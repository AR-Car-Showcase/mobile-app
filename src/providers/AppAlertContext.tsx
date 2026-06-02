import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './ThemeContext';

type AlertButton = {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
};

type AppAlertContextValue = {
    showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
};

const AppAlertContext = createContext<AppAlertContextValue | undefined>(undefined);

export const AppAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { colors } = useTheme();
    const [alertState, setAlertState] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons: AlertButton[];
    }>({
        visible: false,
        title: '',
        buttons: [{ text: 'OK' }],
    });

    const showAlert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
        setAlertState({
            visible: true,
            title,
            message,
            buttons: buttons?.length ? buttons : [{ text: 'OK' }],
        });
    }, []);

    const hideAlert = useCallback(() => {
        setAlertState((current) => ({ ...current, visible: false }));
    }, []);

    const themedStyles = useMemo(() => createStyles(colors), [colors]);

    return (
        <AppAlertContext.Provider value={{ showAlert }}>
            {children}
            <Modal
                transparent
                visible={alertState.visible}
                animationType="fade"
                onRequestClose={hideAlert}
            >
                <Pressable style={themedStyles.backdrop} onPress={hideAlert}>
                    <Pressable style={themedStyles.card}>
                        <Text style={themedStyles.title}>{alertState.title}</Text>
                        {alertState.message ? (
                            <Text style={themedStyles.message}>{alertState.message}</Text>
                        ) : null}
                        <View style={themedStyles.actions}>
                            {alertState.buttons.map((button, index) => (
                                <TouchableOpacity
                                    key={`${button.text}-${index}`}
                                    style={[
                                        themedStyles.actionButton,
                                        button.style === 'destructive' && themedStyles.destructiveButton,
                                    ]}
                                    onPress={() => {
                                        hideAlert();
                                        button.onPress?.();
                                    }}
                                >
                                    <Text
                                        style={[
                                            themedStyles.actionText,
                                            button.style === 'destructive' && themedStyles.destructiveText,
                                            button.style === 'cancel' && themedStyles.cancelText,
                                        ]}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </AppAlertContext.Provider>
    );
};

export const useAppAlert = () => {
    const context = useContext(AppAlertContext);
    if (!context) {
        throw new Error('useAppAlert must be used within AppAlertProvider');
    }
    return context.showAlert;
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        padding: 22,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.22,
        shadowRadius: 28,
        elevation: 10,
    },
    title: {
        color: colors.text,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    message: {
        color: colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 24,
        flexWrap: 'wrap',
    },
    actionButton: {
        minWidth: 86,
        minHeight: 42,
        paddingHorizontal: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent,
    },
    destructiveButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
    },
    actionText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    cancelText: {
        color: '#FFFFFF',
    },
    destructiveText: {
        color: colors.error,
    },
});
