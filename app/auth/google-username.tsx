import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createAuthStyles } from '../../constants/AuthStyles';
import { isApiError } from '../../types/errors';
import { SUPPORT_EMAIL } from '../../api/session';
import { isValidUsername } from '../../utils/validation';
import { useTheme } from '../context/ThemeContext';
import { useAppAlert } from '../context/AppAlertContext';

const GoogleUsernameScreen = () => {
    const { user, updateProfile } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [loading, setLoading] = useState(false);
    const submitInFlightRef = useRef(false);
    const router = useRouter();
    const { colors: Theme } = useTheme();
    const AuthStyles = useMemo(() => createAuthStyles(Theme), [Theme]);
    const showAlert = useAppAlert();

    useEffect(() => {
        if (user?.profileCompleted) {
            router.replace('/');
            return;
        }

        setUsername(user?.username || '');
    }, [user, router]);

    const handleContinue = async () => {
        if (submitInFlightRef.current) {
            return;
        }

        const trimmed = username.trim();
        if (!isValidUsername(trimmed)) {
            showAlert('Validation Error', 'Use 3-20 letters, numbers, dots, or underscores.');
            return;
        }

        submitInFlightRef.current = true;
        setLoading(true);
        try {
            const updatedUser = await updateProfile({ username: trimmed });
            if (__DEV__) {
                console.info('[Profile][GoogleOnboarding] username saved', { username: updatedUser.username });
            }
            showAlert('Profile Saved', 'Your username is ready.', [
                { text: 'Continue', onPress: () => router.replace('/') }
            ]);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Could not save your username.');
            showAlert('Username Setup Failed', message);
        } finally {
            submitInFlightRef.current = false;
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={AuthStyles.container}
        >
            <ScrollView contentContainerStyle={AuthStyles.scrollContent} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => router.replace('/')} style={AuthStyles.backButton}>
                    <Ionicons name="close" size={24} color={Theme.text} />
                </TouchableOpacity>

                <View style={AuthStyles.header}>
                    <Text style={AuthStyles.title}>Choose Username</Text>
                    <Text style={AuthStyles.subtitle}>
                        Give your profile a public name before you continue.
                    </Text>
                </View>

                <View style={AuthStyles.inputWrapper}>
                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Username"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoComplete="username"
                        />
                    </View>
                </View>

                <Text style={{ color: Theme.textSecondary, fontSize: 12, textAlign: 'center', marginTop: -8 }}>
                    This becomes your account handle. You can update profile details later, but the username is locked after setup.
                </Text>

                <TouchableOpacity
                    style={[AuthStyles.button, (loading || !isValidUsername(username)) && AuthStyles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={loading || !isValidUsername(username)}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={AuthStyles.buttonText}>Continue</Text>
                    )}
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

export default GoogleUsernameScreen;
