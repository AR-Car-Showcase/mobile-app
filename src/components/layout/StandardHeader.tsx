import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useAppScale, useTheme } from '../../providers';

interface StandardHeaderProps {
    title: string;
    onMenuPress?: () => void;
    rightComponent?: React.ReactNode;
    animatedStyle?: any;
}

export function StandardHeader({ title, onMenuPress, rightComponent, animatedStyle }: StandardHeaderProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { uiScale } = useAppScale();

    return (
        <Animated.View 
            style={[
                styles.header, 
                { 
                    backgroundColor: colors.background,
                    paddingTop: insets.top + 10 * uiScale
                },
                animatedStyle
            ]}
        >
            <View style={styles.headerContent}>
                {onMenuPress && (
                    <Pressable
                        style={{
                            backgroundColor: colors.surface,
                            width: 44 * uiScale,
                            height: 44 * uiScale,
                            borderRadius: 22 * uiScale,
                            justifyContent: 'center',
                            alignItems: 'center',
                            elevation: 4,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        }}
                        onPress={onMenuPress}
                    >
                        <Ionicons name="menu" size={24 * uiScale} color={colors.text} />
                    </Pressable>
                )}
                <Text style={[styles.title, { color: colors.text, fontSize: 20 * uiScale }]}>{title}</Text>
                <View style={{ flex: 1 }} />
                {rightComponent}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    header: {
        zIndex: 100,
        paddingBottom: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 16,
    },
    title: {
        fontWeight: 'bold',
    },
});
