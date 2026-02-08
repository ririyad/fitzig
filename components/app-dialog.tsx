import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { UI } from '@/constants/ui';
import { ThemedText } from '@/components/themed-text';

export type AppDialogAction = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

type AppDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  actions: AppDialogAction[];
  tone?: 'default' | 'success' | 'danger';
  dismissible?: boolean;
  onRequestClose?: () => void;
};

export function AppDialog({
  visible,
  title,
  message,
  actions,
  tone = 'default',
  dismissible = true,
  onRequestClose,
}: AppDialogProps) {
  const cardToneStyle =
    tone === 'success' ? styles.cardSuccess : tone === 'danger' ? styles.cardDanger : undefined;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onRequestClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            if (dismissible) onRequestClose?.();
          }}
        />
        <View style={[styles.card, cardToneStyle]}>
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}

          <View style={[styles.actionRow, actions.length === 1 && styles.singleActionRow]}>
            {actions.map((action) => {
              const variant = action.variant ?? 'secondary';
              const buttonStyle =
                variant === 'primary'
                  ? styles.actionPrimary
                  : variant === 'danger'
                    ? styles.actionDanger
                    : styles.actionSecondary;
              const textStyle =
                variant === 'secondary' ? styles.actionSecondaryText : styles.actionStrongText;

              return (
                <Pressable
                  key={action.label}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  style={[
                    styles.actionButton,
                    buttonStyle,
                    actions.length === 1 && styles.singleActionButton,
                    action.disabled && styles.actionDisabled,
                  ]}>
                  <ThemedText type="defaultSemiBold" style={textStyle}>
                    {action.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  cardSuccess: {
    borderColor: 'rgba(34, 197, 94, 0.45)',
  },
  cardDanger: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  title: {
    color: UI.text,
  },
  message: {
    color: UI.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  singleActionRow: {
    justifyContent: 'flex-end',
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  singleActionButton: {
    flex: 0,
    minWidth: 128,
  },
  actionSecondary: {
    borderColor: UI.borderSoft,
    backgroundColor: UI.cardStrong,
  },
  actionPrimary: {
    borderColor: UI.accentStrong,
    backgroundColor: UI.accent,
  },
  actionDanger: {
    borderColor: 'rgba(248, 113, 113, 0.75)',
    backgroundColor: UI.danger,
  },
  actionSecondaryText: {
    color: UI.textSoft,
  },
  actionStrongText: {
    color: '#ffffff',
  },
  actionDisabled: {
    opacity: 0.55,
  },
});
