import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState, memo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, Dimensions, Image, ScrollView, RefreshControl } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { CommonStyles } from '../../constants';
import { useTheme } from '../context/ThemeContext';
import { getCarByBrandAndModel, getCarById } from '../../api/cars';
import { recommendationsApi } from '../../api/recommendations';
import { Car } from '../../types/car';
import { useScrollContext } from '../context/ScrollContext';
import { likeService } from '../services/likeService';
import { useAuth } from '../context/AuthContext';
import LoginRequiredModal from '../../components/LoginRequiredModal';

const { width } = Dimensions.get('window');
const TOP_TIER_HEIGHT = 88;
const BOTTOM_TIER_HEIGHT = 88;
const TOTAL_HEADER_HEIGHT = TOP_TIER_HEIGHT + BOTTOM_TIER_HEIGHT;

const MemoizedThumbnail = memo(({ item, isSelected, onPress, colors }: { item: string, isSelected: boolean, onPress: () => void, colors: any }) => {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.thumbnailWrapper, isSelected && { borderColor: colors.accent, borderWidth: 2 }]}
        >
            <ExpoImage
                source={{ uri: item }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
            />
        </Pressable>
    );
});
MemoizedThumbnail.displayName = 'MemoizedThumbnail';

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

const SPEC_CATEGORIES: Record<string, string[]> = {
    "Engine & Transmission": ["Engine Type", "Displacement", "Engine Displacement", "Max Power", "Max Torque", "No. of Cylinders", "Valves Per Cylinder", "Turbo Charger", "Transmission Type", "Gearbox", "Drive Type"],
    "Fuel & Performance": ["Fuel Type", "Fuel Tank Capacity", "Petrol Fuel Tank Capacity", "Diesel Fuel Tank Capacity", "Mileage", "City Mileage", "Petrol Highway Mileage", "Diesel Highway Mileage", "Top Speed", "Acceleration", "0-100kmph", "Emission Norm Compliance"],
    "Suspension, Steering & Brakes": ["Suspension", "Steering Type", "Steering Column", "Steering Gear Type", "Turning Radius", "Brakes Front", "Brakes Rear", "Shock Absorbers"],
    "Dimensions & Capacity": ["Length", "Width", "Height", "Boot Space", "Seating Capacity", "Wheel Base", "Front Tread", "Rear Tread", "Kerb Weight", "Gross Weight", "No. of Doors", "Ground Clearance"],
    "Comfort & Convenience": ["Power Steering", "Power Windows", "Power Windows Front", "Power Windows Rear", "Air Conditioner", "Heater", "Adjustable Steering", "Automatic Climate Control", "Air Quality Control", "Accessory Power Outlet", "Trunk Light", "Vanity Mirror", "Rear Reading Lamp", "Rear Seat Headrest", "Adjustable Headrest", "Rear Seat Centre Arm Rest", "Cup Holders", "Cruise Control", "Parking Sensors", "Real-Time Vehicle Tracking", "KeyLess Entry", "Engine Start/Stop Button", "Cooled Glovebox", "Voice Commands", "USB Charger", "Central Console Armrest", "Tailgate Ajar Warning", "Hands-Free Tailgate", "Luggage Hook & Net", "Automatic Headlamps", "Follow Me Home Headlamps"],
    "Interior": ["Tachometer", "Leather Wrapped Steering Wheel", "Glove Box", "Digital Cluster", "Upholstery", "Leather Seats", "Electronic Multi-Tripmeter", "Digital Clock", "Outside Temperature Display", "Digital Odometer", "Sun Roof", "Moon Roof", "Dual Tone Dashboard", "Lighting"],
    "Exterior": ["Adjustable Headlamps", "Fog Lights", "Rain Sensing Wiper", "Rear Window Wiper", "Rear Window Washer", "Rear Window Defogger", "Alloy Wheels", "Wheel Covers", "Outside Rear View Mirror Turn Indicators", "Projector Headlamps", "Boot Opening", "Heated Outside Rear View Mirror", "Outside Rear View Mirror (ORVM)", "Tyre Size", "Tyre Type", "LED DRLs", "LED Headlamps", "LED Taillights", "Integrated Antenna", "Chrome Grille", "Chrome Garnish", "Roof Rail"],
    "Safety": ["Anti-lock Braking System (ABS)", "Brake Assist", "Central Locking", "Child Safety Locks", "Anti-Theft Alarm", "No. of Airbags", "Driver Airbag", "Passenger Airbag", "Side Airbag", "Side Airbag-Rear", "Day & Night Rear View Mirror", "Curtain Airbag", "Electronic Brakeforce Distribution (EBD)", "Seat Belt Warning", "Door Ajar Warning", "Traction Control", "Tyre Pressure Monitoring System (TPMS)", "Engine Immobilizer", "Electronic Stability Control (ESC)", "Rear Camera", "Anti-Theft Device", "Anti-Pinch Power Windows", "Speed Alert", "Speed Sensing Auto Door Lock", "ISOFIX Child Seat Mounts", "Pretensioners & Force Limiter Seatbelts", "Hill Descent Control", "Hill Assist", "Impact Sensing Auto Door Unlock", "360 View Camera"],
    "Entertainment & Communication": ["Radio", "Wireless Phone Charging", "Bluetooth Connectivity", "Touchscreen", "Touchscreen Size", "Android Auto", "Apple CarPlay", "Usb Ports", "Speakers", "Audio System Remote Control", "Integrated 2DIN Audio"],
    "ADAS Feature": ["Lane Departure Warning", "Emergency Braking", "Adaptive Cruise Control", "Blind Spot Monitor", "Lane Keep Assist"],
    "Advance Internet Feature": ["Remote Engine Start", "Remote Horn & Light", "Geo Fence"]
};

