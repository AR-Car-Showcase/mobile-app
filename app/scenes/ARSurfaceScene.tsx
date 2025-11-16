import React, { useState, useRef, useCallback, useImperativeHandle } from 'react';
import {
  ViroARScene,
  ViroNode,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroText,
  ViroARPlane,
  ViroQuad,
} from '@reactvision/react-viro';

export default function ARSurfaceScene(props: any) {
  const [carScale, setCarScale] = useState(0.08);
  const [carRotation, setCarRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [anchorPosition, setAnchorPosition] = useState<[number, number, number]>([0, 0, -1]);
  const [surfaceDetected, setSurfaceDetected] = useState(false);
  const isPlacedRef = useRef(false);

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
      setSurfaceDetected(true);
      setAnchorPosition([
        anchor.position[0],
        anchor.position[1] + 0.005,
        anchor.position[2]
      ]);
    }
  }, []);

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[1, -1, -1]}
        intensity={600}
        castsShadow={true}
      />

      <ViroARPlane
        minHeight={0.1}
        minWidth={0.1}
        alignment="Horizontal"
        onAnchorFound={onPlaneDetected}
      >
        <ViroQuad
          rotation={[-90, 0, 0]}
          width={2}
          height={2}
          materials={['white']}
          opacity={0.6}
        />
      </ViroARPlane>

      <ViroNode
        position={anchorPosition}
        scale={[carScale, carScale, carScale]}
        rotation={carRotation}
      >
        <Viro3DObject
          source={require('../../assets/models/car.glb')}
          type="GLB"
          resources={[]}
          scale={[1, 1, 1]}
          lightReceivingBitMask={1}
        />
      </ViroNode>

      <ViroText
        text={surfaceDetected ? "Use controls to adjust" : "Point at a flat surface"}
        position={[0, 0.45, -0.8]}
        scale={[0.18, 0.18, 0.18]}
        style={{
          color: surfaceDetected ? '#00FF00' : '#FFFF00',
          fontSize: 12
        }}
      />
    </ViroARScene>
  );
}
