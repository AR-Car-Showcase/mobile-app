import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { carsApi } from '../../api/cars';
import { Car } from '../../types/car';

export default function ARGalleryScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadModels = async () => {
            setLoading(true);
            try {
                const allCars = await carsApi.getAllCars(true);
                const models = allCars.filter(car =>
                    car.model3D &&
                    !car.model3D.endsWith('car.glb')
                );

                if (models.length === 0) {
                    console.warn('[GALLERY] No cars with 3D models found in API. Check backend mappings.');
                }

                setCars(models);
            } catch (error) {
                console.error('Failed to load AR models:', error);
            } finally {
                setLoading(false);
            }
        };
        loadModels();
    }, []);

    const handleModelPress = (car: Car) => {
        setSelectedModel(String(car.id));
        router.push({
            pathname: '/hybrid',
            params: {
                id: car.id,
                brand: car.brand,
                model: car.model,
                initialMode: 'AR',
                modelFile: car.model3D,
                carData: JSON.stringify(car)
            }
        });
    };

    const renderModelCard = ({ item }: { item: Car }) => (
        <TouchableOpacity
            style={[styles.modelCard, { backgroundColor: colors.surface }]}
            onPress={() => handleModelPress(item)}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={[colors.accent + '20', colors.accent + '05']}
                style={styles.cardGradient}
            >
                <View style={styles.iconContainer}>
                    {item.images.exterior[0] ? (
                        <Image
                            source={{ uri: item.images.exterior[0] }}
                            style={{ width: 120, height: 80, borderRadius: 8 }}
                            resizeMode="contain"
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name="car-sports"
                            size={60}
                            color={colors.accent}
                        />
                    )}
                </View>

                <View style={styles.modelInfo}>
                    <Text style={[styles.brandText, { color: colors.textSecondary }]}>
                        {item.brand}
                    </Text>
                    <Text style={[styles.modelName, { color: colors.text }]}>
                        {item.model}
                    </Text>
                </View>

                <View style={[styles.arBadge, { backgroundColor: colors.accent }]}>
                    <MaterialCommunityIcons name="cube-scan" size={16} color="#FFF" />
                    <Text style={styles.arBadgeText}>AR READY</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary }}>Loading models...</Text>
                </View>
            ) : (
                <FlatList
                    data={cars}
                    renderItem={renderModelCard}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.row}
                    ListHeaderComponent={
                        <View style={{ marginBottom: 16 }}>
                            <View style={[styles.headerContent, { paddingVertical: 10 }]}>
                                <MaterialCommunityIcons name="view-grid" size={28} color={colors.accent} />
                                <View style={styles.headerTextContainer}>
                                    <Text style={[styles.headerTitle, { color: colors.text }]}>AR Gallery</Text>
                                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                                        Explore {cars.length} Identified Models
                                    </Text>
                                </View>
                            </View>

                            {/* Debug Info Overlay */}
                            <View style={[styles.debugBanner, { backgroundColor: colors.accent + '15' }]}>
                                <Ionicons name="bug-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                                <Text style={[styles.debugText, { color: colors.text }]}>
                                    DEBUG: Identified {cars.length} 3D models.
                                </Text>
                            </View>

                            <View style={[styles.infoBanner, { backgroundColor: colors.accent + '10', marginTop: 12, marginHorizontal: 0 }]}>
                                <Ionicons name="information-circle" size={20} color={colors.accent} />
                                <Text style={[styles.infoBannerText, { color: colors.text }]}>
                                    Tap any car to view it in AR
                                </Text>
                            </View>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTextContainer: {
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        gap: 8,
    },
    infoBannerText: {
        fontSize: 14,
        fontWeight: '500',
    },
    debugBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    debugText: {
        fontSize: 12,
        fontWeight: '600',
    },
    gridContainer: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    modelCard: {
        flex: 1,
        margin: 8,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    cardGradient: {
        padding: 16,
        minHeight: 180,
        justifyContent: 'space-between',
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    modelInfo: {
        alignItems: 'center',
        marginTop: 8,
    },
    brandText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modelName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    arBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 12,
        gap: 4,
    },
    arBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
});
