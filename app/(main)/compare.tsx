import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCarCatalog, useTheme } from '../../src/providers';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    useSharedValue,
} from 'react-native-reanimated';
import { recommendationsApi } from '../../api/recommendations';
import { Car } from '../../types/car';

import { CompareCarSlot } from '../../src/features/compare/components/CompareCarSlot';
import { CarPickerModal } from '../../src/features/compare/components/CarPickerModal';
import { CompareSpecTable } from '../../src/features/compare/components/CompareSpecTable';
import { AiComparePanel } from '../../src/features/compare/components/AiComparePanel';

const TOP_TIER_HEIGHT = 88;
const BOTTOM_TIER_HEIGHT = 88;
const TOTAL_HEADER_HEIGHT = TOP_TIER_HEIGHT + BOTTOM_TIER_HEIGHT;

export default function CompareScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const router = useRouter();
    const scrollY = useSharedValue(0);
    const { cars: catalogCars, loading: catalogLoading, refreshing, refreshCatalog } = useCarCatalog();

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
    
    const [aiNeed, setAiNeed] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState('');
    const [aiError, setAiError] = useState('');
    const [aiModel, setAiModel] = useState('');

    useEffect(() => {
        setSearchResults(catalogCars);
    }, [catalogCars]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const lower = text.toLowerCase();
        if (lower.length <= 1) {
            setSearchResults(catalogCars);
            return;
        }

        setSearchResults(
            catalogCars.filter((car) =>
                car.brand.toLowerCase().includes(lower) ||
                car.model.toLowerCase().includes(lower) ||
                car.bodyType.toLowerCase().includes(lower)
            )
        );
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

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top + 92}
        >
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
                contentContainerStyle={{ paddingTop: TOTAL_HEADER_HEIGHT + 10, paddingBottom: 32 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refreshCatalog} tintColor={colors.accent} />
                }
            >
                <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <View style={styles.labelCol} />
                    {[0, 1, 2].map((index) => {
                        const car = selectedCars[index];
                        return (
                            <View key={index} style={styles.carCol}>
                                <CompareCarSlot 
                                    car={car}
                                    colors={colors}
                                    onRemove={removeCar}
                                    onAdd={() => setIsModalVisible(true)}
                                />
                            </View>
                        );
                    })}
                </View>

                {selectedCars.length > 0 ? (
                    <CompareSpecTable selectedCars={selectedCars} colors={colors} />
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

                <AiComparePanel 
                    colors={colors}
                    selectedCars={selectedCars}
                    aiNeed={aiNeed}
                    setAiNeed={setAiNeed}
                    aiLoading={aiLoading}
                    runAiComparison={runAiComparison}
                    aiError={aiError}
                    aiInsight={aiInsight}
                    aiModel={aiModel}
                />

                <View style={{ height: 40 }} />
            </Animated.ScrollView>

            <CarPickerModal 
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                colors={colors}
                searchQuery={searchQuery}
                onSearch={handleSearch}
                loading={catalogLoading}
                searchResults={searchResults}
                onSelectCar={addCar}
            />
        </KeyboardAvoidingView>
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
        paddingTop: 60,
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
});
