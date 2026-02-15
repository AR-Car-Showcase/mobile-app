import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { customizationsApi, CustomizationResponse } from '../../api/customizations';
import { carsApi } from '../../api/cars';

export default function SavedModelsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [customizations, setCustomizations] = useState<CustomizationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadCustomizations = async () => {
        try {
            const data = await customizationsApi.getUserCustomizations();
            setCustomizations(data);
        } catch (error) {
            console.error('Failed to load saved models:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCustomizations();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadCustomizations();
    };

    const handleModelPress = async (item: CustomizationResponse) => {
        // Fetch full car data for the studio
        const carData = await carsApi.getCarById(item.vehicleId);

        router.push({
            pathname: '/hybrid',
            params: {
                id: item.vehicleId,
                brand: item.carBrand,
                model: item.carModel,
                initialMode: '3D',
                customizationId: item.customizationId,
                modelUrl: item.modelUrl,
                materials: item.materials,
                carData: carData ? JSON.stringify(carData) : undefined
            }
        });
    };

    const renderModelCard = ({ item }: { item: CustomizationResponse }) => (
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
                    {item.carImage ? (
                        <Image
                            source={{ uri: item.carImage }}
                            style={{ width: '100%', height: 100, borderRadius: 8 }}
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
                        {item.carBrand}
                    </Text>
                    <Text style={[styles.modelName, { color: colors.text }]}>
                        {item.carModel}
                    </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#FFF" />
                    <Text style={styles.statusBadgeText}>CUSTOMIZED</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />

            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Showroom</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Opening showroom...</Text>
                </View>
            ) : customizations.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="car-off" size={60} color={colors.textTertiary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved models yet</Text>
                    <TouchableOpacity
                        style={[styles.browseButton, { backgroundColor: colors.accent }]}
                        onPress={() => router.push('/')}
                    >
                        <Text style={styles.browseButtonText}>Browse Cars</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={customizations}
                    renderItem={renderModelCard}
                    keyExtractor={(item) => item.customizationId}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.row}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
                    }
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={[styles.listHeaderTitle, { color: colors.textSecondary }]}>
                                {customizations.length} SAVED BUILDS
                            </Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 24,
    },
    browseButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    browseButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    gridContainer: {
        padding: 12,
    },
    row: {
        justifyContent: 'space-between',
    },
    modelCard: {
        flex: 0.48,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    cardGradient: {
        padding: 12,
        minHeight: 180,
        justifyContent: 'space-between',
    },
    iconContainer: {
        alignItems: 'center',
        height: 100,
        justifyContent: 'center',
    },
    modelInfo: {
        alignItems: 'center',
        marginVertical: 8,
    },
    brandText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modelName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 2,
        textAlign: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    listHeader: {
        paddingHorizontal: 4,
        paddingBottom: 8,
    },
    listHeaderTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
