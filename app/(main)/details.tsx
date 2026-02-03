import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { CommonStyles } from '../../constants';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LoginRequiredModal from '../../components/LoginRequiredModal';


const MOCK_DB = [
    { id: '1', model_make_display: 'Bugatti', model_name: 'Chiron', model_year: '2023', model_trim: 'Sport', model_price: '$3,000,000', model_engine_cc: '8000', model_transmission_type: 'DSG', model_drive: 'AWD', image: 'https://images.unsplash.com/photo-1597687843302-f8c5c4c474d2?q=80&w=1000&auto=format&fit=crop' },
    { id: '2', model_make_display: 'Lamborghini', model_name: 'Aventador', model_year: '2022', model_trim: 'SVJ', model_price: '$500,000', model_engine_cc: '6500', model_transmission_type: 'ISR', model_drive: 'AWD', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop' },
    { id: '3', model_make_display: 'Porsche', model_name: '911', model_year: '2024', model_trim: 'GT3', model_price: '$180,000', model_engine_cc: '4000', model_transmission_type: 'PDK', model_drive: 'RWD', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&auto=format&fit=crop' },
];

export default function VehicleDetailsScreen() {
    const params = useLocalSearchParams();
    const { colors } = useTheme();
    const { isAuthenticated } = useAuth();
    const [vehicle, setVehicle] = useState<any>(null);
    const [loginModalVisible, setLoginModalVisible] = useState(false);

    useEffect(() => {
        if (params.vehicle) {
            setVehicle(JSON.parse(params.vehicle as string));
        } else if (params.id) {
            const found = MOCK_DB.find(c => c.id === params.id);
            if (found) setVehicle(found);
        }
    }, [params]);

    if (!vehicle) {
        return (
            <View style={[CommonStyles.container, styles.center, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>Loading vehicle data...</Text>
            </View>
        );
    }

    const renderDetailRow = (label: string, value: string | number | null, icon?: string) => {
        if (value === null || value === undefined || value === '') return null;
        return (
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]} key={label}>
                <View style={styles.labelContainer}>
                    {icon && <MaterialCommunityIcons name={icon as any} size={18} color={colors.accentLight} style={styles.icon} />}
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
                </View>
                <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
            </View>
        );
    };

    const renderSection = (title: string, children: React.ReactNode) => (
        <View style={styles.section} key={title}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
        </View>
    );

    return (
        <View style={[CommonStyles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{vehicle.model_make_display}</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{vehicle.model_name} {vehicle.model_year}</Text>
                </View>
                <Pressable style={styles.backButton}>
                    <Ionicons name="heart-outline" size={24} color={colors.text} />
                </Pressable>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Image Placeholder */}
                <Image
                    source={{ uri: vehicle.image || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop' }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />

                <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <View>
                            <Text style={[styles.trimName, { color: colors.text }]}>{vehicle.model_trim || 'Base Trim'}</Text>
                            <Text style={{ color: colors.accent, fontSize: 18, fontWeight: 'bold' }}>{vehicle.model_price || 'Price TBD'}</Text>
                        </View>
                    </View>

                    <View style={styles.mainSpecs}>
                        <View style={styles.mainSpecItem}>
                            <Text style={[styles.mainSpecValue, { color: colors.text }]}>{vehicle.model_engine_cc}cc</Text>
                            <Text style={[styles.mainSpecLabel, { color: colors.textSecondary }]}>Engine</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.mainSpecItem}>
                            <Text style={[styles.mainSpecValue, { color: colors.text }]}>{vehicle.model_transmission_type}</Text>
                            <Text style={[styles.mainSpecLabel, { color: colors.textSecondary }]}>Trans</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.mainSpecItem}>
                            <Text style={[styles.mainSpecValue, { color: colors.text }]}>{vehicle.model_drive}</Text>
                            <Text style={[styles.mainSpecLabel, { color: colors.textSecondary }]}>Drive</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <Pressable
                        style={[styles.secondaryButton, { borderColor: colors.accent }]}
                        onPress={() => router.push('/compare')}
                    >
                        <Text style={{ color: colors.accent, fontWeight: 'bold' }}>Compare</Text>
                    </Pressable>
                    <Pressable
                        style={[CommonStyles.actionButton, styles.launchButton, { flex: 1, backgroundColor: colors.accent }]}
                        onPress={() => {
                            if (isAuthenticated) {
                                router.push({ pathname: '/', params: { startAR: 'true', vehicle: JSON.stringify(vehicle) } });
                            } else {
                                setLoginModalVisible(true);
                            }
                        }}
                    >
                        <Ionicons name="cube-outline" size={20} color={'#FFF'} />
                        <Text style={[CommonStyles.actionButtonText, { color: '#FFF' }]}>View in AR</Text>
                    </Pressable>
                </View>

                {renderSection('Engine & Performance', [
                    renderDetailRow('Engine Type', vehicle.model_engine_type, 'engine-outline'),
                    renderDetailRow('Cylinders', vehicle.model_engine_num_cyl, 'engine-outline'),
                    renderDetailRow('Valves/Cyl', vehicle.model_engine_valves_per_cyl),
                    renderDetailRow('Power', vehicle.model_engine_power_ps ? `${vehicle.model_engine_power_ps} PS` : null, 'lightning-bolt-outline'),
                    renderDetailRow('Torque', vehicle.model_engine_torque_nm ? `${vehicle.model_engine_torque_nm} Nm` : null, 'speedometer-slow'),
                    renderDetailRow('Top Speed', vehicle.model_top_speed_kph ? `${vehicle.model_top_speed_kph} km/h` : null, 'speedometer'),
                    renderDetailRow('0-100 km/h', vehicle.model_0_to_100_kph ? `${vehicle.model_0_to_100_kph}s` : null, 'timer-outline'),
                ])}



                <View style={{ height: 40 }} />
            </ScrollView>

            <LoginRequiredModal
                visible={loginModalVisible}
                onClose={() => setLoginModalVisible(false)}
                featureName="AR Viewing"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    heroImage: {
        width: '100%',
        height: 250,
    },
    heroCard: {
        margin: 16,
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
    },
    trimName: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    mainSpecs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 16,
    },
    mainSpecItem: {
        alignItems: 'center',
        flex: 1,
    },
    mainSpecValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    mainSpecLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: 30,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionContent: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 10,
        width: 20,
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 24,
    },
    launchButton: {
        marginTop: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    secondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
