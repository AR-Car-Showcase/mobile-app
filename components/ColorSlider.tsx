import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    PanResponder,
    Animated,
    Dimensions,
    Text,
} from 'react-native';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 60;
const Theme = Colors.dark;

interface ColorSliderProps {
    onColorChange: (color: string, code: string) => void;
    initialValue?: number;
}

const COLOR_PRESETS = [
    { name: 'Red', value: 'redMaterial', code: '#FF0000' },
    { name: 'Orange', value: 'orangeMaterial', code: '#FFA500' },
    { name: 'Yellow', value: 'yellowMaterial', code: '#FFFF00' },
    { name: 'Green', value: 'greenMaterial', code: '#008000' },
    { name: 'Blue', value: 'blueMaterial', code: '#0000FF' },
    { name: 'Indigo', value: 'indigoMaterial', code: '#4B0082' },
    { name: 'Violet', value: 'violetMaterial', code: '#EE82EE' },
    { name: 'Silver', value: 'silverMaterial', code: '#C0C0C0' },
    { name: 'White', value: 'whiteMaterial', code: '#FFFFFF' },
    { name: 'Black', value: 'blackMaterial', code: '#000000' },
];

export default function ColorSlider({ onColorChange, initialValue = 0 }: ColorSliderProps) {
    const pan = useRef(new Animated.Value(initialValue * (SLIDER_WIDTH / (COLOR_PRESETS.length - 1)))).current;
    const [selectedIdx, setSelectedIdx] = useState(initialValue);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                let newX = gestureState.moveX - 30;

                if (newX < 0) newX = 0;
                if (newX > SLIDER_WIDTH) newX = SLIDER_WIDTH;

                pan.setValue(newX);

                const idx = Math.round((newX / SLIDER_WIDTH) * (COLOR_PRESETS.length - 1));
                if (idx !== selectedIdx && idx >= 0 && idx < COLOR_PRESETS.length) {
                    setSelectedIdx(idx);
                    onColorChange(COLOR_PRESETS[idx].value, COLOR_PRESETS[idx].code);
                }
            },
            onPanResponderRelease: () => {
                const idx = Math.round(((pan as any)._value / SLIDER_WIDTH) * (COLOR_PRESETS.length - 1));
                const constrainedIdx = Math.max(0, Math.min(COLOR_PRESETS.length - 1, idx));
                const finalX = constrainedIdx * (SLIDER_WIDTH / (COLOR_PRESETS.length - 1));

                Animated.spring(pan, {
                    toValue: finalX,
                    useNativeDriver: false,
                    friction: 7,
                }).start();
            },
        })
    ).current;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Custom Colors: {COLOR_PRESETS[selectedIdx].name}</Text>
            <View style={styles.sliderTrackWrapper}>
                <View style={styles.sliderTrack}>
                    {COLOR_PRESETS.map((preset, index) => (
                        <View
                            key={index}
                            style={[
                                styles.colorSegment,
                                { backgroundColor: preset.code, flex: 1 }
                            ]}
                        />
                    ))}
                </View>
                <Animated.View
                    style={[
                        styles.pointer,
                        {
                            transform: [{ translateX: pan }],
                            backgroundColor: COLOR_PRESETS[selectedIdx].code,
                        },
                    ]}
                    {...panResponder.panHandlers}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        borderRadius: 16,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
    label: {
        color: Theme.text,
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    sliderTrackWrapper: {
        height: 40,
        justifyContent: 'center',
        paddingVertical: 5,
    },
    sliderTrack: {
        height: 12,
        flexDirection: 'row',
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    colorSegment: {
        height: '100%',
    },
    pointer: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 3,
        borderColor: '#fff',
        top: 6,
        marginLeft: -14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
});
