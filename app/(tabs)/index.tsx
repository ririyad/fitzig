import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { listSessionRuns, listSessionTemplates } from '@/lib/workout-storage';
import { SessionRun, SessionTemplate } from '@/types/workout';

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

export default function HomeScreen() {
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [runs, setRuns] = useState<SessionRun[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        const [nextTemplates, nextRuns] = await Promise.all([
          listSessionTemplates(),
          listSessionRuns(),
        ]);
        if (!active) return;
        setTemplates(nextTemplates);
        setRuns(nextRuns);
        setLoading(false);
      };

      load();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.hero}>
        <ThemedText type="title" style={styles.heroTitle}>
          Fitzig Workout
        </ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Build a session, run the timer, and log your reps.
        </ThemedText>
        <Link href="/session/create" asChild>
          <Pressable style={styles.primaryButton}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Create New Session
            </ThemedText>
          </Pressable>
        </Link>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Saved Templates
        </ThemedText>
        {loading ? (
          <ThemedText style={styles.bodyText}>Loading...</ThemedText>
        ) : templates.length === 0 ? (
          <ThemedText style={styles.bodyText}>No templates yet. Create your first session.</ThemedText>
        ) : (
          templates.map((template) => (
            <View key={template.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                  {template.name}
                </ThemedText>
                <ThemedText style={styles.mutedText}>{template.setsCount} sets</ThemedText>
              </View>
              <ThemedText style={styles.mutedText}>
                {template.exercises.length} exercises · cooldown {template.cooldownSeconds}s
              </ThemedText>
              <Link
                href={{
                  pathname: '/session/run',
                  params: { templateId: template.id },
                }}
                asChild>
                <Pressable style={styles.secondaryButton}>
                  <ThemedText style={styles.secondaryButtonText}>Start Session</ThemedText>
                </Pressable>
              </Link>
            </View>
          ))
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Past Sessions
        </ThemedText>
        {loading ? (
          <ThemedText style={styles.bodyText}>Loading...</ThemedText>
        ) : runs.length === 0 ? (
          <ThemedText style={styles.bodyText}>No completed sessions yet.</ThemedText>
        ) : (
          runs.map((run) => (
            <View key={run.id} style={styles.card}>
              <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                {run.templateName}
              </ThemedText>
              <ThemedText style={styles.mutedText}>
                Completed {formatDate(run.completedAt)}
              </ThemedText>
              <ThemedText style={styles.mutedText}>
                {run.results.length} entries recorded
              </ThemedText>
            </View>
          ))
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
    backgroundColor: '#0b0f1a',
  },
  hero: {
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#121826',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  heroTitle: {
    color: '#ffffff',
  },
  heroSubtitle: {
    color: '#cbd5f5',
  },
  sectionTitle: {
    color: '#f8fafc',
  },
  bodyText: {
    color: '#f8fafc',
  },
  mutedText: {
    color: '#94a3b8',
  },
  section: {
    gap: 12,
  },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#111827',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#f97316',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#ffffff',
  },
  secondaryButton: {
    marginTop: 8,
    backgroundColor: '#1f2937',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    color: '#ffffff',
  },
});
