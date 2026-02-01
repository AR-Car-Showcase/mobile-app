import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, CommonStyles } from '../constants';

export default function VehicleDetailsScreen() {
    const params = useLocalSearchParams();
    const vehicle = params.vehicle ? JSON.parse(params.vehicle as string) : null;

    if (!vehicle) {
        return (
            <View style={[CommonStyles.container, styles.center]}>
                <Text style={styles.errorText}>No vehicle data found</Text>
                <Pressable style={CommonStyles.actionButton} onPress={() => router.back()}>
                    <Text style={CommonStyles.actionButtonText}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const renderDetailRow = (label: string, value: string | number | null, icon?: string) => {
        if (value === null || value === undefined || value === '') return null;
        return (
            <View style={styles.detailRow} key={label}>
                <View style={styles.labelContainer}>
                    {icon && <MaterialCommunityIcons name={icon as any} size={18} color={Colors.accentLight} style={styles.icon} />}
                    <Text style={styles.detailLabel}>{label}</Text>
                </View>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        );
    };

    const renderSection = (title: string, children: React.ReactNode) => (
        <View style={styles.section} key={title}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );

    return (
        <View style={CommonStyles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{vehicle.model_make_display}</Text>
                    <Text style={styles.headerSubtitle}>{vehicle.model_name} {vehicle.model_year}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <Text style={styles.trimName}>{vehicle.model_trim || 'Base Trim'}</Text>
                    <View style={styles.mainSpecs}>
                        <View style={styles.mainSpecItem}>
                            <Text style={styles.mainSpecValue}>{vehicle.model_engine_cc}cc</Text>
                            <Text style={styles.mainSpecLabel}>Engine</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.mainSpecItem}>
                            <Text style={styles.mainSpecValue}>{vehicle.model_transmission_type}</Text>
                            <Text style={styles.mainSpecLabel}>Trans</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.mainSpecItem}>
                            <Text style={styles.mainSpecValue}>{vehicle.model_drive}</Text>
                            <Text style={styles.mainSpecLabel}>Drive</Text>
                        </View>
                    </View>
                </View>

                {renderSection('Engine & Performance', [
                    renderDetailRow('Engine Type', vehicle.model_engine_type, 'engine-outline'),
                    renderDetailRow('Cylinders', vehicle.model_engine_num_cyl, 'engine-outline'),
                    renderDetailRow('Valves per Cyl', vehicle.model_engine_valves_per_cyl),
                    renderDetailRow('Power', `${vehicle.model_engine_power_ps} PS @ ${vehicle.model_engine_power_rpm} RPM`, 'lightning-bolt-outline'),
                    renderDetailRow('Torque', `${vehicle.model_engine_torque_nm} Nm @ ${vehicle.model_engine_torque_rpm} RPM`, 'speedometer-slow'),
                    renderDetailRow('Top Speed', `${vehicle.model_top_speed_kph} km/h`, 'speedometer'),
                    renderDetailRow('0-100 km/h', `${vehicle.model_0_to_100_kph}s`, 'timer-outline'),
                ])}

                {renderSection('Dimensions & Weight', [
                    renderDetailRow('Length', `${vehicle.model_length_mm} mm`, 'arrow-expand-horizontal'),
                    renderDetailRow('Width', `${vehicle.model_width_mm} mm`, 'arrow-expand-horizontal'),
                    renderDetailRow('Height', `${vehicle.model_height_mm} mm`, 'arrow-expand-vertical'),
                    renderDetailRow('Wheelbase', `${vehicle.model_wheelbase_mm} mm`),
                    renderDetailRow('Weight', `${vehicle.model_weight_kg} kg`, 'weight-kilogram'),
                    renderDetailRow('Seats', vehicle.model_seats, 'car-seat'),
                    renderDetailRow('Doors', vehicle.model_doors, 'car-door'),
                ])}

                {renderSection('Fuel & Efficiency', [
                    renderDetailRow('Fuel Type', vehicle.model_engine_fuel, 'fuel'),
                    renderDetailRow('Fuel Capacity', `${vehicle.model_fuel_cap_l} L`),
                    renderDetailRow('Mixed L/100km', vehicle.model_lkm_mixed),
                    renderDetailRow('City L/100km', vehicle.model_lkm_city),
                    renderDetailRow('Highway L/100km', vehicle.model_lkm_hwy),
                    renderDetailRow('CO2 Emissions', vehicle.model_co2),
                ])}

                {renderSection('Other Details', [
                    renderDetailRow('Body Style', vehicle.model_body, 'car-back'),
                    renderDetailRow('Engine Position', vehicle.model_engine_position),
                    renderDetailRow('Bore x Stroke', `${vehicle.model_engine_bore_mm} x ${vehicle.model_engine_stroke_mm} mm`),
                    renderDetailRow('Compression Ratio', vehicle.model_engine_compression),
                    renderDetailRow('Sold in US', vehicle.model_sold_in_us === '1' ? 'Yes' : 'No'),
                ])}

                <Pressable
                    style={[CommonStyles.actionButton, styles.launchButton]}
                    onPress={() => router.push({ pathname: '/', params: { startAR: 'true', vehicle: JSON.stringify(vehicle) } })}
                >
                    <Ionicons name="play-outline" size={20} color={Colors.text} />
                    <Text style={CommonStyles.actionButtonText}>Launch AR with this Car</Text>
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
        padding: 20,
    },
    errorText: {
        color: Colors.text,
        fontSize: 18,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: '#111',
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        color: Colors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    heroCard: {
        backgroundColor: '#1a1a1a',
        margin: 16,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    trimName: {
        color: Colors.accentLight,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    mainSpecs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
    },
    mainSpecItem: {
        alignItems: 'center',
        flex: 1,
    },
    mainSpecValue: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    mainSpecLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: '#333',
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#222',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
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
        color: Colors.textSecondary,
        fontSize: 14,
    },
    detailValue: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    launchButton: {

        marginHorizontal: 16,
        marginTop: 10,
        backgroundColor: Colors.accent,
    },
});
