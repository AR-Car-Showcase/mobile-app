import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

interface Color {
  name: string;
  value: string;
  code: string;
}

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  const colors: Color[] = [
    { name: 'Red', value: 'redMaterial', code: '#FF0000' },
    { name: 'Blue', value: 'blueMaterial', code: '#0000FF' },
    { name: 'Silver', value: 'silverMaterial', code: '#C0C0C0' },
    { name: 'White', value: 'whiteMaterial', code: '#FFFFFF' },
    { name: 'Black', value: 'blackMaterial', code: '#000000' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Color</Text>
      <View style={styles.colorGrid}>
        {colors.map((color) => (
          <Pressable
            key={color.value}
            style={[
              styles.colorButton,
              {
                backgroundColor: color.code,
                borderWidth: selectedColor === color.value ? 3 : 1,
                borderColor: selectedColor === color.value ? '#FFF' : '#666',
              },
            ]}
            onPress={() => onColorSelect(color.value)}
          >
            <Text style={styles.colorName}>{color.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: '48%',
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
