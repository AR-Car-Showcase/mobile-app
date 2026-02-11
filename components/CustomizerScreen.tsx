import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, PanResponder } from 'react-native';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber/native';
import { Center, useGLTF } from '@react-three/drei/native';
import { GLTFLoader, DRACOLoader } from 'three-stdlib';
import { useCarContext } from '../app/context/CarContext';
import * as THREE from 'three';
import { CarModels, DEFAULT_MODEL_URL, getRawModelUrl } from '../constants/CarModels';
import { getModelUrl } from '../app/services/blenderService';

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

function SceneController({
    targetRotationY,
    targetRotationX,
    targetZoom,
    rotationYRef,
    rotationXRef,
    zoomRef,
    viewType,
    autoRotate = false,
    modelPath = DEFAULT_MODEL_URL
}: {
    targetRotationY: number,
    targetRotationX: number,
    targetZoom: number,
    rotationYRef: React.MutableRefObject<number>,
    rotationXRef: React.MutableRefObject<number>,
    zoomRef: React.MutableRefObject<number>,
    viewType: 'exterior' | 'interior',
    autoRotate?: boolean,
    modelPath?: string
}) {
    const { camera } = useThree();
    const groupRef = useRef<THREE.Group>(null);

    const modelToLoad = useMemo(() => {
        if (modelPath) {
            if (modelPath.startsWith('http') || modelPath.startsWith('/api/')) {
                return getModelUrl(modelPath);
            }

            const fileName = modelPath.split('/').pop() || 'car.glb';
            if (CarModels[fileName]) {
                return CarModels[fileName].uri;
            }
            return getRawModelUrl(fileName);
        }
        return DEFAULT_MODEL_URL;
    }, [modelPath]);

    const { scene } = useGLTF(modelToLoad) as any;
    const { config } = useCarContext();
    const materialsRef = useRef<THREE.Material[]>([]);
    const originalColorsRef = useRef<{ [key: string]: string }>({});
    const initializedRef = useRef(false);

    useEffect(() => {
        if (scene && !initializedRef.current) {
            const configurableMaterials = Object.keys(config.materials);
            let count = 0;
            scene.traverse((child: any) => {
                if (child.isMesh && child.material) {
                    const matName = child.material.name.toLowerCase();

                    if (matName.includes('glass') || matName.includes('window') || matName.includes('windshield')) {
                        child.material.transparent = true;
                        child.material.opacity = 0.3;
                        child.material.side = THREE.DoubleSide;
                    }

                    if (configurableMaterials.includes(child.material.name)) {
                        if (!originalColorsRef.current[child.material.name]) {
                            originalColorsRef.current[child.material.name] = child.material.color.getStyle();
                        }
                        child.material = child.material.clone();
                        child.material.metalness = 0.6;
                        child.material.roughness = 0.2;
                        materialsRef.current.push(child.material);
                        count++;
                    }
                }
            });
            initializedRef.current = true;
        }
    }, [scene]);

    useEffect(() => {
        if (materialsRef.current.length > 0) {
            materialsRef.current.forEach((material: any) => {
                const colorHex = config.showCustomized
                    ? config.materials[material.name]
                    : originalColorsRef.current[material.name];

                if (colorHex) {
                    material.color.set(colorHex);
                    material.needsUpdate = true;
                }
            });
        }
    }, [config.materials, config.showCustomized]);

    useEffect(() => {
        rotationYRef.current = targetRotationY;
    }, [targetRotationY]);

    useEffect(() => {
        rotationXRef.current = targetRotationX;
    }, [targetRotationX]);

    useEffect(() => {
        zoomRef.current = targetZoom;
    }, [targetZoom]);

    useFrame((state, delta) => {
        if (autoRotate && viewType === 'exterior') {
            rotationYRef.current += delta * 0.3;
        }

        if (groupRef.current) {
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationYRef.current, 0.4);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotationXRef.current, 0.4);
        }

        if (viewType === 'interior') {
            const targetPos = new THREE.Vector3(-0.5, 0.7, 0.2);
            camera.position.lerp(targetPos, 0.1);

            const lookPos = new THREE.Vector3(-0.5, 0.7, 5);
            const rotatedLookPos = lookPos.applyEuler(new THREE.Euler(0, rotationYRef.current, 0));
            camera.lookAt(rotatedLookPos);
        } else {
            const distance = THREE.MathUtils.lerp(camera.position.length(), zoomRef.current, 0.4);
            const angle = Math.PI / 4;
            const targetPos = new THREE.Vector3(
                distance * Math.cos(angle),
                distance * Math.sin(angle) * 0.5 + 2,
                distance * Math.sin(angle)
            );
            camera.position.lerp(targetPos, 0.1);
            camera.lookAt(0, 0, 0);
        }
    });

    return (
        <group ref={groupRef} dispose={null}>
            <Center>
                <primitive
                    object={scene}
                    scale={[1.5, 1.5, 1.5]}
                    rotation={[0, Math.PI, 0]}
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
    modelPath
}: CustomizerScreenProps) {
    const [loading, setLoading] = useState(true);
    const bgColor = theme === 'dark' ? '#111' : '#f0f0f0';

    const rotationYRef = useRef(rotationY);
    const rotationXRef = useRef(rotationX);
    const zoomRef = useRef(zoom);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => touchEnabled,
        onMoveShouldSetPanResponder: () => touchEnabled,
        onPanResponderMove: (e, gestureState) => {
            if (e.nativeEvent.touches.length === 2) {
                const touch1 = e.nativeEvent.touches[0];
                const touch2 = e.nativeEvent.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.pageX - touch1.pageX, 2) +
                    Math.pow(touch2.pageY - touch1.pageY, 2)
                );

                if (!(panResponder as any)._lastDist) {
                    (panResponder as any)._lastDist = currentDistance;
                    return;
                }

                const delta = ((panResponder as any)._lastDist - currentDistance) * 0.02;
                (panResponder as any)._lastDist = currentDistance;
                zoomRef.current = Math.max(3, Math.min(10, zoomRef.current + delta));
            } else if (e.nativeEvent.touches.length === 1) {
                const lastDx = (panResponder as any)._lastDx || 0;
                const lastDy = (panResponder as any)._lastDy || 0;

                const deltaX = (gestureState.dx - lastDx) * 0.01;
                const deltaY = (gestureState.dy - lastDy) * 0.01;

                (panResponder as any)._lastDx = gestureState.dx;
                (panResponder as any)._lastDy = gestureState.dy;

                rotationYRef.current += deltaX;
                rotationXRef.current = Math.max(-1.2, Math.min(1.2, rotationXRef.current + deltaY));
            }
        },
        onPanResponderRelease: () => {
            (panResponder as any)._lastDist = null;
            (panResponder as any)._lastDx = 0;
            (panResponder as any)._lastDy = 0;

            onRotationYChange(rotationYRef.current);
            onRotationXChange(rotationXRef.current);
            onZoomChange(zoomRef.current);
        },
    }), [touchEnabled]);

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
