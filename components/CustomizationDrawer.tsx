import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    PanResponder,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import ColorPicker from './ColorPicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = 620;
const CLOSED_OFFSET = DRAWER_HEIGHT - 60;

interface CustomizationDrawerProps {
    isVisible: boolean;
    onClose: () => void;
    onApply: () => void;
    onSave: () => void;
    isGenerating: boolean;
    isSaving: boolean;
    activeMaterial: string;
    setActiveMaterial: (name: string) => void;
    onColorChange: (materialName: string, colorHex: string) => void;
    currentColors: { [key: string]: string };
}

export default function CustomizationDrawer({
    isVisible,
    onClose,
    onApply,
    onSave,
    isGenerating,
    isSaving,
    activeMaterial,
    setActiveMaterial,
    onColorChange,
    currentColors
}: CustomizationDrawerProps) {
    const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: isVisible ? 0 : DRAWER_HEIGHT,
            useNativeDriver: true,
            tension: 50,
            friction: 8
        }).start();
    }, [isVisible]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120 || gestureState.vy > 0.5) {
                    onClose();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8
                    }).start();
                }
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.drawer,
                { transform: [{ translateY }] }
            ]}
        >
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                <View {...panResponder.panHandlers} style={styles.handleContainer}>
                    <View style={styles.handle} />
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>Customization</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ColorPicker
                        onColorChange={onColorChange}
                        activeMaterial={activeMaterial}
                        setActiveMaterial={setActiveMaterial}
                        currentColors={currentColors}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.applyButton,
                                isGenerating && styles.applyButtonDisabled
                            ]}
                            onPress={onApply}
                            disabled={isGenerating}
                        >
                            <Ionicons name="color-wand" size={20} color="white" />
                            <Text style={styles.applyButtonText}>
                                {isGenerating ? 'Generating...' : 'Apply to AR'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                isSaving && styles.saveButtonDisabled
                            ]}
                            onPress={onSave}
                            disabled={isSaving}
                        >
                            <Ionicons name="save-outline" size={20} color="white" />
                            <Text style={styles.saveButtonText}>
                                {isSaving ? 'Saving...' : 'Save Build'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </BlurView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    drawer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: DRAWER_HEIGHT,
        zIndex: 1000,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    blurContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    handleContainer: {
        height: 30,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    closeButton: {
        padding: 5,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    saveButton: {
        backgroundColor: '#10b981',
        flexDirection: 'row',
        height: 54,
        flex: 1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonDisabled: {
        backgroundColor: '#064e3b',
        opacity: 0.6,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    applyButton: {
        backgroundColor: '#3b82f6',
        flexDirection: 'row',
        height: 54,
        flex: 1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    applyButtonDisabled: {
        backgroundColor: '#1e3a8a',
        opacity: 0.6,
    },
});
