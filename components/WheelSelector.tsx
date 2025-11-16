import React from 'react';
import { View, Pressable, Text, StyleSheet, ScrollView } from 'react-native';

interface WheelSelectorProps {
  selectedWheel: string;
  onWheelSelect: (wheel: string) => void;
}

export default function WheelSelector({ selectedWheel, onWheelSelect }: WheelSelectorProps) {
  const wheels = ['Stock', 'Sport', 'Luxury', 'Off-Road', 'Custom'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Wheels</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {wheels.map((wheel) => (
          <Pressable
            key={wheel}
            style={[
              styles.wheelButton,
              selectedWheel === wheel && styles.wheelButtonActive,
            ]}
            onPress={() => onWheelSelect(wheel)}
          >
            <Text style={styles.wheelText}>{wheel}</Text>
          </Pressable>
        ))}
      </ScrollView>
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
  wheelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  wheelButtonActive: {
    backgroundColor: '#007AFF',
  },
  wheelText: {
    color: '#fff',
    fontWeight: '600',
  },
});
