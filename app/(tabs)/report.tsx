import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppGradientBackground } from '@/components/app-gradient-background';
import { ExerciseIcon } from '@/components/exercise-icon';
import { GradientHero } from '@/components/gradient-hero';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getExerciseMeta } from '@/constants/exercises';
import { UI } from '@/constants/ui';
import { listSessionRuns } from '@/lib/workout-storage';
import { SessionRun } from '@/types/workout';

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_HEIGHT = 92;
const PUSH_UP_ID = 'push_up';
const PUSH_UP_WINDOW_DAYS = 30;
const PUSH_UP_CHART_HEIGHT = 96;
const PUSH_UP_BAR_MIN_HEIGHT = 4;

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

type PushUpTrendPoint = {
  dayKey: number;
  label: string;
  reps: number;
  showLabel: boolean;
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
    const oneWeekAgo = Date.now() - 7 * DAY_MS;
    const now = Date.now();
    const todayStart = startOfDay(now);
    let totalLoggedSets = 0;
    let totalReps = 0;
    let totalDurationSeconds = 0;
    let pushUpTotalReps = 0;
    let pushUpWeeklyReps = 0;
    let pushUpLoggedSets = 0;
    const exerciseTotals: Record<string, number> = {};
    const templateTotals: Record<string, number> = {};
    const pushUpDayTotals = new Map<number, number>();

    const pushUpDailyTrend: PushUpTrendPoint[] = Array.from({ length: PUSH_UP_WINDOW_DAYS }, (_, index) => {
      const dayKey = todayStart - (PUSH_UP_WINDOW_DAYS - 1 - index) * DAY_MS;
      const label = new Date(dayKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return {
        dayKey,
        label,
        reps: 0,
        showLabel: index % 5 === 0 || index === PUSH_UP_WINDOW_DAYS - 1,
      };
    });

    runs.forEach((run) => {
      templateTotals[run.templateName] = (templateTotals[run.templateName] ?? 0) + 1;
      run.results.forEach((result) => {
        totalDurationSeconds += result.durationSeconds;
        if (result.count === null) return;
        totalLoggedSets += 1;
        totalReps += result.count;
        exerciseTotals[result.exerciseId] = (exerciseTotals[result.exerciseId] ?? 0) + result.count;

        if (result.exerciseId === PUSH_UP_ID) {
          const clampedPushUpReps = Math.max(0, result.count);
          const resultDay = startOfDay(run.completedAt);

          pushUpLoggedSets += 1;
          pushUpTotalReps += clampedPushUpReps;
          pushUpDayTotals.set(resultDay, (pushUpDayTotals.get(resultDay) ?? 0) + clampedPushUpReps);
          if (run.completedAt >= oneWeekAgo) {
            pushUpWeeklyReps += clampedPushUpReps;
          }
        }
      });
    });

    const averageReps = totalLoggedSets > 0 ? Math.round(totalReps / totalLoggedSets) : 0;
    const pushUpAveragePerSet =
      pushUpLoggedSets > 0 ? Math.round(pushUpTotalReps / pushUpLoggedSets) : 0;
    const totalMinutes = Math.round(totalDurationSeconds / 60);
    const weeklySessions = runs.filter((run) => run.completedAt >= oneWeekAgo).length;

    pushUpDailyTrend.forEach((point) => {
      point.reps = pushUpDayTotals.get(point.dayKey) ?? 0;
    });

    const pushUp30dTotal = pushUpDailyTrend.reduce((sum, point) => sum + point.reps, 0);
    const pushUp30dAveragePerDay = Math.round(pushUp30dTotal / PUSH_UP_WINDOW_DAYS);
    const pushUp30dBestDay = Math.max(0, ...pushUpDailyTrend.map((point) => point.reps));
    const pushUpTrendMax = Math.max(1, pushUp30dBestDay);

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
        name: getExerciseMeta(exerciseId).name,
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
      pushUpTotalReps,
      pushUpWeeklyReps,
      pushUpLoggedSets,
      pushUpAveragePerSet,
      pushUp30dTotal,
      pushUp30dAveragePerDay,
      pushUp30dBestDay,
      pushUpTrendMax,
      pushUpDailyTrend,
      dailySessions,
      topExercises,
      topTemplates,
    };
  }, [runs]);

  const maxDailyCount = Math.max(1, ...report.dailySessions.map((point) => point.count));
  const maxExerciseReps = Math.max(1, ...report.topExercises.map((item) => item.totalReps));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppGradientBackground variant="report">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
          contentInsetAdjustmentBehavior="never">
          <GradientHero variant="report" style={styles.hero}>
            <ThemedText style={styles.eyebrow}>Performance</ThemedText>
            <ThemedText type="title" style={styles.title}>
              Workout Report
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Weekly momentum, rep volume, and exercise distribution.
            </ThemedText>
          </GradientHero>

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
                  <View style={styles.metricIconContainer}>
                    <Ionicons name="fitness-outline" size={16} color={UI.accent} />
                  </View>
                  <ThemedText style={styles.metricLabel}>Sessions</ThemedText>
                  <ThemedText type="title" style={styles.metricValue}>
                    {report.totalSessions}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.metricCard}>
                  <View style={styles.metricIconContainer}>
                    <Ionicons name="calendar-outline" size={16} color={UI.accent} />
                  </View>
                  <ThemedText style={styles.metricLabel}>This Week</ThemedText>
                  <ThemedText type="title" style={styles.metricValue}>
                    {report.weeklySessions}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.metricCard}>
                  <View style={styles.metricIconContainer}>
                    <Ionicons name="barbell-outline" size={16} color={UI.accent} />
                  </View>
                  <ThemedText style={styles.metricLabel}>Total Reps</ThemedText>
                  <ThemedText type="title" style={styles.metricValue}>
                    {report.totalReps}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.metricCard}>
                  <View style={styles.metricIconContainer}>
                    <Ionicons name="stats-chart-outline" size={16} color={UI.accent} />
                  </View>
                  <ThemedText style={styles.metricLabel}>Avg / Set</ThemedText>
                  <ThemedText type="title" style={styles.metricValue}>
                    {report.averageReps}
                  </ThemedText>
                </ThemedView>
              </View>

              <ThemedView style={styles.card}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Push Up Reflection
                </ThemedText>
                <View style={styles.pushUpPrimaryRow}>
                  <View style={styles.exerciseLabelRow}>
                    <ExerciseIcon exerciseId={PUSH_UP_ID} size={18} color={UI.textSoft} />
                    <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                      Push Up
                    </ThemedText>
                  </View>
                  <ThemedText type="title" style={styles.pushUpValue}>
                    {report.pushUpTotalReps} reps
                  </ThemedText>
                </View>
                <View style={styles.pushUpMetaRow}>
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>
                      Last 7 days: {report.pushUpWeeklyReps}
                    </ThemedText>
                  </View>
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>
                      Avg / set: {report.pushUpAveragePerSet}
                    </ThemedText>
                  </View>
                </View>
                {report.pushUpLoggedSets === 0 && (
                  <ThemedText style={styles.mutedText}>
                    No Push Up reps logged yet. Add Push Up in a session and save results.
                  </ThemedText>
                )}
              </ThemedView>

              <ThemedView style={[styles.card, styles.pushUpProgressCard]}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Push Up Progress (30 Days)
                </ThemedText>
                <View style={styles.pushUpKpiRow}>
                  <View style={styles.pushUpKpiItem}>
                    <ThemedText style={styles.metricLabel}>Total (30d)</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                      {report.pushUp30dTotal}
                    </ThemedText>
                  </View>
                  <View style={styles.pushUpKpiItem}>
                    <ThemedText style={styles.metricLabel}>Avg / day</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                      {report.pushUp30dAveragePerDay}
                    </ThemedText>
                  </View>
                  <View style={styles.pushUpKpiItem}>
                    <ThemedText style={styles.metricLabel}>Best day</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                      {report.pushUp30dBestDay}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.pushUpChartRow}>
                  {report.pushUpDailyTrend.map((point) => {
                    const normalizedHeight = Math.round(
                      (point.reps / report.pushUpTrendMax) * PUSH_UP_CHART_HEIGHT
                    );
                    const height = Math.max(PUSH_UP_BAR_MIN_HEIGHT, normalizedHeight);

                    return (
                      <View key={point.dayKey} style={styles.pushUpChartBarTrack}>
                        <View style={[styles.pushUpChartBar, { height }]} />
                      </View>
                    );
                  })}
                </View>
                <View style={styles.pushUpLabelRow}>
                  {report.pushUpDailyTrend
                    .filter((point) => point.showLabel)
                    .map((point) => (
                      <ThemedText key={point.dayKey} numberOfLines={1} style={styles.pushUpLabelText}>
                        {point.label}
                      </ThemedText>
                    ))}
                </View>
                {report.pushUp30dTotal === 0 && (
                  <ThemedText style={styles.mutedText}>
                    No Push Up reps logged in the last 30 days.
                  </ThemedText>
                )}
              </ThemedView>

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
                        <View style={styles.exerciseLabelRow}>
                          <ExerciseIcon exerciseId={item.id} size={15} color={UI.textSoft} />
                          <ThemedText type="defaultSemiBold" style={styles.bodyText}>
                            {item.name}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.metaText}>{item.totalReps} reps</ThemedText>
                      </View>
                      <View style={styles.repsTrack}>
                        <View
                          style={[
                            styles.repsBar,
                            {
                              width: `${Math.max(
                                8,
                                Math.round((item.totalReps / maxExerciseReps) * 100)
                              )}%`,
                            },
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: UI.bgElevated,
    padding: 12,
    gap: 10,
  },
  pushUpPrimaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  pushUpValue: {
    color: UI.text,
    fontSize: 24,
    lineHeight: 30,
  },
  pushUpMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pushUpProgressCard: {
    gap: 12,
  },
  pushUpKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  pushUpKpiItem: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UI.borderSoft,
    backgroundColor: UI.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  pushUpChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: PUSH_UP_CHART_HEIGHT,
  },
  pushUpChartBarTrack: {
    flex: 1,
    height: PUSH_UP_CHART_HEIGHT,
    borderRadius: 8,
    justifyContent: 'flex-end',
    backgroundColor: UI.bgMuted,
    overflow: 'hidden',
  },
  pushUpChartBar: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: UI.accentStrong,
  },
  pushUpLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  pushUpLabelText: {
    color: UI.textMuted,
    fontSize: 9,
    lineHeight: 12,
    width: 42,
    textAlign: 'center',
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
  exerciseLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
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
