import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { interpolate, Extrapolate, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { spacing } from '../../../../theme';

const TOP_TIER_HEIGHT = 88;
const BOTTOM_TIER_HEIGHT = 88;

interface DetailsHeaderProps {
    scrollY: SharedValue<number>;
    colors: any;
    displayName: string;
    isLiked: boolean;
    onToggleLike: () => void;
}

export function DetailsHeader({ scrollY, colors, displayName, isLiked, onToggleLike }: DetailsHeaderProps) {
    const navigation = useNavigation<any>();
    const router = useRouter();

    const tier1Style = useAnimatedStyle(() => {
        const translateY = interpolate(scrollY.value, [0, TOP_TIER_HEIGHT], [0, -TOP_TIER_HEIGHT], Extrapolate.CLAMP);
        const opacity = interpolate(scrollY.value, [0, TOP_TIER_HEIGHT / 2], [1, 0], Extrapolate.CLAMP);
        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    const tier2Style = useAnimatedStyle(() => {
        const translateY = interpolate(scrollY.value, [0, TOP_TIER_HEIGHT], [0, -TOP_TIER_HEIGHT], Extrapolate.CLAMP);
        return {
            transform: [{ translateY }],
        };
    });

    const centeredTitleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [TOP_TIER_HEIGHT, TOP_TIER_HEIGHT + 30], [1, 0], Extrapolate.CLAMP);
        return { opacity };
    });

    const stickyNameStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [TOP_TIER_HEIGHT + 20, TOP_TIER_HEIGHT + 50], [0, 1], Extrapolate.CLAMP);
        const translateX = interpolate(scrollY.value, [TOP_TIER_HEIGHT + 20, TOP_TIER_HEIGHT + 50], [20, 0], Extrapolate.CLAMP);
        return {
            opacity,
            transform: [{ translateX }],
        };
    });

    return (
        <>
            <Animated.View style={[styles.tier1Header, { backgroundColor: colors.background }, tier1Style]}>
                <Pressable onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.tier1Title, { color: colors.text }]}>Car Details</Text>
            </Animated.View>

            <Animated.View style={[styles.tier2Header, { backgroundColor: colors.surface }, tier2Style]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>

                <View style={styles.tier2TitleContainer}>
                    <Animated.View style={[styles.centeredTitleWrapper, centeredTitleStyle]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>{displayName}</Text>
                    </Animated.View>

                    <Animated.View style={[styles.stickyNameWrapper, stickyNameStyle]}>
                        <Text style={[styles.stickyCarName, { color: colors.text }]} numberOfLines={1}>{displayName}</Text>
                    </Animated.View>
                </View>

                <Pressable style={styles.backButton} onPress={onToggleLike}>
                    <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={24} 
                        color={isLiked ? colors.error : colors.accent} 
                    />
                </Pressable>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    tier1Header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: TOP_TIER_HEIGHT + 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: 44,
        zIndex: 110,
    },
    tier1Title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: spacing.md,
    },
    tier2Header: {
        position: 'absolute',
        top: TOP_TIER_HEIGHT,
        left: 0,
        right: 0,
        height: BOTTOM_TIER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tier2TitleContainer: {
        flex: 1,
        justifyContent: 'center',
        height: '100%',
        marginHorizontal: spacing.xs,
    },
    centeredTitleWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    stickyNameWrapper: {
        position: 'absolute',
        left: 0,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    stickyCarName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
