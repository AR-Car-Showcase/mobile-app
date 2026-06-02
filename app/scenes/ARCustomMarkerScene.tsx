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
import { DEFAULT_MODEL_OBJ } from '../../constants/CarModels';
import { useModelSource } from '../../src/hooks';

interface ARCustomMarkerSceneProps {
  customImageUri: string | null;
  sceneNavigator?: any;
}

export default function ARCustomMarkerScene({ customImageUri, sceneNavigator }: ARCustomMarkerSceneProps) {
  const carScale = 0.08;
  const carRotation: [number, number, number] = [0, 0, 0];
  const [imageFound, setImageFound] = useState(false);
  const [animationRun, setAnimationRun] = useState(false);
  const [targetRegistered, setTargetRegistered] = useState(false);
  const mvp = sceneNavigator?.viroAppProps;
  const modelPath = mvp?.modelPath || mvp?.model3D;
  const cacheToken = mvp?.cacheToken;
  const { source: modelSourceUri, loading: modelLoading } = useModelSource(modelPath, cacheToken);

  useEffect(() => {
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
  }, []);

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
            key={`${sceneNavigator?.viroAppProps?.modelPath || 'default'}-${cacheToken || '0'}`}
            source={modelLoading ? DEFAULT_MODEL_OBJ : { uri: modelSourceUri }}
            type="GLB"
            resources={[]}
            scale={[1, 1, 1]}
            lightReceivingBitMask={1}
            onLoadStart={() => console.log('[CUSTOM] ⏳ Loading model:', sceneNavigator?.viroAppProps?.modelPath || 'default')}
            onLoadEnd={() => console.log('[CUSTOM] ✅ Model loaded successfully')}
            onError={(event: any) => console.warn('[CUSTOM] ❌ Failed to load model:', event.nativeEvent.error)}
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
