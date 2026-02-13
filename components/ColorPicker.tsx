import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
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
    const [showHexInput, setShowHexInput] = useState(false);
    const selected = currentColors[activeMaterial] || '#FFFFFF';
    const [localHex, setLocalHex] = useState(selected);
    const isInternalUpdate = useRef(false);
    const ColorPickerComp = ColorPickerWheel as any;

    useEffect(() => {
        if (!isInternalUpdate.current) {
            setLocalHex(selected);
        }
        isInternalUpdate.current = false;
    }, [selected, activeMaterial]);

    const onColorChangeWheel = (color: string) => {
        if (color.toLowerCase() === selected.toLowerCase()) return;

        isInternalUpdate.current = true;
        setLocalHex(color.toUpperCase());
        onColorChange(activeMaterial, color);
    };

    const onHexInputChange = (text: string) => {
        const filtered = text.replace(/[^#A-Fa-f0-9]/g, '').toUpperCase();
        setLocalHex(filtered);

        const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
        if (hexRegex.test(filtered)) {
            isInternalUpdate.current = true;
            onColorChange(activeMaterial, filtered);
        }
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

            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={[styles.hexToggleButton, showHexInput && styles.activeHexToggleButton]}
                    onPress={() => setShowHexInput(!showHexInput)}
                >
                    <Text style={styles.hexToggleText}>HEX ENTRY</Text>
                </TouchableOpacity>

                {showHexInput && (
                    <View style={styles.hexInputContainer}>
                        <TextInput
                            style={styles.hexInput}
                            value={localHex}
                            onChangeText={onHexInputChange}
                            placeholder="#FFFFFF"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            autoCapitalize="characters"
                            maxLength={7}
                            autoCorrect={false}
                            spellCheck={false}
                            autoComplete="off"
                        />
                    </View>
                )}
            </View>

            <View style={styles.pickerWrapper}>
                <ColorPickerComp
                    color={selected}
                    onColorChange={onColorChangeWheel}
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
        height: 420,
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
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        gap: 12,
        zIndex: 10,
    },
    hexToggleButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    activeHexToggleButton: {
        backgroundColor: '#3b82f6',
        borderColor: '#60a5fa',
    },
    hexToggleText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    hexInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 36,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        width: 100,
    },
    hexInput: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        padding: 0,
    },
});
