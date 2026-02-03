import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

const Theme = Colors.dark;

export const ComponentStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Theme.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        borderWidth: 1,
        borderColor: Theme.glassBorder,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Theme.border,
    },
    modalTitle: {
        color: Theme.text,
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    modalCloseButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: Theme.surfaceHighlight,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Theme.border,
    },
    listItemText: {
        color: Theme.text,
        fontSize: 16,
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: Theme.textSecondary,
        marginTop: 12,
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyStateText: {
        color: Theme.textSecondary,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    }
});
