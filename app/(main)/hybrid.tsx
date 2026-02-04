import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CommonStyles, ARStyles, Colors } from '../../constants';
import { HybridStyles as styles } from '../../constants/HybridStyles';
import { CarProvider, useCarContext } from '../context/CarContext';
import CustomizerScreen from '../../components/CustomizerScreen';
import CustomizationDrawer from '../../components/CustomizationDrawer';
import { generateCustomModel, getModelUrl } from '../services/blenderService';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARHybridScene from '../scenes/ARHybridScene';

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
            setGeneratedModelUrl(modelUrl);
            setViewMode('AR');
        } catch (error) {
            console.error('[ERROR] Generation failed:', error);
            Alert.alert('Error', 'Generation service unavailable.');
        } finally {
            setIsGenerating(false);
        }
    };

    const Theme = Colors.dark;

    return (
        <View style={CommonStyles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
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
                                style={[styles.iconButton, { marginLeft: 12, backgroundColor: autoRotate ? Theme.accent : 'rgba(0,0,0,0.5)' }]}
                                onPress={() => setAutoRotate(!autoRotate)}
                            >
                                <Ionicons name="refresh-circle-outline" size={24} color="white" />
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
                                style={[styles.iconButton, { marginRight: 12, backgroundColor: isPickerVisible ? Theme.accent : 'rgba(0,0,0,0.5)' }]}
                                onPress={() => setIsPickerVisible(!isPickerVisible)}
                            >
                                <Ionicons name="color-filter-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity style={styles.iconButton} onPress={() => setShowSpecs(!showSpecs)}>
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
                        touchEnabled={true}
                        theme={backgroundTheme}
                        viewType={viewType}
                        autoRotate={autoRotate}
                    />
                ) : (
                    <View style={styles.arContainer}>
                        <ViroARSceneNavigator
                            autofocus={true}
                            initialScene={{ scene: ARHybridScene }}
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
                        <TouchableOpacity style={styles.toggleButton} onPress={() => setViewMode('3D')}>
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
                    <ActivityIndicator size="large" color={Theme.accent} />
                    <Text style={styles.loadingText}>Generating Model...</Text>
                </View>
            )}
        </View>
    );
}

export default function HybridScreen() {
    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false
                }}
            />
            <CarProvider>
                <HybridContent />
            </CarProvider>
        </>
    );
}
