import React from 'react';
import { View, Pressable, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';

interface WheelSelectorProps {
  selectedWheel: string;
  onWheelSelect: (wheel: string) => void;
}

export default function WheelSelector({ selectedWheel, onWheelSelect }: WheelSelectorProps) {
  const wheels = ['Stock', 'Sport', 'Luxury', 'Off-Road', 'Custom'];
  const Theme = Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: Theme.surface }]}>
      <Text style={[styles.title, { color: Theme.text }]}>Select Wheels</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {wheels.map((wheel) => {
          const isActive = selectedWheel === wheel;
          return (
            <Pressable
              key={wheel}
              style={[
                styles.wheelButton,
                { backgroundColor: isActive ? Theme.accent : Theme.surfaceHighlight }
              ]}
              onPress={() => onWheelSelect(wheel)}
            >
              <Text style={[styles.wheelText, { color: isActive ? '#FFF' : Theme.textSecondary }]}>{wheel}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  wheelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  wheelText: {
    fontWeight: '600',
  },
});
