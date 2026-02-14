import React, { Suspense, useRef, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Canvas, useThree, useFrame } from '@react-three/fiber/native';
import { Center, useGLTF } from '@react-three/drei/native';
import { useCarContext } from '../app/context/CarContext';
import * as THREE from 'three';
import { DEFAULT_MODEL_URL } from '../constants/CarModels';
import { useModelSource } from '../hooks/useModelSource';
import { useSceneMaterials } from '../hooks/useSceneMaterials';
import { useSceneCleanup } from '../hooks/useSceneCleanup';
import { useTouchGestures } from '../hooks/useTouchGestures';

interface CustomizerScreenProps {
    rotationY: number;
    rotationX: number;
    zoom: number;
    onRotationYChange: (rotation: number) => void;
    onRotationXChange: (rotation: number) => void;
    onZoomChange: (zoom: number) => void;
    touchEnabled: boolean;
    theme: 'dark' | 'light';
    viewType: 'exterior' | 'interior';
    autoRotate?: boolean;
    modelPath?: string;
}

interface SceneControllerProps {
    targetRotationY: number;
    targetRotationX: number;
    targetZoom: number;
    rotationYRef: React.MutableRefObject<number>;
    rotationXRef: React.MutableRefObject<number>;
    zoomRef: React.MutableRefObject<number>;
    viewType: 'exterior' | 'interior';
    autoRotate?: boolean;
    modelPath?: string;
}

const LERP_FACTOR = 0.4;
const CAMERA_LERP_FACTOR = 0.1;
const AUTO_ROTATE_SPEED = 0.3;
const MODEL_SCALE: [number, number, number] = [1.5, 1.5, 1.5];
const MODEL_ROTATION: [number, number, number] = [0, Math.PI, 0];
const INTERIOR_POSITION = new THREE.Vector3(-0.5, 0.7, 0.2);
const INTERIOR_LOOK_BASE = new THREE.Vector3(-0.5, 0.7, 5);
const CAMERA_ANGLE = Math.PI / 4;
const LOADING_DELAY_MS = 500;

function SceneController({
    targetRotationY,
    targetRotationX,
    targetZoom,
    rotationYRef,
    rotationXRef,
    zoomRef,
    viewType,
    autoRotate = false,
    modelPath = DEFAULT_MODEL_URL,
}: SceneControllerProps) {
    const { camera } = useThree();
    const groupRef = useRef<THREE.Group>(null);
    const modelToLoad = useModelSource(modelPath);
    const { scene } = useGLTF(modelToLoad) as any;
    const { config } = useCarContext();

    const { materialsRef, originalColorsRef } = useSceneMaterials(scene, config.materials);
    useSceneCleanup(scene, materialsRef, originalColorsRef);

    useEffect(() => {
        rotationYRef.current = targetRotationY;
    }, [targetRotationY]);

    useEffect(() => {
        rotationXRef.current = targetRotationX;
    }, [targetRotationX]);

    useEffect(() => {
        zoomRef.current = targetZoom;
    }, [targetZoom]);

    useFrame((_, delta) => {
        if (autoRotate && viewType === 'exterior') {
            rotationYRef.current += delta * AUTO_ROTATE_SPEED;
        }

        if (groupRef.current) {
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationYRef.current, LERP_FACTOR);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotationXRef.current, LERP_FACTOR);
        }

        if (viewType === 'interior') {
            camera.position.lerp(INTERIOR_POSITION, CAMERA_LERP_FACTOR);
            const rotatedLookPos = INTERIOR_LOOK_BASE.clone().applyEuler(new THREE.Euler(0, rotationYRef.current, 0));
            camera.lookAt(rotatedLookPos);
        } else {
            const distance = THREE.MathUtils.lerp(camera.position.length(), zoomRef.current, LERP_FACTOR);
            const targetPos = new THREE.Vector3(
                distance * Math.cos(CAMERA_ANGLE),
                distance * Math.sin(CAMERA_ANGLE) * 0.5 + 2,
                distance * Math.sin(CAMERA_ANGLE)
            );
            camera.position.lerp(targetPos, CAMERA_LERP_FACTOR);
            camera.lookAt(0, 0, 0);
        }
    });

    return (
        <group ref={groupRef} dispose={null}>
            <Center>
                <primitive
                    object={scene}
                    scale={MODEL_SCALE}
                    rotation={MODEL_ROTATION}
                    dispose={null}
                />
            </Center>
        </group>
    );
}

export default function CustomizerScreen({
    rotationY,
    rotationX,
    zoom,
    onRotationYChange,
    onRotationXChange,
    onZoomChange,
    touchEnabled,
    theme,
    viewType,
    autoRotate,
    modelPath,
}: CustomizerScreenProps) {
    const [loading, setLoading] = useState(true);
    const bgColor = theme === 'dark' ? '#111' : '#f0f0f0';

    const rotationYRef = useRef(rotationY);
    const rotationXRef = useRef(rotationX);
    const zoomRef = useRef(zoom);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), LOADING_DELAY_MS);
        return () => clearTimeout(timer);
    }, []);

    const panResponder = useTouchGestures(
        touchEnabled,
        rotationYRef,
        rotationXRef,
        zoomRef,
        { onRotationYChange, onRotationXChange, onZoomChange }
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]} {...panResponder.panHandlers}>
            {loading && (
                <View style={[styles.loader, { backgroundColor: bgColor }]}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Initializing Studio...</Text>
                </View>
            )}

            <Canvas
                shadows
                camera={{ position: [5, 2, 5], fov: 45 }}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
            >
                <color attach="background" args={[bgColor]} />
                <ambientLight intensity={theme === 'dark' ? 0.5 : 0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <hemisphereLight args={['#ffffff', theme === 'dark' ? '#222' : '#888', 0.6]} />
                <Suspense fallback={null}>
                    <SceneController
                        targetRotationY={rotationY}
                        targetRotationX={rotationX}
                        targetZoom={zoom}
                        rotationYRef={rotationYRef}
                        rotationXRef={rotationXRef}
                        zoomRef={zoomRef}
                        viewType={viewType}
                        autoRotate={autoRotate}
                        modelPath={modelPath}
                    />
                </Suspense>
            </Canvas>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingText: {
        color: '#3b82f6',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
});

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
useGLTF.preload(DEFAULT_MODEL_URL);
