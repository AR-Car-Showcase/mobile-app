import { useEffect, MutableRefObject } from 'react';
import * as THREE from 'three';

export function useSceneCleanup(
    scene: THREE.Object3D | null,
    materialsRef: MutableRefObject<THREE.Material[]>,
    originalColorsRef: MutableRefObject<Record<string, string>>
): void {
    useEffect(() => {
        return () => {
            if (scene) {
                scene.traverse((object: any) => {
                    if (object.isMesh) {
                        object.geometry?.dispose();
                        
                        const disposeMaterial = (mat: any) => {
                            if (!mat) return;
                            
                            // Dispose textures
                            Object.keys(mat).forEach(key => {
                                if (mat[key] && mat[key].isTexture) {
                                    mat[key].dispose();
                                }
                            });
                            
                            mat.dispose();
                        };

                        if (Array.isArray(object.material)) {
                            object.material.forEach(disposeMaterial);
                        } else {
                            disposeMaterial(object.material);
                        }
                    }
                });
            }
            materialsRef.current = [];
            originalColorsRef.current = {};
        };
    }, [scene]);
}
