import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EXERCISES } from '@/constants/exercises';
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
      <ThemedView style={styles.centered}>
        <ThemedText>Loading session...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Session Complete
      </ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        {template.name}
      </ThemedText>

      {Array.from({ length: template.setsCount }).map((_, setIndex) => (
        <ThemedView key={setIndex} style={styles.setCard}>
          <ThemedText type="defaultSemiBold" style={styles.bodyText}>
            Set {setIndex + 1}
          </ThemedText>
          {template.exercises.map((exercise) => {
            const key = `${setIndex}_${exercise.exerciseId}`;
            return (
              <View key={key} style={styles.exerciseRow}>
                <ThemedText style={styles.bodyText}>
                  {exerciseNames[exercise.exerciseId] ?? exercise.exerciseId}
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Count"
                  value={counts[key] ?? ''}
                  onChangeText={(value) => updateCount(key, value)}
                  keyboardType="number-pad"
                  placeholderTextColor="#94a3b8"
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    backgroundColor: '#0b0f1a',
  },
  title: {
    color: '#f8fafc',
  },
  subtitle: {
    color: '#cbd5f5',
  },
  bodyText: {
    color: '#f8fafc',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCard: {
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    backgroundColor: '#111827',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
    textAlign: 'center',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
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
});
