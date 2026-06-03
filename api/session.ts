import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const USER_KEY = 'auth.user';

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.API_URL ||
    process.env.API_URL ||
    '';
const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const GOOGLE_CONFIG_URL = `${API_BASE_URL}/auth/google/config`;
const USE_SECURE_STORE = Platform.OS !== 'web';
export const SUPPORT_EMAIL =
    process.env.EXPO_PUBLIC_SUPPORT_EMAIL ||
    Constants.expoConfig?.extra?.SUPPORT_EMAIL ||
    'contact@arcarshowcase.com';

async function setValue(key: string, value: string, secure: boolean) {
    if (secure && USE_SECURE_STORE) {
        await SecureStore.setItemAsync(key, value);
        return;
    }

    await AsyncStorage.setItem(key, value);
}

async function getValue(key: string, secure: boolean) {
    if (secure && USE_SECURE_STORE) {
        return SecureStore.getItemAsync(key);
    }

    return AsyncStorage.getItem(key);
}

async function removeValue(key: string, secure: boolean) {
    if (secure && USE_SECURE_STORE) {
        await SecureStore.deleteItemAsync(key);
        return;
    }

    await AsyncStorage.removeItem(key);
}

export async function setAuthTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
        setValue(ACCESS_TOKEN_KEY, accessToken, true),
        setValue(REFRESH_TOKEN_KEY, refreshToken, true),
    ]);
}

export async function getAccessToken() {
    return getValue(ACCESS_TOKEN_KEY, true);
}

export async function getRefreshToken() {
    return getValue(REFRESH_TOKEN_KEY, true);
}

export async function clearAuthTokens() {
    await Promise.all([
        removeValue(ACCESS_TOKEN_KEY, true),
        removeValue(REFRESH_TOKEN_KEY, true),
    ]);
}

export async function storeUser<T>(user: T) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser<T>() {
    const value = await AsyncStorage.getItem(USER_KEY);
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

export async function clearStoredUser() {
    await AsyncStorage.removeItem(USER_KEY);
}

export async function clearAuthSession() {
    await Promise.all([clearAuthTokens(), clearStoredUser()]);
}

export async function refreshAuthSession(): Promise<{ accessToken: string; refreshToken: string; tokenType?: string } | null> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken || !AUTH_BASE_URL) {
        return null;
    }

    const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json().catch(() => null);
    if (!data?.accessToken || !data?.refreshToken) {
        return null;
    }

    await setAuthTokens(data.accessToken, data.refreshToken);
    return data;
}

export async function logoutRemoteSession() {
    const refreshToken = await getRefreshToken();
    if (!refreshToken || !AUTH_BASE_URL) {
        return;
    }

    try {
        await fetch(`${AUTH_BASE_URL}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
    } catch {
        // Best-effort logout only. Local token cleanup still happens.
    }
}

export interface GoogleAuthConfig {
    enabled: boolean;
    issuerUri?: string;
    autoLinkByEmail?: boolean;
    clientId?: string;
    clientIds?: string[];
}

export async function fetchGoogleAuthConfig(): Promise<GoogleAuthConfig | null> {
    if (!API_BASE_URL) {
        return null;
    }

    try {
        const response = await fetch(GOOGLE_CONFIG_URL);
        if (!response.ok) {
            return null;
        }

        return (await response.json()) as GoogleAuthConfig;
    } catch {
        return null;
    }
}
