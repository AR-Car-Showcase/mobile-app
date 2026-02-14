import { useMemo } from 'react';
import { CarModels, DEFAULT_MODEL_URL, getRawModelUrl } from '../constants/CarModels';
import { getModelUrl } from '../app/services/blenderService';

type ModelSourceUri = { uri: string };

export function useModelSource(modelPath?: string): string {
    return useMemo(() => {
        if (!modelPath) return DEFAULT_MODEL_URL;

        if (modelPath.startsWith('http') || modelPath.startsWith('/api/')) {
            return getModelUrl(modelPath);
        }

        const fileName = modelPath.split('/').pop() || 'car.glb';
        if (CarModels[fileName]) {
            return CarModels[fileName].uri;
        }
        return getRawModelUrl(fileName);
    }, [modelPath]);
}

export function resolveModelSourceForAR(
    modelPath?: string,
    showCustomized?: boolean,
    customModelUrl?: string
): ModelSourceUri {
    if (showCustomized && customModelUrl) {
        return { uri: getModelUrl(customModelUrl) };
    }

    if (modelPath) {
        if (modelPath.startsWith('http') || modelPath.startsWith('/api/')) {
            return { uri: getModelUrl(modelPath) };
        }

        const fileName = modelPath.split('/').pop() || 'car.glb';
        if (CarModels[fileName]) {
            return CarModels[fileName];
        }
        return { uri: getModelUrl(fileName) };
    }

    return CarModels['car.glb'];
}
