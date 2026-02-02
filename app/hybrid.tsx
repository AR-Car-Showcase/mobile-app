import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CommonStyles, ARStyles, Colors } from '../constants';
import { CarProvider, useCarContext } from './context/CarContext';
import CustomizerScreen from './components/CustomizerScreen';
import CustomizationDrawer from './components/CustomizationDrawer';
import { generateCustomModel, getModelUrl } from './services/blenderService';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARHybridScene from './scenes/ARHybridScene';


function HybridContent() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'3D' | 'AR'>('3D');
    const { config, updateMaterialColor, setShowCustomized } = useCarContext();
    const [activeMaterial, setActiveMaterial] = useState('CAR_BODY_PRIMARY');
    const [showSpecs, setShowSpecs] = useState(false);
    const [backgroundTheme, setBackgroundTheme] = useState<'dark' | 'light'>('dark');
    const [viewType, setViewType] = useState<'exterior' | 'interior'>('exterior');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [autoRotate, setAutoRotate] = useState(false);

    const [rotationY, setRotationY] = useState(0);
    const [rotationX, setRotationX] = useState(0);
    const [zoom, setZoom] = useState(5);
    const [touchEnabled, setTouchEnabled] = useState(true);

    const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const sceneRef = useRef<any>(null);

    const handleRotateLeft = () => sceneRef.current?.rotateLeft?.();
    const handleRotateRight = () => sceneRef.current?.rotateRight?.();
    const handleZoomIn = () => sceneRef.current?.zoomIn?.();
    const handleZoomOut = () => sceneRef.current?.zoomOut?.();

    const resetPosition = () => {
        if (viewMode === '3D') {
            setRotationY(0);
            setRotationX(0);
            setZoom(5);
        } else {
            sceneRef.current?.reset?.();
        }
    };

    const handleApplyToAR = async () => {
        setIsGenerating(true);
        try {
            const result = await generateCustomModel({
                materials: config.materials,
                showCustomized: true
            } as any);

            const modelUrl = getModelUrl(result.filename);
            console.log('[INFO] Model generated:', modelUrl);
            setGeneratedModelUrl(modelUrl);
            setViewMode('AR');
        } catch (error) {
            console.error('[ERROR] Generation failed:', error);
            Alert.alert('Error', 'Generation service unavailable.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <View style={CommonStyles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    {viewMode === '3D' && (
                        <>
                            <TouchableOpacity
                                style={[styles.iconButton, { marginLeft: 12 }]}
                                onPress={() => setBackgroundTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                            >
                                <Ionicons
                                    name={backgroundTheme === 'dark' ? "sunny-outline" : "moon-outline"}
                                    size={24}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, { marginLeft: 12, backgroundColor: autoRotate ? '#3b82f6' : 'rgba(0,0,0,0.5)' }]}
                                onPress={() => setAutoRotate(!autoRotate)}
                            >
                                <Ionicons
                                    name="refresh-circle-outline"
                                    size={24}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Bugatti Chiron</Text>
                    <TouchableOpacity
                        style={styles.modelToggle}
                        onPress={() => setShowCustomized(!config.showCustomized)}
                    >
                        <Text style={styles.modelToggleText}>
                            {config.showCustomized ? 'CUSTOMIZED' : 'ORIGINAL'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.headerRight}>
                    {viewMode === '3D' && (
                        <>
                            <TouchableOpacity
                                style={[styles.iconButton, { marginRight: 12 }]}
                                onPress={() => setViewType(prev => prev === 'exterior' ? 'interior' : 'exterior')}
                            >
                                <Ionicons
                                    name={viewType === 'exterior' ? "car-outline" : "glasses-outline"}
                                    size={24}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, { marginRight: 12, backgroundColor: isPickerVisible ? '#3b82f6' : 'rgba(0,0,0,0.5)' }]}
                                onPress={() => setIsPickerVisible(!isPickerVisible)}
                            >
                                <Ionicons
                                    name="color-filter-outline"
                                    size={24}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setShowSpecs(!showSpecs)}
                    >
                        <Ionicons name="information-circle-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.contentArea}>
                {viewMode === '3D' ? (
                    <CustomizerScreen
                        rotationY={rotationY}
                        rotationX={rotationX}
                        zoom={zoom}
                        onRotationYChange={setRotationY}
                        onRotationXChange={setRotationX}
                        onZoomChange={setZoom}
                        touchEnabled={touchEnabled}
                        theme={backgroundTheme}
                        viewType={viewType}
                        autoRotate={autoRotate}
                    />
                ) : (
                    <View style={styles.arContainer}>
                        <ViroARSceneNavigator
                            autofocus={true}
                            initialScene={{
                                scene: ARHybridScene,
                            }}
                            viroAppProps={{
                                sceneRef,
                                materials: config.materials,
                                customModelUrl: generatedModelUrl,
                                showCustomized: config.showCustomized
                            }}
                            style={styles.arView}
                        />
                    </View>
                )}

                {viewMode === 'AR' && (
                    <View style={ARStyles.controlButtons}>
                        <View style={ARStyles.rotationButtons}>
                            <TouchableOpacity style={ARStyles.controlBtn} onPress={handleRotateLeft}>
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={ARStyles.controlBtn} onPress={handleRotateRight}>
                                <Ionicons name="arrow-forward" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={ARStyles.zoomButtons}>
                            <TouchableOpacity style={ARStyles.controlBtn} onPress={handleZoomIn}>
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={ARStyles.controlBtn} onPress={handleZoomOut}>
                                <Ionicons name="remove" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.alignmentPointerWrapper}>
                    <TouchableOpacity style={styles.resetButton} onPress={resetPosition}>
                        <MaterialIcons name="explore" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                {viewMode === 'AR' && (
                    <View style={styles.bottomControls}>
                        {showSpecs && (
                            <View style={styles.specsPanel}>
                                <Text style={styles.specTitle}>Bugatti Chiron Specs</Text>
                                <View style={styles.specRow}><Text style={styles.specLabel}>Engine</Text><Text style={styles.specValue}>8.0L W16</Text></View>
                                <View style={styles.specRow}><Text style={styles.specLabel}>Power</Text><Text style={styles.specValue}>1500 HP</Text></View>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setViewMode('3D')}
                        >
                            <Text style={styles.toggleText}>Back to 3D View</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {viewMode === '3D' && (
                <CustomizationDrawer
                    isVisible={isPickerVisible}
                    onClose={() => setIsPickerVisible(false)}
                    onApply={handleApplyToAR}
                    isGenerating={isGenerating}
                    activeMaterial={activeMaterial}
                    setActiveMaterial={setActiveMaterial}
                    onColorChange={updateMaterialColor}
                    currentColors={config.materials}
                />
            )}

            {isGenerating && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Generating Model...</Text>
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    modelToggle: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.5)',
    },
    modelToggleText: {
        color: '#60a5fa',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        zIndex: 50,
    },
    actionBarLeft: {
        flexDirection: 'row',
    },
    actionBarRight: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    contentArea: {
        flex: 1,
    },
    arContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    arView: {
        flex: 1,
    },
    alignmentPointerWrapper: {
        position: 'absolute',
        right: 20,
        bottom: 220,
        zIndex: 20,
    },
    resetButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    toggleButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        backgroundColor: Colors.accent,
        alignSelf: 'center',
    },
    toggleText: {
        color: 'white',
        fontWeight: 'bold',
    },
    bottomControls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    specsPanel: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        width: '80%',
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
    pickerPanel: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 30,
        backgroundColor: 'rgba(20, 20, 20, 0.9)',
        borderRadius: 25,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 100,
    },
    applyButton: {
        marginTop: 15,
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 40,
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
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
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
