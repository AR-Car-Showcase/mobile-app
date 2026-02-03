import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import { carApi, Make, Model, Trim } from '../api/carApi';
import { Colors } from '../constants';
import { ComponentStyles } from '../constants/ComponentStyles';

interface VehicleSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (vehicle: Trim) => void;
}

type Step = 'year' | 'make' | 'model' | 'trim';

export default function VehicleSelector({ visible, onClose, onSelect }: VehicleSelectorProps) {
    const [step, setStep] = useState<Step>('year');
    const [loading, setLoading] = useState(false);
    const [years, setYears] = useState<number[]>([]);
    const [makes, setMakes] = useState<Make[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [trims, setTrims] = useState<Trim[]>([]);

    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedMake, setSelectedMake] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    const Theme = Colors.dark;

    useEffect(() => {
        if (visible && step === 'year' && years.length === 0) {
            loadYears();
        }
    }, [visible, step]);

    const loadYears = async () => {
        setLoading(true);
        try {
            const data = await carApi.getYears();
            const min = parseInt(data.min_year);
            const max = parseInt(data.max_year);
            const yearsList = [];
            for (let i = max; i >= min; i--) {
                yearsList.push(i);
            }
            setYears(yearsList);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadMakes = async (year: number) => {
        setLoading(true);
        try {
            const data = await carApi.getMakes(year);
            setMakes(data);
            setStep('make');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadModels = async (make: string, year: number) => {
        setLoading(true);
        try {
            const data = await carApi.getModels(make, year);
            setModels(data);
            setStep('model');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadTrims = async (make: string, model: string, year: number) => {
        setLoading(true);
        try {
            const data = await carApi.getTrims(make, model, year);
            setTrims(data);
            setStep('trim');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 'make') setStep('year');
        if (step === 'model') setStep('make');
        if (step === 'trim') setStep('model');
    };

    const renderItem = ({ item }: { item: any }) => {
        let label = '';
        let onPress = () => { };

        if (step === 'year') {
            label = item.toString();
            onPress = () => {
                setSelectedYear(item);
                loadMakes(item);
            };
        } else if (step === 'make') {
            label = item.make_display;
            onPress = () => {
                setSelectedMake(item.make_id);
                loadModels(item.make_id, selectedYear!);
            };
        } else if (step === 'model') {
            label = item.model_name;
            onPress = () => {
                setSelectedModel(item.model_name);
                loadTrims(selectedMake!, item.model_name, selectedYear!);
            };
        } else if (step === 'trim') {
            label = `${item.model_year} ${item.model_trim || 'Base'}`;
            onPress = () => onSelect(item);
        }

        return (
            <Pressable style={ComponentStyles.listItem} onPress={onPress}>
                <Text style={ComponentStyles.listItemText}>{label}</Text>
                <Ionicons name="chevron-forward" size={20} color={Theme.textSecondary} />
            </Pressable>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={ComponentStyles.modalContainer}>
                <View style={[ComponentStyles.modalContent, { height: '70%' }]}>
                    <View style={ComponentStyles.modalHeader}>
                        <Pressable onPress={step === 'year' ? onClose : handleBack} style={ComponentStyles.modalCloseButton}>
                            <Ionicons name={step === 'year' ? 'close' : 'arrow-back'} size={24} color={Theme.text} />
                        </Pressable>
                        <Text style={ComponentStyles.modalTitle}>
                            {step === 'year' ? 'Select Year' : step === 'make' ? 'Select Make' : step === 'model' ? 'Select Model' : 'Select Trim'}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {loading ? (
                        <View style={ComponentStyles.center}>
                            <ActivityIndicator size="large" color={Theme.accent} />
                        </View>
                    ) : (
                        <FlatList
                            data={step === 'year' ? years : step === 'make' ? makes : step === 'model' ? models : trims}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}
