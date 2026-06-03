import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppScale, useTheme } from '../src/providers';
import { router } from 'expo-router';

interface CarCardProps {
    id: string;
    name: string;
    image: string;
    price: string;
    rating?: number;
    featured?: boolean;
    fullWidth?: boolean;
    width?: number;
    imageHeight?: number;
    priceFontSize?: number;
    onPress?: () => void;
    modelPath?: string;
}

const CarCard = React.memo(({ id, name, image, price, rating, featured, fullWidth, width, imageHeight, priceFontSize, onPress, modelPath }: CarCardProps) => {
    const { colors } = useTheme();
    const { uiScale } = useAppScale();

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
                width ? { width: width * uiScale } : null,
                featured && { width: 280 * uiScale, height: 220 * uiScale },
                fullWidth && styles.fullWidthContainer
            ]}
            onPress={handlePress}
        >
            <Image
                source={{ uri: image }}
                style={[
                    styles.image,
                    imageHeight ? { height: imageHeight * uiScale } : null,
                    featured && { height: 150 * uiScale }
                ]}
                resizeMode="cover"
            />
            <View style={[styles.content, { padding: 12 * uiScale }]}>
                <View style={styles.header}>
                    <Text style={[styles.name, { color: colors.text, fontSize: 14 * uiScale }]} numberOfLines={1}>{name}</Text>
                    {rating && (
                        <View style={styles.rating}>
                            <Ionicons name="star" size={14 * uiScale} color={colors.accent} />
                            <Text style={[styles.ratingText, { color: colors.textSecondary, fontSize: 12 * uiScale }]}>{rating}</Text>
                        </View>
                    )}
                </View>
                <Text
                    style={[
                        styles.price,
                        { color: colors.accent, fontSize: (priceFontSize || 14) * uiScale }
                    ]}
                    numberOfLines={1}
                >
                    {price}
                </Text>
            </View>
        </Pressable>
    );
});
CarCard.displayName = 'CarCard';

export default CarCard;

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        width: 190,
        marginRight: 16,
    },
    fullWidthContainer: {
        width: '100%',
        marginRight: 0,
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: 100,
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
        fontWeight: '600',
    },
    price: {
        fontWeight: 'bold',
    },
});
