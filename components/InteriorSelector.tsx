import React from 'react';
import { View, Pressable, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';

interface InteriorSelectorProps {
  selectedInterior: string;
  onInteriorSelect: (interior: string) => void;
}

const INTERIOR_OPTIONS = ['Leather', 'Suede', 'Fabric', 'Eco', 'Premium'];
const Theme = Colors.dark;

export default function InteriorSelector({ selectedInterior, onInteriorSelect }: InteriorSelectorProps) {
  return (
    <View style={[styles.container, { backgroundColor: Theme.surface }]}>
      <Text style={[styles.title, { color: Theme.text }]}>Select Interior</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {INTERIOR_OPTIONS.map((interior) => {
          const isActive = selectedInterior === interior;
          return (
            <Pressable
              key={interior}
              style={[
                styles.interiorButton,
                { backgroundColor: isActive ? Theme.success : Theme.surfaceHighlight }
              ]}
              onPress={() => onInteriorSelect(interior)}
            >
              <Text style={[styles.interiorText, { color: isActive ? '#FFF' : Theme.textSecondary }]}>{interior}</Text>
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
  interiorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  interiorText: {
    fontWeight: '600',
  },
});
