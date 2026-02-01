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

export default function ARHybridScene(props?: any) {
    const [carScale, setCarScale] = useState(0.08);
    const [carRotation, setCarRotation] = useState<[number, number, number]>([0, 0, 0]);
    const [anchorPosition, setAnchorPosition] = useState<[number, number, number]>([0, 0, -1]);
    const isPlacedRef = useRef(false);

    const navigator = props.arSceneNavigator || props.sceneNavigator;
    const viroAppProps = navigator?.viroAppProps;
    const { selectedColorCode, customModelUrl, sceneRef } = viroAppProps || {};

    console.log('INFO: ARHybridScene Component Keys:', Object.keys(props));
    console.log('INFO: Navigator Interface Keys:', Object.keys(props.arSceneNavigator));
    console.log('INFO: ViroAppProps verification:', !!props.arSceneNavigator?.viroAppProps);
    const modelUrl = props.arSceneNavigator?.viroAppProps?.customModelUrl;
    console.log('INFO: Requesting Model URL:', modelUrl);

    console.log('INFO: AR Model Architecture:', customModelUrl ? 'BAKED (Remote)' : 'DYNAMIC (Local)');
    if (customModelUrl) console.log('INFO: URL:', customModelUrl);

    useEffect(() => {
        if (!customModelUrl && selectedColorCode) {
            console.log('INFO: Fallback Mode: Customizing Materials:', selectedColorCode);
            ViroMaterials.createMaterials({
                body: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
                body2: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
                Coloured_Material: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
                Base_Material: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
                material: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
            });
        }
    }, [selectedColorCode, customModelUrl]);

    const rotateLeft = useCallback(() => setCarRotation(prev => [prev[0], prev[1] + 30, prev[2]]), []);
    const rotateRight = useCallback(() => setCarRotation(prev => [prev[0], prev[1] - 30, prev[2]]), []);
    const zoomIn = useCallback(() => setCarScale(prev => Math.min(0.3, prev + 0.05)), []);
    const zoomOut = useCallback(() => setCarScale(prev => Math.max(0.05, prev - 0.05)), []);

    useEffect(() => {
        if (sceneRef) {
            sceneRef.current = { rotateLeft, rotateRight, zoomIn, zoomOut };
        }
    }, [rotateLeft, rotateRight, zoomIn, zoomOut, sceneRef]);

    const onPlaneDetected = useCallback((anchor: any) => {
        if (!isPlacedRef.current) {
            isPlacedRef.current = true;
            setAnchorPosition([anchor.position[0], anchor.position[1] + 0.01, anchor.position[2]]);
            console.log('SUCCESS: World Position Initialized');
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
                    key={customModelUrl || selectedColorCode}
                    source={customModelUrl ? { uri: customModelUrl } : require('../../assets/models/car.glb')}
                    type="GLB"
                    materials={!customModelUrl ? ['body', 'body2', 'Coloured_Material', 'Base_Material', 'material'] : undefined}
                    resources={[]}
                    scale={[1, 1, 1]}
                    lightReceivingBitMask={1}
                    onLoadEnd={() => console.log('SUCCESS: 3D Model loaded successfully')}
                />
            </ViroNode>
        </ViroARScene>
    );
}
