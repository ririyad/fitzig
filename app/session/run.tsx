import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EXERCISES } from '@/constants/exercises';
import { UI } from '@/constants/ui';
import {
  clearActiveSessionSnapshot,
  getActiveSessionSnapshot,
  getAppSettings,
  getSessionTemplateById,
  saveActiveSessionSnapshot,
} from '@/lib/workout-storage';
import {
  advanceRuntimeToNow,
  getCurrentRemainingSeconds,
  isRunningStatus,
  RuntimeSessionState,
  RunningStatus,
} from '@/lib/session-runner';
import { ActiveSessionSnapshot, AppSettings, SessionTemplate } from '@/types/workout';

const SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  soundEnabled: false,
  countdownEnabled: true,
  countdownSeconds: 3,
};

const formatSeconds = (value: number) => value.toString().padStart(2, '0');

function createIdleRuntime(): RuntimeSessionState {
  return {
    status: 'idle',
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    remainingSeconds: 0,
    phaseStartedAt: null,
    startedAt: null,
    pausedAt: null,
    pausedPhase: null,
  };
}

function normalizeSnapshotToRuntime(snapshot: ActiveSessionSnapshot): RuntimeSessionState {
  const status = snapshot.status;
  const remainingSeconds = Math.max(0, Math.round(snapshot.remainingSeconds));
  const phaseStartedAt = typeof snapshot.phaseStartedAt === 'number' ? snapshot.phaseStartedAt : null;
  const pausedAt = typeof snapshot.pausedAt === 'number' ? snapshot.pausedAt : null;
  const startedAt = typeof snapshot.startedAt === 'number' ? snapshot.startedAt : null;
  let pausedPhase = snapshot.pausedPhase ?? null;

  if (status === 'paused' && pausedPhase === null) {
    pausedPhase = 'exercise';
  }

  if ((status === 'exercise' || status === 'cooldown') && phaseStartedAt === null) {
    return {
      status: 'paused',
      currentExerciseIndex: snapshot.currentExerciseIndex,
      currentSetIndex: snapshot.currentSetIndex,
      remainingSeconds,
      phaseStartedAt: null,
      startedAt,
      pausedAt: pausedAt ?? Date.now(),
      pausedPhase: pausedPhase ?? status,
    };
  }

  return {
    status,
    currentExerciseIndex: snapshot.currentExerciseIndex,
    currentSetIndex: snapshot.currentSetIndex,
    remainingSeconds,
    phaseStartedAt,
    startedAt,
    pausedAt,
    pausedPhase,
  };
}

