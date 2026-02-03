import React from 'react';
import { Tabs } from 'expo-router';
import { ScrollProvider } from '../../context/ScrollContext';
import AnimatedTabBar from '../../../components/AnimatedTabBar';

export default function TabsLayout() {
    return (
        <ScrollProvider>
            <Tabs
                tabBar={(props) => <AnimatedTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{ title: 'Home' }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{ title: 'Explore' }}
                />
                <Tabs.Screen
                    name="saved"
                    options={{ title: 'Saved' }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{ title: 'Profile' }}
                />
            </Tabs>
        </ScrollProvider>
    );
}
