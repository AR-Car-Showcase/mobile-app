export const UI_SCALE_MIN = 0.85;
export const UI_SCALE_MAX = 1.15;
export const UI_SCALE_STEP = 0.05;
export const UI_SCALE_DEFAULT = 1;
export const UI_SCALE_STORAGE_KEY = 'ui_scale';

export const clampUiScale = (value: number) => {
    if (!Number.isFinite(value)) {
        return UI_SCALE_DEFAULT;
    }
    return Math.min(UI_SCALE_MAX, Math.max(UI_SCALE_MIN, value));
};

export const formatUiScaleLabel = (scale: number) => `${Math.round(scale * 100)}%`;

export const scaleValue = (value: number, scale: number) => value * scale;
