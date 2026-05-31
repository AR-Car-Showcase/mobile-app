import { StyleSheet, Platform } from 'react-native';
import { Colors } from './Colors';

type AuthTheme = typeof Colors.dark;

export const createAuthStyles = (Theme: AuthTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    scrollContent: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        minHeight: '100%',
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        color: Theme.text,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Theme.textSecondary,
        textAlign: 'center',
    },
    inputWrapper: {
        gap: 16,
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: Theme.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: Theme.accent,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 24,
        shadowColor: Theme.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
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
        paddingVertical: 12,
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
        borderRadius: 20,
        backgroundColor: Theme.glass,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 24,
        zIndex: 10,
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
});

export const AuthStyles = createAuthStyles(Colors.dark);
