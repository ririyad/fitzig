import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EXERCISES } from '@/constants/exercises';
import { UI } from '@/constants/ui';
import { getSessionTemplateById, newRunId, saveSessionRun } from '@/lib/workout-storage';
import { SessionRun, SessionTemplate, SetResult } from '@/types/workout';

export default function CompleteSessionScreen() {
  const params = useLocalSearchParams<{ templateId?: string; startedAt?: string }>();
  const [template, setTemplate] = useState<SessionTemplate | null>(null);
  const [counts, setCounts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!params.templateId) return;
    const load = async () => {
      const found = await getSessionTemplateById(params.templateId as string);
      setTemplate(found ?? null);
    };
    load();
  }, [params.templateId]);

  useEffect(() => {
    if (!template) return;
    const initial: Record<string, string> = {};
    for (let setIndex = 0; setIndex < template.setsCount; setIndex += 1) {
      template.exercises.forEach((exercise) => {
        initial[`${setIndex}_${exercise.exerciseId}`] = '';
      });
    }
    setCounts(initial);
  }, [template]);

  const exerciseNames = useMemo(() => {
    const map: Record<string, string> = {};
    EXERCISES.forEach((exercise) => {
      map[exercise.id] = exercise.name;
    });
    return map;
  }, []);

  const updateCount = (key: string, value: string) => {
    setCounts((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!template) return;

    const results: SetResult[] = [];
    for (let setIndex = 0; setIndex < template.setsCount; setIndex += 1) {
      template.exercises.forEach((exercise) => {
        const key = `${setIndex}_${exercise.exerciseId}`;
        const raw = counts[key]?.trim() ?? '';
        const parsed = raw === '' ? null : Number(raw);
        results.push({
          exerciseId: exercise.exerciseId,
          setIndex,
          count: Number.isFinite(parsed) ? parsed : null,
          durationSeconds: exercise.durationSeconds,
        });
      });
    }

    const startedAt = params.startedAt ? Number(params.startedAt) : Date.now();
    const run: SessionRun = {
      id: newRunId(),
      templateId: template.id,
      templateName: template.name,
      startedAt: Number.isFinite(startedAt) ? startedAt : Date.now(),
      completedAt: Date.now(),
      results,
    };

    await saveSessionRun(run);
    Alert.alert('Saved', 'Session results saved.');
    router.replace('/');
  };

  if (!template) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]} edges={['top']}>
        <ThemedText style={styles.bodyText}>Loading session...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <ThemedView style={styles.hero}>
          <ThemedText style={styles.eyebrow}>Session Complete</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Log Your Results
          </ThemedText>
          <ThemedText style={styles.subtitle}>{template.name}</ThemedText>
        </ThemedView>

        {Array.from({ length: template.setsCount }).map((_, setIndex) => (
          <ThemedView key={setIndex} style={styles.setCard}>
            <View style={styles.setHeader}>
              <ThemedText type="defaultSemiBold" style={styles.setTitle}>
                Set {setIndex + 1}
              </ThemedText>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{template.exercises.length} exercises</ThemedText>
              </View>
            </View>
            {template.exercises.map((exercise) => {
              const key = `${setIndex}_${exercise.exerciseId}`;
              return (
                <View key={key} style={styles.exerciseRow}>
                  <ThemedText style={styles.bodyText}>
                    {exerciseNames[exercise.exerciseId] ?? exercise.exerciseId}
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Reps"
                    value={counts[key] ?? ''}
                    onChangeText={(value) => updateCount(key, value)}
                    keyboardType="number-pad"
                    placeholderTextColor={UI.textMuted}
                  />
                </View>
              );
            })}
          </ThemedView>
        ))}

        <Pressable style={styles.primaryButton} onPress={handleSave}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Save Results
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI.bg,
  },
  scrollView: {
    backgroundColor: UI.bg,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
    backgroundColor: UI.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.bg,
  },
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 16,
    gap: 6,
  },
  eyebrow: {
    color: UI.success,
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
  setCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 12,
    gap: 10,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  setTitle: {
    color: UI.text,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: UI.textSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    backgroundColor: UI.card,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: UI.borderSoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 92,
    textAlign: 'center',
    backgroundColor: UI.bgMuted,
    color: UI.text,
    fontFamily: 'Manrope_600SemiBold',
  },
  primaryButton: {
    backgroundColor: UI.accent,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
  },
  bodyText: {
    color: UI.text,
  },
});
