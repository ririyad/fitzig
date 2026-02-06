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
import { UI } from '@/constants/ui';
import { newTemplateId, saveSessionTemplate } from '@/lib/workout-storage';
import { SessionExercise, SessionTemplate } from '@/types/workout';

const MAX_EXERCISES = 5;

export default function CreateSessionScreen() {
  const [name, setName] = useState('');
  const [setsCount, setSetsCount] = useState('3');
  const [cooldownSeconds, setCooldownSeconds] = useState('20');
  const [selectedExercises, setSelectedExercises] = useState<
    { exerciseId: string; durationSeconds: string }[]
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
        <ThemedView style={styles.hero}>
          <ThemedText style={styles.eyebrow}>Session Builder</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Create New Session
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Configure rounds, cooldown, and exercises for a focused workout flow.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Session Details
          </ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Session name"
            placeholderTextColor={UI.textMuted}
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
                placeholderTextColor={UI.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Cooldown (sec)</ThemedText>
              <TextInput
                style={styles.input}
                value={cooldownSeconds}
                onChangeText={setCooldownSeconds}
                keyboardType="number-pad"
                placeholderTextColor={UI.textMuted}
              />
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <View style={styles.sectionRow}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Selected Exercises
            </ThemedText>
            <View style={styles.counterBadge}>
              <ThemedText style={styles.counterText}>
                {selectedExercises.length}/{MAX_EXERCISES}
              </ThemedText>
            </View>
          </View>
          {selectedExercises.length === 0 ? (
            <ThemedText style={styles.mutedText}>No exercises selected yet.</ThemedText>
          ) : (
            selectedExercises.map((item, index) => {
              const exercise = EXERCISES.find((entry) => entry.id === item.exerciseId);
              return (
                <View key={item.exerciseId} style={styles.exerciseRow}>
                  <View style={styles.exerciseHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                      {index + 1}. {exercise?.name ?? item.exerciseId}
                    </ThemedText>
                    <Pressable style={styles.removeButton} onPress={() => removeExercise(item.exerciseId)}>
                      <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                    </Pressable>
                  </View>
                  <View style={styles.durationRow}>
                    <ThemedText style={styles.label}>Duration (sec)</ThemedText>
                    <TextInput
                      style={[styles.input, styles.durationInput]}
                      value={item.durationSeconds}
                      onChangeText={(value) => updateDuration(item.exerciseId, value)}
                      keyboardType="number-pad"
                      placeholderTextColor={UI.textMuted}
                    />
                  </View>
                </View>
              );
            })
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Add Exercises
          </ThemedText>
          <ThemedText style={styles.mutedText}>
            Tap to add. You can include up to {MAX_EXERCISES} exercises.
          </ThemedText>
          <View style={styles.exerciseList}>
            {availableExercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                style={styles.exerciseChip}
                onPress={() => addExercise(exercise.id)}>
                <ThemedText style={styles.chipText}>{exercise.name}</ThemedText>
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
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
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
  section: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 12,
    gap: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: UI.text,
  },
  counterBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  counterText: {
    color: UI.textSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    flex: 1,
    gap: 6,
  },
  label: {
    color: UI.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: UI.card,
    color: UI.text,
    fontFamily: 'Manrope_600SemiBold',
  },
  exerciseRow: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 12,
    backgroundColor: UI.card,
    padding: 10,
    gap: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  durationInput: {
    minWidth: 90,
    textAlign: 'center',
  },
  removeButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    backgroundColor: '#3f1115',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeButtonText: {
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Manrope_600SemiBold',
  },
  exerciseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.cardStrong,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    color: UI.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Manrope_600SemiBold',
  },
  primaryButton: {
    backgroundColor: UI.accent,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#ffffff',
  },
  bodyText: {
    color: UI.text,
  },
  mutedText: {
    color: UI.textMuted,
  },
});
