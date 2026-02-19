import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { View, Text, Image, StyleSheet, Switch } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';

function CustomDrawerContent(props: any) {
    const { user, signOut } = useAuth();
    const { colors, theme, toggleTheme } = useTheme();

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: colors.background, flex: 1 }}>
            <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
                {user?.profilePic ? (
                    <Image source={{ uri: user.profilePic }} style={[styles.drawerAvatar, { borderColor: colors.accent }]} />
                ) : (
                    <View style={[styles.drawerAvatarPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="person" size={30} color={colors.textSecondary} />
                    </View>
                )}
                <Text style={[styles.drawerUsername, { color: colors.text }]}>{user?.username || 'Guest User'}</Text>
                <Text style={[styles.drawerEmail, { color: colors.textSecondary }]}>{user?.email || 'Browse our collection'}</Text>
            </View>

            <View style={styles.drawerItemsContainer}>
                <DrawerItemList {...props} />
            </View>

            <View style={[styles.drawerFooter, { borderTopColor: colors.border }]}>
                <View style={styles.themeToggleContainer}>
                    <View style={styles.themeToggleLabelContainer}>
                        <Ionicons
                            name={theme === 'dark' ? "moon-outline" : "sunny-outline"}
                            size={24}
                            color={colors.text}
                        />
                        <Text style={[styles.themeToggleText, { color: colors.text }]}>
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </Text>
                    </View>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: colors.accent }}
                        thumbColor={'#f4f3f4'}
                    />
                </View>

                {user ? (
                    <DrawerItem
                        label="Sign Out"
                        labelStyle={{ color: colors.error }}
                        icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={colors.error} />}
                        onPress={signOut}
                    />
                ) : (
                    <DrawerItem
                        label="Sign In"
                        labelStyle={{ color: colors.accent }}
                        icon={({ color, size }) => <Ionicons name="log-in-outline" size={size} color={colors.accent} />}
                        onPress={() => props.navigation.navigate('auth/login')}
                    />
                )}
            </View>
        </DrawerContentScrollView>
    );
}

import { ScrollProvider } from '../context/ScrollContext';

export default function MainLayout() {
    const { colors } = useTheme();

    return (
        <ScrollProvider>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.background,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    headerTitleStyle: {
                        color: colors.text,
                        fontWeight: 'bold',
                    },
                    headerTintColor: colors.text,
                    drawerActiveBackgroundColor: colors.surfaceHighlight,
                    drawerActiveTintColor: colors.accent,
                    drawerInactiveTintColor: colors.textSecondary,
                    drawerStyle: {
                        backgroundColor: colors.background,
                        width: 280,
                    },
                }}
            >
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        title: 'Home',
                        drawerLabel: 'Home',
                        drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
                        headerShown: false,
                    }}
                />
                <Drawer.Screen
                    name="ar-gallery"
                    options={{
                        title: 'AR Gallery',
                        drawerLabel: 'AR Gallery',
                        drawerIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
                        headerShown: false,
                    }}
                />
                <Drawer.Screen
                    name="saved-models"
                    options={{
                        title: 'Personal Showroom',
                        drawerLabel: 'Saved Builds',
                        drawerIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} />,
                        headerShown: false,
                    }}
                />
                <Drawer.Screen
                    name="compare"
                    options={{
                        title: 'Compare Cars',
                        drawerLabel: 'Compare',
                        drawerIcon: ({ color, size }) => <Ionicons name="git-compare-outline" size={size} color={color} />,
                        headerShown: false,
                    }}
                />
                <Drawer.Screen
                    name="details"
                    options={{
                        title: 'Car Details',
                        headerShown: false,
                        drawerItemStyle: { display: 'none' },
                    }}
                />
                <Drawer.Screen
                    name="hybrid"
                    options={{
                        title: '3D Studio',
                        headerShown: false,
                        drawerItemStyle: { display: 'none' },
                    }}
                />
                <Drawer.Screen
                    name="preferences"
                    options={{
                        title: 'Personalization',
                        drawerLabel: 'Preferences',
                        drawerIcon: ({ color, size }) => <Ionicons name="options-outline" size={size} color={color} />,
                        headerShown: false,
                    }}
                />
            </Drawer>
        </ScrollProvider>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 24,
        paddingTop: 40,
        borderBottomWidth: 1,
        marginBottom: 12,
    },
    drawerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 12,
        borderWidth: 1,
    },
    drawerAvatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
    },
    drawerUsername: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    drawerEmail: {
        fontSize: 12,
        marginTop: 4,
    },
    drawerItemsContainer: {
        flex: 1,
    },
    drawerFooter: {
        paddingBottom: 20,
        borderTopWidth: 1,
    },
    themeToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 12,
        marginBottom: 8,
    },
    themeToggleLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    themeToggleText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 12,
    }
});
