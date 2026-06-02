import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { Car } from '../../../../../types/car';
import { radius, spacing } from '../../../../theme';

const RelatedCarCard = memo(({ item, onPress, colors }: { item: Car, onPress: () => void, colors: any }) => (
    <Pressable style={[styles.relatedCarCard, { backgroundColor: colors.surface }]} onPress={onPress}>
        <ExpoImage
            source={{ uri: item.images.exterior[0] }}
            style={styles.relatedCarImage}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
        />
        <View style={styles.relatedCarInfo}>
            <Text style={[styles.relatedCarName, { color: colors.text }]} numberOfLines={1}>{item.brand} {item.model}</Text>
            <Text style={[styles.relatedCarPrice, { color: colors.accent }]}>{item.priceRange}</Text>
        </View>
    </Pressable>
));
RelatedCarCard.displayName = 'RelatedCarCard';

interface SimilarCarsProps {
    relatedCars: Car[];
    colors: any;
}

export function SimilarCars({ relatedCars, colors }: SimilarCarsProps) {
    const router = useRouter();

    if (relatedCars.length === 0) return null;

    return (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>You Might Also Like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                {relatedCars.map((item, index) => (
                    <RelatedCarCard
                        key={`${item.id}-${index}`}
                        item={item}
                        colors={colors}
                        onPress={() => router.push({
                            pathname: '/details',
                            params: { id: item.id }
                        })}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
    },
    relatedCarCard: {
        width: 160,
        borderRadius: radius.md,
        overflow: 'hidden',
        paddingBottom: spacing.xs,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    relatedCarImage: {
        width: '100%',
        height: 100,
    },
    relatedCarInfo: {
        padding: spacing.xs,
    },
    relatedCarName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: spacing.xxs,
        textTransform: 'capitalize',
    },
    relatedCarPrice: {
        fontSize: 12,
        fontWeight: '600',
    },
});
