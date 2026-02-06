import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSessionTemplateById } from '@/lib/workout-storage';
import { SessionTemplate } from '@/types/workout';
import { EXERCISES } from '@/constants/exercises';

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          {template.name}
        </ThemedText>

        <View style={styles.statusCard}>
          <ThemedText type="subtitle" style={styles.bodyText}>
            Set {currentSetIndex + 1} of {template.setsCount}
          </ThemedText>
          <ThemedText style={styles.bodyText}>{statusLabel}</ThemedText>
          <ThemedText
            type="title"
            style={[styles.timerText, isCompactPreview && styles.timerTextCompact]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}>
            {formatSeconds(displaySeconds)}s
          </ThemedText>
          {status !== 'cooldown' && status !== 'idle' && (
            <ThemedText type="defaultSemiBold" style={styles.bodyText}>
              {currentExerciseName}
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
            <ThemedText style={styles.bodyText}>First exercise: {currentExerciseName}</ThemedText>
          )}
        </View>

        <ThemedView style={styles.details}>
          <ThemedText style={styles.bodyText}>
            {template.exercises.length} exercises · {template.cooldownSeconds}s cooldown
          </ThemedText>
          {status === 'idle' && (
            <Pressable style={styles.primaryButton} onPress={handleStart}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Start Session
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
    backgroundColor: '#0b0f1a',
  },
  title: {
    color: '#f8fafc',
  },
  bodyText: {
    color: '#f8fafc',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0f1a',
  },
  statusCard: {
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#111827',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 52,
    lineHeight: 62,
    fontFamily: 'Manrope_700Bold',
    color: '#f8fafc',
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  timerTextCompact: {
    fontSize: 46,
    lineHeight: 54,
  },
  details: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
  },
  secondaryButton: {
    marginTop: 4,
    backgroundColor: '#1f2937',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#f8fafc',
  },
});
