import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EXERCISES } from '@/constants/exercises';
import { UI } from '@/constants/ui';
import { listSessionRuns } from '@/lib/workout-storage';
import { SessionRun } from '@/types/workout';

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_HEIGHT = 92;

function startOfDay(timestamp: number) {
  const value = new Date(timestamp);
  value.setHours(0, 0, 0, 0);
  return value.getTime();
}

type DailyPoint = {
  dayKey: number;
  label: string;
  count: number;
};

type ExerciseSummary = {
  id: string;
  name: string;
  totalReps: number;
};

export default function ReportScreen() {
  const [runs, setRuns] = useState<SessionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const bottomPadding = 20 + Math.max(insets.bottom, 12);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        const nextRuns = await listSessionRuns();
        if (!active) return;
        setRuns(nextRuns);
        setLoading(false);
      };

      load();
      return () => {
        active = false;
      };
    }, [])
  );

  const report = useMemo(() => {
    const totalSessions = runs.length;
    let totalLoggedSets = 0;
    let totalReps = 0;
    let totalDurationSeconds = 0;
    const exerciseTotals: Record<string, number> = {};
    const templateTotals: Record<string, number> = {};
    const exerciseNameById: Record<string, string> = {};

    EXERCISES.forEach((exercise) => {
      exerciseNameById[exercise.id] = exercise.name;
    });

    runs.forEach((run) => {
      templateTotals[run.templateName] = (templateTotals[run.templateName] ?? 0) + 1;
      run.results.forEach((result) => {
        totalDurationSeconds += result.durationSeconds;
        if (result.count === null) return;
        totalLoggedSets += 1;
        totalReps += result.count;
        exerciseTotals[result.exerciseId] = (exerciseTotals[result.exerciseId] ?? 0) + result.count;
      });
    });

    const averageReps = totalLoggedSets > 0 ? Math.round(totalReps / totalLoggedSets) : 0;
    const totalMinutes = Math.round(totalDurationSeconds / 60);
    const oneWeekAgo = Date.now() - 7 * DAY_MS;
    const weeklySessions = runs.filter((run) => run.completedAt >= oneWeekAgo).length;

    const now = Date.now();
    const todayStart = startOfDay(now);
    const dailySessions: DailyPoint[] = Array.from({ length: 7 }, (_, index) => {
      const dayStart = todayStart - (6 - index) * DAY_MS;
      const dayEnd = dayStart + DAY_MS;
      const count = runs.filter(
        (run) => run.completedAt >= dayStart && run.completedAt < dayEnd
      ).length;
      const label = new Date(dayStart).toLocaleDateString(undefined, { weekday: 'short' });
      return { dayKey: dayStart, label, count };
    });

    const topExercises: ExerciseSummary[] = Object.entries(exerciseTotals)
      .map(([exerciseId, reps]) => ({
        id: exerciseId,
        name: exerciseNameById[exerciseId] ?? exerciseId,
        totalReps: reps,
      }))
      .sort((a, b) => b.totalReps - a.totalReps)
      .slice(0, 5);

    const topTemplates = Object.entries(templateTotals)
      .map(([templateName, count]) => ({ templateName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return {
      totalSessions,
      totalReps,
      totalMinutes,
      averageReps,
      weeklySessions,
      dailySessions,
      topExercises,
      topTemplates,
    };
  }, [runs]);

  const maxDailyCount = Math.max(1, ...report.dailySessions.map((point) => point.count));
  const maxExerciseReps = Math.max(1, ...report.topExercises.map((item) => item.totalReps));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
        contentInsetAdjustmentBehavior="never">
        <ThemedView style={styles.hero}>
          <ThemedText style={styles.eyebrow}>Performance</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Training Report
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Weekly momentum, rep volume, and exercise distribution.
          </ThemedText>
        </ThemedView>

        {loading ? (
          <ThemedView style={styles.card}>
            <ThemedText style={styles.bodyText}>Loading report...</ThemedText>
          </ThemedView>
        ) : report.totalSessions === 0 ? (
          <ThemedView style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.bodyText}>
              No data yet
            </ThemedText>
            <ThemedText style={styles.mutedText}>
              Complete at least one session to unlock charts and analytics.
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <View style={styles.metricsGrid}>
              <ThemedView style={styles.metricCard}>
                <ThemedText style={styles.metricLabel}>Sessions</ThemedText>
                <ThemedText type="title" style={styles.metricValue}>
                  {report.totalSessions}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.metricCard}>
                <ThemedText style={styles.metricLabel}>This Week</ThemedText>
                <ThemedText type="title" style={styles.metricValue}>
                  {report.weeklySessions}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.metricCard}>
                <ThemedText style={styles.metricLabel}>Total Reps</ThemedText>
                <ThemedText type="title" style={styles.metricValue}>
                  {report.totalReps}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.metricCard}>
                <ThemedText style={styles.metricLabel}>Avg / Set</ThemedText>
                <ThemedText type="title" style={styles.metricValue}>
                  {report.averageReps}
                </ThemedText>
              </ThemedView>
            </View>

            <ThemedView style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Last 7 Days
                </ThemedText>
                <ThemedText style={styles.metaText}>{report.totalMinutes} timer mins</ThemedText>
              </View>
              <View style={styles.dailyChartRow}>
                {report.dailySessions.map((point) => {
                  const ratio = point.count / maxDailyCount;
                  return (
                    <View key={point.dayKey} style={styles.dailyColumn}>
                      <View style={styles.dailyTrack}>
                        <View
                          style={[
                            styles.dailyBar,
                            { height: Math.max(6, Math.round(CHART_HEIGHT * ratio)) },
                          ]}
                        />
                      </View>
                      <ThemedText style={styles.dailyCount}>{point.count}</ThemedText>
                      <ThemedText style={styles.dailyLabel}>{point.label}</ThemedText>
                    </View>
                  );
                })}
              </View>
            </ThemedView>

            <ThemedView style={styles.card}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Top Exercises by Reps
              </ThemedText>
              {report.topExercises.length === 0 ? (
                <ThemedText style={styles.mutedText}>No rep counts logged yet.</ThemedText>
              ) : (
                report.topExercises.map((item) => (
                  <View key={item.id} style={styles.rowBlock}>
                    <View style={styles.rowHeader}>
                      <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={styles.metaText}>{item.totalReps} reps</ThemedText>
                    </View>
                    <View style={styles.repsTrack}>
                      <View
                        style={[
                          styles.repsBar,
                          { width: `${Math.max(8, Math.round((item.totalReps / maxExerciseReps) * 100))}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </ThemedView>

            <ThemedView style={styles.card}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Most Used Templates
              </ThemedText>
              {report.topTemplates.length === 0 ? (
                <ThemedText style={styles.mutedText}>No template usage found yet.</ThemedText>
              ) : (
                report.topTemplates.map((item) => (
                  <View key={item.templateName} style={styles.templateRow}>
                    <ThemedText style={styles.bodyText}>{item.templateName}</ThemedText>
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>{item.count} sessions</ThemedText>
                    </View>
                  </View>
                ))
              )}
            </ThemedView>
          </>
        )}
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
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    color: UI.textMuted,
    fontSize: 14,
    lineHeight: 20,
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 12,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: UI.text,
  },
  metaText: {
    color: UI.textSoft,
    fontSize: 12,
    lineHeight: 16,
  },
  dailyChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  dailyColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dailyTrack: {
    height: CHART_HEIGHT,
    width: 20,
    borderRadius: 10,
    justifyContent: 'flex-end',
    backgroundColor: UI.bgMuted,
    overflow: 'hidden',
  },
  dailyBar: {
    width: '100%',
    backgroundColor: UI.accent,
  },
  dailyCount: {
    color: UI.text,
    fontSize: 12,
    lineHeight: 16,
  },
  dailyLabel: {
    color: UI.textMuted,
    fontSize: 11,
    lineHeight: 14,
  },
  rowBlock: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  repsTrack: {
    width: '100%',
    height: 9,
    borderRadius: 999,
    backgroundColor: UI.bgMuted,
    overflow: 'hidden',
  },
  repsBar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: UI.accentStrong,
  },
  templateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  bodyText: {
    color: UI.text,
  },
  mutedText: {
    color: UI.textMuted,
  },
});
