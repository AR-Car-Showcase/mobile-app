import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing, radius, typography } from '../../../theme';

interface HomeHeroProps {
    colors: any;
}

export function HomeHero({ colors }: HomeHeroProps) {
    const router = useRouter();

    return (
        <View style={styles.heroSection}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.heroImage}
            />
            <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>Experience the Future</Text>
                <Text style={styles.heroSubtitle}>Visualize your dream car in your driveway today.</Text>
                <Pressable
                    style={[styles.heroButton, { backgroundColor: colors.accent }]}
                    onPress={() => router.push('/explore')}
                >
                    <Text style={styles.heroButtonText}>Explore Cars</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    heroSection: {
        height: 350,
        marginBottom: spacing.xl,
        borderRadius: radius.xl,
        overflow: 'hidden',
        marginHorizontal: spacing.md,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
        padding: spacing.xl,
    },
    heroTitle: {
        color: '#FFF',
        ...typography.display,
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    heroSubtitle: {
        color: '#E0E0E0',
        fontSize: 16,
        marginBottom: spacing.xl,
    },
    heroButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.md,
        alignSelf: 'flex-start',
    },
    heroButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
