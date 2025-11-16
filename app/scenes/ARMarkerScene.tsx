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

export default function ARMarkerScene(props: any) {
  const [carScale, setCarScale] = useState(0.08);
  const [carRotation, setCarRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [imageFound, setImageFound] = useState(false);
  const [animationRun, setAnimationRun] = useState(false);

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

  const onAnchorFound = useCallback(() => {
    setImageFound(true);
    setAnimationRun(true);
  }, []);

  const onAnchorRemoved = useCallback(() => {
    setImageFound(false);
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
            source={require('../../assets/models/car.glb')}
            type="GLB"
            resources={[]}
            scale={[1, 1, 1]}
            lightReceivingBitMask={1}
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
