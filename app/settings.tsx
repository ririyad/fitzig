import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppGradientBackground } from '@/components/app-gradient-background';
import { AppDialog, AppDialogAction } from '@/components/app-dialog';
import { GradientHero } from '@/components/gradient-hero';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UI } from '@/constants/ui';
import { clearAllAppData, getAppSettings, saveAppSettings } from '@/lib/workout-storage';
import { AppSettings } from '@/types/workout';

const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  soundEnabled: false,
  countdownEnabled: true,
  countdownSeconds: 3,
};

type ToggleKey = 'hapticsEnabled' | 'soundEnabled' | 'countdownEnabled';
type DialogState = {
  title: string;
  message: string;
  tone?: 'default' | 'success' | 'danger';
  dismissible?: boolean;
  actions: AppDialogAction[];
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const stored = await getAppSettings();
        if (!active) return;
        setSettings(stored);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const closeDialog = () => setDialog(null);

  const persistSettings = async (next: AppSettings) => {
    try {
      await saveAppSettings(next);
    } catch {
      setDialog({
        title: 'Save Failed',
        message: 'Could not persist settings. Please try again.',
        tone: 'danger',
        actions: [
          {
            label: 'OK',
            variant: 'primary',
            onPress: closeDialog,
          },
        ],
      });
    }
  };

  const updateToggle = (key: ToggleKey, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    void persistSettings(next);
  };

  const updateCountdownSeconds = (delta: number) => {
    const nextSeconds = Math.max(1, Math.min(10, settings.countdownSeconds + delta));
    if (nextSeconds === settings.countdownSeconds) return;
    const next = { ...settings, countdownSeconds: nextSeconds };
    setSettings(next);
    void persistSettings(next);
  };

  const performClearData = async () => {
    if (isClearing) return;

    setIsClearing(true);
    try {
      await clearAllAppData();
      setSettings(DEFAULT_SETTINGS);
      setDialog({
        title: 'Data Cleared',
        message: 'All sessions, templates, and settings have been removed.',
        tone: 'success',
        actions: [
          {
            label: 'Done',
            variant: 'primary',
            onPress: closeDialog,
          },
        ],
      });
    } catch {
      setDialog({
        title: 'Clear Failed',
        message: 'Could not clear app data. Please try again.',
        tone: 'danger',
        actions: [
          {
            label: 'OK',
            variant: 'primary',
            onPress: closeDialog,
          },
        ],
      });
    } finally {
      setIsClearing(false);
    }
  };

  const executeClearData = () => {
    setDialog({
      title: 'Delete Everything?',
      message: 'This action permanently deletes all sessions, reps, templates, and settings on this device.',
      tone: 'danger',
      dismissible: false,
      actions: [
        {
          label: 'Cancel',
          variant: 'secondary',
          onPress: closeDialog,
        },
        {
          label: 'Delete Everything',
          variant: 'danger',
          onPress: () => {
            closeDialog();
            void performClearData();
          },
        },
      ],
    });
  };

  const confirmClearData = () => {
    setDialog({
      title: 'Danger Zone',
      message: 'You are about to clear all local workout data. This cannot be undone.',
      tone: 'danger',
      dismissible: false,
      actions: [
        {
          label: 'Cancel',
          variant: 'secondary',
          onPress: closeDialog,
        },
        {
          label: 'Continue',
          variant: 'danger',
          onPress: executeClearData,
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppGradientBackground variant="settings">
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
          <GradientHero variant="settings" style={styles.hero}>
            <ThemedText style={styles.eyebrow}>Preferences</ThemedText>
            <ThemedText type="title" style={styles.title}>
              Session Settings
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Configure cue behavior and countdown defaults for workout sessions.
            </ThemedText>
          </GradientHero>

          {loading ? (
            <ThemedView style={styles.card}>
              <ThemedText style={styles.bodyText}>Loading settings...</ThemedText>
            </ThemedView>
          ) : (
            <>
              <ThemedView style={styles.card}>
                <View style={styles.settingRow}>
                  <View style={styles.settingText}>
                    <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                      Haptic Cues
                    </ThemedText>
                    <ThemedText style={styles.mutedText}>
                      Vibrates for transitions and completion.
                    </ThemedText>
                  </View>
                  <Switch
                    value={settings.hapticsEnabled}
                    onValueChange={(value) => updateToggle('hapticsEnabled', value)}
                    thumbColor="#ffffff"
                    trackColor={{ false: UI.borderSoft, true: UI.accent }}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingText}>
                    <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                      Sound Cues
                    </ThemedText>
                    <ThemedText style={styles.mutedText}>
                      Plays subtle cues on phase transitions and session completion.
                    </ThemedText>
                  </View>
                  <Switch
                    value={settings.soundEnabled}
                    onValueChange={(value) => updateToggle('soundEnabled', value)}
                    thumbColor="#ffffff"
                    trackColor={{ false: UI.borderSoft, true: UI.accent }}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingText}>
                    <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                      Countdown Before Start
                    </ThemedText>
                    <ThemedText style={styles.mutedText}>
                      Adds a short timer before start and resume.
                    </ThemedText>
                  </View>
                  <Switch
                    value={settings.countdownEnabled}
                    onValueChange={(value) => updateToggle('countdownEnabled', value)}
                    thumbColor="#ffffff"
                    trackColor={{ false: UI.borderSoft, true: UI.accent }}
                  />
                </View>
              </ThemedView>

              <ThemedView style={styles.card}>
                <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                  Countdown Seconds
                </ThemedText>
                <ThemedText style={styles.mutedText}>Choose between 1 and 10 seconds.</ThemedText>
                <View style={styles.counterRow}>
                  <Pressable
                    style={[styles.counterButton, settings.countdownSeconds <= 1 && styles.disabledButton]}
                    disabled={settings.countdownSeconds <= 1}
                    onPress={() => updateCountdownSeconds(-1)}>
                    <ThemedText style={styles.counterButtonText}>-</ThemedText>
                  </Pressable>
                  <View style={styles.counterValueWrap}>
                    <ThemedText type="title" style={styles.counterValue}>
                      {settings.countdownSeconds}s
                    </ThemedText>
                  </View>
                  <Pressable
                    style={[styles.counterButton, settings.countdownSeconds >= 10 && styles.disabledButton]}
                    disabled={settings.countdownSeconds >= 10}
                    onPress={() => updateCountdownSeconds(1)}>
                    <ThemedText style={styles.counterButtonText}>+</ThemedText>
                  </Pressable>
                </View>
              </ThemedView>

              <ThemedView style={[styles.card, styles.dangerCard]}>
                <ThemedText type="defaultSemiBold" style={styles.dangerTitle}>
                  Danger Zone
                </ThemedText>
                <ThemedText style={styles.dangerBody}>
                  Clear all local data including sessions, reps history, templates, saved run state,
                  and settings.
                </ThemedText>
                <Pressable
                  style={[styles.dangerButton, isClearing && styles.dangerButtonDisabled]}
                  disabled={isClearing}
                  onPress={confirmClearData}>
                  <ThemedText type="defaultSemiBold" style={styles.dangerButtonText}>
                    {isClearing ? 'Clearing...' : 'Clear All Data'}
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </>
          )}

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ThemedText type="defaultSemiBold" style={styles.backButtonText}>
              Back
            </ThemedText>
          </Pressable>
        </ScrollView>
        <AppDialog
          visible={dialog !== null}
          title={dialog?.title ?? ''}
          message={dialog?.message}
          tone={dialog?.tone}
          dismissible={dialog?.dismissible}
          actions={dialog?.actions ?? []}
          onRequestClose={closeDialog}
        />
      </AppGradientBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI.bgFallback,
  },
  scrollView: {
    backgroundColor: 'transparent',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
    backgroundColor: 'transparent',
  },
  hero: {
    padding: 16,
    gap: 6,
  },
  eyebrow: {
    color: UI.accentStrong,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: UI.text,
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    color: UI.textMuted,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 12,
    gap: 12,
  },
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(127, 29, 29, 0.14)',
  },
  dangerTitle: {
    color: UI.danger,
  },
  dangerBody: {
    color: UI.textMuted,
  },
  dangerButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.6)',
    backgroundColor: UI.danger,
    alignItems: 'center',
    paddingVertical: 12,
  },
  dangerButtonDisabled: {
    opacity: 0.55,
  },
  dangerButtonText: {
    color: '#ffffff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 2,
  },
  counterButton: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.cardStrong,
    paddingVertical: 10,
  },
  counterButtonText: {
    color: UI.text,
    fontSize: 24,
    lineHeight: 26,
    fontFamily: 'Manrope_700Bold',
  },
  disabledButton: {
    opacity: 0.4,
  },
  counterValueWrap: {
    flex: 1,
    alignItems: 'center',
  },
  counterValue: {
    color: UI.text,
    fontSize: 30,
    lineHeight: 34,
  },
  backButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.cardStrong,
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: UI.textSoft,
  },
  bodyText: {
    color: UI.text,
  },
  mutedText: {
    color: UI.textMuted,
  },
});
