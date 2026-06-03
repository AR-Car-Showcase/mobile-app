/**
 * authRepository.ts
 * ─────────────────
 * Pure network layer for all auth-related API calls.
 * No React state, no hooks — just fetch wrappers that return data or throw.
 */

import Constants from 'expo-constants';
import { ApiError, ApiErrorCode, createNetworkError, getErrorCode } from '../../types/errors';
import { apiClient } from '../../api/client';
import { friendlyAuthError } from '../../utils/validation';
import type { User, EmailVerificationResponse, PasswordResetResponse } from './authTypes';

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.API_URL ||
    process.env.API_URL ||
    'http://10.0.2.2:8080/api';
const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// ── helpers ──────────────────────────────────────────────────────────

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

// ── profile ──────────────────────────────────────────────────────────

export const fetchProfileWithToken = async <T,>(accessToken: string): Promise<T> => {
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

export const updateProfileApi = async (updates: Partial<User>): Promise<void> => {
    await apiClient.put('/user/profile', updates);
};

export const updatePreferencesApi = async (updates: Partial<User>): Promise<void> => {
    await apiClient.put('/user/preferences', updates);
};

// ── sign-in ──────────────────────────────────────────────────────────

export const loginWithCredentials = async (
    username: string,
    password: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
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
        // Check for unverified account (403 Forbidden with specific error code)
        if (response.status === 403 && data?.errorCode === 'ACCOUNT_NOT_VERIFIED') {
            throw new ApiError(ApiErrorCode.ACCOUNT_NOT_VERIFIED, {
                statusCode: 403,
                message: data.message || 'Account not verified',
                userMessage: data.message || 'Please verify your email address to continue.',
                metadata: { email: data.email },
            });
        }

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

    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
};

export const loginWithGoogle = async (
    idToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
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
        const friendlyMessage =
            response.status === 429
                ? 'Google sign-in was already processed. Please wait a moment and try again.'
                : data?.message || 'Google sign-in failed. Please try again.';

        if (__DEV__) {
            console.warn('[Auth][Google] backend rejected sign-in', {
                status: response.status,
                message: data?.message,
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

    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
};

// ── sign-up / email verification ─────────────────────────────────────

export const signUpApi = async (
    username: string,
    email: string,
    password: string,
    phoneNumber?: string,
    profilePic?: string,
): Promise<EmailVerificationResponse> => {
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

export const verifyEmailApi = async (email: string, code: string): Promise<string> => {
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

export const resendVerificationApi = async (email: string): Promise<EmailVerificationResponse> => {
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

// ── password reset ───────────────────────────────────────────────────

export const requestPasswordResetApi = async (email: string): Promise<PasswordResetResponse> => {
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

export const resendPasswordResetApi = async (email: string): Promise<PasswordResetResponse> => {
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

export const resetPasswordApi = async (email: string, code: string, newPassword: string): Promise<string> => {
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

export const changePasswordApi = async (currentPassword: string, newPassword: string): Promise<string> => {
    const data = await apiClient.post<{ message?: string }>('/auth/change-password', {
        currentPassword,
        newPassword,
    });

    return data?.message || 'Password changed successfully.';
};