const KEY_SPECS = ["Max Power", "Max Torque", "City Mileage", "Fuel Type", "Engine Displacement", "Transmission Type", "Seating Capacity", "Boot Space"];

export default function VehicleDetailsScreen() {
    const params = useLocalSearchParams();
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { scrollY } = useScrollContext();
    const [car, setCar] = useState<Car | null>(null);
    const [relatedCars, setRelatedCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedImageType, setSelectedImageType] = useState<'exterior' | 'interior'>('exterior');
    const [isLiked, setIsLiked] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { isAuthenticated } = useAuth();
    const mainImageRef = useRef<any>(null);
    const thumbnailRef = useRef<any>(null);

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const tier1Style = useAnimatedStyle(() => {
        const translateY = interpolate(scrollY.value, [0, TOP_TIER_HEIGHT], [0, -TOP_TIER_HEIGHT], Extrapolate.CLAMP);
        const opacity = interpolate(scrollY.value, [0, TOP_TIER_HEIGHT / 2], [1, 0], Extrapolate.CLAMP);
        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    const tier2Style = useAnimatedStyle(() => {
        const translateY = interpolate(scrollY.value, [0, TOP_TIER_HEIGHT], [0, -TOP_TIER_HEIGHT], Extrapolate.CLAMP);
        return {
            transform: [{ translateY }],
        };
    });

    const centeredTitleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [TOP_TIER_HEIGHT, TOP_TIER_HEIGHT + 30], [1, 0], Extrapolate.CLAMP);
        return { opacity };
    });

    const stickyNameStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [TOP_TIER_HEIGHT + 20, TOP_TIER_HEIGHT + 50], [0, 1], Extrapolate.CLAMP);
        const translateX = interpolate(scrollY.value, [TOP_TIER_HEIGHT + 20, TOP_TIER_HEIGHT + 50], [20, 0], Extrapolate.CLAMP);
        return {
            opacity,
            transform: [{ translateX }],
        };
    });

    useEffect(() => {
        loadCarData();
    }, [params.brand, params.model, params.id]);

    useEffect(() => {
        if (isAuthenticated && car?.id) {
            checkLikeStatus();
        }
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
        setRefreshing(false);
    };

    const loadCarData = async (forceRefresh = false) => {
        if (params.id) {
            setLoading(true);
            const carData = await getCarById(params.id as string);
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
    }, [car?.specs]);

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

    const renderSpecValue = (value: any) => {
        const lowerVal = String(value).toLowerCase();
        const isTrue = value === true || lowerVal === 'true' || lowerVal === 'yes';
        const isFalse = value === false || lowerVal === 'false' || lowerVal === 'no';

        if (isTrue || isFalse) {
            return isTrue ? (
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
            ) : (
                <Ionicons name="close-circle" size={20} color={colors.error} />
            );
        }
        return <Text style={[styles.specValueDetail, { color: colors.text }]}>{String(value)}</Text>;
    };

    const renderQuickSpecs = () => {
        const quickSpecsData = [
            { label: 'Engine', value: mergedSpecs['Engine Displacement'] || mergedSpecs['Displacement'], icon: 'engine', library: 'MCI' },
            { label: 'Fuel', value: mergedSpecs['Fuel Type'] || car.fuelType, icon: 'gas-station', library: 'MCI' },
            { label: 'Seats', value: mergedSpecs['Seating Capacity'] || car.seatingCapacity, icon: 'car-seat', library: 'MCI' },
            { label: 'Transmission', value: mergedSpecs['Transmission Type'] || mergedSpecs['Gearbox'] || car.transmissionType, icon: 'cog-outline', library: 'MCI' },
        ].filter(item => item.value);

        return (
            <View style={[styles.quickSpecsBar, { backgroundColor: colors.surface }]}>
                {quickSpecsData.map((item, index) => (
                    <View key={index} style={styles.quickSpecItem}>
                        {item.library === 'MCI' ? (
                            <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.accent} />
                        ) : (
                            <Ionicons name={item.icon as any} size={20} color={colors.accent} />
                        )}
                        <Text style={[styles.quickSpecValue, { color: colors.text }]} numberOfLines={1}>{item.value}</Text>
                        <Text style={[styles.quickSpecLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderColorSelector = () => {
        if (!car.images.colours || car.images.colours.length === 0) return null;

        return (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Colors</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.colorScrollContainer}
                >
                    {car.images.colours.map((color, index) => (
                        <Pressable
                            key={index}
                            style={styles.colorItem}
                            onPress={() => {
                                const colorImageIndex = car.images.exterior.findIndex(img => img === color.image);
                                if (colorImageIndex !== -1) {
                                    setSelectedImageType('exterior');
                                    setSelectedImageIndex(colorImageIndex);
                                    mainImageRef.current?.scrollToIndex({ index: colorImageIndex, animated: true });
                                }
                            }}
                        >
                            <Image
                                source={{ uri: color.image }}
                                style={styles.colorImage}
                                resizeMode="cover"
                            />
                            <Text style={[styles.colorName, { color: colors.text }]} numberOfLines={1}>
                                {color.name}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderKeySpecs = () => {
        const specsToShow = KEY_SPECS.map(key => ({ key, value: mergedSpecs[key] })).filter(item => item.value);

        return (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Specifications</Text>
                <View style={styles.quickSpecsGrid}>
                    {specsToShow.map((item, index) => (
                        <View key={index} style={[styles.specRowDetail, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.specKey, { color: colors.textSecondary }]}>{item.key}</Text>
                            <View style={styles.specValueContainer}>{renderSpecValue(item.value)}</View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderCategorizedSpecs = () => {
        return Object.entries(SPEC_CATEGORIES).map(([category, keys]) => {
            const categorySpecs = keys.map(key => ({ key, value: mergedSpecs[key] })).filter(item => item.value !== undefined && item.value !== null);

            if (categorySpecs.length === 0) return null;

            return (
                <CollapsibleSection key={category} title={category}>
                    {categorySpecs.map((item, index) => (
                        <View key={index} style={[styles.specRowDetail, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
                            <Text style={[styles.specKey, { color: colors.textSecondary }]}>{item.key}</Text>
                            <View style={styles.specValueContainer}>
                                {renderSpecValue(item.value)}
                            </View>
                        </View>
                    ))}
                </CollapsibleSection>
            );
        });
    };

    const renderRelatedCars = () => {
        if (relatedCars.length === 0) return null;
        return (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>You Might Also Like</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
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
    };

    return (
        <View style={[CommonStyles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={[styles.tier1Header, { backgroundColor: colors.background }, tier1Style]}>
                <Pressable onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.tier1Title, { color: colors.text }]}>Car Details</Text>
            </Animated.View>

            <Animated.View style={[styles.tier2Header, { backgroundColor: colors.surface }, tier2Style]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>

                <View style={styles.tier2TitleContainer}>
                    <Animated.View style={[styles.centeredTitleWrapper, centeredTitleStyle]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>{displayName}</Text>
                    </Animated.View>

                    <Animated.View style={[styles.stickyNameWrapper, stickyNameStyle]}>
                        <Text style={[styles.stickyCarName, { color: colors.text }]} numberOfLines={1}>{displayName}</Text>
                    </Animated.View>
                </View>

                <Pressable style={styles.backButton} onPress={handleToggleLike}>
                    <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={24} 
                        color={isLiked ? colors.error : colors.accent} 
                    />
                </Pressable>
            </Animated.View>

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
                <View style={{ height: 250 }}>
                    <Animated.FlatList
                        ref={mainImageRef}
                        data={currentImages}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(ev) => {
                            const newIndex = Math.round(ev.nativeEvent.contentOffset.x / width);
                            if (newIndex !== selectedImageIndex && newIndex >= 0 && newIndex < currentImages.length) {
                                setSelectedImageIndex(newIndex);
                                const thumbnailWidth = 80 + 8;
                                thumbnailRef.current?.scrollTo({
                                    x: newIndex * thumbnailWidth - (width / 2) + (thumbnailWidth / 2),
                                    animated: true
                                });
                            }
                        }}
                        renderItem={({ item }) => (
                            <ExpoImage
                                source={{ uri: item }}
                                style={{ width: width, height: 250 }}
                                contentFit="cover"
                                transition={0}
                                cachePolicy="memory-disk"
                            />
                        )}
                        removeClippedSubviews={false}
                        getItemLayout={(_, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                        initialNumToRender={3}
                        maxToRenderPerBatch={3}
                        windowSize={5}
                    />
                </View>

                <View style={styles.imageTypeSelector}>
                    <Pressable
                        style={[styles.imageTypeBtn, selectedImageType === 'exterior' && { backgroundColor: colors.accent }]}
                        onPress={() => {
                            setSelectedImageType('exterior');
                            setSelectedImageIndex(0);
                            mainImageRef.current?.scrollToOffset({ offset: 0, animated: false });
                        }}
                    >
                        <Text style={[styles.imageTypeBtnText, { color: selectedImageType === 'exterior' ? '#FFF' : colors.textSecondary }]}>
                            Exterior ({car.images.exterior.length})
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.imageTypeBtn, selectedImageType === 'interior' && { backgroundColor: colors.accent }]}
                        onPress={() => {
                            setSelectedImageType('interior');
                            setSelectedImageIndex(0);
                            mainImageRef.current?.scrollToOffset({ offset: 0, animated: false });
                        }}
                    >
                        <Text style={[styles.imageTypeBtnText, { color: selectedImageType === 'interior' ? '#FFF' : colors.textSecondary }]}>
                            Interior ({car.images.interior.length})
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.thumbnailsContainer}>
                    <Animated.ScrollView
                        ref={thumbnailRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                    >
                        {currentImages.map((item, index) => (
                            <MemoizedThumbnail
                                key={`${item}-${index}`}
                                item={item}
                                isSelected={index === selectedImageIndex}
                                onPress={() => {
                                    setSelectedImageIndex(index);
                                    mainImageRef.current?.scrollToIndex({ index, animated: true });
                                }}
                                colors={colors}
                            />
                        ))}
                    </Animated.ScrollView>
                </View>

                <View style={[styles.priceCard, { backgroundColor: colors.surface }]}>
                    <View>
                        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Estimated Price</Text>
                        <Text style={[styles.priceValue, { color: colors.text }]}>{car.priceRange}</Text>
                        <Text style={[styles.priceDetail, { color: colors.textSecondary }]}>Ex-showroom</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={20} color={colors.accent} />
                        <Text style={[styles.ratingText, { color: colors.text }]}>{Number(car.rating) || 4.5}</Text>
                    </View>
                </View>

                <View style={styles.actionButtonsContainer}>
                    <Pressable
                        style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent }]}
                        onPress={() => router.push({
                            pathname: '/hybrid',
                            params: {
                                id: car.id,
                                brand: car.brand,
                                model: car.model,
                                initialMode: 'AR',
                                modelFile: car.model3D,
                                carData: JSON.stringify(car)
                            }
                        })}
                    >
                        <MaterialCommunityIcons name="cube-scan" size={24} color={colors.accent} />
                        <Text style={[styles.actionButtonText, { color: colors.accent }]}>View in AR</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.actionButton, { backgroundColor: colors.accent }]}
                        onPress={() => router.push({
                            pathname: '/hybrid',
                            params: {
                                id: car.id,
                                brand: car.brand,
                                model: car.model,
                                initialMode: '3D',
                                modelFile: car.model3D,
                                carData: JSON.stringify(car)
                            }
                        })}
                    >
                        <Ionicons name="cube-outline" size={24} color="#FFF" />
                        <Text style={[styles.actionButtonText, { color: '#FFF' }]}>View in 3D</Text>
                    </Pressable>
                </View>

                {renderQuickSpecs()}

                {renderColorSelector()}

                {renderKeySpecs()}

                <View style={[styles.section, { backgroundColor: colors.surface, padding: 0, overflow: 'hidden' }]}>
                    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Full Specifications</Text>
                    </View>
                    {renderCategorizedSpecs()}
                </View>

                {renderRelatedCars()}
            </Animated.ScrollView>
        </View >
    );
}

const CollapsibleSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { colors } = useTheme();
    return (
        <View style={[styles.accordionSection, { borderBottomColor: colors.border }]}>
            <Pressable
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.accordionHeader}
            >
                <Text style={[styles.accordionTitle, { color: colors.text }]}>{title}</Text>
                <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.textSecondary}
                />
            </Pressable>
            {isExpanded && (
                <View style={styles.accordionContent}>
                    {children}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
    },
    tier1Header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: TOP_TIER_HEIGHT + 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 44,
        zIndex: 110,
    },
    tier1Title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    tier2Header: {
        position: 'absolute',
        top: TOP_TIER_HEIGHT,
        left: 0,
        right: 0,
        height: BOTTOM_TIER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tier2TitleContainer: {
        flex: 1,
        justifyContent: 'center',
        height: '100%',
        marginHorizontal: 8,
    },
    centeredTitleWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    stickyNameWrapper: {
        position: 'absolute',
        left: 0,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    stickyCarName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 12,
    },
    quickSpecsBar: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    quickSpecItem: {
        alignItems: 'center',
        flex: 1,
    },
    quickSpecValue: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 4,
    },
    quickSpecLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    heroImage: {
        width: '100%',
        height: 250,
    },
    imageTypeSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16,
        gap: 16,
    },
    imageTypeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    imageTypeBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    thumbnailsContainer: {
        marginBottom: 16,
    },
    thumbnailWrapper: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumbnail: {
        width: 80,
        height: 60,
        resizeMode: 'cover',
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
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    quickSpecsGrid: {
        gap: 8,
    },
    specRowDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
    },
    specKey: {
        fontSize: 14,
        flex: 1,
    },
    specValueDetail: {
        fontSize: 14,
        fontWeight: '600',
    },
    specValueContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    accordionSection: {
        borderBottomWidth: 1,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    accordionTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    accordionContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    colorScrollContainer: {
        paddingVertical: 8,
        gap: 12,
    },
    colorItem: {
        alignItems: 'center',
        marginRight: 12,
        width: 100,
    },
    colorImage: {
        width: 100,
        height: 70,
        borderRadius: 8,
        marginBottom: 8,
    },
    colorName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },

    relatedCarCard: {
        width: 160,
        borderRadius: 12,
        overflow: 'hidden',
        paddingBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    relatedCarImage: {
        width: '100%',
        height: 100,
    },
    relatedCarInfo: {
        padding: 8,
    },
    relatedCarName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    relatedCarPrice: {
        fontSize: 12,
        fontWeight: '600',
    },
});
