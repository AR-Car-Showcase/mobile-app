import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';

export default function SavedScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Saved Vehicles</Text>
            <Text style={styles.subtext}>Your favorites will appear here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: Colors.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtext: {
        color: Colors.textSecondary,
        fontSize: 16,
        marginTop: 8,
    },
});
