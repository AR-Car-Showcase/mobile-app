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

export default function SavedScreen() {
    const { colors } = useTheme();
    const { scrollY } = useScrollContext();
    const navigation = useNavigation<DrawerNavigationProp<any>>();

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

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={80} color={colors.textTertiary} />
                    <Text style={[styles.text, { color: colors.text }]}>Saved Vehicles</Text>
                    <Text style={[styles.subtext, { color: colors.textSecondary }]}>Your favorites will appear here.</Text>
                </View>
            </Animated.ScrollView>
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
});
