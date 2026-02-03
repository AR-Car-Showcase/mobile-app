import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface LoginRequiredModalProps {
    visible: boolean;
    onClose: () => void;
    featureName: string;
}

const { width } = Dimensions.get('window');
const Theme = Colors.dark;

export default function LoginRequiredModal({ visible, onClose, featureName }: LoginRequiredModalProps) {
    const router = useRouter();

    const handleLogin = () => {
        onClose();
        router.push('/auth/login');
    };

    const handleSignup = () => {
        onClose();
        router.push('/auth/signup');
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <BlurView intensity={30} tint="dark" style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-closed" size={32} color={Theme.accent} />
                        </View>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Theme.textSecondary} />
                        </Pressable>
                    </View>

                    <Text style={styles.title}>Login Required</Text>
                    <Text style={styles.description}>
                        To access {featureName}, you need to be logged in to your account.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Pressable style={styles.loginButton} onPress={handleLogin}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </Pressable>

                        <Pressable style={styles.signupButton} onPress={handleSignup}>
                            <Text style={styles.signupButtonText}>Create Account</Text>
                        </Pressable>
                    </View>

                    <Pressable style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Maybe Later</Text>
                    </Pressable>
                </BlurView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        width: width * 0.85,
        borderRadius: 28,
        padding: 24,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.glassBorder,
        backgroundColor: 'rgba(20, 20, 20, 0.4)',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: Theme.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    loginButton: {
        width: '100%',
        height: 56,
        backgroundColor: Theme.accent,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Theme.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupButton: {
        width: '100%',
        height: 56,
        backgroundColor: 'transparent',
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: Theme.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupButtonText: {
        color: Theme.accent,
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 20,
        padding: 8,
    },
    cancelButtonText: {
        color: Theme.textTertiary,
        fontSize: 14,
        fontWeight: '500',
    },
});
