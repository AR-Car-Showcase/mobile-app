import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useScrollContext } from '../../context/ScrollContext';
import { useNavigation, router } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';

import { useSmartScroll } from '../../hooks/useSmartScroll';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
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

    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
                <Text style={[styles.text, { color: colors.text }]}>Not Logged In</Text>
                <Text style={[styles.subtext, { color: colors.textSecondary }]}>Log in to view your profile and saved customizations.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={[styles.headerWrapper, headerStyle]}>
                <Pressable
                    style={[styles.menuButton, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.openDrawer()}
                >
                    <Ionicons name="menu" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <View style={styles.header}>
                    {user.profilePic ? (
                        <Image source={{ uri: user.profilePic }} style={[styles.avatar, { borderColor: colors.accent }]} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                            <Ionicons name="person" size={40} color={colors.textSecondary} />
                        </View>
                    )}
                    <Text style={[styles.username, { color: colors.text }]}>{user.username}</Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
                    {user.phoneNumber && <Text style={[styles.phone, { color: colors.textSecondary }]}>{user.phoneNumber}</Text>}
                </View>

                <View style={[styles.statsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Customs</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => router.push('/preferences')}
                    >
                        <Ionicons name="options-outline" size={24} color={colors.text} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Preferences</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="settings-outline" size={24} color={colors.text} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="notifications-outline" size={24} color={colors.text} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, styles.logoutItem, { backgroundColor: colors.surface, borderColor: 'rgba(239, 68, 68, 0.2)' }]} onPress={signOut}>
                        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                        <Text style={[styles.menuText, { color: "#EF4444" }]}>Log Out</Text>
                    </TouchableOpacity>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 120,
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 2,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 14,
        marginTop: 4,
    },
    phone: {
        fontSize: 14,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    menuContainer: {
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
    },
    logoutItem: {
        marginTop: 20,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 24,
    },
    subtext: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
