import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    clampUiScale,
    UI_SCALE_DEFAULT,
    UI_SCALE_STORAGE_KEY,
    UI_SCALE_STEP,
    UI_SCALE_MIN,
    UI_SCALE_MAX,
    scaleValue,
} from '../utils/uiScale';

interface AppScaleContextType {
    uiScale: number;
    canIncreaseScale: boolean;
    canDecreaseScale: boolean;
    increaseScale: () => void;
    decreaseScale: () => void;
    resetScale: () => void;
    setUiScale: (scale: number) => void;
    scaleValue: (value: number) => number;
}

const AppScaleContext = createContext<AppScaleContextType | undefined>(undefined);

export const AppScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [uiScale, setUiScaleState] = useState(UI_SCALE_DEFAULT);

    useEffect(() => {
        let mounted = true;

        const loadScale = async () => {
            try {
                const savedScale = await AsyncStorage.getItem(UI_SCALE_STORAGE_KEY);
                if (!mounted || !savedScale) {
                    return;
                }

                const parsed = Number.parseFloat(savedScale);
                if (Number.isFinite(parsed)) {
                    setUiScaleState(clampUiScale(parsed));
                }
            } catch (error) {
                console.warn('Failed to load UI scale preference:', error);
            }
        };

        void loadScale();

        return () => {
            mounted = false;
        };
    }, []);

    const persistScale = useCallback(async (nextScale: number) => {
        const clamped = clampUiScale(nextScale);
        setUiScaleState(clamped);

        try {
            await AsyncStorage.setItem(UI_SCALE_STORAGE_KEY, clamped.toFixed(2));
        } catch (error) {
            console.warn('Failed to save UI scale preference:', error);
        }
    }, []);

    const increaseScale = useCallback(() => {
        void persistScale(uiScale + UI_SCALE_STEP);
    }, [persistScale, uiScale]);

    const decreaseScale = useCallback(() => {
        void persistScale(uiScale - UI_SCALE_STEP);
    }, [persistScale, uiScale]);

    const resetScale = useCallback(() => {
        void persistScale(UI_SCALE_DEFAULT);
    }, [persistScale]);

    const setUiScale = useCallback((scale: number) => {
        void persistScale(scale);
    }, [persistScale]);

    const value = useMemo<AppScaleContextType>(() => ({
        uiScale,
        canIncreaseScale: uiScale < UI_SCALE_MAX,
        canDecreaseScale: uiScale > UI_SCALE_MIN,
        increaseScale,
        decreaseScale,
        resetScale,
        setUiScale,
        scaleValue: (valueToScale: number) => scaleValue(valueToScale, uiScale),
    }), [uiScale, increaseScale, decreaseScale, resetScale, setUiScale]);

    return (
        <AppScaleContext.Provider value={value}>
            {children}
        </AppScaleContext.Provider>
    );
};

export const useAppScale = () => {
    const context = useContext(AppScaleContext);
    if (!context) {
        throw new Error('useAppScale must be used within an AppScaleProvider');
    }
    return context;
};
