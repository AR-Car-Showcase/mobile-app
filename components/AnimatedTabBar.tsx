import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated from 'react-native-reanimated';
import { useScrollContext } from '../app/context/ScrollContext';
import { useSmartScroll } from '../app/hooks/useSmartScroll';

const { width } = Dimensions.get('window');

const TAB_ICONS: Record<string, { focused: string; default: string }> = {
    index: { focused: 'home', default: 'home-outline' },
    explore: { focused: 'search', default: 'search-outline' },
    saved: { focused: 'heart', default: 'heart-outline' },
    profile: { focused: 'person', default: 'person-outline' },
};

const DEFAULT_TAB_ICON = 'square';

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

                    const iconConfig = TAB_ICONS[route.name];
                    const iconName = iconConfig
                        ? (isFocused ? iconConfig.focused : iconConfig.default)
                        : DEFAULT_TAB_ICON;

                    return (
                        <Pressable
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <Ionicons
                                name={iconName as any}
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
