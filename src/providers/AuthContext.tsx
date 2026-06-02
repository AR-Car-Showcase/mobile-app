/**
 * AuthContext.tsx
 * ──────────────
 * Thin React provider that composes the auth repository into React state.
 * All raw API calls now live in `src/services/authRepository.ts`.
 * All shared types live in `src/services/authTypes.ts`.
 */

import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { ApiError, ApiErrorCode } from '../../types/errors';
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
import { useAppAlert } from './AppAlertContext';
import { apiClient } from '../../api/client';

import type { User, AuthContextType, EmailVerificationResponse, PasswordResetResponse } from '../services/authTypes';
import { profilesAreEqual } from '../services/authTypes';
import {
    fetchProfileWithToken,
    loginWithCredentials,
    loginWithGoogle,
    signUpApi,
    verifyEmailApi,
    resendVerificationApi,
    requestPasswordResetApi,
    resendPasswordResetApi,
    resetPasswordApi,
    changePasswordApi,
    updateProfileApi,
    updatePreferencesApi,
} from '../services/authRepository';

// Re-export so existing consumers can keep importing from here
export type { User, EmailVerificationResponse, PasswordResetResponse, AuthContextType };

const PROFILE_CACHE_TTL_MS = 60_000;

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

    // ── session helpers ──────────────────────────────────────────────

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

    // ── sign-in ──────────────────────────────────────────────────────

    const signIn = useCallback(async (username: string, password: string) => {
        const tokens = await loginWithCredentials(username, password);
        return establishSession(tokens.accessToken, tokens.refreshToken);
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
            const tokens = await loginWithGoogle(idToken);
            return establishSession(tokens.accessToken, tokens.refreshToken);
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

    // ── sign-up / email verification ─────────────────────────────────

    const signUp = async (
        username: string,
        email: string,
        password: string,
        phoneNumber?: string,
        profilePic?: string,
    ): Promise<EmailVerificationResponse> => {
        return signUpApi(username, email, password, phoneNumber, profilePic);
    };

    const verifyEmail = async (email: string, code: string): Promise<string> => {
        return verifyEmailApi(email, code);
    };

    const resendVerification = async (email: string): Promise<EmailVerificationResponse> => {
        return resendVerificationApi(email);
    };

    // ── password reset ───────────────────────────────────────────────

    const requestPasswordReset = async (email: string): Promise<PasswordResetResponse> => {
        return requestPasswordResetApi(email);
    };

    const resendPasswordReset = async (email: string): Promise<PasswordResetResponse> => {
        return resendPasswordResetApi(email);
    };

    const resetPassword = async (email: string, code: string, newPassword: string): Promise<string> => {
        return resetPasswordApi(email, code, newPassword);
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<string> => {
        return changePasswordApi(currentPassword, newPassword);
    };

    // ── sign-out ─────────────────────────────────────────────────────

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

    // ── init ─────────────────────────────────────────────────────────

    useEffect(() => {
        void bootstrapSession();
        apiClient.setUnauthorizedHandler(() => {
            void signOut(true);
        });
    }, [bootstrapSession, signOut]);

    // ── profile management ───────────────────────────────────────────

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
        await updateProfileApi(updates);
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
        await updatePreferencesApi(updates);
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

    // ── render ───────────────────────────────────────────────────────

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
