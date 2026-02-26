import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { ApiError, ApiErrorCode, createNetworkError } from '../../types/errors';
import { apiClient } from '../../api/client';

const safeStorage = {
    getItem: async (key: string) => {
        if (!AsyncStorage) return null;
        try { return await AsyncStorage.getItem(key); } catch { return null; }
    },
    setItem: async (key: string, value: string) => {
        if (!AsyncStorage) return;
        try { await AsyncStorage.setItem(key, value); } catch { }
    },
    removeItem: async (key: string) => {
        if (!AsyncStorage) return;
        try { await AsyncStorage.removeItem(key); } catch { }
    }
};

const API_URL = `${Constants.expoConfig?.extra?.API_URL}/auth`;

interface User {
    id?: number;
    username: string;
    email: string;
    roles: string[];
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
    const router = useRouter();

    useEffect(() => {
        loadStorageData();
        apiClient.setUnauthorizedHandler(() => signOut(true));
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await safeStorage.getItem('token');
            const storedUser = await safeStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('[Auth] Failed to load stored data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (username: string, password: string) => {
        let response: Response;
        try {
            response = await fetch(`${API_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
        } catch (error) {
            throw createNetworkError(error);
        }

        const data = await response.json();

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

        const userObj: User = {
            username: data.username,
            email: data.email,
            roles: data.roles,
            phoneNumber: data.phoneNumber,
            profilePic: data.profilePic,
            favBrands: data.favBrands,
            preferredBodyTypes: data.preferredBodyTypes,
            preferredFuelTypes: data.preferredFuelTypes,
            preferredTransmissions: data.preferredTransmissions,
            drivingCondition: data.drivingCondition,
            maxBudget: data.maxBudget
        };
        setToken(data.token);
        setUser(userObj);
        await safeStorage.setItem('token', data.token);
        await safeStorage.setItem('user', JSON.stringify(userObj));
    };

    const signUp = async (username: string, email: string, password: string, phoneNumber?: string, profilePic?: string) => {
        let response: Response;
        try {
            response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, phoneNumber, profilePic, role: ['user'] }),
            });
        } catch (error) {
            throw createNetworkError(error);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(ApiErrorCode.SERVER_ERROR, {
                statusCode: response.status,
                userMessage: data.message || 'Signup failed. Please try again.',
            });
        }
    };

    const signOut = async (showPrompt = false) => {
        setToken(null);
        setUser(null);
        await safeStorage.removeItem('token');
        await safeStorage.removeItem('user');

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
        await safeStorage.setItem('user', JSON.stringify(updatedUser));
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
                    safeStorage.setItem('user', JSON.stringify(updatedUser));
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
