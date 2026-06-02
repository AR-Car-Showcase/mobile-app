import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import CarCard from '../../../../components/CarCard';
import { Car } from '../../../../types/car';
import { spacing } from '../../../theme';

interface FeaturedCarsProps {
    featuredCars: Car[];
    colors: any;
}

export function FeaturedCars({ featuredCars, colors }: FeaturedCarsProps) {
    const router = useRouter();

    if (featuredCars.length === 0) return null;

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Cars</Text>
                <Pressable onPress={() => router.push('/explore')}>
                    <Text style={{ color: colors.accent }}>View All</Text>
                </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {featuredCars.map((car, index) => (
                    <CarCard
                        key={`${car.brand}-${car.model}-${index}`}
                        id={`${car.brand}-${car.model}`}
                        name={`${car.brand.charAt(0).toUpperCase() + car.brand.slice(1)} ${car.model.charAt(0).toUpperCase() + car.model.slice(1)}`}
                        image={car.images.exterior[0]}
                        price={car.priceRange}
                        rating={Number(car.rating) || 4.5}
                        onPress={() => router.push({
                            pathname: '/details',
                            params: { id: car.id }
                        })}
                        modelPath={car.model3D}
                        featured
                    />
                ))}
            </ScrollView>
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
    horizontalList: {
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },
});
