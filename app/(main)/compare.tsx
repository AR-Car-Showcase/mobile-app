import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CommonStyles } from '../../constants';
import { getAllCars, searchCars } from '../../api/cars';
import { Car } from '../../types/car';
import { parsePrice, parseEngine, parsePower, parseMileage, parseTorque } from '../../utils/comparisonUtils';

const SPEC_KEYS = [
    { key: 'priceRange', label: 'Price (Ex-Showroom)', type: 'price' },
    { key: 'mileage', label: 'Mileage', type: 'mileage' },
    { key: 'engine', label: 'Engine', type: 'engine' },
    { key: 'power', label: 'Max Power', type: 'power' },
    { key: 'torque', label: 'Max Torque', type: 'torque' },
    { key: 'seatingCapacity', label: 'Seating Capacity', type: 'number' },
    { key: 'rating', label: 'User Rating', type: 'rating' },
];

export default function CompareScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [selectedCars, setSelectedCars] = useState<Car[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchResults, setSearchResults] = useState<Car[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadInitialCars();
    }, []);

    const loadInitialCars = async () => {
        setLoading(true);
        const allCars = await getAllCars();
        setSearchResults(allCars);
        setLoading(false);
    };

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 1) {
            const results = await searchCars(text);
            setSearchResults(results);
        } else {
            const allCars = await getAllCars();
            setSearchResults(allCars);
        }
    };

    const addCar = (car: Car) => {
        if (selectedCars.length < 3) {
            if (!selectedCars.find(c => c.id === car.id)) {
                setSelectedCars([...selectedCars, car]);
            }
        }
        setIsModalVisible(false);
    };

    const removeCar = (id: number) => {
        setSelectedCars(selectedCars.filter(c => c.id !== id));
    };

    const getSpecValue = (car: Car, key: string, type: string): string | number => {
        if (key === 'priceRange') return car.priceRange;
        if (key === 'rating') return car.rating;
        if (key === 'seatingCapacity') return car.seatingCapacity;

        const variant = car.variants?.[0];
        if (variant) {
            if (key === 'mileage') return variant.mileage;
            if (key === 'engine') return variant.engineCC;
        }

        let foundValue: string | number = '-';
        if (car.specs) {
            Object.values(car.specs).forEach(category => {
                if (typeof category === 'object') {
                    Object.entries(category).forEach(([k, v]) => {
                        if (k.toLowerCase().includes(key.toLowerCase()) ||
                            (key === 'power' && k.toLowerCase().includes('power')) ||
                            (key === 'torque' && k.toLowerCase().includes('torque'))) {
                            foundValue = v as string;
                        }
                    });
                }
            });
        }
        return foundValue === '-' ? 'N/A' : foundValue;
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.title, { color: colors.text }]}>Compare Cars</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <View style={styles.labelCol} />
                    {[0, 1, 2].map((index) => {
                        const car = selectedCars[index];
                        return (
                            <View key={index} style={styles.carCol}>
                                {car ? (
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <View style={styles.imageContainer}>
                                            <Image source={{ uri: car.images.exterior[0] }} style={styles.carImage} />
                                            <Pressable
                                                style={[styles.removeButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                                                onPress={() => removeCar(car.id)}
                                            >
                                                <Ionicons name="close" size={16} color="#FFF" />
                                            </Pressable>
                                        </View>
                                        <Text style={[styles.carName, { color: colors.text }]} numberOfLines={2}>{car.brand} {car.model}</Text>
                                    </View>
                                ) : (
                                    <Pressable
                                        style={[styles.addCard, { borderColor: colors.border }]}
                                        onPress={() => setIsModalVisible(true)}
                                    >
                                        <Ionicons name="add" size={32} color={colors.textSecondary} />
                                        <Text style={[styles.addText, { color: colors.textSecondary }]}>Add Car</Text>
                                    </Pressable>
                                )}
                            </View>
                        );
                    })}
                </View>

                {selectedCars.length > 0 ? (
                    SPEC_KEYS.map((spec) => {
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

                                    return (
                                        <View key={index} style={styles.carCol}>
                                            <Text style={[
                                                styles.specValue,
                                                { color: best ? '#4CAF50' : colors.text, fontWeight: best ? 'bold' : '500' }
                                            ]}>
                                                {val} {best && <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                            Select cars to start comparing specifications.
                        </Text>
                        <Pressable
                            style={[styles.mainAddButton, { backgroundColor: colors.accent }]}
                            onPress={() => setIsModalVisible(true)}
                        >
                            <Text style={styles.mainAddButtonText}>Add Car to Compare</Text>
                        </Pressable>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Select Car</Text>
                        <Pressable onPress={() => setIsModalVisible(false)}>
                            <Text style={{ color: colors.accent, fontSize: 16 }}>Close</Text>
                        </Pressable>
                    </View>

                    <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search by brand or model..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[styles.carListItem, { borderBottomColor: colors.border }]}
                                    onPress={() => addCar(item)}
                                >
                                    <Image source={{ uri: item.images.exterior[0] }} style={styles.listImage} />
                                    <View>
                                        <Text style={[styles.listBrand, { color: colors.textSecondary }]}>{item.brand}</Text>
                                        <Text style={[styles.listModel, { color: colors.text }]}>{item.model}</Text>
                                    </View>
                                </Pressable>
                            )}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
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
        alignItems: 'center',
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
    imageContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    carImage: {
        width: 80,
        height: 50,
        borderRadius: 4,
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
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addText: {
        fontSize: 10,
        marginTop: 4,
    },
    featureLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    specValue: {
        fontSize: 12,
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyStateText: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
    },
    mainAddButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
    },
    mainAddButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    carListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    listImage: {
        width: 60,
        height: 40,
        borderRadius: 4,
        marginRight: 16,
        resizeMode: 'cover',
    },
    listBrand: {
        fontSize: 12,
        textTransform: 'uppercase',
    },
    listModel: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
});
