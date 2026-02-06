import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  clearActiveSessionSnapshot,
  getActiveSessionSnapshot,
  getSessionTemplateById,
  listSessionRuns,
  listSessionTemplates,
} from '@/lib/workout-storage';
import { ActiveSessionSnapshot, SessionRun, SessionTemplate } from '@/types/workout';
import { UI } from '@/constants/ui';

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

const SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type ResumeCard = {
  snapshot: ActiveSessionSnapshot;
  templateName: string;
};

export default function HomeScreen() {
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [runs, setRuns] = useState<SessionRun[]>([]);
  const [resumeCard, setResumeCard] = useState<ResumeCard | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const bottomPadding = 22 + Math.max(insets.bottom, 12);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        const [nextTemplates, nextRuns, activeSnapshot] = await Promise.all([
          listSessionTemplates(),
          listSessionRuns(),
          getActiveSessionSnapshot(),
        ]);
        if (!active) return;

        let nextResumeCard: ResumeCard | null = null;
        if (activeSnapshot) {
          const snapshotAge = Date.now() - activeSnapshot.updatedAt;
          if (snapshotAge <= SNAPSHOT_MAX_AGE_MS) {
            const snapshotTemplate =
              nextTemplates.find((template) => template.id === activeSnapshot.templateId) ??
              (await getSessionTemplateById(activeSnapshot.templateId));
            if (!active) return;

            if (snapshotTemplate) {
              nextResumeCard = {
                snapshot: activeSnapshot,
                templateName: snapshotTemplate.name,
              };
            } else {
              await clearActiveSessionSnapshot().catch(() => undefined);
              if (active) {
                Alert.alert('Session Unavailable', 'Saved in-progress session could not be restored.');
              }
            }
          } else {
            await clearActiveSessionSnapshot().catch(() => undefined);
          }
        }

        setTemplates(nextTemplates);
        setRuns(nextRuns);
        setResumeCard(nextResumeCard);
        setLoading(false);
      };

      load();
      return () => {
        active = false;
      };
    }, [])
  );

  const stats = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const runsThisWeek = runs.filter((run) => run.completedAt >= oneWeekAgo).length;
    const totalReps = runs.reduce((sum, run) => {
      return (
        sum +
        run.results.reduce((runSum, result) => {
          if (result.count === null) return runSum;
          return runSum + result.count;
        }, 0)
      );
    }, 0);

    return {
      templateCount: templates.length,
      runCount: runs.length,
      runsThisWeek,
      totalReps,
    };
  }, [templates, runs]);

  const handleDiscardResume = useCallback(async () => {
    try {
      await clearActiveSessionSnapshot();
      setResumeCard(null);
    } catch {
      Alert.alert('Storage Warning', 'Unable to clear saved session snapshot right now.');
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
        contentInsetAdjustmentBehavior="never">
        <ThemedView style={styles.hero}>
          <ThemedText style={styles.eyebrow}>Training Dashboard</ThemedText>
          <ThemedText type="title" style={styles.heroTitle}>
            Build. Run. Improve.
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Create structured sessions, keep momentum, and track your volume over time.
          </ThemedText>
          <View style={styles.heroActions}>
            <Link href="/session/create" asChild>
              <Pressable style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>Create New Session</ThemedText>
              </Pressable>
            </Link>
            <Link href="../settings" asChild>
              <Pressable style={styles.secondaryHeroButton}>
                <ThemedText style={styles.secondaryHeroButtonText}>Settings</ThemedText>
              </Pressable>
            </Link>
          </View>
        </ThemedView>

        {resumeCard && (
          <ThemedView style={styles.resumeCard}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Resume Session
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.bodyText}>
              {resumeCard.templateName}
            </ThemedText>
            <ThemedText style={styles.mutedText}>
              Last active {formatDate(resumeCard.snapshot.updatedAt)}
            </ThemedText>
            <View style={styles.resumeActions}>
              <Link
                href={{
                  pathname: '/session/run',
                  params: { templateId: resumeCard.snapshot.templateId, resume: '1' },
                }}
                asChild>
                <Pressable style={styles.resumeButton}>
                  <ThemedText style={styles.resumeButtonText}>Resume</ThemedText>
                </Pressable>
              </Link>
              <Pressable style={styles.discardButton} onPress={() => void handleDiscardResume()}>
                <ThemedText style={styles.discardButtonText}>Discard</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        )}

        <View style={styles.metricsGrid}>
          <ThemedView style={styles.metricCard}>
            <ThemedText style={styles.metricLabel}>Templates</ThemedText>
            <ThemedText type="title" style={styles.metricValue}>
              {stats.templateCount}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.metricCard}>
            <ThemedText style={styles.metricLabel}>Total Sessions</ThemedText>
            <ThemedText type="title" style={styles.metricValue}>
              {stats.runCount}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.metricCard}>
            <ThemedText style={styles.metricLabel}>This Week</ThemedText>
            <ThemedText type="title" style={styles.metricValue}>
              {stats.runsThisWeek}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.metricCard}>
            <ThemedText style={styles.metricLabel}>Logged Reps</ThemedText>
            <ThemedText type="title" style={styles.metricValue}>
              {stats.totalReps}
            </ThemedText>
          </ThemedView>
        </View>

        <ThemedView style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Saved Templates
            </ThemedText>
            <ThemedText style={styles.sectionMeta}>{stats.templateCount}</ThemedText>
          </View>
          {loading ? (
            <ThemedText style={styles.bodyText}>Loading templates...</ThemedText>
          ) : templates.length === 0 ? (
            <ThemedText style={styles.mutedText}>
              No templates yet. Create your first session to get started.
            </ThemedText>
          ) : (
            templates.map((template) => (
              <View key={template.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                    {template.name}
                  </ThemedText>
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>{template.setsCount} sets</ThemedText>
                  </View>
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

        <ThemedView style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recent Sessions
            </ThemedText>
            <ThemedText style={styles.sectionMeta}>{stats.runCount}</ThemedText>
          </View>
          {loading ? (
            <ThemedText style={styles.bodyText}>Loading sessions...</ThemedText>
          ) : runs.length === 0 ? (
            <ThemedText style={styles.mutedText}>No completed sessions yet.</ThemedText>
          ) : (
            runs.slice(0, 6).map((run) => (
              <View key={run.id} style={styles.itemCard}>
                <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                  {run.templateName}
                </ThemedText>
                <ThemedText style={styles.mutedText}>Completed {formatDate(run.completedAt)}</ThemedText>
                <ThemedText style={styles.mutedText}>{run.results.length} entries recorded</ThemedText>
              </View>
            ))
          )}
        </ThemedView>
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
    gap: 14,
    backgroundColor: UI.bg,
  },
  hero: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    gap: 8,
  },
  eyebrow: {
    color: UI.accentStrong,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: UI.text,
    fontSize: 30,
    lineHeight: 34,
  },
  heroSubtitle: {
    color: UI.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: UI.accent,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  secondaryHeroButton: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.cardStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  secondaryHeroButtonText: {
    color: UI.textSoft,
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
  resumeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 12,
    gap: 8,
  },
  resumeActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  resumeButton: {
    borderRadius: 10,
    backgroundColor: UI.accent,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  resumeButtonText: {
    color: '#ffffff',
    fontFamily: 'Manrope_600SemiBold',
  },
  discardButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.cardStrong,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  discardButtonText: {
    color: UI.textSoft,
    fontFamily: 'Manrope_600SemiBold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    minWidth: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  metricLabel: {
    color: UI.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  metricValue: {
    color: UI.text,
    fontSize: 26,
    lineHeight: 30,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 12,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: UI.text,
    fontSize: 18,
    lineHeight: 22,
  },
  sectionMeta: {
    color: UI.textSoft,
    backgroundColor: UI.bgMuted,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 12,
    lineHeight: 16,
    overflow: 'hidden',
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.card,
    padding: 12,
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.bgMuted,
  },
  badgeText: {
    color: UI.textSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  secondaryButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.cardStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: UI.text,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Manrope_600SemiBold',
  },
  bodyText: {
    color: UI.text,
  },
  mutedText: {
    color: UI.textMuted,
  },
});
