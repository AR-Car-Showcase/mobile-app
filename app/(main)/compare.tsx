import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CommonStyles } from '../../constants';

const COMPARISON_DATA = {
    cars: [
        {
            id: '1',
            name: 'Bugatti Chiron',
            image: 'https://images.unsplash.com/photo-1597687843302-f8c5c4c474d2?q=80&w=1000&auto=format&fit=crop',
            price: '$3M',
            specs: {
                engine: '8.0L W16',
                power: '1500 HP',
                zeroSixty: '2.4s',
                topSpeed: '420 km/h',
                weight: '1996 kg'
            }
        },
        {
            id: '2',
            name: 'Lambo Aventador',
            image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop',
            price: '$500K',
            specs: {
                engine: '6.5L V12',
                power: '770 HP',
                zeroSixty: '2.8s',
                topSpeed: '350 km/h',
                weight: '1525 kg'
            }
        }
    ],
    features: ['engine', 'power', 'zeroSixty', 'topSpeed', 'weight']
};

const FEATURE_LABELS: Record<string, string> = {
    engine: 'Engine',
    power: 'Power',
    zeroSixty: '0-60 mph',
    topSpeed: 'Top Speed',
    weight: 'Weight'
};

export default function CompareScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.title, { color: colors.text }]}>Compare</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.row}>
                    <View style={styles.labelCol} />
                    {COMPARISON_DATA.cars.map((car, index) => (
                        <View key={car.id} style={styles.carCol}>
                            <Image source={{ uri: car.image }} style={styles.carImage} />
                            <Text style={[styles.carName, { color: colors.text }]} numberOfLines={1}>{car.name}</Text>
                            <Text style={[styles.carPrice, { color: colors.accent }]}>{car.price}</Text>
                        </View>
                    ))}
                </View>

                {COMPARISON_DATA.features.map((feature) => (
                    <View key={feature} style={[styles.specRow, { borderBottomColor: colors.border }]}>
                        <View style={styles.labelCol}>
                            <Text style={[styles.featureLabel, { color: colors.textSecondary }]}>
                                {FEATURE_LABELS[feature]}
                            </Text>
                        </View>
                        {COMPARISON_DATA.cars.map((car) => (
                            <View key={car.id} style={styles.carCol}>
                                <Text style={[styles.specValue, { color: colors.text }]}>
                                    {car.specs[feature as keyof typeof car.specs]}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}

                <View style={{ padding: 24 }}>
                    <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                        Add more cars to compare features side-by-side.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 16,
    },
    specRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    labelCol: {
        width: 100,
        paddingLeft: 16,
        justifyContent: 'center',
    },
    carCol: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    carImage: {
        width: 100,
        height: 60,
        borderRadius: 8,
        marginBottom: 8,
    },
    carName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    carPrice: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
    featureLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    specValue: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});
