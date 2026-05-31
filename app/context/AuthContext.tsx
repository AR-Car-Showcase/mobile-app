import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import Constants from 'expo-constants';
import { ApiError, ApiErrorCode, createNetworkError, getErrorCode } from '../../types/errors';
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
import { friendlyAuthError } from '../../utils/validation';
import { useAppAlert } from './AppAlertContext';

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.API_URL ||
    process.env.API_URL ||
    'http://10.0.2.2:8080/api';
const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const PROFILE_CACHE_TTL_MS = 60_000;

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

const fetchProfileWithToken = async <T,>(accessToken: string): Promise<T> => {
    const response = await fetch(`${AUTH_BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await parseResponseBody(response);
    if (!response.ok) {
        throw new ApiError(getErrorCode(response.status), {
            statusCode: response.status,
            message: typeof data?.message === 'string' ? data.message : 'Unable to load profile.',
            userMessage: data?.message || 'Unable to load profile.',
        });
    }

    return data as T;
};

interface User {
    id?: number;
    username: string;
    email: string;
    authProvider?: string;
    profileCompleted?: boolean;
    displayName?: string;
    bio?: string;
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

const normalizeArray = (values?: string[] | null): string => JSON.stringify([...(values || [])].map((item) => item.trim()).sort());

const profilesAreEqual = (a: User | null, b: User | null): boolean => {
    if (a === b) {
        return true;
    }

    if (!a || !b) {
        return false;
    }

    return (
        a.id === b.id &&
        a.username === b.username &&
        a.email === b.email &&
        a.authProvider === b.authProvider &&
        a.profileCompleted === b.profileCompleted &&
        a.displayName === b.displayName &&
        a.bio === b.bio &&
        a.phoneNumber === b.phoneNumber &&
        a.profilePic === b.profilePic &&
        a.drivingCondition === b.drivingCondition &&
        a.maxBudget === b.maxBudget &&
        a.savedCount === b.savedCount &&
        a.customizedCount === b.customizedCount &&
        normalizeArray(a.favBrands) === normalizeArray(b.favBrands) &&
        normalizeArray(a.preferredBodyTypes) === normalizeArray(b.preferredBodyTypes) &&
        normalizeArray(a.preferredFuelTypes) === normalizeArray(b.preferredFuelTypes) &&
        normalizeArray(a.preferredTransmissions) === normalizeArray(b.preferredTransmissions)
    );
};

interface EmailVerificationResponse {
    message: string;
    verificationRequired: boolean;
    email: string;
    expiresInMinutes: number;
    resendAfterSeconds: number;
}

interface PasswordResetResponse {
    message: string;
    resetRequired: boolean;
    email: string;
    expiresInMinutes: number;
    resendAfterSeconds: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (username: string, password: string) => Promise<User>;
    signInWithGoogle: (idToken: string) => Promise<User>;
    signUp: (username: string, email: string, password: string, phoneNumber?: string, profilePic?: string) => Promise<EmailVerificationResponse>;
    verifyEmail: (email: string, code: string) => Promise<string>;
    resendVerification: (email: string) => Promise<EmailVerificationResponse>;
    signOut: () => Promise<void>;
    token: string | null;
    updateUser: (updatedUser: User) => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<User>;
    updatePreferences: (updates: Partial<User>) => Promise<User>;
    fetchProfile: (force?: boolean) => Promise<User | null>;
    requestPasswordReset: (email: string) => Promise<PasswordResetResponse>;
    resendPasswordReset: (email: string) => Promise<PasswordResetResponse>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<string>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const showAlert = useAppAlert();
    const profileFetchedAtRef = useRef(0);
    const googleExchangeRef = useRef<{
        token: string;
        at: number;
        promise?: Promise<User>;
        user?: User;
    } | null>(null);

    const bootstrapSession = useCallback(async () => {
        try {
            const [storedAccessToken, storedRefreshToken, storedUser] = await Promise.all([
                getAccessToken(),
                getRefreshToken(),
                getStoredUser<User>(),
            ]);

            let activeToken = storedAccessToken || null;

            if (storedAccessToken) {
                setToken(storedAccessToken);
                if (storedUser) {
                    setUser(storedUser);
                }
            } else if (storedRefreshToken) {
                const refreshed = await refreshAuthSession();
                if (refreshed?.accessToken) {
                    activeToken = refreshed.accessToken;
                    setToken(refreshed.accessToken);
                }
            }

            if (!activeToken) {
                await clearStoredUser();
                return;
            }

            try {
                const profile = await fetchProfileWithToken<User>(activeToken);
                profileFetchedAtRef.current = Date.now();
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
    }, []);

    const establishSession = useCallback(async (accessToken: string, refreshToken: string) => {
        await setAuthTokens(accessToken, refreshToken);
        setToken(accessToken);

        try {
            const profile = await fetchProfileWithToken<User>(accessToken);
            profileFetchedAtRef.current = Date.now();
            setUser(profile);
            await storeUser(profile);
            return profile;
        } catch (error) {
            await clearAuthSession();
            setToken(null);
            setUser(null);
            throw error;
        }
    }, []);

    const signIn = useCallback(async (username: string, password: string) => {
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
                        userMessage: 'Invalid username/email or password.',
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

        return establishSession(data.accessToken, data.refreshToken);
    }, [establishSession]);

    const signInWithGoogle = useCallback(async (idToken: string) => {
        if (!idToken) {
            throw new ApiError(ApiErrorCode.SERVER_ERROR, {
                message: 'Google sign-in did not return an ID token.',
            });
        }

        const existingExchange = googleExchangeRef.current;
        const duplicateWindowMs = 120000;
        if (
            existingExchange?.token === idToken &&
            Date.now() - existingExchange.at < duplicateWindowMs
        ) {
            if (__DEV__) {
                console.info('[Auth][Google] duplicate ID token exchange suppressed');
            }

            if (existingExchange.promise) {
                return existingExchange.promise;
            }

            if (existingExchange.user) {
                return existingExchange.user;
            }
        }

        if (__DEV__) {
            console.info('[Auth][Google] exchanging ID token with backend');
        }

        const exchangePromise = (async () => {
            let response: Response;
            try {
                response = await fetch(`${AUTH_BASE_URL}/login/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });
            } catch (error) {
                throw createNetworkError(error);
            }

            const data = await parseResponseBody(response);

            if (!response.ok) {
                const errorCode = getErrorCode(response.status);
                const friendlyMessage =
                    response.status === 429
                        ? 'Google sign-in was already processed. Please wait a moment and try again.'
                        : data?.message || 'Google sign-in failed. Please try again.';

                if (__DEV__) {
                    console.warn('[Auth][Google] backend rejected sign-in', {
                        status: response.status,
                        message: data?.message,
                        code: errorCode,
                    });
                }

                throw new ApiError(ApiErrorCode.SERVER_ERROR, {
                    statusCode: response.status,
                    message: data?.message || 'Google sign-in failed',
                    userMessage: friendlyMessage,
                });
            }

            if (!data?.accessToken || !data?.refreshToken) {
                throw new ApiError(ApiErrorCode.SERVER_ERROR, {
                    statusCode: response.status,
                    message: 'Google sign-in response did not include tokens.',
                });
            }

            if (__DEV__) {
                console.info('[Auth][Google] backend returned session tokens successfully');
            }

            return establishSession(data.accessToken, data.refreshToken);
        })();

        googleExchangeRef.current = { token: idToken, promise: exchangePromise, at: Date.now() };

        try {
            const sessionUser = await exchangePromise;
            googleExchangeRef.current = { token: idToken, user: sessionUser, at: Date.now() };
            return sessionUser;
        } catch (error) {
            if (googleExchangeRef.current?.token === idToken) {
                googleExchangeRef.current = null;
            }
            throw error;
        }
    }, [establishSession]);

    const signUp = async (username: string, email: string, password: string, phoneNumber?: string, profilePic?: string): Promise<EmailVerificationResponse> => {
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
            const errorCode = getErrorCode(response.status);
            throw new ApiError(errorCode, {
                statusCode: response.status,
                message: typeof data?.message === 'string' ? data.message : undefined,
                userMessage: friendlyAuthError(data?.message, 'Signup failed. Please try again.'),
            });
        }

        return data as EmailVerificationResponse;
    };

    const verifyEmail = async (email: string, code: string): Promise<string> => {
        let response: Response;
        try {
            response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
        } catch (error) {
            throw createNetworkError(error);
        }

        const data = await parseResponseBody(response);
        if (!response.ok) {
            const errorCode = getErrorCode(response.status);
            throw new ApiError(errorCode, {
                statusCode: response.status,
                message: typeof data?.message === 'string' ? data.message : undefined,
                userMessage: data?.message || 'Verification failed. Please try again.',
            });
        }

        return typeof data?.message === 'string' ? data.message : 'Email verified successfully.';
    };

    const resendVerification = async (email: string): Promise<EmailVerificationResponse> => {
        let response: Response;
        try {
            response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
        } catch (error) {
            throw createNetworkError(error);
        }

        const data = await parseResponseBody(response);

        if (!response.ok) {
            const errorCode = getErrorCode(response.status);
            throw new ApiError(errorCode, {
                statusCode: response.status,
                message: typeof data?.message === 'string' ? data.message : undefined,
                userMessage: data?.message || 'Could not resend verification code.',
            });
        }

        return data as EmailVerificationResponse;
    };

    const requestPasswordReset = async (email: string): Promise<PasswordResetResponse> => {
        let response: Response;
        try {
            response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
        } catch (error) {
            throw createNetworkError(error);
        }

        const data = await parseResponseBody(response);

        if (!response.ok) {
            const errorCode = getErrorCode(response.status);
            throw new ApiError(errorCode, {
                statusCode: response.status,
                message: typeof data?.message === 'string' ? data.message : undefined,
                userMessage: data?.message || 'Could not request a password reset code.',
            });
        }

        return data as PasswordResetResponse;
    };

    const resendPasswordReset = async (email: string): Promise<PasswordResetResponse> => {
        let response: Response;
        try {
            response = await fetch(`${API_BASE_URL}/auth/resend-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
        } catch (error) {
            throw createNetworkError(error);
        }

        const data = await parseResponseBody(response);

        if (!response.ok) {
            const errorCode = getErrorCode(response.status);
            throw new ApiError(errorCode, {
                statusCode: response.status,
                message: typeof data?.message === 'string' ? data.message : undefined,
                userMessage: data?.message || 'Could not resend the password reset code.',
            });
        }

        return data as PasswordResetResponse;
    };

    const resetPassword = async (email: string, code: string, newPassword: string): Promise<string> => {
        let response: Response;
        try {
            response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });
        } catch (error) {
            throw createNetworkError(error);
        }

        const data = await parseResponseBody(response);

        if (!response.ok) {
            const errorCode = getErrorCode(response.status);
            throw new ApiError(errorCode, {
                statusCode: response.status,
                message: typeof data?.message === 'string' ? data.message : undefined,
                userMessage: data?.message || 'Password reset failed. Please try again.',
            });
        }

        return typeof data?.message === 'string' ? data.message : 'Password reset successfully.';
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<string> => {
        const data = await apiClient.post<{ message?: string }>('/auth/change-password', {
            currentPassword,
            newPassword,
        });

        return data?.message || 'Password changed successfully.';
    };

    const signOut = useCallback(async (showPrompt = false) => {
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
            showAlert(
                'Session Expired',
                'Please login again to continue.',
                [{ text: 'OK' }]
            );
        }
    }, [showAlert]);

    useEffect(() => {
        void bootstrapSession();
        apiClient.setUnauthorizedHandler(() => {
            void signOut(true);
        });
    }, [bootstrapSession, signOut]);

    const updateUser = async (updatedUser: User) => {
        setUser(updatedUser);
        await storeUser(updatedUser);
    };

    const fetchProfile = useCallback(async (force = false): Promise<User | null> => {
        try {
            const now = Date.now();
            if (!force && user && now - profileFetchedAtRef.current < PROFILE_CACHE_TTL_MS) {
                return user;
            }

            const activeToken = await getAccessToken();
            if (!activeToken) {
                return null;
            }

            const data = await fetchProfileWithToken<User>(activeToken);
            if (data) {
                profileFetchedAtRef.current = now;
                let shouldPersist = false;
                setUser(prevUser => {
                    if (profilesAreEqual(prevUser, data)) {
                        return prevUser;
                    }

                    shouldPersist = true;
                    return data;
                });

                if (shouldPersist) {
                    await storeUser(data);
                }

                return data;
            }
        } catch (error) {
            console.error('[Auth] Failed to fetch profile:', error);
        }

        return null;
    }, [user]);

    const updateProfile = useCallback(async (updates: Partial<User>): Promise<User> => {
        await apiClient.put('/user/profile', updates);
        const profile = await fetchProfile(true);
        if (profile) {
            return profile;
        }

        const mergedUser = {
            ...(user || {}),
            ...updates,
        } as User;
        setUser(mergedUser);
        await storeUser(mergedUser);
        return mergedUser;
    }, [fetchProfile, user]);

    const updatePreferences = useCallback(async (updates: Partial<User>): Promise<User> => {
        await apiClient.put('/user/preferences', updates);
        const profile = await fetchProfile(true);
        if (profile) {
            return profile;
        }

        const mergedUser = {
            ...(user || {}),
            ...updates,
        } as User;
        setUser(mergedUser);
        await storeUser(mergedUser);
        return mergedUser;
    }, [fetchProfile, user]);

    const signOutUser = useCallback(() => signOut(false), [signOut]);

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!token,
            signIn,
            signInWithGoogle,
            signUp,
            verifyEmail,
            resendVerification,
            signOut: signOutUser,
            token,
            updateUser,
            updateProfile,
            updatePreferences,
            fetchProfile,
            requestPasswordReset,
            resendPasswordReset,
            resetPassword,
            changePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};
