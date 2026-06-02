import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Car } from '../../../../../types/car';
import { spacing } from '../../../../theme';

interface DetailsActionBarProps {
    car: Car;
    modelCacheToken: number;
    colors: any;
}

export function DetailsActionBar({ car, modelCacheToken, colors }: DetailsActionBarProps) {
    const router = useRouter();

    return (
        <View style={styles.actionButtonsContainer}>
            <Pressable
                style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent }]}
                onPress={() => router.push({
                    pathname: '/hybrid',
                    params: {
                        id: car.id,
                        brand: car.brand,
                        model: car.model,
                        initialMode: 'AR',
                        modelFile: car.model3D,
                        carData: JSON.stringify(car),
                        modelCacheToken: modelCacheToken
                    }
                })}
            >
                <MaterialCommunityIcons name="cube-scan" size={24} color={colors.accent} />
                <Text style={[styles.actionButtonText, { color: colors.accent }]}>View in AR</Text>
            </Pressable>
            <Pressable
                style={[styles.actionButton, { backgroundColor: colors.accent }]}
                onPress={() => router.push({
                    pathname: '/hybrid',
                    params: {
                        id: car.id,
                        brand: car.brand,
                        model: car.model,
                        initialMode: '3D',
                        modelFile: car.model3D,
                        carData: JSON.stringify(car),
                        modelCacheToken: modelCacheToken
                    }
                })}
            >
                <Ionicons name="cube-outline" size={24} color="#FFF" />
                <Text style={[styles.actionButtonText, { color: '#FFF' }]}>View in 3D</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
