import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { CommonStyles } from '../../constants';
import { useTheme } from '../context/ThemeContext';
import { getCarByBrandAndModel } from '../../api/cars';
import { Car } from '../../types/car';

const { width } = Dimensions.get('window');

export default function VehicleDetailsScreen() {
    const params = useLocalSearchParams();
    const { colors } = useTheme();
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedImageType, setSelectedImageType] = useState<'exterior' | 'interior'>('exterior');

    useEffect(() => {
        loadCarData();
    }, [params]);

    const loadCarData = async () => {
        if (params.brand && params.model) {
            const carData = await getCarByBrandAndModel(
                params.brand as string,
                params.model as string
            );
            if (carData) {
                setCar(carData);
            }
        }
        setLoading(false);
    };

    if (loading || !car) {
        return (
            <View style={[CommonStyles.container, styles.center, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                    {loading ? 'Loading car data...' : 'Car not found'}
                </Text>
            </View>
        );
    }

    const currentImages = selectedImageType === 'exterior' ? car.images.exterior : car.images.interior;
    const displayName = `${car.brand.charAt(0).toUpperCase() + car.brand.slice(1)} ${car.model.charAt(0).toUpperCase() + car.model.slice(1)}`;

    const renderSpec = (label: string, value: any, icon?: string) => {
        if (value === null || value === undefined || value === '') return null;
        return (
            <View style={[styles.specItem, { backgroundColor: colors.surface }]} key={label}>
                {icon && <MaterialCommunityIcons name={icon as any} size={20} color={colors.accent} />}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.specLabel, { color: colors.textSecondary }]}>{label}</Text>
                    <Text style={[styles.specValue, { color: colors.text }]}>
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    </Text>
                </View>
            </View>
        );
    };

    // Extract key specifications from the first spec object
    const keySpecs = car.specs[Object.keys(car.specs)[0]] || {};

    return (
        <View style={[CommonStyles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{displayName}</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {car.body_type} • {car.fuel_type}
                    </Text>
                </View>
                <Pressable style={styles.backButton}>
                    <Ionicons name="heart-outline" size={24} color={colors.accent} />
                </Pressable>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Image
                    source={{ uri: currentImages[selectedImageIndex] || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop' }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />

                <View style={styles.imageTypeSelector}>
                    <Pressable
                        style={[styles.imageTypeBtn, selectedImageType === 'exterior' && { backgroundColor: colors.accent }]}
                        onPress={() => { setSelectedImageType('exterior'); setSelectedImageIndex(0); }}
                    >
                        <Text style={[styles.imageTypeBtnText, { color: selectedImageType === 'exterior' ? '#FFF' : colors.textSecondary }]}>
                            Exterior ({car.images.exterior.length})
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.imageTypeBtn, selectedImageType === 'interior' && { backgroundColor: colors.accent }]}
                        onPress={() => { setSelectedImageType('interior'); setSelectedImageIndex(0); }}
                    >
                        <Text style={[styles.imageTypeBtnText, { color: selectedImageType === 'interior' ? '#FFF' : colors.textSecondary }]}>
                            Interior ({car.images.interior.length})
                        </Text>
                    </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageGallery}>
                    {currentImages.map((imgUrl, index) => (
                        <Pressable key={index} onPress={() => setSelectedImageIndex(index)}>
                            <Image
                                source={{ uri: imgUrl }}
                                style={[
                                    styles.thumbnailImage,
                                    { borderColor: selectedImageIndex === index ? colors.accent : colors.border }
                                ]}
                            />
                        </Pressable>
                    ))}
                </ScrollView>

                <View style={[styles.priceCard, { backgroundColor: colors.surface }]}>
                    <View>
                        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Price Range</Text>
                        <Text style={[styles.priceValue, { color: colors.accent }]}>{car.price_range}</Text>
                        <Text style={[styles.priceDetail, { color: colors.textTertiary }]}>
                            {car.min_price} - {car.max_price}
                        </Text>
                    </View>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={20} color="#FFD700" />
                        <Text style={[styles.ratingText, { color: colors.text }]}>{car.rating}</Text>
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Specs</Text>
                    <View style={styles.quickSpecsGrid}>
                        {renderSpec('Body Type', car.body_type, 'car-side')}
                        {renderSpec('Fuel Type', car.fuel_type, 'fuel')}
                        {renderSpec('Transmission', car.transmission_type, 'car-shift-pattern')}
                        {renderSpec('Seating', car.seating_capacity, 'seat')}
                    </View>
                </View>

                {car.variants && car.variants.length > 0 && (
                    <View style={[styles.section, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Variants ({car.variants.length})
                        </Text>
                        {car.variants.map((variant, index) => (
                            <View key={index} style={[styles.variantCard, { borderColor: colors.border }]}>
                                <View style={styles.variantHeader}>
                                    <Text style={[styles.variantName, { color: colors.text }]}>
                                        {variant.variant}
                                    </Text>
                                    <Text style={[styles.variantPrice, { color: colors.accent }]}>
                                        {variant.price}
                                    </Text>
                                </View>
                                <View style={styles.variantDetails}>
                                    <Text style={[styles.variantSpec, { color: colors.textSecondary }]}>
                                        {variant.engine_cc} • {variant.fuel} • {variant.transmission}
                                    </Text>
                                </View>
                                {variant.key_specifications && variant.key_specifications.length > 0 && (
                                    <View style={styles.variantFeatures}>
                                        {variant.key_specifications.map((spec, idx) => (
                                            <View key={idx} style={[styles.featureBadge, { backgroundColor: colors.background }]}>
                                                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                                                    {spec}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {car.images.colours && car.images.colours.length > 0 && (
                    <View style={[styles.section, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Available Colors ({car.images.colours.length})
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorsContainer}>
                            {car.images.colours.map((colour, index) => (
                                <Pressable key={index} style={styles.colorCard}>
                                    <Image source={{ uri: colour.image }} style={styles.colorImage} resizeMode="cover" />
                                    <Text style={[styles.colorName, { color: colors.text }]} numberOfLines={2}>
                                        {colour.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {keySpecs && Object.keys(keySpecs).length > 0 && (
                    <View style={[styles.section, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Full Specifications</Text>
                        <View style={styles.specsGrid}>
                            {Object.entries(keySpecs).map(([key, value]) => renderSpec(key, value))}
                        </View>
                    </View>
                )}

                <Pressable
                    style={[styles.ctaButton, { backgroundColor: colors.accent }]}
                    onPress={() => router.push('/hybrid')}
                >
                    <MaterialCommunityIcons name="rotate-3d-variant" size={24} color="#FFF" />
                    <Text style={styles.ctaButtonText}>View in 3D & AR</Text>
                </Pressable>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
    },
    header: {
        padding: 16,
        paddingTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        elevation: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    heroImage: {
        width: '100%',
        height: 280,
    },
    imageTypeSelector: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    imageTypeBtn: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    imageTypeBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    imageGallery: {
        paddingHorizontal: 16,
        gap: 12,
    },
    thumbnailImage: {
        width: 100,
        height: 70,
        borderRadius: 8,
        borderWidth: 2,
    },
    priceCard: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
    },
    priceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 4,
    },
    priceDetail: {
        fontSize: 12,
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    quickSpecsGrid: {
        gap: 12,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 12,
    },
    specLabel: {
        fontSize: 12,
    },
    specValue: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 2,
    },
    variantCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 12,
    },
    variantHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    variantName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    variantPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    variantDetails: {
        marginTop: 4,
    },
    variantSpec: {
        fontSize: 13,
    },
    variantFeatures: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    featureBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    featureText: {
        fontSize: 11,
    },
    colorsContainer: {
        gap: 12,
    },
    colorCard: {
        alignItems: 'center',
        width: 120,
    },
    colorImage: {
        width: 120,
        height: 80,
        borderRadius: 8,
    },
    colorName: {
        fontSize: 12,
        marginTop: 6,
        textAlign: 'center',
    },
    specsGrid: {
        gap: 8,
    },
    ctaButton: {
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    ctaButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
