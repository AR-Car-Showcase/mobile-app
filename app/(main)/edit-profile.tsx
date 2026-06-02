import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, ActivityIndicator, Image, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppAlert, useAuth, useTheme } from '../../src/providers';
import { SUPPORT_EMAIL } from '../../api/session';
import { isValidPhoneNumber } from '../../utils/validation';

export default function EditProfileScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { user, updateProfile } = useAuth();
    const showAlert = useAppAlert();
    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [username, setUsername] = useState(user?.username || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [profilePic, setProfilePic] = useState<string | null>(user?.profilePic || null);

    useEffect(() => {
        setDisplayName(user?.displayName || '');
        setUsername(user?.username || '');
        setPhoneNumber(user?.phoneNumber || '');
        setBio(user?.bio || '');
        setProfilePic(user?.profilePic || null);
    }, [user]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setProfilePic(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSave = async () => {
        if (displayName.trim().length > 60) {
            showAlert('Validation Error', 'Display name must be 60 characters or less.');
            return;
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            showAlert('Validation Error', 'Please enter a valid phone number or leave it empty.');
            return;
        }

        if (bio.trim().length > 500) {
            showAlert('Validation Error', 'Bio must be 500 characters or less.');
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await updateProfile({
                displayName: displayName.trim() || undefined,
                phoneNumber: phoneNumber.trim() || undefined,
                bio: bio.trim() || undefined,
                profilePic: profilePic || undefined,
            });

            if (__DEV__) {
                console.info('[Profile][Edit] profile saved', {
                    hasBio: !!updatedUser.bio,
                    hasDisplayName: !!updatedUser.displayName,
                });
            }

            showAlert('Profile Saved', 'Your account details were updated successfully.', [
                { text: 'Continue', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            showAlert('Save Failed', error?.userMessage || error?.message || 'Could not update your profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Update your public profile details. Your car preferences are managed separately.
                </Text>

                <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
                    {profilePic ? (
                        <Image source={{ uri: profilePic }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Ionicons name="camera" size={28} color={colors.textSecondary} />
                            <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>Add photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.card}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
                    <TextInput
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Your public name"
                        placeholderTextColor={colors.textTertiary}
                        style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    />

                    <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
                    <View style={[styles.lockedField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.lockedText, { color: colors.text }]}>{username || user?.username}</Text>
                        <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                        Usernames are locked after account setup. Contact support if you need a change.
                    </Text>

                    <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
                    <TextInput
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Phone number"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    />

                    <Text style={[styles.label, { color: colors.textSecondary }]}>Bio</Text>
                    <TextInput
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell people a little about yourself"
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={4}
                        style={[styles.textArea, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    />
                </View>

                <Pressable
                    style={[styles.saveButton, { backgroundColor: colors.accent }, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Profile</Text>
                    )}
                </Pressable>

                <TouchableOpacity
                    style={styles.helpButton}
                    onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=AR%20Car%20Showcase%20account%20help`)}
                >
                    <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                        Need help? Contact <Text style={{ color: colors.accent }}>{SUPPORT_EMAIL}</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 60,
        paddingBottom: 12,
        gap: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 20, fontWeight: '700' },
    content: { paddingHorizontal: 18, paddingBottom: 40 },
    subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 18 },
    avatarPicker: { alignSelf: 'center', marginBottom: 18 },
    avatar: {
        width: 108,
        height: 108,
        borderRadius: 54,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    avatarHint: { fontSize: 12, marginTop: 6 },
    card: {
        borderRadius: 22,
        padding: 16,
        gap: 10,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    lockedField: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lockedText: {
        fontSize: 15,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 12,
        lineHeight: 16,
        marginTop: -4,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 110,
        textAlignVertical: 'top',
        fontSize: 15,
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    buttonDisabled: { opacity: 0.7 },
    helpButton: { alignItems: 'center', marginTop: 18 },
    helpText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
