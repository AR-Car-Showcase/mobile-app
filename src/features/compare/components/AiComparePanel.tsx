import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Car } from '../../../../types/car';
import { radius, spacing } from '../../../theme';

interface AiComparePanelProps {
    colors: any;
    selectedCars: Car[];
    aiNeed: string;
    setAiNeed: (text: string) => void;
    aiLoading: boolean;
    runAiComparison: () => void;
    aiError: string;
    aiInsight: string;
    aiModel: string;
}

export function AiComparePanel({
    colors,
    selectedCars,
    aiNeed,
    setAiNeed,
    aiLoading,
    runAiComparison,
    aiError,
    aiInsight,
    aiModel,
}: AiComparePanelProps) {
    return (
        <View style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.aiTitleRow}>
                <MaterialCommunityIcons name="robot-outline" size={18} color={colors.accent} />
                <Text style={[styles.aiTitle, { color: colors.text }]}>AI Differentiation Assistant</Text>
            </View>

            <Text style={[styles.aiSubtitle, { color: colors.textSecondary }]}>
                Tell AI what matters to you, and it will explain the best option among selected cars.
            </Text>

            <TextInput
                style={[
                    styles.aiInput,
                    {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                    }
                ]}
                placeholder="Example: I drive mostly in city traffic and want low running cost under 18 lakhs."
                placeholderTextColor={colors.textSecondary}
                value={aiNeed}
                onChangeText={setAiNeed}
                multiline
            />

            <Pressable
                style={[
                    styles.aiActionButton,
                    {
                        backgroundColor: selectedCars.length >= 2 ? colors.accent : colors.surfaceHighlight,
                    }
                ]}
                disabled={aiLoading || selectedCars.length < 2}
                onPress={runAiComparison}
            >
                {aiLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.aiActionText}>Generate AI Comparison</Text>
                )}
            </Pressable>

            {aiError ? (
                <Text style={[styles.aiError, { color: colors.error }]}>{aiError}</Text>
            ) : null}

            {aiInsight ? (
                <View style={[styles.aiResultBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <Text style={[styles.aiResultText, { color: colors.text }]}>{aiInsight}</Text>
                    <Text style={[styles.aiMeta, { color: colors.textSecondary }]}>
                        Model: {aiModel || 'N/A'}
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    aiCard: {
        marginHorizontal: spacing.sm,
        marginTop: 18,
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.sm,
        gap: 10,
    },
    aiTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    aiTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    aiSubtitle: {
        fontSize: 12,
        lineHeight: 18,
    },
    aiHint: {
        fontSize: 11,
        fontWeight: '600',
    },
    aiInput: {
        minHeight: 84,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: spacing.xs,
        textAlignVertical: 'top',
        fontSize: 13,
    },
    aiActionButton: {
        borderRadius: 10,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiActionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    aiError: {
        fontSize: 12,
        fontWeight: '600',
    },
    aiResultBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        gap: spacing.xs,
    },
    aiResultText: {
        fontSize: 13,
        lineHeight: 20,
    },
    aiMeta: {
        fontSize: 11,
        fontWeight: '600',
    },
});
