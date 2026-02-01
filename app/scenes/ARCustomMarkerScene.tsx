import React, { useState, useCallback, useEffect } from 'react';
import {
  ViroARScene,
  ViroNode,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroText,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroAnimations,
} from '@reactvision/react-viro';

interface ARCustomMarkerSceneProps {
  customImageUri: string | null;
  sceneNavigator?: any;
}

ViroAnimations.registerAnimations({
  scaleIn: {
    properties: { scaleX: 0.08, scaleY: 0.08, scaleZ: 0.08 },
    duration: 500,
    easing: 'bounce',
  },
  scaleOut: {
    properties: { scaleX: 0, scaleY: 0, scaleZ: 0 },
    duration: 200,
  },
});

export default function ARCustomMarkerScene({ customImageUri, sceneNavigator }: ARCustomMarkerSceneProps) {
  const [carScale, setCarScale] = useState(0.08);
  const [carRotation, setCarRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [imageFound, setImageFound] = useState(false);
  const [animationRun, setAnimationRun] = useState(false);
  const [targetRegistered, setTargetRegistered] = useState(false);

  useEffect(() => {
    if (customImageUri) {
      ViroARTrackingTargets.createTargets({
        customMarker: {
          source: { uri: customImageUri },
          orientation: 'Up',
          physicalWidth: 0.2,
        },
      });
      setTargetRegistered(true);
    }
  }, [customImageUri]);

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



  const onAnchorFound = useCallback(() => {
    setImageFound(true);
    setAnimationRun(true);
  }, []);

  const onAnchorRemoved = useCallback(() => {
    setImageFound(false);
  }, []);

  if (!targetRegistered) {
    return (
      <ViroARScene>
        <ViroAmbientLight color="#ffffff" intensity={300} />
        <ViroText
          text="Loading custom marker..."
          position={[0, 0, -1]}
          scale={[0.2, 0.2, 0.2]}
          style={{ color: '#FFFF00', fontSize: 12 }}
        />
      </ViroARScene>
    );
  }

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[1, -1, -1]}
        intensity={600}
        castsShadow={true}
      />

      <ViroARImageMarker
        target="customMarker"
        onAnchorFound={onAnchorFound}
        onAnchorRemoved={onAnchorRemoved}
      >
        <ViroNode
          position={[0, 0, 0]}
          scale={[carScale, carScale, carScale]}
          rotation={carRotation}
          animation={{
            name: imageFound ? 'scaleIn' : 'scaleOut',
            run: animationRun,
            onFinish: () => setAnimationRun(false),
          }}
        >
          <Viro3DObject
            source={require('../../assets/models/car.glb')}
            type="GLB"
            resources={[]}
            scale={[1, 1, 1]}
            lightReceivingBitMask={1}
          />
        </ViroNode>
      </ViroARImageMarker>

      <ViroText
        text={imageFound ? "Use controls to adjust" : "Point camera at your uploaded marker"}
        position={[0, 0.45, -0.8]}
        scale={[0.18, 0.18, 0.18]}
        style={{
          color: imageFound ? '#00FF00' : '#FFFF00',
          fontSize: 12
        }}
      />
    </ViroARScene>
  );
}
