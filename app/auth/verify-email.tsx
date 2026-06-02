import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useAppAlert, useAuth, useTheme } from '../../src/providers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createAuthStyles } from '../../constants/AuthStyles';
import { isApiError } from '../../types/errors';
import { isValidEmail, isValidOtp } from '../../utils/validation';

const VerifyEmailScreen = () => {
    const params = useLocalSearchParams<{ email?: string }>();
    const initialEmail = useMemo(() => {
        const value = params.email;
        return typeof value === 'string' ? value : '';
    }, [params.email]);

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const { verifyEmail, resendVerification } = useAuth();
    const router = useRouter();
    const { colors: Theme } = useTheme();
    const AuthStyles = useMemo(() => createAuthStyles(Theme), [Theme]);
    const showAlert = useAppAlert();
    const email = initialEmail;

    useEffect(() => {
        if (!email) {
            showAlert('Verification Required', 'Please sign up first so we know which email to verify.', [
                { text: 'Go to Sign Up', onPress: () => router.replace('/auth/signup') },
            ]);
        }
    }, [email, router, showAlert]);

    const handleVerify = async () => {
        if (!email || !isValidEmail(email)) {
            showAlert('Verification Required', 'Please sign up first so we know which email to verify.');
            return;
        }

        if (!isValidOtp(code)) {
            showAlert('Validation Error', 'Enter the 6-digit verification code from your email.');
            return;
        }

        setLoading(true);
        try {
            const message = await verifyEmail(email.trim(), code.trim());
            showAlert('Verified', message, [
                { text: 'Continue to Sign In', onPress: () => router.replace('/auth/login') }
            ]);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Verification failed');
            showAlert('Verification Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email || !isValidEmail(email)) {
            showAlert('Verification Required', 'Please sign up first so we know which email to verify.');
            return;
        }

        setResendLoading(true);
        try {
            const response = await resendVerification(email.trim());
            showAlert('Code Sent', response.message);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Could not resend verification code');
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
                    <Text style={AuthStyles.title}>Verify Email</Text>
                    <Text style={AuthStyles.subtitle}>Enter the one-time code we sent to your inbox</Text>
                </View>

                <View style={AuthStyles.inputWrapper}>
                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <Text style={[AuthStyles.input, { color: Theme.text }]}>{email || 'Email from signup required'}</Text>
                        <Ionicons name="lock-closed-outline" size={16} color={Theme.textSecondary} />
                    </View>

                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="6-digit code"
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
                </View>

                <Text style={{ color: Theme.textSecondary, textAlign: 'center', marginTop: -8, marginBottom: 16, fontSize: 12 }}>
                    The code expires in about 10 minutes. You can resend if needed.
                </Text>

                <TouchableOpacity
                    style={[AuthStyles.button, (!email || !code) && AuthStyles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={loading || !email || !code}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={AuthStyles.buttonText}>Verify Account</Text>
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default VerifyEmailScreen;
