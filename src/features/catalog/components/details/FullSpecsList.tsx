import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Car } from '../../../../../types/car';
import { radius, spacing } from '../../../../theme';

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

const CollapsibleSection = ({ title, children, colors }: { title: string, children: React.ReactNode, colors: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);
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

export function SpecValueDisplay({ value, colors }: { value: any, colors: any }) {
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
}

interface FullSpecsListProps {
    car: Car;
    mergedSpecs: Record<string, any>;
    colors: any;
    onColorSelect: (colorImage: string) => void;
}

export function FullSpecsList({ car, mergedSpecs, colors, onColorSelect }: FullSpecsListProps) {
    
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
                            onPress={() => onColorSelect(color.image)}
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
                            <View style={styles.specValueContainer}>
                                <SpecValueDisplay value={item.value} colors={colors} />
                            </View>
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
                <CollapsibleSection key={category} title={category} colors={colors}>
                    {categorySpecs.map((item, index) => (
                        <View key={index} style={[styles.specRowDetail, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
                            <Text style={[styles.specKey, { color: colors.textSecondary }]}>{item.key}</Text>
                            <View style={styles.specValueContainer}>
                                <SpecValueDisplay value={item.value} colors={colors} />
                            </View>
                        </View>
                    ))}
                </CollapsibleSection>
            );
        });
    };

    return (
        <>
            {renderColorSelector()}
            {renderKeySpecs()}
            <View style={[styles.section, { backgroundColor: colors.surface, padding: 0, overflow: 'hidden' }]}>
                <View style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Full Specifications</Text>
                </View>
                {renderCategorizedSpecs()}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    section: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
    },
    colorScrollContainer: {
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },
    colorItem: {
        alignItems: 'center',
        marginRight: spacing.sm,
        width: 100,
    },
    colorImage: {
        width: 100,
        height: 70,
        borderRadius: radius.sm,
        marginBottom: spacing.xs,
    },
    colorName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    quickSpecsGrid: {
        gap: spacing.xs,
    },
    specRowDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
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
        padding: spacing.md,
    },
    accordionTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    accordionContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
});
