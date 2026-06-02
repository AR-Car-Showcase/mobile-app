import React, { useState, useCallback } from 'react';
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

export default function ARMarkerScene(props?: any) {
  const carScale = 0.08;
  const carRotation: [number, number, number] = [0, 0, 0];
  const [imageFound, setImageFound] = useState(false);
  const [animationRun, setAnimationRun] = useState(false);

  const onAnchorFound = useCallback(() => {
    setImageFound(true);
    setAnimationRun(true);
  }, []);

  const onAnchorRemoved = useCallback(() => {
    setImageFound(false);
  }, []);

  const mvp = props.sceneNavigator?.viroAppProps;
  const modelPath = mvp?.modelPath || mvp?.model3D;
  const cacheToken = mvp?.cacheToken;
  const { source: modelSourceUri, loading: modelLoading } = useModelSource(modelPath, cacheToken);

  React.useEffect(() => {
    ViroARTrackingTargets.createTargets({
      defaultMarker: {
        source: require('../../assets/marker-image.png'),
        orientation: 'Up',
        physicalWidth: 0.2,
      },
    });

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
        target="defaultMarker"
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
            key={`${props.sceneNavigator?.viroAppProps?.modelPath || 'default'}-${cacheToken || '0'}`}
            source={modelLoading ? DEFAULT_MODEL_OBJ : { uri: modelSourceUri }}
            type="GLB"
            resources={[]}
            scale={[1, 1, 1]}
            lightReceivingBitMask={1}
            onLoadStart={() => console.log('[MARKER] ⏳ Loading model:', props.sceneNavigator?.viroAppProps?.modelPath || 'default')}
            onLoadEnd={() => console.log('[MARKER] ✅ Model loaded successfully')}
            onError={(event: any) => console.warn('[MARKER] ❌ Failed to load model:', event.nativeEvent.error)}
          />
        </ViroNode>
      </ViroARImageMarker>

      <ViroText
        text={imageFound ? "Use controls to adjust" : "Point camera at marker image"}
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
