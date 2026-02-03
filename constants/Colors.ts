const BaseColors = {
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceHighlight: '#E9ECEF',
    text: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',
    accent: '#2563EB',
    accentLight: '#60A5FA',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(0, 0, 0, 0.05)',
    cardBackground: '#FFFFFF',
    glassBackground: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000000',
    glassOverlay: 'rgba(255, 255, 255, 0.6)',
  },
  dark: {
    background: '#050505',
    surface: '#121212',
    surfaceHighlight: '#1E1E1E',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#6B7280',
    accent: '#3B82F6',
    accentLight: '#60A5FA',
    border: '#27272A',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    glass: 'rgba(20, 20, 20, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    cardBackground: '#121212',
    glassBackground: 'rgba(20, 20, 20, 0.8)',
    shadowColor: '#000000',
    glassOverlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export const Colors = {
  ...BaseColors.dark,
  light: BaseColors.light,
  dark: BaseColors.dark,
};

export const DefaultTheme = Colors.dark;
export const SharedColors = Colors.dark;
