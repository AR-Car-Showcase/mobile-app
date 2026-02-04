import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import CarCard from '../../../components/CarCard';
import { router } from 'expo-router';
import { getAllCars, getBodyTypes, getCarsByBodyType } from '../../../api/cars';
import { Car } from '../../../types/car';

export default function ExploreScreen() {
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [cars, setCars] = useState<Car[]>([]);
    const [filteredCars, setFilteredCars] = useState<Car[]>([]);
    const [filters, setFilters] = useState<string[]>(['All']);

    useEffect(() => {
        loadCars();
    }, []);

    const loadCars = async () => {
        const allCars = await getAllCars();
        const bodyTypes = await getBodyTypes();
        setCars(allCars);
        setFilteredCars(allCars);
        setFilters(['All', ...bodyTypes]);
    };

    useEffect(() => {
        filterCars();
    }, [searchQuery, activeFilter, cars]);

    const filterCars = async () => {
        let result: Car[] = cars;

        if (activeFilter !== 'All') {
            result = await getCarsByBodyType(activeFilter);
        }

        if (searchQuery) {
            result = result.filter(car =>
                car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.body_type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredCars(result);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Search cars..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <Pressable style={styles.filterBtn}>
                    <Ionicons name="filter" size={24} color={colors.text} />
                </Pressable>
            </View>

            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersList}
                >
                    {filters.map((filter) => (
                        <Pressable
                            key={filter}
                            style={[
                                styles.filterChip,
                                { backgroundColor: activeFilter === filter ? colors.accent : colors.surface }
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: activeFilter === filter ? '#FFF' : colors.textSecondary }
                            ]}>
                                {filter}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredCars}
                keyExtractor={(item, index) => `${item.brand}-${item.model}-${index}`}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.row}
                renderItem={({ item, index }) => (
                    <CarCard
                        id={`${item.brand}-${item.model}-${index}`}
                        name={`${item.brand.charAt(0).toUpperCase() + item.brand.slice(1)} ${item.model.charAt(0).toUpperCase() + item.model.slice(1)}`}
                        image={item.images.exterior[1] || item.images.exterior[0]}
                        price={item.price_range}
                        rating={parseFloat(item.rating) || 4.5}
                        onPress={() => router.push(`/details?brand=${item.brand}&model=${item.model}`)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={{ color: colors.textSecondary }}>No cars found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    filterBtn: {
        padding: 8,
    },
    filtersList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    gridContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
});
