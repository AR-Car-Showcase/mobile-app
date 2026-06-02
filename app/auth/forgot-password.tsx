import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Linking } from 'react-native';
import { useAppAlert, useAuth, useTheme } from '../../src/providers';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createAuthStyles } from '../../constants/AuthStyles';
import { isApiError } from '../../types/errors';
import { SUPPORT_EMAIL } from '../../api/session';
import { isValidEmail, normalizeEmail } from '../../utils/validation';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { requestPasswordReset } = useAuth();
    const router = useRouter();
    const { colors: Theme } = useTheme();
    const AuthStyles = useMemo(() => createAuthStyles(Theme), [Theme]);
    const showAlert = useAppAlert();

    const handleSendCode = async () => {
        const trimmedEmail = normalizeEmail(email);
        if (!isValidEmail(trimmedEmail)) {
            showAlert('Validation Error', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await requestPasswordReset(trimmedEmail);
            showAlert('Check your email', response.message, [
                {
                    text: 'Continue',
                    onPress: () => router.replace({
                        pathname: '/auth/reset-password',
                        params: { email: response.email },
                    }),
                },
            ]);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Could not request a reset code.');
            showAlert('Reset Request Failed', message);
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
                    <Text style={AuthStyles.title}>Forgot Password</Text>
                    <Text style={AuthStyles.subtitle}>
                        We&apos;ll send a one-time code to your email so you can set a new password.
                    </Text>
                </View>

                <View style={AuthStyles.inputWrapper}>
                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoComplete="email"
                            keyboardType="email-address"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[AuthStyles.button, (!email.trim() || loading) && AuthStyles.buttonDisabled]}
                    onPress={handleSendCode}
                    disabled={loading || !email.trim()}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={AuthStyles.buttonText}>Send Reset Code</Text>
                    )}
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

export default ForgotPasswordScreen;
