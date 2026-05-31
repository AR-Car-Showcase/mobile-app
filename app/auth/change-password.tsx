import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createAuthStyles } from '../../constants/AuthStyles';
import { isApiError } from '../../types/errors';
import { SUPPORT_EMAIL } from '../../api/session';
import { validateStrongPassword } from '../../utils/validation';
import { useTheme } from '../context/ThemeContext';
import { useAppAlert } from '../context/AppAlertContext';

const ChangePasswordScreen = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { changePassword } = useAuth();
    const router = useRouter();
    const { colors: Theme } = useTheme();
    const AuthStyles = useMemo(() => createAuthStyles(Theme), [Theme]);
    const showAlert = useAppAlert();

    const handleChange = async () => {
        if (!currentPassword.trim() || !newPassword.trim()) {
            showAlert('Error', 'Please fill in both password fields.');
            return;
        }

        const passwordError = validateStrongPassword(newPassword);
        if (passwordError) {
            showAlert('Validation Error', passwordError);
            return;
        }

        if (currentPassword === newPassword) {
            showAlert('Validation Error', 'New password must be different from your current password.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert('Validation Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const message = await changePassword(currentPassword, newPassword);
            showAlert('Password Updated', message, [
                { text: 'Done', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Could not change your password.');
            showAlert('Change Password Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={AuthStyles.container}
        >
            <ScrollView contentContainerStyle={AuthStyles.scrollContent} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => router.back()} style={AuthStyles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Theme.text} />
                </TouchableOpacity>

                <View style={AuthStyles.header}>
                    <Text style={AuthStyles.title}>Change Password</Text>
                    <Text style={AuthStyles.subtitle}>Update your password while signed in.</Text>
                </View>

                <View style={AuthStyles.inputWrapper}>
                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Current password"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            autoComplete="password"
                        />
                    </View>

                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="New password"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            autoComplete="new-password"
                        />
                    </View>

                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Confirm new password"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoComplete="new-password"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[AuthStyles.button, (!currentPassword.trim() || !newPassword.trim()) && AuthStyles.buttonDisabled]}
                    onPress={handleChange}
                    disabled={loading || !currentPassword.trim() || !newPassword.trim()}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={AuthStyles.buttonText}>Update Password</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => router.push('/auth/forgot-password')}
                >
                    <Text style={AuthStyles.linkText}>Forgot current password? <Text style={AuthStyles.linkHighlight}>Reset it</Text></Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=AR%20Car%20Showcase%20account%20help`)}
                >
                    <Text style={AuthStyles.linkText}>
                        Need help? Contact <Text style={AuthStyles.linkHighlight}>{SUPPORT_EMAIL}</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ChangePasswordScreen;
