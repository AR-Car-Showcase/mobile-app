import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    useSharedValue,
} from 'react-native-reanimated';
import { getAllCars, searchCars } from '../../api/cars';
import { recommendationsApi } from '../../api/recommendations';
import { Car } from '../../types/car';
import { parsePrice, parseEngine, parsePower, parseMileage, parseTorque } from '../../utils/comparisonUtils';

const SPEC_KEYS = [
    { key: 'priceRange', label: 'Price (Ex-Showroom)', type: 'price' },
    { key: 'bodyType', label: 'Body Type', type: 'text' },
    { key: 'fuelType', label: 'Fuel Type', type: 'text' },
    { key: 'transmissionType', label: 'Transmission', type: 'text' },
    { key: 'engine', label: 'Engine (cc)', type: 'engine' },
    { key: 'mileage', label: 'Mileage', type: 'mileage' },
    { key: 'power', label: 'Max Power', type: 'power' },
    { key: 'torque', label: 'Max Torque', type: 'torque' },
    { key: 'bootSpace', label: 'Boot Space', type: 'text' },
    { key: 'fuelTankCapacity', label: 'Fuel Tank', type: 'text' },
    { key: 'topSpeed', label: 'Top Speed', type: 'text' },
    { key: 'acceleration', label: '0-100 km/h', type: 'text' },
    { key: 'groundClearance', label: 'Ground Clearance', type: 'text' },
    { key: 'seatingCapacity', label: 'Seating Capacity', type: 'number' },
    { key: 'rating', label: 'User Rating', type: 'rating' },
];

const TOP_TIER_HEIGHT = 88;
const BOTTOM_TIER_HEIGHT = 88;
const TOTAL_HEADER_HEIGHT = TOP_TIER_HEIGHT + BOTTOM_TIER_HEIGHT;

