import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    ViroARScene,
    ViroNode,
    ViroAmbientLight,
    ViroDirectionalLight,
    Viro3DObject,
    ViroARPlane,
    ViroQuad,
    ViroMaterials,
} from '@reactvision/react-viro';
import { resolveModelSourceForAR } from '../../hooks/useModelSource';

type Triplet = [number, number, number];

interface ARSceneViroAppProps {
    materials?: Record<string, string>;
    customModelUrl?: string;
    sceneRef?: React.MutableRefObject<SceneControls | null>;
    showCustomized?: boolean;
    modelPath?: string;
}

interface SceneControls {
    rotateLeft: () => void;
    rotateRight: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
}

const GLASS_MATERIAL = {
    lightingModel: 'PBR' as const,
    diffuseColor: 'rgba(255, 255, 255, 0.2)',
    blendMode: 'Alpha' as const,
    shininess: 2.0,
    metalness: 0.1,
    roughness: 0.1,
};

const GLASS_MATERIAL_NAMES = [
    'Glass', 'Window', 'Windshield',
    'GLASS', 'WINDOW', 'WINDSHIELD',
    'glass', 'window', 'windshield',
];

const INITIAL_SCALE = 0.08;
const ROTATION_STEP = 30;
const SCALE_STEP = 0.05;
const MAX_SCALE = 0.3;
const MIN_SCALE = 0.05;
const RESET_SCALE = 0.1;

export default function ARHybridScene(props?: any) {
    const [carScale, setCarScale] = useState(INITIAL_SCALE);
    const [carRotation, setCarRotation] = useState<Triplet>([0, 0, 0]);
    const [anchorPosition, setAnchorPosition] = useState<Triplet>([0, 0, -1]);
    const isPlacedRef = useRef(false);

    const navigator = props.arSceneNavigator || props.sceneNavigator;
    const viroAppProps: ARSceneViroAppProps = navigator?.viroAppProps || {};
    const { materials, customModelUrl, sceneRef, showCustomized, modelPath } = viroAppProps;

    useEffect(() => {
        const materialDefinitions: Record<string, any> = {};

        GLASS_MATERIAL_NAMES.forEach(name => {
            materialDefinitions[name] = GLASS_MATERIAL;
        });

        if (materials) {
            Object.entries(materials).forEach(([matName, colorValue]) => {
                if (colorValue) {
                    materialDefinitions[matName] = {
                        lightingModel: 'PBR',
                        diffuseColor: colorValue,
                        metalness: 0.2,
                        roughness: 0.5,
                    };
                }
            });
        }

        ViroMaterials.createMaterials(materialDefinitions);
    }, [materials, customModelUrl, showCustomized]);

    const rotateLeft = useCallback(() => setCarRotation(prev => [prev[0], prev[1] + ROTATION_STEP, prev[2]]), []);
    const rotateRight = useCallback(() => setCarRotation(prev => [prev[0], prev[1] - ROTATION_STEP, prev[2]]), []);
    const zoomIn = useCallback(() => setCarScale(prev => Math.min(MAX_SCALE, prev + SCALE_STEP)), []);
    const zoomOut = useCallback(() => setCarScale(prev => Math.max(MIN_SCALE, prev - SCALE_STEP)), []);
    const reset = useCallback(() => {
        setCarRotation([0, 0, 0]);
        setCarScale(RESET_SCALE);
    }, []);

    useEffect(() => {
        if (sceneRef) {
            sceneRef.current = { rotateLeft, rotateRight, zoomIn, zoomOut, reset };
        }
    }, [rotateLeft, rotateRight, zoomIn, zoomOut, reset, sceneRef]);

    const onPlaneDetected = useCallback((anchor: any) => {
        if (!isPlacedRef.current) {
            isPlacedRef.current = true;
            setAnchorPosition([anchor.position[0], anchor.position[1] + 0.01, anchor.position[2]]);
        }
    }, []);

    const modelSource = resolveModelSourceForAR(modelPath, showCustomized, customModelUrl);
    const modelKey = `${showCustomized}-${customModelUrl || JSON.stringify(materials)}-${modelPath}`;
    const appliedMaterials = showCustomized && !customModelUrl && materials
        ? Object.keys(materials)
        : undefined;

    return (
        <ViroARScene>
            <ViroAmbientLight color="#ffffff" intensity={400} />
            <ViroDirectionalLight color="#ffffff" direction={[1, -1, -1]} intensity={800} />

            <ViroARPlane alignment="Horizontal" onAnchorFound={onPlaneDetected}>
                <ViroQuad rotation={[-90, 0, 0]} width={2} height={2} opacity={0.3} />
            </ViroARPlane>

            <ViroNode
                position={anchorPosition}
                scale={[carScale, carScale, carScale]}
                rotation={carRotation}
            >
                <Viro3DObject
                    key={modelKey}
                    source={modelSource}
                    type="GLB"
                    materials={appliedMaterials}
                    resources={[]}
                    scale={[1, 1, 1]}
                    lightReceivingBitMask={1}
                    onLoadStart={() => console.log(`[AR] ⏳ Loading model: ${modelPath || 'default'}`)}
                    onLoadEnd={() => console.log('[SUCCESS] ✅ 3D Model loaded successfully in AR')}
                    onError={(event: any) => console.warn('[AR] ❌ Failed to load model:', event.nativeEvent.error)}
                />
            </ViroNode>
        </ViroARScene>
    );
}
