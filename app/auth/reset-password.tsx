import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createAuthStyles } from '../../constants/AuthStyles';
import { isApiError } from '../../types/errors';
import { SUPPORT_EMAIL } from '../../api/session';
import { isValidEmail, isValidOtp, validateStrongPassword } from '../../utils/validation';
import { useTheme } from '../context/ThemeContext';
import { useAppAlert } from '../context/AppAlertContext';

const ResetPasswordScreen = () => {
    const params = useLocalSearchParams<{ email?: string }>();
    const initialEmail = useMemo(() => {
        const value = params.email;
        return typeof value === 'string' ? value : '';
    }, [params.email]);

    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const { resetPassword, resendPasswordReset } = useAuth();
    const router = useRouter();
    const { colors: Theme } = useTheme();
    const AuthStyles = useMemo(() => createAuthStyles(Theme), [Theme]);
    const showAlert = useAppAlert();
    const email = initialEmail;

    useEffect(() => {
        if (!email) {
            showAlert('Reset Required', 'Please request a reset code first so we know which account to update.', [
                { text: 'Request Code', onPress: () => router.replace('/auth/forgot-password') },
            ]);
        }
    }, [email, router, showAlert]);

    const handleReset = async () => {
        if (!email || !isValidEmail(email)) {
            showAlert('Reset Required', 'Please request a reset code first.');
            return;
        }

        if (!isValidOtp(code)) {
            showAlert('Validation Error', 'Enter the 6-digit reset code from your email.');
            return;
        }

        const passwordError = validateStrongPassword(newPassword);
        if (passwordError) {
            showAlert('Validation Error', passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert('Validation Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const message = await resetPassword(email, code.trim(), newPassword);
            showAlert('Password Updated', message, [
                { text: 'Sign In', onPress: () => router.replace('/auth/login') }
            ]);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Could not reset your password.');
            showAlert('Reset Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email || !isValidEmail(email)) {
            showAlert('Reset Required', 'Please request a reset code first.');
            return;
        }

        setResendLoading(true);
        try {
            const response = await resendPasswordReset(email);
            showAlert('Code Sent', response.message);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Could not resend the reset code.');
            showAlert('Resend Failed', message);
        } finally {
            setResendLoading(false);
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
                    <Text style={AuthStyles.title}>Reset Password</Text>
                    <Text style={AuthStyles.subtitle}>Enter the code we sent and choose a new password.</Text>
                </View>

                <View style={AuthStyles.inputWrapper}>
                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <Text style={[AuthStyles.input, { color: Theme.text }]}>{email || 'Email from reset request required'}</Text>
                        <Ionicons name="lock-closed-outline" size={16} color={Theme.textSecondary} />
                    </View>

                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Reset code"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={code}
                            onChangeText={setCode}
                            keyboardType="number-pad"
                            maxLength={6}
                            autoComplete="one-time-code"
                            textContentType="oneTimeCode"
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
                    style={[AuthStyles.button, (!email.trim() || !code.trim() || !newPassword.trim()) && AuthStyles.buttonDisabled]}
                    onPress={handleReset}
                    disabled={loading || !email.trim() || !code.trim() || !newPassword.trim()}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={AuthStyles.buttonText}>Reset Password</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[AuthStyles.linkButton, resendLoading && { opacity: 0.6 }]}
                    onPress={handleResend}
                    disabled={resendLoading}
                >
                    <Text style={AuthStyles.linkText}>
                        Didn&apos;t get a code? <Text style={AuthStyles.linkHighlight}>Resend</Text>
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={AuthStyles.linkText}>Back to <Text style={AuthStyles.linkHighlight}>Sign In</Text></Text>
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

export default ResetPasswordScreen;
