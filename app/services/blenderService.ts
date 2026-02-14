import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { ApiError, ApiErrorCode, getErrorCode, createNetworkError } from '../../types/errors';

const API_BASE_URL = Constants.expoConfig?.extra?.API_URL;

export interface CarConfig {
    materials: {
        [key: string]: string;
    };
    vehicleId?: string;
}

export interface GenerateResult {
    success: boolean;
    model_id: string;
    filename: string;
    download_url: string;
    generation_time?: number;
}

export async function generateCustomModel(config: CarConfig): Promise<GenerateResult> {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        throw new ApiError(ApiErrorCode.UNAUTHORIZED, {
            userMessage: 'Please log in to generate custom models.',
        });
    }

    const payload = {
        vehicleId: config.vehicleId,
        materials: config.materials,
    };

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}/customizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        throw createNetworkError(error);
    }

    if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        const code = getErrorCode(response.status);
        throw new ApiError(code, {
            statusCode: response.status,
            message: `Generation failed: ${response.status} ${errorText}`,
        });
    }

    const result = await response.json();

    return {
        success: true,
        model_id: result.customizationId,
        filename: result.modelUrl.split('/').pop(),
        download_url: result.modelUrl,
        generation_time: 0,
    };
}

export function getModelUrl(pathOrFilename: string): string {
    if (!pathOrFilename) return '';
    if (pathOrFilename.startsWith('http')) return pathOrFilename;

    const root = API_BASE_URL.replace('/api', '');

    if (pathOrFilename.startsWith('/')) {
        return `${root}${pathOrFilename}`;
    }

    if (pathOrFilename.startsWith('car_')) {
        return `${API_BASE_URL}/models/${pathOrFilename}`;
    }

    return `${API_BASE_URL}/static/models/${pathOrFilename}`;
}
