import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, RefreshControl, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useAppAlert, useTheme } from '../../../src/providers';
import { useNavigation, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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
    const showAlert = useAppAlert();
    const [likedCars, setLikedCars] = React.useState<LikedCar[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [removingId, setRemovingId] = React.useState<string | null>(null);

    // showSpinner is off for background refreshes, so coming back to the tab does not
    // blank out the list that is already on screen.
    const fetchLikedCars = React.useCallback(async (showSpinner = true) => {
        try {
            if (showSpinner) setLoading(true);
            const cars = await likeService.getMyLikes();
            setLikedCars(cars);
        } catch (error) {
            console.error('[SavedScreen] Failed to fetch liked cars:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Liking happens on the details screen, so the list has to be rebuilt on focus.
    // Fetching only on mount left a car the user just liked missing from this tab.
    useFocusEffect(
        React.useCallback(() => {
            if (!isAuthenticated) {
                setLikedCars([]);
                setLoading(false);
                return;
            }
            void fetchLikedCars(likedCars.length === 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isAuthenticated, fetchLikedCars])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLikedCars(false);
    };

    const handleRemove = (car: LikedCar, label: string) => {
        const carId = car.id.toString();
        showAlert(
            'Remove from saved?',
            `${label} will no longer appear in your saved cars.`,
            [
                { text: 'Cancel' },
                {
                    text: 'Remove',
                    onPress: async () => {
                        setRemovingId(carId);
                        // Drop it immediately, then restore it if the request fails, so
                        // the list never shows a car the server still has.
                        const previous = likedCars;
                        setLikedCars(current => current.filter(entry => entry.id.toString() !== carId));
                        try {
                            await likeService.unlikeCar(car.id);
                        } catch (error: any) {
                            setLikedCars(previous);
                            showAlert('Could not remove car', error?.userMessage || error?.message
                                || 'Please check your connection and try again.');
                        } finally {
                            setRemovingId(null);
                        }
                    },
                },
            ]
        );
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
                style={[styles.scrollContent, { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 100 }]}
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
                        renderItem={({ item }: { item: any }) => {
                            const name = `${item.brand.charAt(0).toUpperCase() + item.brand.slice(1)} ${item.model.charAt(0).toUpperCase() + item.model.slice(1)}`;
                            const isRemoving = removingId === item.id.toString();
                            return (
                                <View style={styles.cardWrapper}>
                                    <CarCard
                                        id={item.id.toString()}
                                        name={name}
                                        image={item.image}
                                        price={item.priceRange}
                                        featured={true}
                                        fullWidth={true}
                                        onPress={() => router.push({ pathname: '/details', params: { id: item.id } })}
                                    />
                                    <Pressable
                                        style={styles.removeButton}
                                        onPress={() => handleRemove(item, name)}
                                        disabled={isRemoving}
                                        hitSlop={8}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Remove ${name} from your saved cars`}
                                    >
                                        {isRemoving ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Ionicons name="heart-dislike-outline" size={18} color="#fff" />
                                        )}
                                    </Pressable>
                                </View>
                            );
                        }}
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
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
});
