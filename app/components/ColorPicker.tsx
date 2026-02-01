import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ColorPickerProps {
    onColorChange: (name: string, code: string) => void;
    selectedColor?: string;
}

export default function ColorPicker({ onColorChange, selectedColor = '#FFFFFF' }: ColorPickerProps) {
    const colors = [
        { name: 'Red', code: '#FF0000' },
        { name: 'Orange', code: '#FF8C00' },
        { name: 'Yellow', code: '#FFD700' },
        { name: 'Green', code: '#00FF00' },
        { name: 'Blue', code: '#0080FF' },
        { name: 'Indigo', code: '#4B0082' },
        { name: 'Purple', code: '#9370DB' },
        { name: 'Silver', code: '#C0C0C0' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Black', code: '#1a1a1a' },
    ];

    const [selected, setSelected] = useState(selectedColor);

    const handleColorSelect = (color: { name: string; code: string }) => {
        setSelected(color.code);
        onColorChange(color.name, color.code);
    };

    const selectedColorName = colors.find(c => c.code === selected)?.name || 'White';

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Color: {selectedColorName}</Text>
            <View style={styles.grid}>
                {colors.map((color) => (
                    <TouchableOpacity
                        key={color.code}
                        style={[
                            styles.colorSwatch,
                            { backgroundColor: color.code },
                            selected === color.code && styles.selectedSwatch,
                        ]}
                        onPress={() => handleColorSelect(color)}
                        activeOpacity={0.7}
                    >
                        {selected === color.code && (
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={color.code === '#FFFFFF' || color.code === '#FFD700' ? '#000' : '#fff'}
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 10,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    colorSwatch: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    selectedSwatch: {
        borderColor: '#fff',
        borderWidth: 4,
        transform: [{ scale: 1.1 }],
    },
});
