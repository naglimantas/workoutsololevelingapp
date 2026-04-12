import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryBar } from 'victory-native';
import { colors, statColors, rankColors } from '../theme/colors';
import SystemPanel from '../components/SystemPanel';
import {
  getHunterProfile,
  getWorkoutHistory,
  getWeeklyStats,
} from '../utils/storage';
import { getLevelFromXP } from '../utils/xpSystem';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

const STAT_NAMES = ['strength', 'agility', 'endurance', 'intelligence', 'vitality'];

export default function ProgressScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [selectedStat, setSelectedStat] = useState('strength');
  const [tab, setTab] = useState('stats'); // stats | workouts | records

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const [p, h, ws] = await Promise.all([
      getHunterProfile(),
      getWorkoutHistory(),
      getWeeklyStats(),
    ]);
    setProfile(p);
    setHistory(h);
    setWeeklyStats(ws);
  }

  if (!profile) return null;

  const level = getLevelFromXP(profile.xp);

  // Chart data for selected stat
  const statChartData = weeklyStats.slice(-14).map((snap, i) => ({
    x: i + 1,
    y: snap.stats?.[selectedStat] || 0,
  }));

  // XP chart data
  const xpChartData = weeklyStats.slice(-14).map((snap, i) => ({
    x: i + 1,
    y: snap.xp || 0,
  }));

  // Workout frequency (last 7 days)
  const last7 = history.filter(w => {
    const d = new Date(w.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return d > cutoff;
  }).length;

  const customTheme = {
    ...VictoryTheme.material,
    axis: {
      ...VictoryTheme.material.axis,
      style: {
        ...VictoryTheme.material.axis?.style,
        axis: { stroke: colors.border },
        tickLabels: { fill: colors.textDim, fontFamily: 'Rajdhani_400Regular', fontSize: 10 },
        grid: { stroke: colors.border + '44' },
      },
    },
  };

  return (
    <LinearGradient colors={[colors.background, colors.darkPurple + '44', colors.background]} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTag}>[ PROGRESS ANALYTICS ]</Text>

          {/* Summary Row */}
          <View style={styles.summaryRow}>
            <SystemPanel style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{last7}</Text>
              <Text style={styles.summaryLabel}>WORKOUTS{'\n'}THIS WEEK</Text>
            </SystemPanel>
            <SystemPanel style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{profile.streak}</Text>
              <Text style={styles.summaryLabel}>🔥 DAY{'\n'}STREAK</Text>
            </SystemPanel>
            <SystemPanel style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{level}</Text>
              <Text style={styles.summaryLabel}>CURRENT{'\n'}LEVEL</Text>
            </SystemPanel>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabRow}>
            {['stats', 'workouts'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && { color: colors.electricBlue }]}>
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* STATS TAB */}
          {tab === 'stats' && (
            <>
              {/* Stat selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statSelector}>
                {STAT_NAMES.map(s => {
                  const sc = statColors[s];
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statChip, selectedStat === s && { borderColor: sc, backgroundColor: sc + '22' }]}
                      onPress={() => setSelectedStat(s)}
                    >
                      <Text style={[styles.statChipText, selectedStat === s && { color: sc }]}>
                        {s.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {weeklyStats.length >= 2 ? (
                <SystemPanel style={styles.chartPanel} noPad>
                  <Text style={[styles.chartTitle, { color: statColors[selectedStat] }]}>
                    {selectedStat.toUpperCase()} OVER TIME
                  </Text>
                  <VictoryChart
                    width={CHART_WIDTH}
                    height={200}
                    theme={customTheme}
                    padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
                  >
                    <VictoryAxis
                      tickFormat={() => ''}
                    />
                    <VictoryAxis dependentAxis />
                    <VictoryLine
                      data={statChartData}
                      style={{
                        data: {
                          stroke: statColors[selectedStat],
                          strokeWidth: 2,
                        },
                      }}
                      animate={{ duration: 500 }}
                    />
                  </VictoryChart>
                </SystemPanel>
              ) : (
                <SystemPanel style={styles.noDataPanel}>
                  <Text style={styles.noDataText}>Complete workouts to unlock stat charts.</Text>
                </SystemPanel>
              )}

              {/* Current stats */}
              <SystemPanel style={styles.panel}>
                <Text style={styles.panelTitle}>CURRENT STAT VALUES</Text>
                {STAT_NAMES.map(s => {
                  const sc = statColors[s];
                  const val = profile.stats[s] || 0;
                  return (
                    <View key={s} style={styles.statRow}>
                      <Text style={[styles.statName, { color: sc }]}>{s.toUpperCase()}</Text>
                      <View style={styles.statTrack}>
                        <View style={[styles.statFill, { width: `${Math.min(val / 500 * 100, 100)}%`, backgroundColor: sc }]} />
                      </View>
                      <Text style={[styles.statVal, { color: sc }]}>{val}</Text>
                    </View>
                  );
                })}
              </SystemPanel>

              {/* XP chart */}
              {weeklyStats.length >= 2 && (
                <SystemPanel style={styles.chartPanel} noPad>
                  <Text style={[styles.chartTitle, { color: colors.gold }]}>XP OVER TIME</Text>
                  <VictoryChart
                    width={CHART_WIDTH}
                    height={200}
                    theme={customTheme}
                    padding={{ top: 20, bottom: 40, left: 60, right: 20 }}
                  >
                    <VictoryAxis tickFormat={() => ''} />
                    <VictoryAxis dependentAxis tickFormat={v => `${Math.round(v / 1000)}k`} />
                    <VictoryLine
                      data={xpChartData}
                      style={{ data: { stroke: colors.gold, strokeWidth: 2 } }}
                    />
                  </VictoryChart>
                </SystemPanel>
              )}
            </>
          )}

          {/* WORKOUTS TAB */}
          {tab === 'workouts' && (
            <>
              {history.length === 0 ? (
                <SystemPanel style={styles.noDataPanel}>
                  <Text style={styles.noDataText}>No workout history yet. Complete your first session.</Text>
                </SystemPanel>
              ) : (
                history.slice(0, 20).map((w, i) => (
                  <WorkoutHistoryItem key={w.id || i} workout={w} />
                ))
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function WorkoutHistoryItem({ workout }) {
  const date = new Date(workout.date);
  const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyName}>{workout.name}</Text>
        <Text style={styles.historyMeta}>
          {dateStr} · {workout.duration}min · {workout.exercises?.length || 0} exercises
        </Text>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyXP}>+{workout.xpGained}</Text>
        <Text style={styles.historyXPLabel}>XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  backBtn: { padding: 16, paddingBottom: 0 },
  backText: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 13, color: colors.electricBlue, letterSpacing: 2 },
  scroll: { padding: 16, paddingBottom: 40 },
  screenTag: { fontFamily: 'Rajdhani_500Medium', fontSize: 11, color: colors.electricBlue, letterSpacing: 3, textAlign: 'center', marginBottom: 16 },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, alignItems: 'center', padding: 12 },
  summaryValue: { fontFamily: 'Rajdhani_700Bold', fontSize: 28, color: colors.textPrimary, letterSpacing: 1 },
  summaryLabel: { fontFamily: 'Rajdhani_500Medium', fontSize: 9, color: colors.textSecondary, letterSpacing: 1, marginTop: 4, textAlign: 'center', lineHeight: 14 },

  tabRow: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.electricBlue },
  tabText: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 13, color: colors.textSecondary, letterSpacing: 1.5 },

  statSelector: { marginBottom: 12, flexGrow: 0 },
  statChip: { paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: colors.border, borderRadius: 2, marginRight: 8, backgroundColor: colors.surface },
  statChipText: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 11, color: colors.textSecondary, letterSpacing: 1 },

  chartPanel: { marginBottom: 12, overflow: 'hidden', padding: 12 },
  chartTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 11, letterSpacing: 2.5, marginBottom: 4 },

  noDataPanel: { marginBottom: 12, alignItems: 'center' },
  noDataText: { fontFamily: 'Rajdhani_400Regular', fontSize: 13, color: colors.textDim, textAlign: 'center', letterSpacing: 0.5, lineHeight: 20 },

  panel: { marginBottom: 12 },
  panelTitle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 11, color: colors.textSecondary, letterSpacing: 2.5, marginBottom: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  statName: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 11, letterSpacing: 1, width: 80 },
  statTrack: { flex: 1, height: 5, backgroundColor: colors.surface, borderRadius: 2, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  statFill: { height: '100%', borderRadius: 2 },
  statVal: { fontFamily: 'Rajdhani_700Bold', fontSize: 14, width: 36, textAlign: 'right' },

  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyLeft: { flex: 1 },
  historyName: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 15, color: colors.textPrimary, letterSpacing: 0.5 },
  historyMeta: { fontFamily: 'Rajdhani_400Regular', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  historyRight: { alignItems: 'center', minWidth: 40 },
  historyXP: { fontFamily: 'Rajdhani_700Bold', fontSize: 18, color: colors.gold },
  historyXPLabel: { fontFamily: 'Rajdhani_500Medium', fontSize: 9, color: colors.gold + 'aa', letterSpacing: 1 },
});
