import { Asset } from 'expo-asset';
import { CarModels, DEFAULT_MODEL_URL, getRawModelUrl } from '../../constants/CarModels';
import { getModelUrl } from './blenderService';

const pendingDownloads = new Map<string, Promise<string>>();

export function resolveModelUrl(modelPath?: string): string {
    if (!modelPath) {
        return DEFAULT_MODEL_URL;
    }

    if (modelPath.startsWith('http') || modelPath.startsWith('/api/')) {
        return getModelUrl(modelPath);
    }

    const fileName = modelPath.split('/').pop() || 'car.glb';
    if (CarModels[fileName]) {
        return CarModels[fileName].uri;
    }

    return getRawModelUrl(fileName);
}

function appendCacheToken(url: string, cacheToken?: string | number, forceRefresh = false): string {
    const token = forceRefresh ? Date.now().toString(36) : (cacheToken !== undefined && cacheToken !== null ? String(cacheToken).trim() : '');
    if (!token) {
        return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(token)}`;
}

export async function getCachedModelUri(
    modelPath?: string,
    options?: { cacheToken?: string | number; forceRefresh?: boolean }
): Promise<string> {
    const remoteUrl = resolveModelUrl(modelPath);
    const cachedUrl = appendCacheToken(remoteUrl, options?.cacheToken, options?.forceRefresh);

    const inFlight = pendingDownloads.get(cachedUrl);
    if (inFlight) {
        return inFlight;
    }

    const downloadPromise = (async () => {
        try {
            const asset = Asset.fromURI(cachedUrl);
            await asset.downloadAsync();
            return asset.localUri || asset.uri || cachedUrl;
        } catch {
            return cachedUrl;
        }
    })();

    pendingDownloads.set(cachedUrl, downloadPromise);

    try {
        return await downloadPromise;
    } finally {
        pendingDownloads.delete(cachedUrl);
    }
}

export async function preloadModel(
    modelPath?: string,
    options?: { cacheToken?: string | number; forceRefresh?: boolean }
): Promise<void> {
    await getCachedModelUri(modelPath, options);
}
