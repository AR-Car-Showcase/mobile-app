import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Car } from '../../../../../types/car';
import { radius, spacing } from '../../../../theme';

interface PriceCardProps {
    priceRange: string;
    rating: string | number;
    colors: any;
}

export function PriceCard({ priceRange, rating, colors }: PriceCardProps) {
    return (
        <View style={[styles.priceCard, { backgroundColor: colors.surface }]}>
            <View>
                <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Estimated Price</Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>{priceRange}</Text>
                <Text style={[styles.priceDetail, { color: colors.textSecondary }]}>Ex-showroom</Text>
            </View>
            <View style={styles.ratingContainer}>
                <Ionicons name="star" size={20} color={colors.accent} />
                <Text style={[styles.ratingText, { color: colors.text }]}>{Number(rating) || 4.5}</Text>
            </View>
        </View>
    );
}

interface QuickSpecsBarProps {
    car: Car;
    mergedSpecs: Record<string, any>;
    colors: any;
}

export function QuickSpecsBar({ car, mergedSpecs, colors }: QuickSpecsBarProps) {
    const quickSpecsData = [
        { label: 'Engine', value: mergedSpecs['Engine Displacement'] || mergedSpecs['Displacement'], icon: 'engine', library: 'MCI' },
        { label: 'Fuel', value: mergedSpecs['Fuel Type'] || car.fuelType, icon: 'gas-station', library: 'MCI' },
        { label: 'Seats', value: mergedSpecs['Seating Capacity'] || car.seatingCapacity, icon: 'car-seat', library: 'MCI' },
        { label: 'Transmission', value: mergedSpecs['Transmission Type'] || mergedSpecs['Gearbox'] || car.transmissionType, icon: 'cog-outline', library: 'MCI' },
    ].filter(item => item.value);

    return (
        <View style={[styles.quickSpecsBar, { backgroundColor: colors.surface }]}>
            {quickSpecsData.map((item, index) => (
                <View key={index} style={styles.quickSpecItem}>
                    {item.library === 'MCI' ? (
                        <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.accent} />
                    ) : (
                        <Ionicons name={item.icon as any} size={20} color={colors.accent} />
                    )}
                    <Text style={[styles.quickSpecValue, { color: colors.text }]} numberOfLines={1}>{item.value}</Text>
                    <Text style={[styles.quickSpecLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    priceCard: {
        margin: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
    },
    priceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: spacing.xxs,
    },
    priceDetail: {
        fontSize: 12,
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xxs,
    },
    ratingText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    quickSpecsBar: {
        flexDirection: 'row',
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
        padding: spacing.md,
        borderRadius: radius.md,
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    quickSpecItem: {
        alignItems: 'center',
        flex: 1,
    },
    quickSpecValue: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: spacing.xxs,
    },
    quickSpecLabel: {
        fontSize: 11,
        marginTop: 2,
    },
});
