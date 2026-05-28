import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { ApiError, ApiErrorCode, createNetworkError } from '../../types/errors';
import { apiClient } from '../../api/client';
import {
    clearAuthSession,
    clearStoredUser,
    getAccessToken,
    getRefreshToken,
    getStoredUser,
    logoutRemoteSession,
    refreshAuthSession,
    setAuthTokens,
    storeUser,
} from '../../api/session';

const API_BASE_URL = Constants.expoConfig?.extra?.API_URL ?? 'http://10.0.2.2:8080/api';
const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const parseResponseBody = async (response: Response): Promise<any> => {
    try {
        return await response.json();
    } catch {
        try {
            const text = await response.text();
            return text ? { message: text } : {};
        } catch {
            return {};
        }
    }
};

interface User {
    id?: number;
    username: string;
    email: string;
    roles?: string[];
    phoneNumber?: string;
    profilePic?: string;
    favBrands?: string[];
    preferredBodyTypes?: string[];
    preferredFuelTypes?: string[];
    preferredTransmissions?: string[];
    drivingCondition?: string;
    maxBudget?: number | null;
    savedCount?: number;
    customizedCount?: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (username: string, password: string) => Promise<void>;
    signUp: (username: string, email: string, password: string, phoneNumber?: string, profilePic?: string) => Promise<void>;
    signOut: () => Promise<void>;
    token: string | null;
    updateUser: (updatedUser: User) => Promise<void>;
    fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        bootstrapSession();
        apiClient.setUnauthorizedHandler(() => signOut(true));
    }, []);

    const bootstrapSession = async () => {
        try {
            const [storedAccessToken, storedRefreshToken, storedUser] = await Promise.all([
                getAccessToken(),
                getRefreshToken(),
                getStoredUser<User>(),
            ]);

            if (storedAccessToken) {
                setToken(storedAccessToken);
                if (storedUser) {
                    setUser(storedUser);
                }
            } else if (storedRefreshToken) {
                const refreshed = await refreshAuthSession();
                if (refreshed?.accessToken) {
                    setToken(refreshed.accessToken);
                }
            }

            const activeToken = storedAccessToken || (await getAccessToken());
            if (!activeToken) {
                await clearStoredUser();
                return;
            }

            try {
                const profile = await apiClient.get<User>('/user/profile');
                setUser(profile);
                await storeUser(profile);
            } catch (profileError) {
                if (!storedUser) {
                    throw profileError;
                }
            }
        } catch (error) {
            console.error('[Auth] Failed to bootstrap session:', error);
            await clearAuthSession();
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (username: string, password: string) => {
        let response: Response;
        try {
            response = await fetch(`${AUTH_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
        } catch (error) {
            throw createNetworkError(error);
        }

        const data = await parseResponseBody(response);

        if (!response.ok) {
            if (response.status === 401) {
                throw new ApiError(ApiErrorCode.UNAUTHORIZED, {
                    statusCode: 401,
                    userMessage: data.message || 'Invalid username or password.',
                });
            }

            throw new ApiError(ApiErrorCode.SERVER_ERROR, {
                statusCode: response.status,
                message: data.message || 'Login failed',
            });
        }

        if (!data?.accessToken || !data?.refreshToken) {
            throw new ApiError(ApiErrorCode.SERVER_ERROR, {
                statusCode: response.status,
                message: 'Login response did not include tokens.',
            });
        }

        await setAuthTokens(data.accessToken, data.refreshToken);
        setToken(data.accessToken);

        try {
            const profile = await apiClient.get<User>('/user/profile');
            setUser(profile);
            await storeUser(profile);
        } catch (error) {
            await clearAuthSession();
            setToken(null);
            setUser(null);
            throw error;
        }
    };

    const signUp = async (username: string, email: string, password: string, phoneNumber?: string, profilePic?: string) => {
        let response: Response;
        try {
            response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, phoneNumber, profilePic }),
            });
        } catch (error) {
            throw createNetworkError(error);
        }

        const data = await parseResponseBody(response);

        if (!response.ok) {
            throw new ApiError(ApiErrorCode.SERVER_ERROR, {
                statusCode: response.status,
                message: typeof data?.message === 'string' ? data.message : undefined,
                userMessage: data?.message || 'Signup failed. Please try again.',
            });
        }
    };

    const signOut = async (showPrompt = false) => {
        try {
            await logoutRemoteSession();
        } catch {
            // Best-effort server logout.
        } finally {
            await clearAuthSession();
            setToken(null);
            setUser(null);
        }

        if (showPrompt) {
            Alert.alert(
                'Session Expired',
                'Please login again to continue.',
                [{ text: 'OK' }]
            );
        }
    };

    const updateUser = async (updatedUser: User) => {
        setUser(updatedUser);
        await storeUser(updatedUser);
    };

    const fetchProfile = async () => {
        try {
            const data = await apiClient.get<User>('/user/profile');
            if (data) {
                setUser(prevUser => {
                    const updatedUser = {
                        ...(prevUser || {}),
                        ...data
                    } as User;
                    void storeUser(updatedUser);
                    return updatedUser;
                });
            }
        } catch (error) {
            console.error('[Auth] Failed to fetch profile:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!token,
            signIn,
            signUp,
            signOut: () => signOut(false),
            token,
            updateUser,
            fetchProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};
