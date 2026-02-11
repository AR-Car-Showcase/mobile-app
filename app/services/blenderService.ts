import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

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
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const payload = {
            vehicleId: config.vehicleId,
            materials: config.materials
        };

        const response = await fetch(`${API_BASE_URL}/customizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Generation failed: ${response.status} ${errorText}`);
        }

        const result = await response.json();

        return {
            success: true,
            model_id: result.customizationId,
            filename: result.modelUrl.split('/').pop(),
            download_url: result.modelUrl,
            generation_time: 0
        };
    } catch (error) {
        throw error;
    }
}

export function getModelUrl(pathOrFilename: string): string {
    if (!pathOrFilename) return '';
    if (pathOrFilename.startsWith('http')) return pathOrFilename;

    const root = API_BASE_URL.replace('/api', '');

    if (pathOrFilename.startsWith('/')) {
        return `${root}${pathOrFilename}`;
    }

    // Handle filenames
    if (pathOrFilename.startsWith('car_')) {
        // Custom models from blender-service/generated
        return `${API_BASE_URL}/models/${pathOrFilename}`;
    }

    // Original models from src/main/resources/static/models
    return `${API_BASE_URL}/static/models/${pathOrFilename}`;
}

export async function checkServiceHealth(): Promise<boolean> {
    return true;
}
