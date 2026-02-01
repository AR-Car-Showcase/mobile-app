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

export default function ARSurfaceScene(props?: any) {
  const [carScale, setCarScale] = useState(0.08);
  const [carRotation, setCarRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [anchorPosition, setAnchorPosition] = useState<[number, number, number]>([0, 0, -1]);
  const isPlacedRef = useRef(false);

  const selectedColorCode =
    props.sceneNavigator?.viroAppProps?.selectedColorCode || '#FF0000';

  useEffect(() => {
    ViroMaterials.createMaterials({
      body: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
      body2: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
      Coloured_Material: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
      Base_Material: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
      material: { lightingModel: 'PBR', diffuseColor: selectedColorCode, metalness: 0.2, roughness: 0.5 },
    });
    console.log('INFO: Car material updated with color:', selectedColorCode);
  }, [selectedColorCode]);

  const rotateLeft = useCallback(() => {
    setCarRotation(prev => [prev[0], prev[1] + 30, prev[2]]);
  }, []);

  const rotateRight = useCallback(() => {
    setCarRotation(prev => [prev[0], prev[1] - 30, prev[2]]);
  }, []);

  const zoomIn = useCallback(() => {
    setCarScale(prev => Math.min(0.3, prev + 0.05));
  }, []);

  const zoomOut = useCallback(() => {
    setCarScale(prev => Math.max(0.05, prev - 0.05));
  }, []);

  if (props.sceneNavigator?.viroAppProps?.sceneRef) {
    props.sceneNavigator.viroAppProps.sceneRef.current = {
      rotateLeft,
      rotateRight,
      zoomIn,
      zoomOut,
    };
  }

  const onPlaneDetected = useCallback((anchor: any) => {
    if (!isPlacedRef.current) {
      isPlacedRef.current = true;
      setAnchorPosition([
        anchor.position[0],
        anchor.position[1] + 0.01,
        anchor.position[2],
      ]);
      console.log('INFO: Plane detected at:', anchor.position);
    }
  }, []);

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={400} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[1, -1, -1]}
        intensity={800}
      />

      <ViroARPlane alignment="Horizontal" onAnchorFound={onPlaneDetected}>
        <ViroQuad
          rotation={[-90, 0, 0]}
          width={2}
          height={2}
          opacity={0.3}
        />
      </ViroARPlane>

      <ViroNode
        position={anchorPosition}
        scale={[carScale, carScale, carScale]}
        rotation={carRotation}
      >
        <Viro3DObject
          key={selectedColorCode}
          source={require('../../assets/models/car.glb')}
          type="GLB"
          resources={[]}
          scale={[1, 1, 1]}
          lightReceivingBitMask={1}
        />

      </ViroNode>

      <ViroText
        text={`Car Color: ${selectedColorCode}`}
        position={[0, 0.45, -0.8]}
        scale={[0.15, 0.15, 0.15]}
        style={{ color: '#FFFFFF', fontSize: 12 }}
      />
    </ViroARScene>
  );
}
