import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ColorPickerWheel from 'react-native-wheel-color-picker';

interface ColorPickerProps {
    onColorChange: (materialName: string, colorHex: string) => void;
    activeMaterial: string;
    setActiveMaterial: (name: string) => void;
    currentColors: { [key: string]: string };
}

const MATERIAL_SLOTS = [
    { id: 'CAR_BODY_PRIMARY', label: 'Main Body' },
    { id: 'CAR_BODY_SECONDARY', label: 'Accent Finish' },
    { id: 'CAR_INTERIOR_1', label: 'Dashboard & Console' },
    { id: 'CAR_INTERIOR_2', label: 'Seat Upholstery' },
    { id: 'CAR_INTERIOR_3', label: 'Interior Trims' },
    { id: 'CAR_RIM', label: 'Wheel Rims' },
    { id: 'CARBON_MATERIAL_1', label: 'Carbon Fiber' },
];

export default function ColorPicker({
    onColorChange,
    activeMaterial,
    setActiveMaterial,
    currentColors
}: ColorPickerProps) {
    const selected = currentColors[activeMaterial] || '#FFFFFF';
    const ColorPickerComp = ColorPickerWheel as any;

    const onColorChangeWheel = (color: string) => {
        onColorChange(activeMaterial, color);
    };

    return (
        <View style={styles.container}>
            <View style={styles.slotSelector}>
                {MATERIAL_SLOTS.map(slot => (
                    <TouchableOpacity
                        key={slot.id}
                        style={[
                            styles.slotButton,
                            activeMaterial === slot.id && styles.activeSlotButton
                        ]}
                        onPress={() => setActiveMaterial(slot.id)}
                    >
                        <Text style={[
                            styles.slotText,
                            activeMaterial === slot.id && styles.activeSlotText
                        ]}>{slot.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.pickerWrapper}>
                <ColorPickerComp
                    color={selected}
                    onColorChangeComplete={onColorChangeWheel}
                    thumbSize={20}
                    sliderSize={20}
                    noSnap={true}
                    row={false}
                    swatches={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        padding: 0,
        height: 340,
        width: '100%',
    },
    pickerWrapper: {
        flex: 1,
        paddingBottom: 20,
    },
    slotSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 15,
        justifyContent: 'center',
    },
    slotButton: {
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    activeSlotButton: {
        backgroundColor: '#3b82f6',
        borderColor: '#60a5fa',
    },
    slotText: {
        color: '#ccc',
        fontSize: 10,
        fontWeight: 'bold',
    },
    activeSlotText: {
        color: '#fff',
    },
});
