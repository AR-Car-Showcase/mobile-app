import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, PanResponder } from 'react-native';
import { Canvas, useThree, useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import { useCarContext } from '../context/CarContext';
import * as THREE from 'three';

interface CustomizerScreenProps {
    rotation: number;
    zoom: number;
    onRotationChange: (rotation: number) => void;
    onZoomChange: (zoom: number) => void;
    touchEnabled: boolean;
}


function SceneController({
    targetRotation,
    targetZoom,
    rotationRef,
    zoomRef
}: {
    targetRotation: number,
    targetZoom: number,
    rotationRef: React.MutableRefObject<number>,
    zoomRef: React.MutableRefObject<number>
}) {
    const { camera } = useThree();
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF(require('../../assets/models/car.glb')) as any;
    const { config } = useCarContext();
    const materialsRef = useRef<THREE.Material[]>([]);
    const initializedRef = useRef(false);


    useEffect(() => {
        if (scene && !initializedRef.current) {
            scene.traverse((child: any) => {
                if (child.isMesh) {
                    const matName = child.material?.name;
                    if (matName === 'body' || matName === 'body2' ||
                        matName === 'Coloured_Material' || matName === 'Base_Material' ||
                        matName === 'material') {
                        child.material = child.material.clone();
                        child.material.metalness = 0.6;
                        child.material.roughness = 0.2;
                        materialsRef.current.push(child.material);
                    }
                }
            });
            initializedRef.current = true;
        }
    }, [scene]);


    useEffect(() => {
        if (materialsRef.current.length > 0) {
            materialsRef.current.forEach((material: any) => {
                material.color.set(config.selectedColor);
                material.needsUpdate = true;
            });
        }
    }, [config.selectedColor]);


    useEffect(() => {
        rotationRef.current = targetRotation;
    }, [targetRotation]);

    useEffect(() => {
        zoomRef.current = targetZoom;
    }, [targetZoom]);


    useFrame(() => {
        if (groupRef.current) {

            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationRef.current, 0.2);
        }


        const distance = THREE.MathUtils.lerp(camera.position.length(), zoomRef.current, 0.2);
        const angle = Math.PI / 4;

        camera.position.set(
            distance * Math.cos(angle),
            distance * 0.4,
            distance * Math.sin(angle)
        );
        camera.lookAt(0, 0, 0);
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} scale={[1.5, 1.5, 1.5]} position={[0, -0.5, 0]} />
        </group>
    );
}

export default function CustomizerScreen({
    rotation,
    zoom,
    onRotationChange,
    onZoomChange,
    touchEnabled
}: CustomizerScreenProps) {
    const [loading, setLoading] = useState(true);


    const rotationRef = useRef(rotation);
    const zoomRef = useRef(zoom);


    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => touchEnabled,
        onMoveShouldSetPanResponder: () => touchEnabled,

        onPanResponderGrant: (e) => {

        },

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



                rotationRef.current += gestureState.vx * 0.1; // Use velocity for extra smoothness


                const lastDx = (panResponder as any)._lastDx || 0;
                const deltaX = (gestureState.dx - lastDx) * 0.01;
                (panResponder as any)._lastDx = gestureState.dx;

                rotationRef.current += deltaX;
            }
        },

        onPanResponderRelease: () => {
            (panResponder as any)._lastDist = null;
            (panResponder as any)._lastDx = 0;


            onRotationChange(rotationRef.current);
            onZoomChange(zoomRef.current);
        },
    }), [touchEnabled, onRotationChange, onZoomChange]);

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            {loading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Initializing Studio...</Text>
                </View>
            )}

            <Canvas
                shadows
                camera={{ position: [5, 2, 5], fov: 45 }}
                gl={{
                    antialias: true,
                    powerPreference: 'high-performance',
                    precision: 'lowp'
                }}
            >
                <color attach="background" args={['#111']} />

                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <hemisphereLight args={['#ffffff', '#222222', 0.4]} />

                <Suspense fallback={null}>
                    <SceneController
                        targetRotation={rotation}
                        targetZoom={zoom}
                        rotationRef={rotationRef}
                        zoomRef={zoomRef}
                    />
                </Suspense>
            </Canvas>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
        zIndex: 999,
    },
    loadingText: {
        color: '#3b82f6',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
});

useGLTF.preload(require('../../assets/models/car.glb'));
