import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CONFIGURABLE_MATERIALS } from '../constants/CarModels';
import { CarConfig } from '../app/context/CarContext';

const GLASS_KEYWORDS = ['glass', 'window', 'windshield'];

function isGlassMaterial(materialName: string): boolean {
    const lower = materialName.toLowerCase();
    return GLASS_KEYWORDS.some(keyword => lower.includes(keyword));
}

interface SceneMaterialsResult {
    materialsRef: React.MutableRefObject<THREE.Material[]>;
    originalColorsRef: React.MutableRefObject<Record<string, string>>;
}

export function useSceneMaterials(
    scene: THREE.Object3D | null,
    configMaterials: Record<string, string>
): SceneMaterialsResult {
    const materialsRef = useRef<THREE.Material[]>([]);
    const originalColorsRef = useRef<Record<string, string>>({});
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!scene || initializedRef.current) return;

        scene.traverse((child: any) => {
            if (!child.isMesh || !child.material) return;

            if (isGlassMaterial(child.material.name)) {
                child.material.transparent = true;
                child.material.opacity = 0.3;
                child.material.side = THREE.DoubleSide;
            }

            if (CONFIGURABLE_MATERIALS.includes(child.material.name)) {
                if (!originalColorsRef.current[child.material.name]) {
                    originalColorsRef.current[child.material.name] = child.material.color.getStyle();
                }
                child.material = child.material.clone();
                child.material.metalness = 0.6;
                child.material.roughness = 0.2;
                materialsRef.current.push(child.material);
            }
        });

        initializedRef.current = true;
    }, [scene]);

    useEffect(() => {
        if (materialsRef.current.length === 0) return;

        materialsRef.current.forEach((material: any) => {
            const colorHex = configMaterials[material.name] || originalColorsRef.current[material.name];
            if (colorHex) {
                material.color.set(colorHex);
                material.needsUpdate = true;
            }
        });
    }, [configMaterials]);

    return { materialsRef, originalColorsRef };
}
