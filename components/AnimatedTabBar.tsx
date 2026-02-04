import React from 'react';
import { View, Platform, StyleSheet, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useDerivedValue,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { useScrollContext } from '../app/context/ScrollContext';
import { Colors } from '../constants/Colors';
import { useTheme } from '../app/context/ThemeContext';

export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { scrollY, tabBarHeight } = useScrollContext();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const translateY = useDerivedValue(() => {
        return interpolate(
            scrollY.value,
            [0, 50],
            [0, tabBarHeight],
            Extrapolate.CLAMP
        );
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: withTiming(translateY.value > 20 ? tabBarHeight : 0, { duration: 250 }) }],
        };
    });

    return (
        <Animated.View style={[
            styles.container,
            animatedStyle,
            { height: tabBarHeight, backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface }
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

                    const iconName =
                        label === 'Home' ? 'home' :
                            label === 'Explore' ? 'search' :
                                label === 'Saved' ? 'heart' : 'person';

                    return (
                        <Pressable
                            key={index}
                            onPress={onPress}
                            style={styles.tabButton}
                        >
                            <Ionicons
                                name={isFocused ? iconName : `${iconName}-outline` as any}
                                size={24}
                                color={isFocused ? (isDark ? Colors.dark.accent : Colors.light.accent) : (isDark ? Colors.dark.textSecondary : Colors.light.textSecondary)}
                            />
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
        elevation: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    content: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        flex: 1,
    },
});
