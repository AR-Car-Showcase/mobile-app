import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { AuthStyles } from '../../constants/AuthStyles';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();
    const Theme = Colors.dark;

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Validation Error', 'Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            await signIn(username, password);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Check your credentials');
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
                <View style={AuthStyles.header}>
                    <Text style={AuthStyles.title}>Welcome Back</Text>
                    <Text style={AuthStyles.subtitle}>Sign in to access your Studio</Text>
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
                        />
                    </View>

                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[AuthStyles.button, loading && AuthStyles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={AuthStyles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => router.push('/auth/signup')}
                >
                    <Text style={AuthStyles.linkText}>Don't have an account? <Text style={AuthStyles.linkHighlight}>Sign Up</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
