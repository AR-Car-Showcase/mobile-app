import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CommonStyles } from '../constants';
import { CarProvider, useCarContext } from './context/CarContext';
import CustomizerScreen from './components/CustomizerScreen';
import ColorPicker from './components/ColorPicker';
import { generateCustomModel, getModelUrl } from './services/blenderService';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARHybridScene from './scenes/ARHybridScene';

function HybridContent() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'3D' | 'AR'>('3D');
    const { config, updateColor } = useCarContext();
    const [showSpecs, setShowSpecs] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(5);
    const [touchEnabled, setTouchEnabled] = useState(true);

    const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const sceneRef = useRef<any>(null);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleRotateLeft = () => {
        if (viewMode === '3D') {
            setRotation(prev => prev - 0.3);
        } else {
            sceneRef.current?.rotateLeft?.();
        }
    };
    const handleRotateRight = () => {
        if (viewMode === '3D') {
            setRotation(prev => prev + 0.3);
        } else {
            sceneRef.current?.rotateRight?.();
        }
    };
    const handleZoomIn = () => {
        if (viewMode === '3D') {
            setZoom(prev => Math.max(3, prev - 0.5));
        } else {
            sceneRef.current?.zoomIn?.();
        }
    };
    const handleZoomOut = () => {
        if (viewMode === '3D') {
            setZoom(prev => Math.min(10, prev + 0.5));
        } else {
            sceneRef.current?.zoomOut?.();
        }
    };

    const handleApplyToAR = async () => {
        setIsGenerating(true);
        try {
            const result = await generateCustomModel({
                body_color: config.selectedColor,
            });

            const modelUrl = getModelUrl(result.filename);
            console.log('INFO: Final Model Path Mapping:', modelUrl);
            setGeneratedModelUrl(modelUrl);
            setViewMode('AR');
        } catch (error) {
            console.error('Generation failed:', error);
            Alert.alert('Error', 'Failed to generate custom model. Ensure Blender service is running.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <View style={CommonStyles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bugatti Chiron</Text>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowSpecs(!showSpecs)}
                >
                    <Ionicons name="information-circle-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.contentArea}>
                {viewMode === '3D' ? (
                    <CustomizerScreen
                        rotation={rotation}
                        zoom={zoom}
                        onRotationChange={setRotation}
                        onZoomChange={setZoom}
                        touchEnabled={touchEnabled}
                    />
                ) : (
                    <View style={{ flex: 1 }}>
                        <ViroARSceneNavigator
                            autofocus={true}
                            initialScene={{
                                scene: ARHybridScene,
                            }}
                            viroAppProps={{
                                sceneRef,
                                selectedColorCode: config.selectedColor,
                                customModelUrl: generatedModelUrl
                            }}
                            style={styles.arView}
                        />
                    </View>
                )}

                <View style={styles.controlsOverlayWrapper}>
                    <View style={styles.controlRow}>
                        <TouchableOpacity onPress={handleRotateLeft} style={styles.controlBtn}>
                            <Ionicons name="refresh-outline" style={{ transform: [{ scaleX: -1 }] }} size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleRotateRight} style={styles.controlBtn}>
                            <Ionicons name="refresh-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.controlRow, { marginTop: 10 }]}>
                        <TouchableOpacity onPress={handleZoomOut} style={styles.controlBtn}>
                            <Ionicons name="remove" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleZoomIn} style={styles.controlBtn}>
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    {viewMode === '3D' && (
                        <TouchableOpacity
                            onPress={() => setTouchEnabled(!touchEnabled)}
                            style={[styles.controlBtn, { marginTop: 10, width: 'auto', paddingHorizontal: 12 }]}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name={touchEnabled ? "hand-left" : "hand-left-outline"} size={20} color="white" />
                                <Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }}>
                                    {touchEnabled ? 'ON' : 'OFF'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === '3D' && styles.activeToggle]}
                        onPress={() => setViewMode('3D')}
                    >
                        <Text style={styles.toggleText}>3D Studio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'AR' && styles.activeToggle]}
                        onPress={() => setViewMode('AR')}
                    >
                        <Text style={styles.toggleText}>AR Mode</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.bottomControls}>
                {showSpecs && (
                    <Animated.View style={[styles.specsPanel, { opacity: fadeAnim }]}>
                        <Text style={styles.specTitle}>Specifications</Text>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Engine</Text>
                            <Text style={styles.specValue}>8.0L W16 Quad-Turbo</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Power</Text>
                            <Text style={styles.specValue}>1500 hp</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>0-60 mph</Text>
                            <Text style={styles.specValue}>2.4 s</Text>
                        </View>
                    </Animated.View>
                )}

                {viewMode === '3D' && (
                    <View style={styles.sliderContainer}>
                        <ColorPicker
                            onColorChange={(name, hex) => {
                                updateColor(name, hex);
                            }}
                            selectedColor={config.selectedColor}
                        />
                        <TouchableOpacity
                            style={[
                                styles.applyButton,
                                isGenerating && styles.applyButtonDisabled
                            ]}
                            onPress={handleApplyToAR}
                            disabled={isGenerating}
                        >
                            <Ionicons name="color-wand" size={20} color="white" />
                            <Text style={styles.applyButtonText}>
                                {isGenerating ? 'Generating...' : 'Apply to AR'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {isGenerating && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Generating custom model...</Text>
                    <Text style={styles.loadingSubtext}>
                        This runs Blender in the background to create a unique GLB file.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    contentArea: {
        flex: 1,
    },
    arView: {
        flex: 1,
    },
    controlsOverlayWrapper: {
        position: 'absolute',
        left: 20,
        bottom: 220,
        zIndex: 20,
    },
    controlRow: {
        flexDirection: 'row',
        gap: 12,
    },
    controlBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    toggleContainer: {
        position: 'absolute',
        top: 100,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 25,
        padding: 4,
        zIndex: 10,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    activeToggle: {
        backgroundColor: '#3b82f6',
    },
    toggleText: {
        color: 'white',
        fontWeight: '600',
    },
    bottomControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 40,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    specsPanel: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    specTitle: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    specLabel: {
        color: '#aaa',
    },
    specValue: {
        color: 'white',
        fontWeight: 'bold',
    },
    sliderContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingVertical: 15,
        borderRadius: 20,
        width: '100%',
    },
    applyButton: {
        marginTop: 15,
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    applyButtonDisabled: {
        backgroundColor: '#1e40af',
        opacity: 0.7,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    loadingSubtext: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default function HybridScreen() {
    return (
        <CarProvider>
            <Stack.Screen options={{ headerShown: false }} />
            <HybridContent />
        </CarProvider>
    );
}
