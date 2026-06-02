import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, RefreshControl, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useTheme } from '../../../src/providers';
import { useNavigation, router } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { likeService } from '../../../src/services';
import type { Car as LikedCar } from '../../../src/services/likeService';
import CarCard from '../../../components/CarCard';

export default function SavedScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const { isAuthenticated } = useAuth();
    const [likedCars, setLikedCars] = React.useState<LikedCar[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchLikedCars = async () => {
        try {
            setLoading(true);
            const cars = await likeService.getMyLikes();
            setLikedCars(cars);
        } catch (error) {
            console.error('[SavedScreen] Failed to fetch liked cars:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        if (isAuthenticated) {
            void fetchLikedCars();
        } else {
            setLikedCars([]);
            setLoading(false);
        }
    }, [isAuthenticated]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLikedCars();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.headerWrapper, { top: insets.top + 10 }]}>
                <Pressable
                    style={[styles.menuButton, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.openDrawer()}
                >
                    <Ionicons name="menu" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Saved</Text>
            </View>

            <View
                style={[styles.scrollContent, { paddingTop: insets.top + 70 }]}
                onLayout={() => {}}
            >
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.accent} />
                    </View>
                ) : !isAuthenticated ? (
                    <ScrollView 
                        contentContainerStyle={styles.emptyState}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                    >
                        <Ionicons name="lock-closed-outline" size={80} color={colors.textTertiary} />
                        <Text style={[styles.text, { color: colors.text }]}>Login Required</Text>
                        <Text style={[styles.subtext, { color: colors.textSecondary }]}>Log in to view your favorite cars.</Text>
                    </ScrollView>
                ) : likedCars.length === 0 ? (
                    <ScrollView 
                        contentContainerStyle={styles.emptyState}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                    >
                        <Ionicons name="heart-outline" size={80} color={colors.textTertiary} />
                        <Text style={[styles.text, { color: colors.text }]}>No Saved Cars</Text>
                        <Text style={[styles.subtext, { color: colors.textSecondary }]}>Your favorites will appear here.</Text>
                    </ScrollView>
                ) : (
                    <FlatList
                        data={likedCars}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }: { item: any }) => (
                            <View style={styles.cardWrapper}>
                                <CarCard
                                    id={item.id.toString()}
                                    name={`${item.brand.charAt(0).toUpperCase() + item.brand.slice(1)} ${item.model.charAt(0).toUpperCase() + item.model.slice(1)}`}
                                    image={item.image}
                                    price={item.priceRange}
                                    featured={true}
                                    fullWidth={true}
                                    onPress={() => router.push({ pathname: '/details', params: { id: item.id } })}
                                />
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews
                        initialNumToRender={6}
                        maxToRenderPerBatch={6}
                        windowSize={7}
                        updateCellsBatchingPeriod={50}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerWrapper: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 100,
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    emptyState: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
    },
    subtext: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    cardWrapper: {
        marginBottom: 10,
    },
});
