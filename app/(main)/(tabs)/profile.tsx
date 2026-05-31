import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Linking, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useScrollContext } from '../../context/ScrollContext';
import { useNavigation, router } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
} from 'react-native-reanimated';

import LoginRequiredModal from '../../../components/LoginRequiredModal';
import { useFocusEffect } from '@react-navigation/native';
import { SUPPORT_EMAIL } from '../../../api/session';

export default function ProfileScreen() {
    const { user, signOut, fetchProfile } = useAuth();
    const { colors } = useTheme();
    const { scrollY } = useScrollContext();
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const [showLoginModal, setShowLoginModal] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const userId = user?.id;

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            if (!userId) {
                setShowLoginModal(true);
                return;
            }

            void fetchProfile();
        }, [userId, fetchProfile])
    );

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
            <View style={[styles.container, styles.centeredContainer, { backgroundColor: colors.background }]}>
                <View style={styles.iconBackground}>
                    <Ionicons name="person-circle-outline" size={100} color={colors.accent} />
                </View>
                <Text style={[styles.text, { color: colors.text }]}>Profile</Text>
                <Text style={[styles.subtext, { color: colors.textSecondary }]}>Log in to view your profile and saved car builds</Text>
                
                <TouchableOpacity 
                    style={[styles.loginButton, { backgroundColor: colors.accent }]}
                    onPress={() => setShowLoginModal(true)}
                >
                    <Text style={styles.loginButtonText}>Login / Sign Up</Text>
                </TouchableOpacity>

                <LoginRequiredModal
                    visible={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    featureName="Profile"
                />
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
            >
                <View style={styles.header}>
                    {user.profilePic ? (
                        <Image source={{ uri: user.profilePic }} style={[styles.avatar, { borderColor: colors.accent }]} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                            <Ionicons name="person" size={40} color={colors.textSecondary} />
                        </View>
                    )}
                    <View style={styles.profileIdentity}>
                        {user.displayName ? (
                            <Text style={[styles.displayName, { color: colors.textSecondary }]} numberOfLines={1}>{user.displayName}</Text>
                        ) : null}
                        <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>{user.username}</Text>
                        {user.bio ? (
                            <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={3}>{user.bio}</Text>
                        ) : null}
                        <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>{user.email}</Text>
                        {user.phoneNumber && <Text style={[styles.phone, { color: colors.textSecondary }]} numberOfLines={1}>{user.phoneNumber}</Text>}
                    </View>
                </View>

                <View style={[styles.statsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: colors.text }]}>{user.savedCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: colors.text }]}>{user.customizedCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Customs</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => router.push('/edit-profile')}
                    >
                        <Ionicons name="person-outline" size={24} color={colors.text} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Edit Profile</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => router.push('/preferences')}
                    >
                        <Ionicons name="options-outline" size={24} color={colors.text} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Car Preferences</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => router.push('/auth/change-password')}
                    >
                        <Ionicons name="key-outline" size={24} color={colors.text} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Change Password</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=AR%20Car%20Showcase%20support`)}
                    >
                        <Ionicons name="settings-outline" size={24} color={colors.text} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        gap: 18,
    },
    avatar: {
        width: 92,
        height: 92,
        borderRadius: 46,
        borderWidth: 2,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
    },
    profileIdentity: {
        flex: 1,
        minWidth: 0,
        alignItems: 'flex-start',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    displayName: {
        fontSize: 14,
        marginBottom: 2,
    },
    bio: {
        fontSize: 13,
        marginTop: 8,
        textAlign: 'left',
        lineHeight: 18,
        maxWidth: '100%',
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
        marginBottom: 32,
    },
    centeredContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBackground: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 28,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
