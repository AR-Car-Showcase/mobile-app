import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../../../theme';

interface CatalogStatusBannerProps {
    showCachePopup: boolean;
    setShowCachePopup: (show: boolean) => void;
    refreshing: boolean;
    meta: any;
    colors: any;
}

export function CatalogStatusBanner({ showCachePopup, setShowCachePopup, refreshing, meta, colors }: CatalogStatusBannerProps) {
    if (!showCachePopup) return null;

    return (
        <View style={[styles.cachePopup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>Data Status</Text>
                <Pressable onPress={() => setShowCachePopup(false)}>
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons name={refreshing ? "sync" : "checkmark-circle-outline"} size={16} color={colors.accent} />
                <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>
                    {refreshing
                        ? 'Refreshing from server…'
                        : meta?.source === 'cache'
                            ? meta.backgroundRefreshStarted
                                ? 'Loaded from cache. Refreshing in background.'
                                : 'Loaded from cache.'
                            : 'Loaded fresh from server.'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cachePopup: {
        position: 'absolute',
        top: 90,
        right: spacing.md,
        width: 250,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        zIndex: 200,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
});
