import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import { CommonStyles } from '../../constants';
import { useAuth, useScrollContext, useTheme } from '../../src/providers';
import { getCarByBrandAndModel, getCarById } from '../../api/cars';
import { recommendationsApi } from '../../api/recommendations';
import { Car } from '../../types/car';
import { likeService } from '../../src/services';
import LoginRequiredModal from '../../components/LoginRequiredModal';

import { DetailsHeader } from '../../src/features/catalog/components/details/DetailsHeader';
import { CarImageGallery } from '../../src/features/catalog/components/details/CarImageGallery';
import { PriceCard, QuickSpecsBar } from '../../src/features/catalog/components/details/SpecSummary';
import { DetailsActionBar } from '../../src/features/catalog/components/details/DetailsActionBar';
import { FullSpecsList } from '../../src/features/catalog/components/details/FullSpecsList';
import { SimilarCars } from '../../src/features/catalog/components/details/SimilarCars';

const TOTAL_HEADER_HEIGHT = 176; // 88 + 88

export default function VehicleDetailsScreen() {
    const params = useLocalSearchParams();
    const { colors } = useTheme();
    const { scrollY } = useScrollContext();
    
    const [car, setCar] = useState<Car | null>(null);
    const [relatedCars, setRelatedCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedImageType, setSelectedImageType] = useState<'exterior' | 'interior'>('exterior');
    const mainImageRef = useRef<any>(null);
    const thumbnailRef = useRef<any>(null);
    
    const [isLiked, setIsLiked] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [modelCacheToken, setModelCacheToken] = useState(0);
    const { isAuthenticated } = useAuth();

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const loadCarData = React.useCallback(async (forceRefresh = false) => {
        if (params.id) {
            setLoading(true);
            const carData = await getCarById(params.id as string, forceRefresh);
            if (carData) {
                setCar(carData);
                fetchRecommendations(carData.id);
            }
            setLoading(false);
            return;
        }

        let brand = params.brand as string;
        let model = params.model as string;

        if (brand && model) {
            const carData = await getCarByBrandAndModel(brand, model, forceRefresh);
            if (carData) {
                setCar(carData);
                fetchRecommendations(carData.id);
            }
        }
        setLoading(false);
    }, [params.id, params.brand, params.model]);

    useEffect(() => {
        loadCarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.brand, params.model, params.id]);

    useEffect(() => {
        if (isAuthenticated && car?.id) {
            checkLikeStatus();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, car?.id]);

    const checkLikeStatus = async () => {
        try {
            if (car?.id) {
                const liked = await likeService.checkLike(car.id);
                setIsLiked(liked);
            }
        } catch (error) {
            console.error('[Details] Failed to check like status:', error);
        }
    };

    const handleToggleLike = async () => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        if (!car?.id) return;
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        try {
            if (newLikedState) {
                await likeService.likeCar(car.id);
            } else {
                await likeService.unlikeCar(car.id);
            }
        } catch (error) {
            console.error('[Details] Failed to toggle like:', error);
            setIsLiked(!newLikedState);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCarData(true);
        setModelCacheToken(prev => prev + 1);
        setRefreshing(false);
    };

    const fetchRecommendations = async (carId: number | string) => {
        try {
            const numId = typeof carId === 'string' ? parseInt(carId) : carId;
            if (!isNaN(numId)) {
                recommendationsApi.trackInteraction(numId, 'view');
                const recs = await recommendationsApi.getSimilarCars(numId);
                setRelatedCars(recs);
            }
        } catch (e) {
            console.error("Failed to load recommendations", e);
        }
    };

    const mergedSpecs = React.useMemo(() => {
        let merged: Record<string, any> = {};
        if (car && car.specs) {
            Object.values(car.specs).forEach((group: any) => {
                if (typeof group === 'object') {
                    merged = { ...merged, ...group };
                }
            });
        }
        return merged;
    }, [car]);

    if (loading || !car) {
        return (
            <View style={[CommonStyles.container, styles.center, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                    {loading ? 'Loading car data...' : 'Car not found'}
                </Text>
            </View>
        );
    }

    const displayName = `${car.brand.charAt(0).toUpperCase() + car.brand.slice(1)} ${car.model.charAt(0).toUpperCase() + car.model.slice(1)}`;

    return (
        <View style={[CommonStyles.container, { backgroundColor: colors.background }]}>
            <DetailsHeader 
                scrollY={scrollY}
                colors={colors}
                displayName={displayName}
                isLiked={isLiked}
                onToggleLike={handleToggleLike}
            />

            <LoginRequiredModal 
                visible={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                featureName="Save Vehicles"
            />

            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingTop: TOTAL_HEADER_HEIGHT + 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.accent]}
                        tintColor={colors.accent}
                    />
                }
            >
                <CarImageGallery 
                    images={car.images}
                    colors={colors}
                    selectedImageIndex={selectedImageIndex}
                    setSelectedImageIndex={setSelectedImageIndex}
                    selectedImageType={selectedImageType}
                    setSelectedImageType={setSelectedImageType}
                    mainImageRef={mainImageRef}
                    thumbnailRef={thumbnailRef}
                />

                <PriceCard 
                    priceRange={car.priceRange}
                    rating={car.rating || 4.5}
                    colors={colors}
                />

                <DetailsActionBar 
                    car={car}
                    modelCacheToken={modelCacheToken}
                    colors={colors}
                />

                <QuickSpecsBar 
                    car={car}
                    mergedSpecs={mergedSpecs}
                    colors={colors}
                />

                <FullSpecsList 
                    car={car}
                    mergedSpecs={mergedSpecs}
                    colors={colors}
                    onColorSelect={(colorImage) => {
                        const colorImageIndex = car.images.exterior.findIndex(img => img === colorImage);
                        if (colorImageIndex !== -1) {
                            setSelectedImageType('exterior');
                            setSelectedImageIndex(colorImageIndex);
                            mainImageRef.current?.scrollToIndex({ index: colorImageIndex, animated: true });
                        }
                    }}
                />

                <SimilarCars 
                    relatedCars={relatedCars}
                    colors={colors}
                />
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
});
