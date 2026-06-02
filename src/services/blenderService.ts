import { ApiError, ApiErrorCode } from '../../types/errors';
import { apiClient, BASE_URL } from '../../api/client';

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
    const payload = {
        vehicleId: config.vehicleId,
        materials: config.materials,
    };

    try {
        const result = await apiClient.post<{
            customizationId: string;
            modelUrl: string;
        }>('/customizations', payload);

        return {
            success: true,
            model_id: result.customizationId,
            filename: result.modelUrl.split('/').pop() || '',
            download_url: result.modelUrl,
            generation_time: 0,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(ApiErrorCode.SERVER_ERROR, {
            userMessage: 'Failed to generate custom model. Please try again.',
        });
    }
}

export function getModelUrl(pathOrFilename: string): string {
    if (!pathOrFilename) return '';
    if (pathOrFilename.startsWith('http')) return pathOrFilename;

    const root = BASE_URL.replace('/api', '');

    if (pathOrFilename.startsWith('/')) {
        return `${root}${pathOrFilename}`;
    }

    if (pathOrFilename.startsWith('car_')) {
        return `${BASE_URL}/models/${pathOrFilename}`;
    }

    return `${BASE_URL}/static/models/${pathOrFilename}`;
}
