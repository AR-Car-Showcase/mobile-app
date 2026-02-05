import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';

function CustomDrawerContent(props: any) {
    const { user, signOut } = useAuth();

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: Colors.background, flex: 1 }}>
            <View style={styles.drawerHeader}>
                {user?.profilePic ? (
                    <Image source={{ uri: user.profilePic }} style={styles.drawerAvatar} />
                ) : (
                    <View style={styles.drawerAvatarPlaceholder}>
                        <Ionicons name="person" size={30} color={Colors.textSecondary} />
                    </View>
                )}
                <Text style={styles.drawerUsername}>{user?.username || 'Guest User'}</Text>
                <Text style={styles.drawerEmail}>{user?.email || 'Browse our collection'}</Text>
            </View>

            <View style={styles.drawerItemsContainer}>
                <DrawerItemList {...props} />
            </View>

            <View style={styles.drawerFooter}>
                {user ? (
                    <DrawerItem
                        label="Sign Out"
                        labelStyle={{ color: Colors.error }}
                        icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={Colors.error} />}
                        onPress={signOut}
                    />
                ) : (
                    <DrawerItem
                        label="Sign In"
                        labelStyle={{ color: Colors.accent }}
                        icon={({ color, size }) => <Ionicons name="log-in-outline" size={size} color={Colors.accent} />}
                        onPress={() => props.navigation.navigate('auth/login')}
                    />
                )}
            </View>
        </DrawerContentScrollView>
    );
}

import { ScrollProvider } from '../context/ScrollContext';

export default function MainLayout() {
    return (
        <ScrollProvider>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: Colors.background,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    headerTitleStyle: {
                        color: Colors.text,
                        fontWeight: 'bold',
                    },
                    headerTintColor: Colors.text,
                    drawerActiveBackgroundColor: Colors.glassBackground,
                    drawerActiveTintColor: Colors.accent,
                    drawerInactiveTintColor: Colors.textSecondary,
                    drawerStyle: {
                        backgroundColor: Colors.background,
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
            </Drawer>
        </ScrollProvider>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 24,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
        marginBottom: 12,
    },
    drawerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.accent,
    },
    drawerAvatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.glassBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    drawerUsername: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    drawerEmail: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    drawerItemsContainer: {
        flex: 1,
    },
    drawerFooter: {
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.glassBorder,
    },
});
