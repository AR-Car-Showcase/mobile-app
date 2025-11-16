import React from 'react';
import { View, Pressable, Text, StyleSheet, ScrollView } from 'react-native';

interface InteriorSelectorProps {
  selectedInterior: string;
  onInteriorSelect: (interior: string) => void;
}

export default function InteriorSelector({ selectedInterior, onInteriorSelect }: InteriorSelectorProps) {
  const interiors = ['Leather', 'Suede', 'Fabric', 'Eco', 'Premium'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Interior</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {interiors.map((interior) => (
          <Pressable
            key={interior}
            style={[
              styles.interiorButton,
              selectedInterior === interior && styles.interiorButtonActive,
            ]}
            onPress={() => onInteriorSelect(interior)}
          >
            <Text style={styles.interiorText}>{interior}</Text>
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
  interiorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  interiorButtonActive: {
    backgroundColor: '#34C759',
  },
  interiorText: {
    color: '#fff',
    fontWeight: '600',
  },
});
