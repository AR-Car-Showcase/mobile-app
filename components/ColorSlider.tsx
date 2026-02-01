import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    PanResponder,
    Animated,
    Dimensions,
    Text,
} from 'react-native';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 60;
const POINTER_SIZE = 24;

interface ColorSliderProps {
    onColorChange: (color: string, code: string) => void;
    initialValue?: number;
}

export default function ColorSlider({ onColorChange, initialValue = 0 }: ColorSliderProps) {
    const colors = [
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

    const pan = useRef(new Animated.Value(initialValue * (SLIDER_WIDTH / (colors.length - 1)))).current;
    const [selectedIdx, setSelectedIdx] = useState(initialValue);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (e, gestureState) => {
                let newX = gestureState.moveX - 20 - 10;

                if (newX < 0) newX = 0;
                if (newX > SLIDER_WIDTH) newX = SLIDER_WIDTH;

                pan.setValue(newX);

                const idx = Math.round((newX / SLIDER_WIDTH) * (colors.length - 1));
                if (idx !== selectedIdx && idx >= 0 && idx < colors.length) {
                    console.log('INFO: Color selected:', colors[idx].name, colors[idx].code);
                    setSelectedIdx(idx);
                    onColorChange(colors[idx].value, colors[idx].code);
                }
            },
            onPanResponderRelease: (e, gestureState) => {
                const currentValue = (pan as any)._value;
                const idx = Math.round((currentValue / SLIDER_WIDTH) * (colors.length - 1));
                const constrainedIdx = Math.max(0, Math.min(colors.length - 1, idx));
                const finalX = constrainedIdx * (SLIDER_WIDTH / (colors.length - 1));

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
            <Text style={styles.label}>Custom Colors: {colors[selectedIdx].name}</Text>
            <View style={styles.sliderTrackWrapper}>
                <View style={styles.sliderTrack}>
                    {colors.map((c, i) => (
                        <View
                            key={i}
                            style={[
                                styles.colorSegment,
                                { backgroundColor: c.code, flex: 1 }
                            ]}
                        />
                    ))}
                </View>
                <Animated.View
                    style={[
                        styles.pointer,
                        {
                            transform: [{ translateX: pan }],
                            backgroundColor: colors[selectedIdx].code,
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
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderRadius: 16,
        marginHorizontal: 10,
    },
    label: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    sliderTrackWrapper: {
        height: 40,
        justifyContent: 'center',
        paddingVertical: 5,
    },
    sliderTrack: {
        height: 16,
        flexDirection: 'row',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#222',
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
        borderWidth: 4,
        borderColor: '#fff',
        top: 6,
        marginLeft: -14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 8,
    },
});
