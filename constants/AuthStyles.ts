import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from './Colors';
import { spacing, radius } from '../src/theme';

type AuthTheme = typeof Colors.dark;

export const createAuthStyles = (Theme: AuthTheme) => {
    const insets = { top: 40 };
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingTop: insets.top + spacing.lg,
        minHeight: '100%',
        justifyContent: 'center',
    },
    header: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        color: Theme.text,
        fontWeight: 'bold',
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Theme.textSecondary,
        textAlign: 'center',
    },
    inputWrapper: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        height: 60,
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        color: Theme.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: Theme.accent,
        height: 60,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: spacing.lg,
        shadowColor: Theme.accent,
        shadowOffset: { width: 0, height: spacing.xs },
        shadowOpacity: 0.3,
        shadowRadius: spacing.xs,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.5,
        backgroundColor: Theme.textTertiary,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkButton: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    linkText: {
        color: Theme.textSecondary,
        fontSize: 15,
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
        top: insets.top + spacing.lg,
        left: spacing.lg,
        zIndex: 10,
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
    });
};

export const AuthStyles = createAuthStyles(Colors.dark);
