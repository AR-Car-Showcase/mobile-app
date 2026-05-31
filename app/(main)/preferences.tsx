import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiClient } from '../../api/client';
import { SUPPORT_EMAIL } from '../../api/session';

const DRIVING_CONDITIONS = ['City', 'Highway', 'Mixed'];

interface CarOptions {
    brands: string[];
    bodyTypes: string[];
    fuelTypes: string[];
    transmissionTypes: string[];
}

export default function PreferencesScreen() {
    const { colors } = useTheme();
    const { user, updatePreferences } = useAuth();
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState<CarOptions>({
        brands: [],
        bodyTypes: [],
        fuelTypes: [],
        transmissionTypes: []
    });
    const [selectedBrands, setSelectedBrands] = useState<string[]>(user?.favBrands || []);
    const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>(user?.preferredBodyTypes || []);
    const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(user?.preferredFuelTypes || []);
    const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>(user?.preferredTransmissions || []);
    const [drivingCondition, setDrivingCondition] = useState(user?.drivingCondition || '');
    const [maxBudget, setMaxBudget] = useState(user?.maxBudget ? user.maxBudget.toString() : '');

    const fetchOptions = useCallback(async () => {
        try {
            console.log('[Preferences] Fetching car options metadata...');
            const data = await apiClient.get<CarOptions>('/cars/options');
            setOptions(data);
        } catch (error) {
            console.error('[Preferences] Failed to fetch car options:', error);
            // Fallback to sensible defaults if metadata API is unavailable
            setOptions({
                brands: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Honda', 'Toyota'],
                bodyTypes: ['SUV', 'Sedan', 'Hatchback', 'MPV'],
                fuelTypes: ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'],
                transmissionTypes: ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT']
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            setSelectedBrands(user.favBrands || []);
            setSelectedBodyTypes(user.preferredBodyTypes || []);
            setSelectedFuelTypes(user.preferredFuelTypes || []);
            setSelectedTransmissions(user.preferredTransmissions || []);
            setDrivingCondition(user.drivingCondition || '');
            setMaxBudget(user.maxBudget ? user.maxBudget.toString() : '');
        }

        fetchOptions();
    }, [user, fetchOptions]);

    const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleSave = async () => {
        try {
            const budgetValue = parseFloat(maxBudget);

            const payload = {
                favBrands: selectedBrands,
                preferredBodyTypes: selectedBodyTypes,
                preferredFuelTypes: selectedFuelTypes,
                preferredTransmissions: selectedTransmissions,
                drivingCondition,
                maxBudget: isNaN(budgetValue) ? null : budgetValue
            };

            console.log('[Preferences] Saving preferences:', payload);
            const updatedUser = await updatePreferences(payload);

            Alert.alert('Success', 'Preferences saved successfully!');
            console.log('[Preferences] Updated profile user:', updatedUser?.username);
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to save preferences. Please try again.');
            console.error('[Preferences] Save error:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textTertiary, marginTop: 16 }]}>Loading options...</Text>
            </View>
        );
    }

    const renderChipSection = (title: string, items: string[], selected: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.multiText, { color: colors.textTertiary }]}>Select Multiple</Text>
            </View>
            <View style={styles.optionsGrid}>
                {items.map((item) => {
                    const isSelected = selected.includes(item);
                    return (
                        <Pressable
                            key={item}
                            style={[
                                styles.optionChip,
                                {
                                    backgroundColor: isSelected ? colors.accent : colors.surface,
                                    borderColor: isSelected ? colors.accent : colors.border
                                }
                            ]}
                            onPress={() => toggleSelection(item, selected, setter)}
                        >
                            <Text style={[styles.optionText, { color: isSelected ? '#FFF' : colors.text }]}>
                                {item}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.title, { color: colors.text }]}>Car Preferences</Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
                    Tell us what you like, and we&apos;ll find the perfect cars for you.
                </Text>

                {renderChipSection("Favorite Brands", options.brands, selectedBrands, setSelectedBrands)}
                {renderChipSection("Preferred Body Type", options.bodyTypes, selectedBodyTypes, setSelectedBodyTypes)}
                {renderChipSection("Preferred Fuel Type", options.fuelTypes, selectedFuelTypes, setSelectedFuelTypes)}
                {renderChipSection("Preferred Transmission", options.transmissionTypes, selectedTransmissions, setSelectedTransmissions)}

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Driving Condition</Text>
                    <View style={styles.optionsRow}>
                        {DRIVING_CONDITIONS.map((cond) => (
                            <Pressable
                                key={cond}
                                style={[
                                    styles.optionChip,
                                    {
                                        backgroundColor: drivingCondition === cond ? colors.accent : colors.surface,
                                        borderColor: drivingCondition === cond ? colors.accent : colors.border
                                    }
                                ]}
                                onPress={() => setDrivingCondition(cond)}
                            >
                                <Text style={[styles.optionText, { color: drivingCondition === cond ? '#FFF' : colors.text }]}>
                                    {cond}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Max Budget (Lakhs)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., 20"
                        placeholderTextColor={colors.textTertiary}
                        value={maxBudget}
                        onChangeText={setMaxBudget}
                        keyboardType="numeric"
                    />
                </View>

                <Pressable
                    style={[styles.saveButton, { backgroundColor: colors.accent }]}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Apply Preferences</Text>
                </Pressable>

                <TouchableOpacity
                    onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=AR%20Car%20Showcase%20account%20help`)}
                    style={styles.supportLink}
                >
                    <Text style={[styles.supportText, { color: colors.textSecondary }]}>
                        Need help with your account? Contact <Text style={{ color: colors.accent }}>{SUPPORT_EMAIL}</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { fontSize: 22, fontWeight: 'bold' },
    subtitle: { fontSize: 14, marginBottom: 16 },
    content: { flex: 1, paddingHorizontal: 16 },
    section: { marginBottom: 28 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold' },
    multiText: { fontSize: 11 },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    optionText: { fontSize: 13, fontWeight: '600' },
    input: {
        height: 54,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    saveButton: {
        marginTop: 20,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    loadingText: { fontSize: 14 },
    avatarPicker: {
        alignSelf: 'center',
        marginBottom: 18,
    },
    avatarPreview: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    avatarHint: {
        marginTop: 6,
        fontSize: 12,
        textAlign: 'center',
    },
    supportLink: {
        marginTop: 12,
        alignItems: 'center',
    },
    supportText: {
        fontSize: 12,
        textAlign: 'center',
    }
});
