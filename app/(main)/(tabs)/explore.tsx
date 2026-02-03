import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import CarCard from '../../../components/CarCard';
import { router } from 'expo-router';

const MOCK_CARS = [
    { id: '1', name: 'Bugatti Chiron', price: '$3,000,000', image: 'https://images.unsplash.com/photo-1597687843302-f8c5c4c474d2?q=80&w=1000&auto=format&fit=crop', rating: 4.9 },
    { id: '2', name: 'Lamborghini Aventador', price: '$500,000', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop', rating: 4.8 },
    { id: '3', name: 'Porsche 911 GT3', price: '$180,000', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&auto=format&fit=crop', rating: 4.8 },
    { id: '4', name: 'Ferrari SF90', price: '$600,000', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000&auto=format&fit=crop', rating: 4.7 },
    { id: '5', name: 'McLaren 720S', price: '$300,000', image: 'https://images.unsplash.com/photo-1627454820574-fb8ec456ad4c?q=80&w=1000&auto=format&fit=crop', rating: 4.6 },
    { id: '6', name: 'Aston Martin DB11', price: '$220,000', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1000&auto=format&fit=crop', rating: 4.5 },
];

const FILTERS = ['All', 'Sports', 'SUV', 'Electric', 'Concept'];

export default function ExploreScreen() {
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredCars = MOCK_CARS.filter(car =>
        car.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeFilter === 'All' || activeFilter === 'Sports')
    );

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
                    {FILTERS.map((filter) => (
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
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <CarCard
                        id={item.id}
                        name={item.name}
                        image={item.image}
                        price={item.price}
                        rating={item.rating}
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
        paddingTop: 60,
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
