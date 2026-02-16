import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { AppGradientBackground } from '@/components/app-gradient-background';
import { GradientHero } from '@/components/gradient-hero';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  clearActiveSessionSnapshot,
  getActiveSessionSnapshot,
  getSessionTemplateById,
  listSessionRuns,
  listSessionTemplates,
  updateLongestStreak,
} from '@/lib/workout-storage';
import { ActiveSessionSnapshot, SessionRun, SessionTemplate } from '@/types/workout';
import { getStreakInfo, getStreakMessage } from '@/lib/streaks';
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
  const [streak, setStreak] = useState({ current: 0, longest: 0, workedOutToday: false });
  const insets = useSafeAreaInsets();
  const bottomPadding = 22 + Math.max(insets.bottom, 12);
  const appVersion = useMemo(
    () => Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '0.0.0',
    []
  );

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

        // Calculate streaks
        const streakInfo = getStreakInfo(nextRuns);
        const longestStreak = await updateLongestStreak(streakInfo.current);

        setTemplates(nextTemplates);
        setRuns(nextRuns);
        setResumeCard(nextResumeCard);
        setStreak({
          current: streakInfo.current,
          longest: longestStreak,
          workedOutToday: streakInfo.workedOutToday,
        });
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
      <AppGradientBackground variant="home">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
          contentInsetAdjustmentBehavior="never">
          <View style={styles.utilityRow}>
            <Link href="../settings" asChild>
              <Pressable style={styles.utilityButton}>
                <Ionicons name="settings-outline" size={18} color={UI.textMuted} />
                <ThemedText style={styles.utilityButtonText}>Settings</ThemedText>
              </Pressable>
            </Link>
          </View>

          {/* Streak Banner */}
          <ThemedView style={[
            styles.streakBanner,
            streak.current > 0 && streak.workedOutToday && styles.streakBannerActive
          ]}>
            <View style={styles.streakContent}>
              <View style={styles.streakIconContainer}>
                <Ionicons 
                  name="flame" 
                  size={32} 
                  color={streak.current > 0 && streak.workedOutToday ? '#f97316' : UI.textMuted} 
                />
              </View>
              <View style={styles.streakTextContainer}>
                <ThemedText type="title" style={styles.streakNumber}>
                  {streak.current} {streak.current === 1 ? 'Day' : 'Days'}
                </ThemedText>
                <ThemedText style={styles.streakLabel}>
                  {getStreakMessage(streak.current, streak.workedOutToday)}
                </ThemedText>
              </View>
            </View>
            {streak.longest > 0 && (
              <View style={styles.streakBestContainer}>
                <Ionicons name="trophy-outline" size={14} color={UI.textSoft} />
                <ThemedText style={styles.streakBestText}>
                  Best: {streak.longest}
                </ThemedText>
              </View>
            )}
          </ThemedView>

          <GradientHero variant="home" style={styles.hero}>
            <ThemedText type="title" style={styles.heroTitle} allowFontScaling={false}>
              Fitzig
            </ThemedText>
            <ThemedText style={styles.versionText}>Version {appVersion}</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Create structured sessions, keep momentum, and track your volume over time.
            </ThemedText>
            <Link href="/session/create" asChild>
              <Pressable style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>Create New Session</ThemedText>
              </Pressable>
            </Link>
          </GradientHero>

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
              <View style={styles.metricIconContainer}>
                <Ionicons name="albums-outline" size={16} color={UI.accent} />
              </View>
              <ThemedText style={styles.metricLabel}>Templates</ThemedText>
              <ThemedText type="title" style={styles.metricValue}>
                {stats.templateCount}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.metricCard}>
              <View style={styles.metricIconContainer}>
                <Ionicons name="calendar-outline" size={16} color={UI.accent} />
              </View>
              <ThemedText style={styles.metricLabel}>Total Sessions</ThemedText>
              <ThemedText type="title" style={styles.metricValue}>
                {stats.runCount}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.metricCard}>
              <View style={styles.metricIconContainer}>
                <Ionicons name="trending-up-outline" size={16} color={UI.accent} />
              </View>
              <ThemedText style={styles.metricLabel}>This Week</ThemedText>
              <ThemedText type="title" style={styles.metricValue}>
                {stats.runsThisWeek}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.metricCard}>
              <View style={styles.metricIconContainer}>
                <Ionicons name="barbell-outline" size={16} color={UI.accent} />
              </View>
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
              <View style={styles.emptyState}>
                <Ionicons name="add-circle-outline" size={32} color={UI.textMuted} />
                <ThemedText style={styles.mutedText}>
                  No templates yet. Create your first session to get started.
                </ThemedText>
              </View>
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
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={32} color={UI.textMuted} />
                <ThemedText style={styles.mutedText}>No completed sessions yet.</ThemedText>
              </View>
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
    gap: 14,
    backgroundColor: 'transparent',
  },
  hero: {
    padding: 16,
    gap: 8,
  },
  utilityRow: {
    alignItems: 'flex-end',
  },
  utilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  utilityButtonText: {
    color: UI.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Manrope_600SemiBold',
  },
  heroTitle: {
    color: UI.text,
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 2,
  },
  versionText: {
    color: UI.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Manrope_600SemiBold',
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
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 2,
  },
  metricIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: UI.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
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
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  streakBanner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 16,
    gap: 12,
  },
  streakBannerActive: {
    borderColor: '#f97316',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: UI.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: UI.border,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakNumber: {
    color: UI.text,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 2,
  },
  streakLabel: {
    color: UI.textMuted,
    fontSize: 14,
    lineHeight: 18,
  },
  streakBestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
  },
  streakBestText: {
    color: UI.textSoft,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Manrope_600SemiBold',
  },
});
