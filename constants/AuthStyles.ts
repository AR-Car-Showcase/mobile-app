import { StyleSheet } from 'react-native';
import { Colors } from './Colors';
import { spacing, radius } from '../src/theme';
import { scaleValue } from '../src/utils/uiScale';

type AuthTheme = typeof Colors.dark;

export const createAuthStyles = (Theme: AuthTheme, uiScale = 1) => {
    const scale = (value: number) => scaleValue(value, uiScale);
    const insets = { top: scale(40) };
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    scrollContent: {
        padding: scale(spacing.lg),
        paddingTop: insets.top + scale(spacing.lg),
        minHeight: '100%',
        justifyContent: 'center',
    },
    header: {
        marginBottom: scale(spacing.xl),
        alignItems: 'center',
    },
    title: {
        fontSize: scale(32),
        color: Theme.text,
        fontWeight: 'bold',
        marginBottom: scale(spacing.xs),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: scale(16),
        color: Theme.textSecondary,
        textAlign: 'center',
    },
    inputWrapper: {
        gap: scale(spacing.md),
        marginBottom: scale(spacing.lg),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.surface,
        borderRadius: radius.md,
        paddingHorizontal: scale(spacing.md),
        height: scale(60),
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
    icon: {
        marginRight: scale(spacing.sm),
    },
    input: {
        flex: 1,
        color: Theme.text,
        fontSize: scale(16),
    },
    button: {
        backgroundColor: Theme.accent,
        height: scale(60),
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: scale(spacing.lg),
        shadowColor: Theme.accent,
        shadowOffset: { width: 0, height: scale(spacing.xs) },
        shadowOpacity: 0.3,
        shadowRadius: scale(spacing.xs),
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.5,
        backgroundColor: Theme.textTertiary,
    },
    buttonText: {
        color: 'white',
        fontSize: scale(18),
        fontWeight: 'bold',
    },
    linkButton: {
        alignItems: 'center',
        paddingVertical: scale(spacing.sm),
    },
    linkText: {
        color: Theme.textSecondary,
        fontSize: scale(15),
    },
    linkHighlight: {
        color: Theme.accent,
        fontWeight: 'bold',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: Theme.glass,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: insets.top + scale(spacing.lg),
        left: scale(spacing.lg),
        zIndex: 10,
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
    });
};

export const AuthStyles = createAuthStyles(Colors.dark);
