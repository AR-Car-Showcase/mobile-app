import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface CarModel {
    id: string;
    name: string;
    brand: string;
    fileName: string;
    thumbnail?: string;
}

const AVAILABLE_MODELS: CarModel[] = [
    { id: '1', name: 'Scorpio-N', brand: 'Mahindra', fileName: 'mahindra-scorpio-n.glb' },
    { id: '2', name: 'Baleno', brand: 'Maruti', fileName: 'maruti-baleno.glb' },
    { id: '3', name: 'Brezza', brand: 'Maruti', fileName: 'maruti-brezza.glb' },
    { id: '4', name: 'R8', brand: 'Audi', fileName: 'audi-r8.glb' },
    { id: '5', name: 'CR-V', brand: 'Honda', fileName: 'honda-crv.glb' },
    { id: '6', name: 'Integra', brand: 'Honda', fileName: 'honda-integra.glb' },
    { id: '7', name: 'AMG GTR', brand: 'Mercedes', fileName: 'mercedes-amg-gtr.glb' },
    { id: '8', name: 'S-Class', brand: 'Mercedes', fileName: 'mercedes-s-class.glb' },
    { id: '9', name: 'Chiron', brand: 'Bugatti', fileName: 'bugatti-chiron.glb' },
];

export default function ARGalleryScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    const handleModelPress = (model: CarModel) => {
        setSelectedModel(model.id);
        router.push({
            pathname: '/(main)/hybrid',
            params: {
                brand: model.brand.toLowerCase(),
                model: model.name.toLowerCase(),
                initialMode: 'AR',
                modelFile: model.fileName
            }
        });
    };

    const renderModelCard = ({ item }: { item: CarModel }) => (
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
                    <MaterialCommunityIcons
                        name="car-sports"
                        size={60}
                        color={colors.accent}
                    />
                </View>

                <View style={styles.modelInfo}>
                    <Text style={[styles.brandText, { color: colors.textSecondary }]}>
                        {item.brand}
                    </Text>
                    <Text style={[styles.modelName, { color: colors.text }]}>
                        {item.name}
                    </Text>
                </View>

                <View style={[styles.arBadge, { backgroundColor: colors.accent }]}>
                    <MaterialCommunityIcons name="cube-scan" size={16} color="#FFF" />
                    <Text style={styles.arBadgeText}>AR Ready</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />

            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <View style={styles.headerContent}>
                    <MaterialCommunityIcons name="view-grid" size={28} color={colors.accent} />
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>AR Gallery</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                            {AVAILABLE_MODELS.length} Models Available
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.infoBanner, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name="information-circle" size={20} color={colors.accent} />
                <Text style={[styles.infoBannerText, { color: colors.text }]}>
                    Tap any car to view it in AR
                </Text>
            </View>

            <FlatList
                data={AVAILABLE_MODELS}
                renderItem={renderModelCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.row}
            />
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
