import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useScrollContext } from '../../context/ScrollContext';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';

import { useSmartScroll } from '../../hooks/useSmartScroll';
import { useAuth } from '../../context/AuthContext';
import { likeService, Car } from '../../services/likeService';
import CarCard from '../../../components/CarCard';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList } from 'react-native';

export default function SavedScreen() {
    const { colors } = useTheme();
    const { scrollY } = useScrollContext();
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const { isAuthenticated } = useAuth();
    const [likedCars, setLikedCars] = React.useState<Car[]>([]);
    const [loading, setLoading] = React.useState(true);

    useFocusEffect(
        React.useCallback(() => {
            if (isAuthenticated) {
                fetchLikedCars();
            } else {
                setLikedCars([]);
                setLoading(false);
            }
        }, [isAuthenticated])
    );

    const fetchLikedCars = async () => {
        try {
            setLoading(true);
            const cars = await likeService.getMyLikes();
            setLikedCars(cars);
        } catch (error) {
            console.error('[SavedScreen] Failed to fetch liked cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const headerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: 0 }],
            opacity: 1,
        };
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={[styles.headerWrapper, headerStyle]}>
                <Pressable
                    style={[styles.menuButton, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.openDrawer()}
                >
                    <Ionicons name="menu" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Saved</Text>
            </Animated.View>

            <Animated.View
                style={styles.scrollContent}
                onLayout={() => {}}
            >
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.accent} />
                    </View>
                ) : !isAuthenticated ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="lock-closed-outline" size={80} color={colors.textTertiary} />
                        <Text style={[styles.text, { color: colors.text }]}>Login Required</Text>
                        <Text style={[styles.subtext, { color: colors.textSecondary }]}>Log in to view your favorite cars.</Text>
                    </View>
                ) : likedCars.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={80} color={colors.textTertiary} />
                        <Text style={[styles.text, { color: colors.text }]}>No Saved Cars</Text>
                        <Text style={[styles.subtext, { color: colors.textSecondary }]}>Your favorites will appear here.</Text>
                    </View>
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
                                />
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerWrapper: {
        position: 'absolute',
        top: 50,
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
        paddingTop: 120,
        paddingBottom: 100,
    },
    emptyState: {
        flex: 1,
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
