import { useAnimatedReaction, useSharedValue, useAnimatedStyle, withTiming, SharedValue } from 'react-native-reanimated';

export function useSmartScroll(scrollY: SharedValue<number>, height: number, hideDirection: 'up' | 'down' = 'up') {
    const clampedScroll = useSharedValue(0);

    useAnimatedReaction(
        () => scrollY.value,
        (current: number, previous: number | null) => {
            if (previous === null || previous === undefined) return;
            const diff = current - previous;
            if (Math.abs(diff) > 100) {
                return;
            }

            const newValue = clampedScroll.value + diff;
            clampedScroll.value = Math.max(0, Math.min(newValue, height));
        }
    );

    const animatedStyle = useAnimatedStyle(() => {
        const isHidden = clampedScroll.value > height / 2;
        const translateY = hideDirection === 'up'
            ? (isHidden ? -height : 0)
            : (isHidden ? height : 0);

        return {
            transform: [{ translateY: withTiming(translateY, { duration: 250 }) }],
            opacity: withTiming(isHidden ? 0 : 1, { duration: 250 })
        };
    });

    return animatedStyle;
}
