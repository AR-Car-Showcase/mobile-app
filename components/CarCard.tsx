import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from '../app/context/ThemeContext';
import { router } from 'expo-router';

interface CarCardProps {
    id: string;
    name: string;
    image: string;
    price: string;
    rating?: number;
    featured?: boolean;
    onPress?: () => void;
}

const CarCard = React.memo(({ id, name, image, price, rating, featured, onPress }: CarCardProps) => {
    const { colors } = useTheme();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push({ pathname: '/details', params: { id } });
        }
    };

    return (
        <Pressable
            style={[
                styles.container,
                { backgroundColor: colors.surface },
                featured && styles.featuredContainer
            ]}
            onPress={handlePress}
        >
            <Image source={{ uri: image }} style={[styles.image, featured && styles.featuredImage]} resizeMode="cover" />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{name}</Text>
                    {rating && (
                        <View style={styles.rating}>
                            <Ionicons name="star" size={14} color={colors.accent} />
                            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{rating}</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.price, { color: colors.accent }]}>{price}</Text>
            </View>
        </Pressable>
    );
});

export default CarCard;

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        width: 160,
        marginRight: 16,
    },
    featuredContainer: {
        width: 280,
        height: 220,
    },
    image: {
        width: '100%',
        height: 100,
    },
    featuredImage: {
        height: 150,
    },
    content: {
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
