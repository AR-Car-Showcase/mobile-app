import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated from 'react-native-reanimated';
import { useScrollContext } from '../app/context/ScrollContext';
import { useSmartScroll } from '../app/hooks/useSmartScroll';

const { width } = Dimensions.get('window');

export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { scrollY, tabBarHeight } = useScrollContext();
    const { colors } = useTheme();

    
    const animatedStyle = useSmartScroll(scrollY, tabBarHeight, 'down');

    return (
        <Animated.View style={[
            styles.container,
            {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
            },
            animatedStyle
        ]}>
            <View style={styles.content}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.title !== undefined ? options.title : route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const getIconName = (name: string, focused: boolean): any => {
                        switch (name) {
                            case 'index': return focused ? 'home' : 'home-outline';
                            case 'explore': return focused ? 'search' : 'search-outline';
                            case 'saved': return focused ? 'heart' : 'heart-outline';
                            case 'profile': return focused ? 'person' : 'person-outline';
                            default: return 'square';
                        }
                    };

                    return (
                        <Pressable
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <Ionicons
                                name={getIconName(route.name, isFocused)}
                                size={24}
                                color={isFocused ? colors.accent : colors.textSecondary}
                            />
                            <Text style={[
                                styles.label,
                                { color: isFocused ? colors.accent : colors.textSecondary }
                            ]}>
                                {label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        borderTopWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
    },
});
