import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    ViroARScene,
    ViroNode,
    ViroAmbientLight,
    ViroDirectionalLight,
    Viro3DObject,
    ViroText,
    ViroARPlane,
    ViroQuad,
    ViroMaterials,
} from '@reactvision/react-viro';
import { CarModels, DEFAULT_MODEL } from '../../constants/CarModels';

export default function ARHybridScene(props?: any) {
    const [carScale, setCarScale] = useState(0.08);
    const [carRotation, setCarRotation] = useState<[number, number, number]>([0, 0, 0]);
    const [anchorPosition, setAnchorPosition] = useState<[number, number, number]>([0, 0, -1]);
    const isPlacedRef = useRef(false);

    const navigator = props.arSceneNavigator || props.sceneNavigator;
    const viroAppProps = navigator?.viroAppProps;
    const { materials, customModelUrl, sceneRef, showCustomized, modelPath } = viroAppProps || {};

    useEffect(() => {
        const glassMaterial = {
            lightingModel: 'PBR',
            diffuseColor: 'rgba(255, 255, 255, 0.2)',
            blendMode: 'Alpha',
            shininess: 2.0,
            metalness: 0.1,
            roughness: 0.1
        };

        const materialDefinitions: { [key: string]: any } = {
            "Glass": glassMaterial,
            "Window": glassMaterial,
            "Windshield": glassMaterial,
            "GLASS": glassMaterial,
            "WINDOW": glassMaterial,
            "WINDSHIELD": glassMaterial,
            "glass": glassMaterial,
            "window": glassMaterial,
            "windshield": glassMaterial,
        };

        if (showCustomized && !customModelUrl && materials) {
            Object.keys(materials).forEach(matName => {
                materialDefinitions[matName] = {
                    lightingModel: 'PBR',
                    diffuseColor: materials[matName],
                    metalness: 0.2,
                    roughness: 0.5
                };
            });
        }

        ViroMaterials.createMaterials(materialDefinitions);
    }, [materials, customModelUrl, showCustomized]);

    const rotateLeft = useCallback(() => setCarRotation(prev => [prev[0], prev[1] + 30, prev[2]]), []);
    const rotateRight = useCallback(() => setCarRotation(prev => [prev[0], prev[1] - 30, prev[2]]), []);
    const zoomIn = useCallback(() => setCarScale(prev => Math.min(0.3, prev + 0.05)), []);
    const zoomOut = useCallback(() => setCarScale(prev => Math.max(0.05, prev - 0.05)), []);
    const reset = useCallback(() => {
        setCarRotation([0, 0, 0]);
        setCarScale(0.1);
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

    return (
        <ViroARScene>
            <ViroAmbientLight color="#ffffff" intensity={400} />
            <ViroDirectionalLight color="#ffffff" direction={[1, -1, -1]} intensity={800} />

            <ViroARPlane alignment="Horizontal" onAnchorFound={onPlaneDetected}>
                <ViroQuad rotation={[-90, 0, 0]} width={2} height={2} opacity={0.3} />
            </ViroARPlane>

            <ViroNode position={anchorPosition} scale={[carScale, carScale, carScale]} rotation={carRotation}>
                <Viro3DObject
                    key={`${showCustomized}-${customModelUrl || JSON.stringify(materials)}-${modelPath}`}
                    source={(() => {
                        if (showCustomized && customModelUrl) {
                            return { uri: customModelUrl };
                        }
                        if (modelPath) {
                            const fileName = modelPath.split('/').pop() || 'bugatti-chiron.glb';
                            if (CarModels[fileName]) {
                                return CarModels[fileName];
                            }
                            console.warn(`[AR] Model ${fileName} not found, using default`);
                        }
                        return DEFAULT_MODEL;
                    })()}
                    type="GLB"
                    materials={showCustomized && !customModelUrl && materials ? Object.keys(materials) : undefined}
                    resources={[]}
                    scale={[1, 1, 1]}
                    lightReceivingBitMask={1}
                    onLoadEnd={() => console.log('[SUCCESS] 3D Model loaded successfully')}
                />
            </ViroNode>
        </ViroARScene>
    );
}
