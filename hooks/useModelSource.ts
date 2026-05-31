import { useEffect, useMemo, useState } from 'react';
import { getCachedModelUri, preloadModel, resolveModelUrl } from '../app/services/modelCache';

export interface CachedModelSourceResult {
    source: string;
    loading: boolean;
    refresh: (forceRefresh?: boolean) => Promise<string>;
}

export function useModelSource(modelPath?: string, cacheToken?: string | number): CachedModelSourceResult {
    const [source, setSource] = useState(() => resolveModelUrl(modelPath));
    const [loading, setLoading] = useState(true);

    const stableToken = useMemo(() => {
        return cacheToken === undefined || cacheToken === null ? '' : String(cacheToken);
    }, [cacheToken]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        console.log(`[3D Model] Started loading model from: ${modelPath}`);

        getCachedModelUri(modelPath, { cacheToken: stableToken })
            .then((resolved) => {
                if (!cancelled) {
                    console.log(`[3D Model] Finished resolving model to: ${resolved}`);
                    setSource(resolved);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    const fallback = resolveModelUrl(modelPath);
                    console.warn(`[3D Model] Failed to load model from cache: ${err}. Falling back to: ${fallback}`);
                    setSource(fallback);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [modelPath, stableToken]);

    const refresh = async (forceRefresh = true) => {
        console.log(`[3D Model] Refreshing model from: ${modelPath} (force: ${forceRefresh})`);
        const resolved = await getCachedModelUri(modelPath, {
            cacheToken: stableToken,
            forceRefresh,
        });
        console.log(`[3D Model] Refreshed model resolved to: ${resolved}`);
        setSource(resolved);
        return resolved;
    };

    return { source, loading, refresh };
}

export function resolveModelSourceForAR(
    modelPath?: string,
    showCustomized?: boolean,
    customModelUrl?: string
): { uri: string } {
    if (showCustomized && customModelUrl) {
        return { uri: resolveModelUrl(customModelUrl) };
    }

    return { uri: resolveModelUrl(modelPath) };
}

export { preloadModel, resolveModelUrl };
