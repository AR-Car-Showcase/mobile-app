import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Car } from '../../../../types/car';
import { recommendationsApi } from '../../../../api/recommendations';
import { radius, spacing } from '../../../theme';

interface PersonalRecommendationsProps {
    recommendedCars: Car[];
    colors: any;
}

export function PersonalRecommendations({ recommendedCars, colors }: PersonalRecommendationsProps) {
    const router = useRouter();

    if (recommendedCars.length === 0) return null;

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for You</Text>
            </View>

            <View style={styles.verticalList}>
                {recommendedCars.map((car, index) => (
                    <Pressable
                        key={`${car.brand}-${car.model}-rec-${index}`}
                        style={[styles.recommendedCard, { backgroundColor: colors.surface }]}
                        onPress={() => {
                            recommendationsApi.trackInteraction(car.id, 'click');
                            router.push({
                                pathname: '/details',
                                params: { id: car.id }
                            });
                        }}
                    >
                        <Image
                            source={{ uri: car.images.exterior[0] }}
                            style={styles.recommendedImage}
                        />
                        <View style={styles.recommendedContent}>
                            <Text style={[styles.recommendedTitle, { color: colors.text }]}>
                                {car.brand.charAt(0).toUpperCase() + car.brand.slice(1)} {car.model.charAt(0).toUpperCase() + car.model.slice(1)}
                            </Text>
                            <Text style={{ color: colors.textSecondary }}>{car.bodyType} • {car.fuelType}</Text>
                            <Text style={{ color: colors.accent, fontWeight: 'bold', marginTop: 4 }}>{car.priceRange}</Text>
                        </View>
                        <View style={[styles.actionIcon, { backgroundColor: colors.surfaceHighlight }]}>
                            <Ionicons name="arrow-forward" size={20} color={colors.text} />
                        </View>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    verticalList: {
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },
    recommendedCard: {
        flexDirection: 'row',
        padding: spacing.sm,
        borderRadius: radius.lg,
        alignItems: 'center',
        gap: spacing.sm,
    },
    recommendedImage: {
        width: 80,
        height: 60,
        borderRadius: radius.sm,
    },
    recommendedContent: {
        flex: 1,
    },
    recommendedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionIcon: {
        padding: spacing.xs,
        borderRadius: 20,
    },
});
