import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, ApiErrorCode, getErrorCode, createNetworkError } from '../types/errors';

const getBaseUrl = () => Constants.expoConfig?.extra?.API_URL;

export const BASE_URL = getBaseUrl();

const DEFAULT_TIMEOUT_MS = 15000;

async function getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    let url = `${BASE_URL}${endpoint}`;
    if (params) {
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
            .join('&');
        url += `?${queryString}`;
    }
    return url;
}

async function parseErrorBody(response: Response): Promise<string> {
    try {
        const body = await response.json();
        return body?.message || body?.error || response.statusText;
    } catch {
        try {
            return await response.text();
        } catch {
            return response.statusText;
        }
    }
}

let unauthorizedHandler: (() => void) | null = null;

async function performRequest<T>(
    url: string,
    options: RequestInit,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        if (!response.ok) {
            if (response.status === 401 && unauthorizedHandler) {
                unauthorizedHandler();
            }

            const errorBody = await parseErrorBody(response);
            const code = getErrorCode(response.status);
            throw new ApiError(code, {
                statusCode: response.status,
                message: `${response.status} ${errorBody}`,
            });
        }

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            return text as unknown as T;
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;

        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(ApiErrorCode.TIMEOUT, {
                message: `Request to ${url} timed out after ${timeoutMs}ms`,
            });
        }

        throw createNetworkError(error);
    } finally {
        clearTimeout(timeoutId);
    }
}

export const apiClient = {
    setUnauthorizedHandler: (handler: () => void) => {
        unauthorizedHandler = handler;
    },

    get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
        const url = buildUrl(endpoint, params);
        const headers = await getAuthHeaders();

        return performRequest<T>(url, { method: 'GET', headers });
    },

    post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
        const url = buildUrl(endpoint);
        const headers = await getAuthHeaders();

        return performRequest<T>(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
    },

    put: async <T>(endpoint: string, data?: unknown): Promise<T> => {
        const url = buildUrl(endpoint);
        const headers = await getAuthHeaders();

        return performRequest<T>(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
    },

    patch: async <T>(endpoint: string, data?: unknown): Promise<T> => {
        const url = buildUrl(endpoint);
        const headers = await getAuthHeaders();

        return performRequest<T>(url, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });
    },

    delete: async <T>(endpoint: string): Promise<T> => {
        const url = buildUrl(endpoint);
        const headers = await getAuthHeaders();

        return performRequest<T>(url, { method: 'DELETE', headers });
    },
};
