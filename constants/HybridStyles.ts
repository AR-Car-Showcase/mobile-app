import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from './Colors';

const { width } = Dimensions.get('window');
const Theme = Colors.dark;

export const HybridStyles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.text,
        letterSpacing: -0.5,
    },
    modelToggle: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    modelToggleText: {
        color: Theme.accentLight,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
    contentArea: {
        flex: 1,
    },
    arContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    arView: {
        flex: 1,
    },
    alignmentPointerWrapper: {
        position: 'absolute',
        right: 20,
        bottom: 220,
        zIndex: 20,
    },
    resetButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
    toggleButton: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 30,
        backgroundColor: Theme.accent,
        alignSelf: 'center',
        shadowColor: Theme.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    toggleText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    bottomControls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    specsPanel: {
        backgroundColor: 'rgba(20, 20, 20, 0.9)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        width: width * 0.85,
        borderWidth: 1,
        borderColor: Theme.glassBorder,
    },
    specTitle: {
        color: Theme.accentLight,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    specLabel: {
        color: Theme.textSecondary,
        fontSize: 14,
    },
    specValue: {
        color: Theme.text,
        fontWeight: '700',
        fontSize: 14,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        color: Theme.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 0.5,
    },
});
