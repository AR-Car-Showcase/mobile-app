import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CommonStyles, ARStyles, Colors } from '../../constants';
import { HybridStyles as styles } from '../../constants/HybridStyles';
import { CarProvider, useCarContext } from '../context/CarContext';
import { getCarByBrandAndModel, getCarById } from '../../api/cars';
import CustomizerScreen from '../../components/CustomizerScreen';
import CustomizationDrawer from '../../components/CustomizationDrawer';
import { generateCustomModel, getModelUrl } from '../services/blenderService';
import { customizationsApi } from '../../api/customizations';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARHybridScene from '../scenes/ARHybridScene';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const MIN_ZOOM = 1.5;
const MAX_ZOOM = 20;
const ZOOM_STEP = 0.5;

function HybridContent() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors } = useTheme();
    const [viewMode, setViewMode] = useState<'3D' | 'AR'>('3D');
    const { config, updateMaterialColor, setShowCustomized, resetCustomization } = useCarContext();
    const [activeMaterial, setActiveMaterial] = useState('CAR_BODY_PRIMARY');
    const [showSpecs, setShowSpecs] = useState(false);
    const [backgroundTheme, setBackgroundTheme] = useState<'dark' | 'light'>('dark');
    const [viewType, setViewType] = useState<'exterior' | 'interior'>('exterior');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [autoRotate, setAutoRotate] = useState(false);
    const [car, setCar] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [rotationY, setRotationY] = useState(0);
    const [rotationX, setRotationX] = useState(0);
    const [zoom, setZoom] = useState(5);

    const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const sceneRef = useRef<any>(null);

    React.useEffect(() => {
        const loadInitialData = async () => {
            if (params.carData) {
                try {
                    const carData = JSON.parse(params.carData as string);
                    setCar(carData);
                    console.log('[HYBRID] Using car data passed from details screen');
                } catch (e) {
                    console.error('[HYBRID] Failed to parse carData param:', e);
                }
            }
            else if (params.id) {
                const carData = await getCarById(params.id as string);
                if (carData) setCar(carData);
                console.log(`[HYBRID] Fetched car ${params.id} from API`);
            } else if (params.brand && params.model) {
                const carData = await getCarByBrandAndModel(params.brand as string, params.model as string);
                if (carData) setCar(carData);
                console.log('[HYBRID] Fetched car data from API');
            }

            if (params.customizationId) {
                console.log('[HYBRID] Loading saved customization:', params.customizationId);
                if (params.materials) {
                    try {
                        const mats = JSON.parse(params.materials as string);
                        Object.keys(mats).forEach(key => {
                            updateMaterialColor(key, mats[key]);
                        });
                        setShowCustomized(true);
                    } catch (e) {
                        console.error('[HYBRID] Failed to parse materials:', e);
                    }
                }
                if (params.modelUrl) {
                    setGeneratedModelUrl(params.modelUrl as string);
                }
            } else {
                console.log('[HYBRID] Original view - resetting customization');
                resetCustomization();
            }

            if (params.initialMode) {
                setViewMode(params.initialMode as '3D' | 'AR');
            }
        };
        loadInitialData();
    }, [params.carData, params.brand, params.model, params.id, params.initialMode, params.customizationId]);

    const handleRotateLeft = () => sceneRef.current?.rotateLeft?.();
    const handleRotateRight = () => sceneRef.current?.rotateRight?.();
    const handleZoomIn = () => {
        if (viewMode === '3D') {
            setZoom(prev => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
        } else {
            sceneRef.current?.zoomIn?.();
        }
    };

    const handleZoomOut = () => {
        if (viewMode === '3D') {
            setZoom(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
        } else {
            sceneRef.current?.zoomOut?.();
        }
    };

    const resetPosition = () => {
        console.log('[HYBRID] Resetting camera position');
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
            console.log('[HYBRID] Generating custom model for AR');
            const result = await generateCustomModel({
                vehicleId: car?.id?.toString(),
                materials: config.materials
            });

            const modelUrl = getModelUrl(result.filename);
            console.log('[HYBRID] Model generated:', modelUrl);
            setGeneratedModelUrl(modelUrl);
            setShowCustomized(true);
            setViewMode('AR');
        } catch (error: any) {
            console.error('[HYBRID] Generation failed:', error);
            Alert.alert('Error', error.message || 'Generation service unavailable.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveCustomization = async () => {
        if (!car?.id) return;
        setIsSaving(true);
        try {
            await customizationsApi.saveCustomization(car.id.toString(), config.materials);
            Alert.alert('Success', 'Model saved to your showroom!');
            setIsPickerVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save customization.');
        } finally {
            setIsSaving(false);
        }
    };

    const Theme = Colors.dark;
    const dynamicIconColor = backgroundTheme === 'dark' ? '#FFFFFF' : '#1A1A1A';
    const dynamicButtonBg = backgroundTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

    return (
        <View style={[CommonStyles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { top: 60, paddingHorizontal: 16, paddingTop: 10 }]}>
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: dynamicButtonBg }]} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={dynamicIconColor} />
                </TouchableOpacity>

                <View style={[styles.modelToggle, { flex: 1, marginHorizontal: 20, alignItems: 'center', backgroundColor: backgroundTheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
                    <Text style={[styles.headerTitle, { color: dynamicIconColor }]}>{car?.brand?.toUpperCase()} {car?.model?.toUpperCase()}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.toggleButton, { backgroundColor: viewMode === 'AR' ? '#FF3B30' : Colors.dark.accent, paddingVertical: 8, paddingHorizontal: 16 }]}
                    onPress={() => setViewMode(prev => prev === '3D' ? 'AR' : '3D')}
                >
                    <Text style={[styles.toggleText, { fontSize: 13 }]}>{viewMode === '3D' ? 'AR MODE' : '3D MODE'}</Text>
                </TouchableOpacity>
            </View>

            {viewMode === '3D' && (
                <View style={{ position: 'absolute', left: 20, top: 140, gap: 15, zIndex: 10 }}>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: dynamicButtonBg }]}
                        onPress={() => setBackgroundTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                    >
                        <Ionicons name={backgroundTheme === 'dark' ? "sunny-outline" : "moon-outline"} size={22} color={dynamicIconColor} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: autoRotate ? Colors.dark.accent : dynamicButtonBg }]}
                        onPress={() => setAutoRotate(!autoRotate)}
                    >
                        <Ionicons name="refresh-outline" size={22} color={autoRotate ? "white" : dynamicIconColor} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: dynamicButtonBg }]}
                        onPress={() => setViewType(prev => prev === 'exterior' ? 'interior' : 'exterior')}
                    >
                        <Ionicons name={viewType === 'exterior' ? "car-outline" : "glasses-outline"} size={22} color={dynamicIconColor} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: isPickerVisible ? Colors.dark.accent : dynamicButtonBg }]}
                        onPress={() => setIsPickerVisible(!isPickerVisible)}
                    >
                        <Ionicons name="color-palette-outline" size={22} color={isPickerVisible ? "white" : dynamicIconColor} />
                    </TouchableOpacity>
                </View>
            )}

            {viewMode === '3D' && (
                <View style={{ position: 'absolute', right: 20, top: 140, gap: 15, zIndex: 10 }}>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: dynamicButtonBg }]} onPress={handleZoomIn}>
                        <Ionicons name="add" size={24} color={dynamicIconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: dynamicButtonBg }]} onPress={handleZoomOut}>
                        <Ionicons name="remove" size={24} color={dynamicIconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: dynamicButtonBg }]} onPress={resetPosition}>
                        <MaterialIcons name="center-focus-weak" size={24} color={dynamicIconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: showSpecs ? Colors.dark.accent : dynamicButtonBg }]} onPress={() => setShowSpecs(!showSpecs)}>
                        <Ionicons name="information-circle-outline" size={24} color={showSpecs ? "white" : dynamicIconColor} />
                    </TouchableOpacity>
                </View>
            )}

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
                        modelPath={car?.model3D || params.modelFile as string}
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
                                showCustomized: config.showCustomized,
                                modelPath: car?.model3D || params.modelFile as string
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

                {viewMode === '3D' && (
                    <View style={styles.alignmentPointerWrapper}>
                        <TouchableOpacity style={[styles.resetButton, { backgroundColor: backgroundTheme === 'dark' ? 'rgba(20, 20, 20, 0.8)' : 'rgba(255, 255, 255, 0.9)' }]} onPress={resetPosition}>
                            <MaterialIcons name="explore" size={28} color={dynamicIconColor} />
                        </TouchableOpacity>
                    </View>
                )}

                {viewMode === 'AR' && (
                    <View style={styles.bottomControls}>
                        {showSpecs && car && (
                            <View style={styles.specsPanel}>
                                <Text style={styles.specTitle}>{car.brand.toUpperCase()} {car.model.toUpperCase()} Specs</Text>
                                <View style={styles.specRow}><Text style={styles.specLabel}>Body Type</Text><Text style={styles.specValue}>{car.body_type}</Text></View>
                                <View style={styles.specRow}><Text style={styles.specLabel}>Fuel Type</Text><Text style={styles.specValue}>{car.fuel_type}</Text></View>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {viewMode === '3D' && (
                <CustomizationDrawer
                    isVisible={isPickerVisible}
                    onClose={() => setIsPickerVisible(false)}
                    onApply={handleApplyToAR}
                    onSave={handleSaveCustomization}
                    isGenerating={isGenerating}
                    isSaving={isSaving}
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