export default function RunSessionScreen() {
  const params = useLocalSearchParams<{ templateId?: string; resume?: string }>();
  const navigation = useNavigation();

  const [template, setTemplate] = useState<SessionTemplate | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [runtime, setRuntime] = useState<RuntimeSessionState>(createIdleRuntime());
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const [countdownTargetStatus, setCountdownTargetStatus] = useState<RunningStatus | null>(null);
  const [clock, setClock] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasWarnedStorageRef = useRef(false);
  const isCompletingRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  const safeStorageWarning = useCallback(() => {
    if (hasWarnedStorageRef.current) return;
    hasWarnedStorageRef.current = true;
    Alert.alert(
      'Storage Warning',
      'Some session data could not be persisted. Your current session will continue.'
    );
  }, []);

  const triggerHaptic = useCallback(
    async (kind: 'exercise' | 'cooldown' | 'countdown' | 'complete') => {
      if (!settings.hapticsEnabled) return;
      try {
        if (kind === 'exercise') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          return;
        }
        if (kind === 'cooldown') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return;
        }
        if (kind === 'countdown') {
          await Haptics.selectionAsync();
          return;
        }
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Best-effort cue.
      }
    },
    [settings.hapticsEnabled]
  );

  const persistSnapshotNow = useCallback(async () => {
    if (!template) return;

    const isSessionActive = runtime.startedAt !== null || countdownRemaining > 0;
    if (!isSessionActive) {
      try {
        await clearActiveSessionSnapshot();
      } catch {
        safeStorageWarning();
      }
      return;
    }

    const now = Date.now();
    const currentRemaining = getCurrentRemainingSeconds(runtime, now);

    const snapshot: ActiveSessionSnapshot = {
      templateId: template.id,
      currentExerciseIndex: runtime.currentExerciseIndex,
      currentSetIndex: runtime.currentSetIndex,
      status: runtime.status,
      remainingSeconds: currentRemaining,
      phaseStartedAt:
        isRunningStatus(runtime.status) && runtime.phaseStartedAt !== null ? now : runtime.phaseStartedAt,
      pausedAt: runtime.pausedAt,
      startedAt: runtime.startedAt,
      updatedAt: now,
      pausedPhase: runtime.pausedPhase,
      countdownRemaining: countdownRemaining > 0 ? countdownRemaining : undefined,
      countdownTargetStatus: countdownTargetStatus ?? undefined,
    };

    try {
      await saveActiveSessionSnapshot(snapshot);
    } catch {
      safeStorageWarning();
    }
  }, [
    template,
    runtime,
    countdownRemaining,
    countdownTargetStatus,
    safeStorageWarning,
  ]);

  const completeSession = useCallback(async () => {
    if (!template || isCompletingRef.current) return;
    isCompletingRef.current = true;

    try {
      await clearActiveSessionSnapshot();
    } catch {
      safeStorageWarning();
    }

    void triggerHaptic('complete');

    router.replace({
      pathname: '/session/complete',
      params: {
        templateId: template.id,
        startedAt: String(runtime.startedAt ?? Date.now()),
      },
    });
  }, [template, runtime.startedAt, safeStorageWarning, triggerHaptic]);

  const discardSession = useCallback(async () => {
    try {
      await clearActiveSessionSnapshot();
    } catch {
      safeStorageWarning();
    }
    router.replace('/');
  }, [safeStorageWarning]);

  const confirmDiscardAndLeave = useCallback(() => {
    Alert.alert('Discard Session?', 'Your in-progress timer session will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          void discardSession();
        },
      },
    ]);
  }, [discardSession]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      isCompletingRef.current = false;

      try {
        const nextSettings = await getAppSettings();
        if (!active) return;
        setSettings(nextSettings);

        const shouldResume = params.resume === '1';
        if (shouldResume) {
          const snapshot = await getActiveSessionSnapshot();
          if (!active) return;

          if (!snapshot) {
            setErrorMessage('No recoverable session found.');
            setLoading(false);
            return;
          }

          if (Date.now() - snapshot.updatedAt > SNAPSHOT_MAX_AGE_MS) {
            await clearActiveSessionSnapshot().catch(() => undefined);
            if (!active) return;
            Alert.alert('Session Expired', 'Previous in-progress session expired after 24 hours.');
            setErrorMessage('No recoverable session found.');
            setLoading(false);
            return;
          }

          const restoredTemplate = await getSessionTemplateById(snapshot.templateId);
          if (!active) return;

          if (!restoredTemplate) {
            await clearActiveSessionSnapshot().catch(() => undefined);
            Alert.alert('Session Unavailable', 'The original template no longer exists.');
            setErrorMessage('Unable to restore this session.');
            setLoading(false);
            return;
          }

          setTemplate(restoredTemplate);
          setRuntime(normalizeSnapshotToRuntime(snapshot));
          setCountdownRemaining(Math.max(0, Math.round(snapshot.countdownRemaining ?? 0)));
          const nextTarget = snapshot.countdownTargetStatus ?? null;
          setCountdownTargetStatus(
            nextTarget === 'exercise' || nextTarget === 'cooldown' ? nextTarget : null
          );
          setClock(Date.now());
          setLoading(false);
          return;
        }

        if (!params.templateId) {
          setErrorMessage('No template selected.');
          setLoading(false);
          return;
        }

        const found = await getSessionTemplateById(params.templateId as string);
        if (!active) return;

        if (!found) {
          setErrorMessage('Template not found.');
          setLoading(false);
          return;
        }

        setTemplate(found);
        setRuntime(createIdleRuntime());
        setCountdownRemaining(0);
        setCountdownTargetStatus(null);
        setClock(Date.now());
      } catch {
        setErrorMessage('Failed to load session.');
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
  }, [params.resume, params.templateId]);

  useEffect(() => {
    if (!template) return;
    void persistSnapshotNow();
  }, [
    template,
    runtime,
    countdownRemaining,
    countdownTargetStatus,
    persistSnapshotNow,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackgrounded =
        appStateRef.current === 'background' || appStateRef.current === 'inactive';
      if (nextState !== 'active') {
        void persistSnapshotNow();
      }
      if (wasBackgrounded && nextState === 'active') {
        setClock(Date.now());
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [persistSnapshotNow]);

  useEffect(() => {
    if (countdownRemaining <= 0 && !isRunningStatus(runtime.status)) return;
    const interval = setInterval(() => {
      setClock(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, [countdownRemaining, runtime.status]);

  useEffect(() => {
    if (countdownRemaining <= 0) return;
    const timeout = setTimeout(() => {
      setCountdownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [countdownRemaining]);

  useEffect(() => {
    if (!countdownTargetStatus || countdownRemaining > 0) return;

    void triggerHaptic('countdown');

    setRuntime((prev) => ({
      ...prev,
      status: countdownTargetStatus,
      phaseStartedAt: Date.now(),
      pausedAt: null,
      pausedPhase: null,
    }));
    setCountdownTargetStatus(null);
    setClock(Date.now());
  }, [countdownRemaining, countdownTargetStatus, triggerHaptic]);

  useEffect(() => {
    if (!template) return;
    if (!isRunningStatus(runtime.status)) return;

    const { nextState, completed } = advanceRuntimeToNow(runtime, template, clock);
    if (completed) {
      void completeSession();
      return;
    }

    if (nextState !== runtime) {
      const movedToNextExercise =
        nextState.status === 'exercise' &&
        (nextState.status !== runtime.status ||
          nextState.currentExerciseIndex !== runtime.currentExerciseIndex ||
          nextState.currentSetIndex !== runtime.currentSetIndex);

      if (movedToNextExercise) {
        void triggerHaptic('exercise');
      } else if (nextState.status === 'cooldown' && runtime.status !== 'cooldown') {
        void triggerHaptic('cooldown');
      }

      setRuntime(nextState);
    }
  }, [clock, runtime, template, completeSession, triggerHaptic]);

  const hasActiveSession =
    runtime.startedAt !== null && (runtime.status !== 'idle' || countdownRemaining > 0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!hasActiveSession) return;
      event.preventDefault();
      confirmDiscardAndLeave();
    });

    return unsubscribe;
  }, [navigation, hasActiveSession, confirmDiscardAndLeave]);

  const currentExercise = useMemo(() => {
    if (!template) return null;
    return template.exercises[runtime.currentExerciseIndex] ?? null;
  }, [template, runtime.currentExerciseIndex]);

  const previewDuration = useMemo(() => {
    if (!template) return 0;
    return template.exercises[0]?.durationSeconds ?? 0;
  }, [template]);

  const currentExerciseName = useMemo(() => {
    if (!currentExercise) return '';
    return EXERCISES.find((entry) => entry.id === currentExercise.exerciseId)?.name ?? currentExercise.exerciseId;
  }, [currentExercise]);

  const nextExerciseName = useMemo(() => {
    if (!template || !template.exercises.length) return '';
    const nextIndex = runtime.currentExerciseIndex + 1;
    const nextExercise = template.exercises[nextIndex] ?? template.exercises[0];
    if (!nextExercise) return '';
    return EXERCISES.find((entry) => entry.id === nextExercise.exerciseId)?.name ?? nextExercise.exerciseId;
  }, [template, runtime.currentExerciseIndex]);

  const displaySeconds = useMemo(() => {
    if (countdownRemaining > 0) return countdownRemaining;
    if (runtime.status === 'idle') return previewDuration;
    return getCurrentRemainingSeconds(runtime, clock);
  }, [countdownRemaining, runtime, previewDuration, clock]);

  const statusLabel = useMemo(() => {
    if (countdownRemaining > 0) return 'Countdown';
    if (runtime.status === 'paused') return 'Paused';
    if (runtime.status === 'cooldown') return 'Cooldown';
    if (runtime.status === 'exercise') return 'Exercise';
    return 'Ready';
  }, [countdownRemaining, runtime.status]);

  const totalBlocks = template ? template.setsCount * template.exercises.length : 0;
  const activeBlock = template
    ? runtime.currentSetIndex * template.exercises.length + runtime.currentExerciseIndex + 1
    : 0;

  const startPhaseWithOptionalCountdown = useCallback(
    (targetStatus: RunningStatus) => {
      if (settings.countdownEnabled) {
        setCountdownTargetStatus(targetStatus);
        setCountdownRemaining(settings.countdownSeconds);
        return;
      }

      setRuntime((prev) => ({
        ...prev,
        status: targetStatus,
        phaseStartedAt: Date.now(),
        pausedAt: null,
        pausedPhase: null,
      }));
      setClock(Date.now());
    },
    [settings.countdownEnabled, settings.countdownSeconds]
  );

  const handleStart = useCallback(() => {
    if (!template || template.exercises.length === 0) return;
    const now = Date.now();
    const firstExercise = template.exercises[0];

    setRuntime({
      status: 'idle',
      currentSetIndex: 0,
      currentExerciseIndex: 0,
      remainingSeconds: firstExercise.durationSeconds,
      phaseStartedAt: null,
      startedAt: now,
      pausedAt: null,
      pausedPhase: null,
    });

    startPhaseWithOptionalCountdown('exercise');
  }, [template, startPhaseWithOptionalCountdown]);

  const handlePause = useCallback(() => {
    if (!isRunningStatus(runtime.status)) return;
    const now = Date.now();
    const remaining = getCurrentRemainingSeconds(runtime, now);
    setRuntime((prev) => ({
      ...prev,
      status: 'paused',
      remainingSeconds: remaining,
      phaseStartedAt: null,
      pausedAt: now,
      pausedPhase: isRunningStatus(prev.status) ? prev.status : 'exercise',
    }));
    setClock(now);
  }, [runtime]);

  const handleResume = useCallback(() => {
    if (runtime.status !== 'paused') return;
    const targetStatus = runtime.pausedPhase ?? 'exercise';
    startPhaseWithOptionalCountdown(targetStatus);
  }, [runtime.pausedPhase, runtime.status, startPhaseWithOptionalCountdown]);

  const handleStop = useCallback(() => {
    if (!hasActiveSession) return;
    confirmDiscardAndLeave();
  }, [hasActiveSession, confirmDiscardAndLeave]);

  const handleSkipCooldown = useCallback(() => {
    if (runtime.status !== 'cooldown' || runtime.phaseStartedAt === null) return;
    setRuntime((prev) => ({
      ...prev,
      remainingSeconds: 0,
      phaseStartedAt: Date.now(),
    }));
    setClock(Date.now());
  }, [runtime.phaseStartedAt, runtime.status]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]} edges={['top']}>
        <ThemedText style={styles.bodyText}>Loading session...</ThemedText>
      </SafeAreaView>
    );
  }

  if (!template || errorMessage) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]} edges={['top']}>
        <ThemedText style={styles.bodyText}>{errorMessage ?? 'Session unavailable.'}</ThemedText>
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/')}>
          <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>
            Back To Home
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isCompactPreview = displaySeconds >= 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.headerCard}>
          <ThemedText style={styles.eyebrow}>Session In Progress</ThemedText>
          <ThemedText type="title" style={styles.title}>
            {template.name}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <ThemedText style={styles.metaChipText}>
                Set {runtime.currentSetIndex + 1}/{template.setsCount}
              </ThemedText>
            </View>
            <View style={styles.metaChip}>
              <ThemedText style={styles.metaChipText}>
                Block {Math.min(activeBlock, totalBlocks)}/{totalBlocks}
              </ThemedText>
            </View>
            <View style={styles.metaChip}>
              <ThemedText style={styles.metaChipText}>{statusLabel}</ThemedText>
            </View>
          </View>
        </ThemedView>

        <View style={styles.timerCard}>
          <ThemedText style={styles.timerLabel}>
            {countdownRemaining > 0
              ? 'Starting In'
              : runtime.status === 'cooldown'
                ? 'Cooldown Timer'
                : 'Active Timer'}
          </ThemedText>
          <ThemedText
            type="title"
            style={[styles.timerText, isCompactPreview && styles.timerTextCompact]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}>
            {formatSeconds(displaySeconds)}s
          </ThemedText>

          {countdownRemaining > 0 ? (
            <ThemedText style={styles.mutedText}>
              {runtime.status === 'paused' ? 'Resuming session...' : 'Preparing first exercise...'}
            </ThemedText>
          ) : runtime.status === 'cooldown' ? (
            <ThemedText style={styles.mutedText}>Up next: {nextExerciseName}</ThemedText>
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.bodyText}>
              {currentExerciseName || 'Get Ready'}
            </ThemedText>
          )}

          <View style={styles.controlsRow}>
            {runtime.status === 'idle' && runtime.startedAt === null && (
              <Pressable style={styles.primaryButton} onPress={handleStart}>
                <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                  Start Session
                </ThemedText>
              </Pressable>
            )}

            {isRunningStatus(runtime.status) && countdownRemaining === 0 && (
              <>
                <Pressable style={styles.secondaryButton} onPress={handlePause}>
                  <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>
                    Pause
                  </ThemedText>
                </Pressable>
                <Pressable style={styles.stopButton} onPress={handleStop}>
                  <ThemedText type="defaultSemiBold" style={styles.stopButtonText}>
                    Stop
                  </ThemedText>
                </Pressable>
              </>
            )}

            {runtime.status === 'paused' && countdownRemaining === 0 && (
              <>
                <Pressable style={styles.secondaryButton} onPress={handleResume}>
                  <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>
                    Resume
                  </ThemedText>
                </Pressable>
                <Pressable style={styles.stopButton} onPress={handleStop}>
                  <ThemedText type="defaultSemiBold" style={styles.stopButtonText}>
                    Stop
                  </ThemedText>
                </Pressable>
              </>
            )}
          </View>

          {runtime.status === 'cooldown' && countdownRemaining === 0 && (
            <Pressable style={styles.ghostButton} onPress={handleSkipCooldown}>
              <ThemedText type="defaultSemiBold" style={styles.ghostButtonText}>
                Skip Cooldown
              </ThemedText>
            </Pressable>
          )}
        </View>

        <ThemedView style={styles.footerCard}>
          <ThemedText style={styles.mutedText}>
            {template.exercises.length} exercises configured · {template.cooldownSeconds}s cooldown
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
    backgroundColor: UI.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.bg,
    paddingHorizontal: 24,
    gap: 10,
  },
  headerCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 16,
    gap: 8,
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.bgMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaChipText: {
    color: UI.textSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  timerCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.card,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  timerLabel: {
    color: UI.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  timerText: {
    fontSize: 58,
    lineHeight: 66,
    fontFamily: 'Manrope_700Bold',
    color: UI.text,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  timerTextCompact: {
    fontSize: 50,
    lineHeight: 58,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  footerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 12,
    alignItems: 'center',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: UI.accent,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 190,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.cardStrong,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: UI.textSoft,
  },
  stopButton: {
    borderWidth: 1,
    borderColor: '#7f1d1d',
    backgroundColor: '#3f1115',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  stopButtonText: {
    color: '#fca5a5',
  },
  ghostButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ghostButtonText: {
    color: UI.textSoft,
  },
  bodyText: {
    color: UI.text,
    textAlign: 'center',
  },
  mutedText: {
    color: UI.textMuted,
    textAlign: 'center',
  },
});
