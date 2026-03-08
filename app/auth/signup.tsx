import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { AuthStyles } from '../../constants/AuthStyles';

const SignupScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const router = useRouter();
    const Theme = Colors.dark;

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setProfilePic(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSignup = async () => {
        if (!username || !email || !password) {
            Alert.alert('Error', 'Please fill in all mandatory fields');
            return;
        }

        if (username.length < 3) {
            Alert.alert('Validation Error', 'Username must be at least 3 characters long');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Validation Error', 'Please enter a valid email address');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Validation Error', 'Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            await signUp(username, email, password, phoneNumber, profilePic || undefined);
            Alert.alert('Success', 'Account created! Please sign in.', [
                { text: 'OK', onPress: () => router.push('/auth/login') }
            ]);
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={AuthStyles.container}
        >
            <TouchableOpacity onPress={() => router.back()} style={AuthStyles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Theme.text} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={AuthStyles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={AuthStyles.header}>
                    <Text style={AuthStyles.title}>Create Account</Text>
                    <Text style={AuthStyles.subtitle}>Join the AR Car Showcase</Text>
                </View>

                <TouchableOpacity style={styles.profilePicContainer} onPress={pickImage}>
                    {profilePic ? (
                        <Image source={{ uri: profilePic }} style={styles.profilePic} />
                    ) : (
                        <View style={styles.profilePicPlaceholder}>
                            <Ionicons name="camera" size={32} color={Theme.textSecondary} />
                            <Text style={styles.profilePicText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

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
                        <Ionicons name="mail-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Phone Number (Optional)"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
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
                    style={[AuthStyles.button, (!username || !email || !password) && AuthStyles.buttonDisabled]}
                    onPress={handleSignup}
                    disabled={loading || !username || !email || !password}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={AuthStyles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={AuthStyles.linkText}>Already have an account? <Text style={AuthStyles.linkHighlight}>Sign In</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    profilePicContainer: {
        alignSelf: 'center',
        marginBottom: 32,
    },
    profilePic: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: Colors.dark.accent,
    },
    profilePicPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.dark.glass,
        borderWidth: 1,
        borderColor: Colors.dark.glassBorder,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicText: {
        color: Colors.dark.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
});
