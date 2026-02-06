import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EXERCISES } from '@/constants/exercises';
import { newTemplateId, saveSessionTemplate } from '@/lib/workout-storage';
import { SessionExercise, SessionTemplate } from '@/types/workout';

const MAX_EXERCISES = 5;

export default function CreateSessionScreen() {
  const [name, setName] = useState('');
  const [setsCount, setSetsCount] = useState('3');
  const [cooldownSeconds, setCooldownSeconds] = useState('20');
  const [selectedExercises, setSelectedExercises] = useState<
    Array<{ exerciseId: string; durationSeconds: string }>
  >([]);

  const availableExercises = useMemo(
    () =>
      EXERCISES.filter(
        (exercise) => !selectedExercises.some((item) => item.exerciseId === exercise.id)
      ),
    [selectedExercises]
  );

  const addExercise = (exerciseId: string) => {
    if (selectedExercises.length >= MAX_EXERCISES) {
      Alert.alert('Limit reached', `You can select up to ${MAX_EXERCISES} exercises.`);
      return;
    }
    setSelectedExercises((prev) => [...prev, { exerciseId, durationSeconds: '45' }]);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => prev.filter((item) => item.exerciseId !== exerciseId));
  };

  const updateDuration = (exerciseId: string, value: string) => {
    setSelectedExercises((prev) =>
      prev.map((item) => (item.exerciseId === exerciseId ? { ...item, durationSeconds: value } : item))
    );
  };

  const canSave = useMemo(() => {
    const parsedSets = Number(setsCount);
    const parsedCooldown = Number(cooldownSeconds);
    if (!name.trim()) return false;
    if (!Number.isFinite(parsedSets) || parsedSets <= 0) return false;
    if (!Number.isFinite(parsedCooldown) || parsedCooldown < 0) return false;
    if (selectedExercises.length === 0 || selectedExercises.length > MAX_EXERCISES) return false;
    return selectedExercises.every((item) => Number(item.durationSeconds) > 0);
  }, [name, setsCount, cooldownSeconds, selectedExercises]);

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Missing info', 'Please fill out all fields with valid values.');
      return;
    }

    const exercises: SessionExercise[] = selectedExercises.map((item, index) => ({
      exerciseId: item.exerciseId,
      durationSeconds: Number(item.durationSeconds),
      order: index,
    }));

    const template: SessionTemplate = {
      id: newTemplateId(),
      name: name.trim(),
      setsCount: Number(setsCount),
      cooldownSeconds: Number(cooldownSeconds),
      exercises,
      createdAt: Date.now(),
    };

    await saveSessionTemplate(template);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Create Session
        </ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Session Details
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Session Name"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Sets</ThemedText>
            <TextInput
              style={styles.input}
              value={setsCount}
              onChangeText={setSetsCount}
              keyboardType="number-pad"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Cooldown (sec)</ThemedText>
            <TextInput
              style={styles.input}
              value={cooldownSeconds}
              onChangeText={setCooldownSeconds}
              keyboardType="number-pad"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Selected Exercises
        </ThemedText>
        {selectedExercises.length === 0 ? (
          <ThemedText style={styles.bodyText}>No exercises added yet.</ThemedText>
        ) : (
          selectedExercises.map((item) => {
            const exercise = EXERCISES.find((entry) => entry.id === item.exerciseId);
            return (
              <View key={item.exerciseId} style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                    {exercise?.name}
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={item.durationSeconds}
                    onChangeText={(value) => updateDuration(item.exerciseId, value)}
                    keyboardType="number-pad"
                    placeholder="Duration (sec)"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <Pressable style={styles.removeButton} onPress={() => removeExercise(item.exerciseId)}>
                  <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                </Pressable>
              </View>
            );
          })
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Add Exercises
        </ThemedText>
        <ThemedText style={styles.bodyText}>
          Select up to {MAX_EXERCISES} exercises.
        </ThemedText>
        <View style={styles.exerciseList}>
          {availableExercises.map((exercise) => (
            <Pressable
              key={exercise.id}
              style={styles.exerciseButton}
              onPress={() => addExercise(exercise.id)}>
              <ThemedText style={styles.bodyText}>{exercise.name}</ThemedText>
            </Pressable>
          ))}
        </View>
      </ThemedView>

        <Pressable
          style={[styles.primaryButton, !canSave && styles.primaryButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Save Session
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  scrollView: {
    backgroundColor: '#0b0f1a',
  },
  container: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
    backgroundColor: '#0b0f1a',
  },
  title: {
    color: '#f8fafc',
  },
  subtitle: {
    color: '#f8fafc',
  },
  label: {
    color: '#cbd5f5',
  },
  bodyText: {
    color: '#f8fafc',
  },
  section: {
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    color: '#f8fafc',
  },
  exerciseRow: {
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    backgroundColor: '#0f172a',
  },
  exerciseInfo: {
    gap: 8,
  },
  removeButton: {
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#b91c1c',
  },
  exerciseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseButton: {
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#0f172a',
  },
  primaryButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
  },
});
