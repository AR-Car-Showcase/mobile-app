import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Car } from '../../../../types/car';
import { radius, spacing } from '../../../theme';

interface CompareCarSlotProps {
    car: Car | undefined;
    colors: any;
    onRemove: (id: number) => void;
    onAdd: () => void;
}

export function CompareCarSlot({ car, colors, onRemove, onAdd }: CompareCarSlotProps) {
    if (car) {
        return (
            <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: car.images.exterior[0] }} style={styles.carImage} />
                    <Pressable
                        style={[styles.removeButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                        onPress={() => onRemove(car.id)}
                    >
                        <Ionicons name="close" size={16} color="#FFF" />
                    </Pressable>
                </View>
                <Text style={[styles.carName, { color: colors.text }]} numberOfLines={2}>
                    {car.brand} {car.model}
                </Text>
            </View>
        );
    }

    return (
        <Pressable
            style={[styles.addCard, { borderColor: colors.border }]}
            onPress={onAdd}
        >
            <Ionicons name="add" size={32} color={colors.textSecondary} />
            <Text style={[styles.addText, { color: colors.textSecondary }]}>Add Car</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        position: 'relative',
        marginBottom: spacing.xs,
    },
    carImage: {
        width: 80,
        height: 50,
        borderRadius: radius.xs,
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carName: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    addCard: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addText: {
        fontSize: 10,
        marginTop: spacing.xxs,
    },
});
