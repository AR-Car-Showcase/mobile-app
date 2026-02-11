import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = () => Constants.expoConfig?.extra?.API_URL;

export const BASE_URL = getBaseUrl();

export const apiClient = {
    get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
        let url = `${BASE_URL}${endpoint}`;
        const token = await AsyncStorage.getItem('token');

        if (params) {
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            url += `?${queryString}`;
        }

        console.log(`[GET] ${url}`);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[API] GET request failed:', error);
            throw error;
        }
    },

    post: async <T>(endpoint: string, data?: any): Promise<T> => {
        const url = `${BASE_URL}${endpoint}`;
        const token = await AsyncStorage.getItem('token');
        console.log(`[POST] ${url}`, data);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[API] POST request failed:', error);
            throw error;
        }
    },
};
