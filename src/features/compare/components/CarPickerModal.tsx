import React from 'react';
import { View, Text, Modal, FlatList, TextInput, Image, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Car } from '../../../../types/car';
import { radius, spacing } from '../../../theme';

interface CarPickerModalProps {
    isVisible: boolean;
    onClose: () => void;
    colors: any;
    searchQuery: string;
    onSearch: (text: string) => void;
    loading: boolean;
    searchResults: Car[];
    onSelectCar: (car: Car) => void;
}

export function CarPickerModal({
    isVisible,
    onClose,
    colors,
    searchQuery,
    onSearch,
    loading,
    searchResults,
    onSelectCar,
}: CarPickerModalProps) {
    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Select Car</Text>
                    <Pressable onPress={onClose}>
                        <Text style={{ color: colors.accent, fontSize: 16 }}>Close</Text>
                    </Pressable>
                </View>

                <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by brand or model..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={onSearch}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id.toString()}
                        keyboardShouldPersistTaps="handled"
                        removeClippedSubviews
                        initialNumToRender={12}
                        maxToRenderPerBatch={12}
                        windowSize={7}
                        updateCellsBatchingPeriod={50}
                        renderItem={({ item }) => (
                            <Pressable
                                style={[styles.carListItem, { borderBottomColor: colors.border }]}
                                onPress={() => onSelectCar(item)}
                            >
                                <Image source={{ uri: item.images.exterior[0] }} style={styles.listImage} />
                                <View>
                                    <Text style={[styles.listBrand, { color: colors.textSecondary }]}>{item.brand}</Text>
                                    <Text style={[styles.listModel, { color: colors.text }]}>{item.model}</Text>
                                </View>
                            </Pressable>
                        )}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        paddingHorizontal: spacing.sm,
        height: 48,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    carListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
    },
    listImage: {
        width: 60,
        height: 40,
        borderRadius: radius.xs,
        marginRight: spacing.md,
        resizeMode: 'cover',
    },
    listBrand: {
        fontSize: 12,
        textTransform: 'uppercase',
    },
    listModel: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
});
