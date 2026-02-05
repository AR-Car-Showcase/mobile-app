import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import CarCard from '../../../components/CarCard';
import { router, useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    useSharedValue
} from 'react-native-reanimated';
import { getAllCars, getBodyTypes, getCarsByBodyType } from '../../../api/cars';
import { Car } from '../../../types/car';
import { useScrollContext } from '../../context/ScrollContext';
import { useSmartScroll } from '../../hooks/useSmartScroll';

export default function ExploreScreen() {
    const { colors } = useTheme();
    const { scrollY } = useScrollContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [cars, setCars] = useState<Car[]>([]);
    const [filteredCars, setFilteredCars] = useState<Car[]>([]);
    const [filters, setFilters] = useState<string[]>(['All']);
    const navigation = useNavigation<DrawerNavigationProp<any>>();

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    // Only the search/filter part uses smart scroll
    const searchBarStyle = useSmartScroll(scrollY, 120, 'up');

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

    const filterCars = () => {
        let result = cars;
        if (activeFilter !== 'All') {
            result = result.filter(car => car.body_type === activeFilter);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(car =>
                car.brand.toLowerCase().includes(query) ||
                car.model.toLowerCase().includes(query)
            );
        }
        setFilteredCars(result);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
                <View style={styles.menuRow}>
                    <Pressable
                        style={[styles.menuButton, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.openDrawer()}
                    >
                        <Ionicons name="menu" size={24} color={colors.text} />
                    </Pressable>
                    <Text style={[styles.exploreTitle, { color: colors.text }]}>Explore</Text>
                </View>
            </View>

            <Animated.View style={[styles.searchContainerWrapper, searchBarStyle, { backgroundColor: colors.background }]}>
                <View style={[styles.searchContainer, { marginTop: 10 }]}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Search cars, brands..."
                            placeholderTextColor={colors.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <Pressable style={[styles.filterButton, { backgroundColor: colors.accent }]}>
                        <Ionicons name="options-outline" size={20} color={colors.text} />
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
            </Animated.View>

            <Animated.FlatList
                data={filteredCars}
                keyExtractor={(item, index) => `${item.brand}-${item.model}-${index}`}
                numColumns={2}
                contentContainerStyle={[styles.gridContainer, { paddingTop: 210 }]}
                columnWrapperStyle={styles.row}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => (
                    <CarCard
                        id={`${item.brand}-${item.model}`}
                        name={`${item.brand.charAt(0).toUpperCase() + item.brand.slice(1)} ${item.model.charAt(0).toUpperCase() + item.model.slice(1)}`}
                        image={item.images.exterior[1] || item.images.exterior[0]}
                        price={item.price_range}
                        rating={Number(item.rating) || 4.5}
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
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 110,
        paddingTop: 50,
        paddingBottom: 10,
    },
    searchContainerWrapper: {
        position: 'absolute',
        top: 100, // Positioned below the fixed header
        left: 0,
        right: 0,
        zIndex: 100,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 16,
    },
    menuButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    exploreTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
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
