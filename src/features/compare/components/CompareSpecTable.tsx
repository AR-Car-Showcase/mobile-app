import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Car } from '../../../../types/car';
import { parsePrice, parseEngine, parsePower, parseMileage, parseTorque } from '../../../../utils/comparisonUtils';
import { spacing } from '../../../theme';

const SPEC_KEYS = [
    { key: 'priceRange', label: 'Price (Ex-Showroom)', type: 'price' },
    { key: 'bodyType', label: 'Body Type', type: 'text' },
    { key: 'fuelType', label: 'Fuel Type', type: 'text' },
    { key: 'transmissionType', label: 'Transmission', type: 'text' },
    { key: 'engine', label: 'Engine (cc)', type: 'engine' },
    { key: 'mileage', label: 'Mileage', type: 'mileage' },
    { key: 'power', label: 'Max Power', type: 'power' },
    { key: 'torque', label: 'Max Torque', type: 'torque' },
    { key: 'bootSpace', label: 'Boot Space', type: 'text' },
    { key: 'fuelTankCapacity', label: 'Fuel Tank', type: 'text' },
    { key: 'topSpeed', label: 'Top Speed', type: 'text' },
    { key: 'acceleration', label: '0-100 km/h', type: 'text' },
    { key: 'groundClearance', label: 'Ground Clearance', type: 'text' },
    { key: 'seatingCapacity', label: 'Seating Capacity', type: 'number' },
    { key: 'rating', label: 'User Rating', type: 'rating' },
];

export const getSpecValue = (car: Car, key: string, type: string): string | number => {
    if (key === 'priceRange') return car.priceRange;
    if (key === 'rating') return car.rating;
    if (key === 'seatingCapacity') return car.seatingCapacity;
    if (key === 'bodyType' || key === 'fuelType' || key === 'transmissionType') {
        return car[key as keyof Car] as string || 'N/A';
    }

    const variant = car.variants?.[0];
    if (variant) {
        if (key === 'mileage') return variant.mileage;
        if (key === 'engine') return variant.engineCC;
    }

    let foundValue: string | number = '-';
    if (car.specs) {
        Object.values(car.specs).forEach((category: any) => {
            if (typeof category === 'object') {
                Object.entries(category).forEach(([k, v]) => {
                    const lowerK = k.toLowerCase();
                    const lowerKey = key.toLowerCase();
                    
                    if (lowerK.includes(lowerKey)) {
                        foundValue = v as string;
                    } else if (key === 'power' && lowerK.includes('power')) {
                        foundValue = v as string;
                    } else if (key === 'torque' && lowerK.includes('torque')) {
                        foundValue = v as string;
                    } else if (key === 'fuelTankCapacity' && lowerK.includes('fuel tank')) {
                        foundValue = v as string;
                    } else if (key === 'topSpeed' && lowerK.includes('top speed')) {
                        foundValue = v as string;
                    } else if (key === 'acceleration' && (lowerK.includes('acceleration') || lowerK.includes('0-100'))) {
                        foundValue = v as string;
                    }
                });
            }
        });
    }
    return foundValue === '-' || foundValue === '' ? 'N/A' : foundValue;
};

const isBest = (val: string | number, type: string, rowValues: (string | number)[]): boolean => {
    if (val === 'N/A' || val === '-') return false;

    const parse = (v: string | number) => {
        const strV = v.toString();
        if (type === 'price') return parsePrice(strV);
        if (type === 'mileage') return parseMileage(strV);
        if (type === 'engine') return parseEngine(strV);
        if (type === 'power') return parsePower(strV);
        if (type === 'torque') return parseTorque(strV);
        if (type === 'rating') return parseFloat(strV);
        if (type === 'number') return parseFloat(strV);
        return 0;
    };

    const currentVal = parse(val);
    const allVals = rowValues.map(v => parse(v)).filter(v => v > 0);

    if (allVals.length < 2) return false;

    if (type === 'price') {
        const min = Math.min(...allVals);
        return currentVal === min && min > 0;
    } else {
        const max = Math.max(...allVals);
        return currentVal === max && max > 0;
    }
};

interface CompareSpecTableProps {
    selectedCars: Car[];
    colors: any;
}

export function CompareSpecTable({ selectedCars, colors }: CompareSpecTableProps) {
    return (
        <>
            {SPEC_KEYS.map((spec) => {
                const rowValues = selectedCars.map(c => getSpecValue(c, spec.key, spec.type));

                return (
                    <View key={spec.key} style={[styles.specRow, { borderBottomColor: colors.border }]}>
                        <View style={styles.labelCol}>
                            <Text style={[styles.featureLabel, { color: colors.textSecondary }]}>{spec.label}</Text>
                        </View>
                        {[0, 1, 2].map((index) => {
                            const car = selectedCars[index];
                            if (!car) return <View key={index} style={styles.carCol} />;

                            const val = rowValues[index];
                            const best = selectedCars.length > 1 && isBest(val, spec.type, rowValues);

                            const renderVal = () => {
                                const lowerVal = String(val).toLowerCase();
                                const isTrue = lowerVal === 'true' || lowerVal === 'yes';
                                const isFalse = lowerVal === 'false' || lowerVal === 'no';

                                if (isTrue || isFalse) {
                                    return (
                                        <Ionicons 
                                            name={isTrue ? "checkmark-circle" : "close-circle"} 
                                            size={20} 
                                            color={isTrue ? colors.accent : colors.error} 
                                        />
                                    );
                                }

                                return (
                                    <Text style={[
                                        styles.specValue,
                                        { color: best ? '#4CAF50' : colors.text, fontWeight: best ? 'bold' : '500' }
                                    ]}>
                                        {val} {best && <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />}
                                    </Text>
                                );
                            };

                            return (
                                <View key={index} style={styles.carCol}>
                                    {renderVal()}
                                </View>
                            );
                        })}
                    </View>
                );
            })}
        </>
    );
}

const styles = StyleSheet.create({
    specRow: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    labelCol: {
        width: 100,
        paddingLeft: spacing.md,
        justifyContent: 'center',
    },
    carCol: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.xxs,
    },
    featureLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    specValue: {
        fontSize: 12,
        textAlign: 'center',
    },
});
