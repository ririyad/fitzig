import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EXERCISES } from '@/constants/exercises';
import { UI } from '@/constants/ui';
import { getSessionTemplateById } from '@/lib/workout-storage';
import { SessionTemplate } from '@/types/workout';

const formatSeconds = (value: number) => value.toString().padStart(2, '0');

export default function RunSessionScreen() {
  const params = useLocalSearchParams<{ templateId?: string }>();
  const [template, setTemplate] = useState<SessionTemplate | null>(null);
  const [status, setStatus] = useState<'idle' | 'exercise' | 'cooldown'>('idle');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!params.templateId) return;
    const load = async () => {
      const found = await getSessionTemplateById(params.templateId as string);
      setTemplate(found ?? null);
    };
    load();
  }, [params.templateId]);

  const currentExercise = useMemo(() => {
    if (!template) return null;
    return template.exercises[currentExerciseIndex] ?? null;
  }, [template, currentExerciseIndex]);

  const previewDuration = useMemo(() => {
    if (!template) return 0;
    return template.exercises[0]?.durationSeconds ?? 0;
  }, [template]);

  const currentExerciseName = useMemo(() => {
    if (!currentExercise) return '';
    return EXERCISES.find((entry) => entry.id === currentExercise.exerciseId)?.name ??
      currentExercise.exerciseId;
  }, [currentExercise]);

  const nextExerciseName = useMemo(() => {
    if (!template || !template.exercises.length) return '';
    const nextIndex = currentExerciseIndex + 1;
    const nextExercise = template.exercises[nextIndex] ?? template.exercises[0];
    if (!nextExercise) return '';
    return EXERCISES.find((entry) => entry.id === nextExercise.exerciseId)?.name ?? nextExercise.exerciseId;
  }, [template, currentExerciseIndex]);

  useEffect(() => {
    if (status === 'idle') return;
    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, remainingSeconds]);

  useEffect(() => {
    if (!template) return;
    if (status === 'idle') return;
    if (remainingSeconds !== 0) return;

    const advanceAfterCooldown = () => {
      const nextExerciseIndex = currentExerciseIndex + 1;
      if (nextExerciseIndex < template.exercises.length) {
        const nextExercise = template.exercises[nextExerciseIndex];
        setCurrentExerciseIndex(nextExerciseIndex);
        setStatus('exercise');
        setRemainingSeconds(nextExercise.durationSeconds);
        return;
      }

      const nextSetIndex = currentSetIndex + 1;
      if (nextSetIndex < template.setsCount) {
        const firstExercise = template.exercises[0];
        setCurrentSetIndex(nextSetIndex);
        setCurrentExerciseIndex(0);
        setStatus('exercise');
        setRemainingSeconds(firstExercise.durationSeconds);
        return;
      }

      router.replace({
        pathname: '/session/complete',
        params: {
          templateId: template.id,
          startedAt: String(startedAt ?? Date.now()),
        },
      });
    };

    if (status === 'exercise') {
      if (template.cooldownSeconds > 0) {
        setStatus('cooldown');
        setRemainingSeconds(template.cooldownSeconds);
      } else {
        advanceAfterCooldown();
      }
      return;
    }

    if (status === 'cooldown') {
      advanceAfterCooldown();
    }
  }, [
    status,
    remainingSeconds,
    template,
    currentExerciseIndex,
    currentSetIndex,
    startedAt,
  ]);

  const handleStart = () => {
    if (!template || template.exercises.length === 0) return;
    setStartedAt(Date.now());
    setStatus('exercise');
    setCurrentSetIndex(0);
    setCurrentExerciseIndex(0);
    setRemainingSeconds(template.exercises[0].durationSeconds);
  };

  const handleSkipCooldown = () => {
    if (status !== 'cooldown' || remainingSeconds <= 0) return;
    setRemainingSeconds(0);
  };

  if (!template) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]} edges={['top']}>
        <ThemedText style={styles.bodyText}>Loading session...</ThemedText>
      </SafeAreaView>
    );
  }

  const statusLabel = status === 'idle' ? 'Ready' : status === 'cooldown' ? 'Cooldown' : 'Exercise';
  const displaySeconds = status === 'idle' ? previewDuration : remainingSeconds;
  const isCompactPreview = displaySeconds >= 100;
  const totalBlocks = template.setsCount * template.exercises.length;
  const activeBlock = currentSetIndex * template.exercises.length + currentExerciseIndex + 1;

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
                Set {currentSetIndex + 1}/{template.setsCount}
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
            {status === 'cooldown' ? 'Cooldown Timer' : 'Active Timer'}
          </ThemedText>
          <ThemedText
            type="title"
            style={[styles.timerText, isCompactPreview && styles.timerTextCompact]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}>
            {formatSeconds(displaySeconds)}s
          </ThemedText>
          {status === 'cooldown' ? (
            <ThemedText style={styles.mutedText}>Up next: {nextExerciseName}</ThemedText>
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.bodyText}>
              {currentExerciseName || 'Get Ready'}
            </ThemedText>
          )}
          {status === 'cooldown' && (
            <Pressable style={styles.secondaryButton} onPress={handleSkipCooldown}>
              <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>
                Skip Cooldown
              </ThemedText>
            </Pressable>
          )}
          {status === 'idle' && (
            <Pressable style={styles.primaryButton} onPress={handleStart}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Start Session
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
    marginTop: 8,
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
  bodyText: {
    color: UI.text,
    textAlign: 'center',
  },
  mutedText: {
    color: UI.textMuted,
    textAlign: 'center',
  },
});
