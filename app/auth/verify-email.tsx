import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { AuthStyles } from '../../constants/AuthStyles';
import { isApiError } from '../../types/errors';

const VerifyEmailScreen = () => {
    const params = useLocalSearchParams<{ email?: string }>();
    const initialEmail = useMemo(() => {
        const value = params.email;
        return typeof value === 'string' ? value : '';
    }, [params.email]);

    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const { verifyEmail, resendVerification } = useAuth();
    const router = useRouter();
    const Theme = Colors.dark;

    const handleVerify = async () => {
        if (!email || !code) {
            Alert.alert('Error', 'Please enter your email and verification code.');
            return;
        }

        if (code.trim().length < 4) {
            Alert.alert('Validation Error', 'Please enter the full verification code.');
            return;
        }

        setLoading(true);
        try {
            const message = await verifyEmail(email.trim(), code.trim());
            Alert.alert('Verified', message, [
                { text: 'Continue to Sign In', onPress: () => router.replace('/auth/login') }
            ]);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Verification failed');
            Alert.alert('Verification Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter the email address used for signup.');
            return;
        }

        setResendLoading(true);
        try {
            const response = await resendVerification(email.trim());
            Alert.alert('Code Sent', response.message);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Could not resend verification code');
            Alert.alert('Resend Failed', message);
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
