import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { carApi, Make, Model, Trim } from '../api/carApi';
import { Colors } from '../constants';

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
            console.error('Error loading years:', error);
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
            console.error('Error loading makes:', error);
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
            console.error('Error loading models:', error);
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
            console.error('Error loading trims:', error);
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
            <Pressable style={styles.item} onPress={onPress}>
                <Text style={styles.itemText}>{label}</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </Pressable>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Pressable onPress={step === 'year' ? onClose : handleBack} style={styles.backButton}>
                            <Ionicons name={step === 'year' ? 'close' : 'arrow-back'} size={24} color={Colors.text} />
                        </Pressable>
                        <Text style={styles.title}>
                            {step === 'year' ? 'Select Year' : step === 'make' ? 'Select Make' : step === 'model' ? 'Select Model' : 'Select Trim'}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color={Colors.accentLight} />
                        </View>
                    ) : (
                        <FlatList
                            data={step === 'year' ? years : step === 'make' ? makes : step === 'model' ? models : trims}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.list}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
    },
    title: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 40,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    itemText: {
        color: Colors.text,
        fontSize: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
