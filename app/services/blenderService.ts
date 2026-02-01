import { Platform } from 'react-native';

const BLENDER_SERVICE_URL = 'http://192.168.0.7:5000';


export interface CarConfig {
    body_color: string;
}

export interface GenerateResult {
    success: boolean;
    model_id: string;
    filename: string;
    download_url: string;
    generation_time: number;
}

export async function generateCustomModel(config: CarConfig): Promise<GenerateResult> {
    console.log('INFO: Requesting custom model generation...', config);
    console.log('INFO: Service Endpoint:', BLENDER_SERVICE_URL);

    try {
        const response = await fetch(`${BLENDER_SERVICE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Generation failed';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorMessage;
                if (errorJson.details) errorMessage += `: ${errorJson.details}`;
            } catch (e) {
                errorMessage += `: ${errorText}`;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('SUCCESS: Model generated successfully:', result);
        return result;
    } catch (error) {
        console.log('ERROR: Generator service failure:', error);
        throw error;
    }
}

export function getModelUrl(filename: string): string {
    return `${BLENDER_SERVICE_URL}/models/${filename}`;
}

export async function checkServiceHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BLENDER_SERVICE_URL}/health`);
        const data = await response.json();
        console.log('INFO: Service health check response:', data);
        return data.status === 'ok';
    } catch (error) {
        console.log('WARNING: Service unreachable:', error);
        return false;
    }
}
