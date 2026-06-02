import React, { createContext, useContext } from 'react';
import { useSharedValue, SharedValue } from 'react-native-reanimated';

interface ScrollContextType {
    scrollY: SharedValue<number>;
    tabBarHeight: number;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const scrollY = useSharedValue(0);
    const tabBarHeight = 88;

    return (
        <ScrollContext.Provider value={{ scrollY, tabBarHeight }}>
            {children}
        </ScrollContext.Provider>
    );
};

export const useScrollContext = () => {
    const context = useContext(ScrollContext);
    if (!context) {
        throw new Error('useScrollContext must be used within a ScrollProvider');
    }
    return context;
};
