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
                    if (!object.isMesh) return;
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach((mat: THREE.Material) => mat.dispose());
                    } else {
                        object.material?.dispose();
                    }
                });
            }
            materialsRef.current = [];
            originalColorsRef.current = {};
        };
    }, [scene]);
}
