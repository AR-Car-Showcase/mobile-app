import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCarCatalog, useScrollContext, useTheme } from '../../../src/providers';
import CarCard from '../../../components/CarCard';
import { router, useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';

export default function ExploreScreen() {
    const { colors } = useTheme();
    const { scrollY } = useScrollContext();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const { cars: catalogCars, loading, refreshing, refreshCatalog } = useCarCatalog();

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const searchBarStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [0, 100],
                        [0, -100],
                        Extrapolation.CLAMP
                    )
                }
            ],
            opacity: interpolate(
                scrollY.value,
                [0, 100],
                [1, 0],
                Extrapolation.CLAMP
            )
        };
    });

    const filters = useMemo(() => ['All', ...Array.from(new Set(catalogCars.map((car) => car.bodyType))).sort()], [catalogCars]);
    const filteredCars = useMemo(() => {
        let result = catalogCars;
        if (activeFilter !== 'All') {
            result = result.filter(car => car.bodyType === activeFilter);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(car =>
                car.brand.toLowerCase().includes(query) ||
                car.model.toLowerCase().includes(query)
            );
        }
        return result;
    }, [catalogCars, searchQuery, activeFilter]);

    const onRefresh = async () => {
        await refreshCatalog();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.fixedHeader, { backgroundColor: colors.background, paddingTop: insets.top + 10 }]}>
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

            <Animated.View style={[styles.searchContainerWrapper, searchBarStyle, { backgroundColor: colors.background, top: insets.top + 60 }]}>
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
                keyExtractor={(item) => String(item.id)}
                numColumns={2}
                contentContainerStyle={[styles.gridContainer, { paddingTop: insets.top + 170 }]}
                columnWrapperStyle={styles.row}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                removeClippedSubviews
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                updateCellsBatchingPeriod={50}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.accent]}
                        tintColor={colors.accent}
                    />
                }
                renderItem={({ item, index }) => (
                    <CarCard
                        id={`${item.brand}-${item.model}`}
                        name={`${item.brand.charAt(0).toUpperCase() + item.brand.slice(1)} ${item.model.charAt(0).toUpperCase() + item.model.slice(1)}`}
                        image={item.images.exterior[0]}
                        price={item.priceRange}
                        rating={Number(item.rating) || 4.5}
                        onPress={() => router.push({ pathname: '/details', params: { id: item.id } })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={{ color: colors.textSecondary }}>
                            {loading ? 'Loading cars...' : 'No cars found'}
                        </Text>
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
        paddingBottom: 10,
    },
    searchContainerWrapper: {
        position: 'absolute',
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
        paddingVertical: 10,
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
