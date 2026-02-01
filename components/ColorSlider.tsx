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
    onColorChange: (color: string) => void;
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
                let newX = gestureState.moveX - 30; // 30 is horizontal padding
                if (newX < 0) newX = 0;
                if (newX > SLIDER_WIDTH) newX = SLIDER_WIDTH;

                pan.setValue(newX);

                const idx = Math.round((newX / SLIDER_WIDTH) * (colors.length - 1));
                if (idx !== selectedIdx) {
                    setSelectedIdx(idx);
                    onColorChange(colors[idx].value);
                }
            },
            onPanResponderRelease: (e, gestureState) => {
                const idx = Math.round((pan._value / SLIDER_WIDTH) * (colors.length - 1));
                const finalX = idx * (SLIDER_WIDTH / (colors.length - 1));
                Animated.spring(pan, {
                    toValue: finalX,
                    useNativeDriver: false,
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
        paddingHorizontal: 30,
        paddingVertical: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    sliderTrackWrapper: {
        height: 30,
        justifyContent: 'center',
    },
    sliderTrack: {
        height: 12,
        flexDirection: 'row',
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#333',
    },
    colorSegment: {
        height: '100%',
    },
    pointer: {
        position: 'absolute',
        width: POINTER_SIZE,
        height: POINTER_SIZE,
        borderRadius: POINTER_SIZE / 2,
        borderWidth: 3,
        borderColor: '#fff',
        top: 3,
        marginLeft: -POINTER_SIZE / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 5,
    },
});