export default function CompareScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const scrollY = useSharedValue(0);

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
    const [selectedCars, setSelectedCars] = useState<Car[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchResults, setSearchResults] = useState<Car[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiNeed, setAiNeed] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState('');
    const [aiError, setAiError] = useState('');
    const [aiModel, setAiModel] = useState('');

    useEffect(() => {
        loadInitialCars();
    }, []);

    const loadInitialCars = async () => {
        setLoading(true);
        const allCars = await getAllCars();
        setSearchResults(allCars);
        setLoading(false);
    };

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 1) {
            const results = await searchCars(text);
            setSearchResults(results);
        } else {
            const allCars = await getAllCars();
            setSearchResults(allCars);
        }
    };

    const addCar = (car: Car) => {
        if (selectedCars.length < 3) {
            if (!selectedCars.find(c => c.id === car.id)) {
                setSelectedCars([...selectedCars, car]);
            }
        }
        setIsModalVisible(false);
    };

    const removeCar = (id: number) => {
        setSelectedCars(selectedCars.filter(c => c.id !== id));
    };

    const runAiComparison = async () => {
        if (selectedCars.length < 2) {
            setAiError('Select at least 2 cars for AI comparison.');
            return;
        }

        setAiLoading(true);
        setAiError('');

        const response = await recommendationsApi.compareCarsWithAi({
            carIds: selectedCars.map(car => car.id),
            carNames: selectedCars.map(car => `${car.brand} ${car.model}`),
            userNeed: aiNeed.trim(),
            dataSource: 'AUTO',
        });

        if (!response) {
            setAiInsight('');
            setAiModel('');
            setAiError('Unable to generate AI comparison right now. Please try again.');
            setAiLoading(false);
            return;
        }

        setAiInsight(sanitizeAiAnswer(response.answer || ''));
        setAiModel(response.model || '');
        setAiLoading(false);
    };

    const sanitizeAiAnswer = (text: string): string => {
        return text
            .replace(/<think[^>]*>[\s\S]*?<\/think>/gi, ' ')
            .replace(/<\/?think[^>]*>/gi, ' ')
            .replace(/\*\*/g, '')
            .trim();
    };

    const getSpecValue = (car: Car, key: string, type: string): string | number => {
        if (key === 'priceRange') return car.priceRange;
        if (key === 'rating') return car.rating;
        if (key === 'seatingCapacity') return car.seatingCapacity;
        if (key === 'bodyType' || key === 'fuelType' || key === 'transmissionType') {
            return car[key as keyof Car] as string || 'N/A';
        }

        const variant = car.variants?.[0];
        if (variant) {
            if (key === 'mileage') return variant.mileage;
            if (key === 'engine') return variant.engineCC;
        }

        let foundValue: string | number = '-';
        if (car.specs) {
            Object.values(car.specs).forEach(category => {
                if (typeof category === 'object') {
                    Object.entries(category).forEach(([k, v]) => {
                        const lowerK = k.toLowerCase();
                        const lowerKey = key.toLowerCase();
                        
                        if (lowerK.includes(lowerKey)) {
                            foundValue = v as string;
                        } else if (key === 'power' && lowerK.includes('power')) {
                            foundValue = v as string;
                        } else if (key === 'torque' && lowerK.includes('torque')) {
                            foundValue = v as string;
                        } else if (key === 'fuelTankCapacity' && lowerK.includes('fuel tank')) {
                            foundValue = v as string;
                        } else if (key === 'topSpeed' && lowerK.includes('top speed')) {
                            foundValue = v as string;
                        } else if (key === 'acceleration' && (lowerK.includes('acceleration') || lowerK.includes('0-100'))) {
                            foundValue = v as string;
                        }
                    });
                }
            });
        }
        return foundValue === '-' || foundValue === '' ? 'N/A' : foundValue;
    };

    const isBest = (val: string | number, type: string, rowValues: (string | number)[]): boolean => {
        if (val === 'N/A' || val === '-') return false;

        const parse = (v: string | number) => {
            const strV = v.toString();
            if (type === 'price') return parsePrice(strV);
            if (type === 'mileage') return parseMileage(strV);
            if (type === 'engine') return parseEngine(strV);
            if (type === 'power') return parsePower(strV);
            if (type === 'torque') return parseTorque(strV);
            if (type === 'rating') return parseFloat(strV);
            if (type === 'number') return parseFloat(strV);
            return 0;
        };

        const currentVal = parse(val);
        const allVals = rowValues.map(v => parse(v)).filter(v => v > 0);

        if (allVals.length < 2) return false;

        if (type === 'price') {
            const min = Math.min(...allVals);
            return currentVal === min && min > 0;
        } else {
            const max = Math.max(...allVals);
            return currentVal === max && max > 0;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={[styles.tier1Header, { backgroundColor: colors.background }, tier1Style]}>
                <Pressable onPress={() => {
                    const r = router as any;
                    if (r.openDrawer) r.openDrawer();
                    else if (r.dispatch) {
                        r.dispatch({ type: 'OPEN_DRAWER' });
                    }
                }} style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.tier1Title, { color: colors.text }]}>Compare Vehicles</Text>
            </Animated.View>

            <Animated.View style={[styles.tier2Header, { backgroundColor: colors.surface }, tier2Style]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>

                <View style={styles.tier2TitleContainer}>
                    <Animated.View style={[styles.centeredTitleWrapper, centeredTitleStyle]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Compare</Text>
                    </Animated.View>

                    <Animated.View style={[styles.stickyNameWrapper, stickyNameStyle]}>
                        <Text style={[styles.stickyCarName, { color: colors.text }]} numberOfLines={1}>
                            {selectedCars.length > 0 
                                ? selectedCars.map(c => c.model).join(' vs ') 
                                : 'Select Cars'}
                        </Text>
                    </Animated.View>
                </View>

                <Pressable
                    onPress={() => {
                        setSelectedCars([]);
                        setAiInsight('');
                        setAiError('');
                        setAiModel('');
                    }}
                    style={styles.clearButton}
                >
                    <Text style={{ color: colors.error, fontSize: 14, fontWeight: '600' }}>Clear</Text>
                </Pressable>
            </Animated.View>

            <Animated.ScrollView 
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: TOTAL_HEADER_HEIGHT + 10 }}
            >
                <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <View style={styles.labelCol} />
                    {[0, 1, 2].map((index) => {
                        const car = selectedCars[index];
                        return (
                            <View key={index} style={styles.carCol}>
                                {car ? (
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <View style={styles.imageContainer}>
                                            <Image source={{ uri: car.images.exterior[0] }} style={styles.carImage} />
                                            <Pressable
                                                style={[styles.removeButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                                                onPress={() => removeCar(car.id)}
                                            >
                                                <Ionicons name="close" size={16} color="#FFF" />
                                            </Pressable>
                                        </View>
                                        <Text style={[styles.carName, { color: colors.text }]} numberOfLines={2}>{car.brand} {car.model}</Text>
                                    </View>
                                ) : (
                                    <Pressable
                                        style={[styles.addCard, { borderColor: colors.border }]}
                                        onPress={() => setIsModalVisible(true)}
                                    >
                                        <Ionicons name="add" size={32} color={colors.textSecondary} />
                                        <Text style={[styles.addText, { color: colors.textSecondary }]}>Add Car</Text>
                                    </Pressable>
                                )}
                            </View>
                        );
                    })}
                </View>

                {selectedCars.length > 0 ? (
                    SPEC_KEYS.map((spec) => {
                        const rowValues = selectedCars.map(c => getSpecValue(c, spec.key, spec.type));

                        return (
                            <View key={spec.key} style={[styles.specRow, { borderBottomColor: colors.border }]}>
                                <View style={styles.labelCol}>
                                    <Text style={[styles.featureLabel, { color: colors.textSecondary }]}>{spec.label}</Text>
                                </View>
                                {[0, 1, 2].map((index) => {
                                    const car = selectedCars[index];
                                    if (!car) return <View key={index} style={styles.carCol} />;

                                    const val = rowValues[index];
                                    const best = selectedCars.length > 1 && isBest(val, spec.type, rowValues);

                                    const renderVal = () => {
                                        const lowerVal = String(val).toLowerCase();
                                        const isTrue = lowerVal === 'true' || lowerVal === 'yes';
                                        const isFalse = lowerVal === 'false' || lowerVal === 'no';

                                        if (isTrue || isFalse) {
                                            return (
                                                <Ionicons 
                                                    name={isTrue ? "checkmark-circle" : "close-circle"} 
                                                    size={20} 
                                                    color={isTrue ? colors.accent : colors.error} 
                                                />
                                            );
                                        }

                                        return (
                                            <Text style={[
                                                styles.specValue,
                                                { color: best ? '#4CAF50' : colors.text, fontWeight: best ? 'bold' : '500' }
                                            ]}>
                                                {val} {best && <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />}
                                            </Text>
                                        );
                                    };

                                    return (
                                        <View key={index} style={styles.carCol}>
                                            {renderVal()}
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                            Select cars to start comparing specifications.
                        </Text>
                        <Pressable
                            style={[styles.mainAddButton, { backgroundColor: colors.accent }]}
                            onPress={() => setIsModalVisible(true)}
                        >
                            <Text style={styles.mainAddButtonText}>Add Car to Compare</Text>
                        </Pressable>
                    </View>
                )}

                <View style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.aiTitleRow}>
                        <MaterialCommunityIcons name="robot-outline" size={18} color={colors.accent} />
                        <Text style={[styles.aiTitle, { color: colors.text }]}>AI Differentiation Assistant</Text>
                    </View>

                    <Text style={[styles.aiSubtitle, { color: colors.textSecondary }]}>
                        Tell AI what matters to you, and it will explain the best option among selected cars.
                    </Text>
                    <Text style={[styles.aiHint, { color: colors.textSecondary }]}>
                        Smart mode is always enabled: DB first, JSON fallback if needed.
                    </Text>

                    <TextInput
                        style={[
                            styles.aiInput,
                            {
                                backgroundColor: colors.background,
                                color: colors.text,
                                borderColor: colors.border,
                            }
                        ]}
                        placeholder="Example: I drive mostly in city traffic and want low running cost under 18 lakhs."
                        placeholderTextColor={colors.textSecondary}
                        value={aiNeed}
                        onChangeText={setAiNeed}
                        multiline
                    />

                    <Pressable
                        style={[
                            styles.aiActionButton,
                            {
                                backgroundColor: selectedCars.length >= 2 ? colors.accent : colors.surfaceHighlight,
                            }
                        ]}
                        disabled={aiLoading || selectedCars.length < 2}
                        onPress={runAiComparison}
                    >
                        {aiLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.aiActionText}>Generate AI Comparison</Text>
                        )}
                    </Pressable>

                    {aiError ? (
                        <Text style={[styles.aiError, { color: colors.error }]}>{aiError}</Text>
                    ) : null}

                    {aiInsight ? (
                        <View style={[styles.aiResultBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
                            <Text style={[styles.aiResultText, { color: colors.text }]}>{aiInsight}</Text>
                            <Text style={[styles.aiMeta, { color: colors.textSecondary }]}>
                                Model: {aiModel || 'N/A'}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <View style={{ height: 40 }} />
            </Animated.ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Select Car</Text>
                        <Pressable onPress={() => setIsModalVisible(false)}>
                            <Text style={{ color: colors.accent, fontSize: 16 }}>Close</Text>
                        </Pressable>
                    </View>

                    <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search by brand or model..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[styles.carListItem, { borderBottomColor: colors.border }]}
                                    onPress={() => addCar(item)}
                                >
                                    <Image source={{ uri: item.images.exterior[0] }} style={styles.listImage} />
                                    <View>
                                        <Text style={[styles.listBrand, { color: colors.textSecondary }]}>{item.brand}</Text>
                                        <Text style={[styles.listModel, { color: colors.text }]}>{item.model}</Text>
                                    </View>
                                </Pressable>
                            )}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    clearButton: {
        padding: 8,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 16,
    },
    specRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    labelCol: {
        width: 100,
        paddingLeft: 16,
        justifyContent: 'center',
    },
    carCol: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    carImage: {
        width: 80,
        height: 50,
        borderRadius: 4,
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carName: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    addCard: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addText: {
        fontSize: 10,
        marginTop: 4,
    },
    featureLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    specValue: {
        fontSize: 12,
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyStateText: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
    },
    mainAddButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
    },
    mainAddButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    aiCard: {
        marginHorizontal: 14,
        marginTop: 18,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 10,
    },
    aiTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    aiTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    aiSubtitle: {
        fontSize: 12,
        lineHeight: 18,
    },
    aiHint: {
        fontSize: 11,
        fontWeight: '600',
    },
    aiInput: {
        minHeight: 84,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        textAlignVertical: 'top',
        fontSize: 13,
    },
    aiActionButton: {
        borderRadius: 10,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiActionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    aiError: {
        fontSize: 12,
        fontWeight: '600',
    },
    aiResultBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        gap: 8,
    },
    aiResultText: {
        fontSize: 13,
        lineHeight: 20,
    },
    aiMeta: {
        fontSize: 11,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    carListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    listImage: {
        width: 60,
        height: 40,
        borderRadius: 4,
        marginRight: 16,
        resizeMode: 'cover',
    },
    listBrand: {
        fontSize: 12,
        textTransform: 'uppercase',
    },
    listModel: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
});
