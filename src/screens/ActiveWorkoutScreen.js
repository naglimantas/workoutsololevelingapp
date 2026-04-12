import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, rankColors } from '../theme/colors';
import SystemPanel from '../components/SystemPanel';
import {
  getHunterProfile,
  saveHunterProfile,
  addWorkoutToHistory,
  recordWeeklySnapshot,
} from '../utils/storage';
import { calcXPForWorkout, calcStatGains, checkRankUp, getRankForXP } from '../utils/xpSystem';
import { getRandomQuote } from '../utils/workoutData';

const { width, height } = Dimensions.get('window');

export default function ActiveWorkoutScreen({ navigation, route }) {
  const { workout } = route.params;
  const exercises = workout.exercises || [];

  const [phase, setPhase] = useState('ready'); // ready | active | rest | complete
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [rpeValue, setRpeValue] = useState(5);
  const [notes, setNotes] = useState('');
  const [completedExercises, setCompletedExercises] = useState([]);
  const [restTimer, setRestTimer] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [finaleQuote] = useState(getRandomQuote());
  const [newRank, setNewRank] = useState(null);

  const timerRef = useRef(null);
  const restRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentEx = exercises[currentExIdx];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Rest countdown
  useEffect(() => {
    if (phase === 'rest' && restTimer > 0) {
      restRef.current = setTimeout(() => setRestTimer(t => t - 1), 1000);
    } else if (phase === 'rest' && restTimer === 0) {
      setPhase('active');
    }
    return () => clearTimeout(restRef.current);
  }, [phase, restTimer]);

  // Pulse animation for rest
  useEffect(() => {
    if (phase === 'rest') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase]);

  function startWorkout() {
    setPhase('active');
    setRepCount(currentEx?.reps || 0);
  }

  function completeSet() {
    const ex = currentEx;
    if (currentSet < ex.sets) {
      // More sets — go to rest
      setCurrentSet(s => s + 1);
      setRestTimer(ex.rest || 60);
      setPhase('rest');
    } else {
      // Exercise done
      const done = [...completedExercises, { ...ex, rpe: rpeValue, notes }];
      setCompletedExercises(done);
      setNotes('');
      setRpeValue(5);
      setCurrentSet(1);

      if (currentExIdx < exercises.length - 1) {
        setCurrentExIdx(i => i + 1);
        const nextEx = exercises[currentExIdx + 1];
        setRepCount(nextEx?.reps || 0);
        setRestTimer(ex.rest || 60);
        setPhase('rest');
      } else {
        finishWorkout(done);
      }
    }
  }

  async function finishWorkout(done) {
    setPhase('complete');
    clearInterval(timerRef.current);

    const durationMin = Math.floor(elapsedSeconds / 60);
    const xp = calcXPForWorkout(done, durationMin);
    setXpGained(xp);

    const profile = await getHunterProfile();
    if (!profile) return;

    const oldXP = profile.xp;
    profile.xp += xp;
    profile.totalWorkouts += 1;
    profile.lastWorkoutDate = new Date().toISOString();

    // Update streak
    const today = new Date().toDateString();
    const lastDate = profile.lastWorkoutDate ? new Date(profile.lastWorkoutDate).toDateString() : null;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        profile.streak += 1;
      } else {
        profile.streak = 1;
      }
    }

    // Stat gains based on workout category
    const gains = calcStatGains(workout.category || 'strength', 1);
    for (const [stat, val] of Object.entries(gains)) {
      if (profile.stats[stat] !== undefined) profile.stats[stat] += val;
    }
    profile.stats.vitality += 1;

    const rankCheck = checkRankUp(oldXP, profile.xp);
    profile.rank = getRankForXP(profile.xp);
    await saveHunterProfile(profile);
    await addWorkoutToHistory({
      name: workout.name,
      category: workout.category,
      exercises: done,
      duration: durationMin,
      xpGained: xp,
    });
    await recordWeeklySnapshot(profile);

    if (rankCheck.didRankUp) {
      setNewRank(rankCheck.newRank);
    }
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // === PHASE: READY ===
  if (phase === 'ready') {
    return (
      <LinearGradient colors={[colors.background, colors.darkPurple, colors.background]} style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← ABORT</Text>
          </TouchableOpacity>
          <Animated.View style={[styles.readyContainer, { opacity: fadeAnim }]}>
            <Text style={styles.systemInit}>[ PROTOCOL LOADED ]</Text>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <Text style={styles.workoutMeta}>{exercises.length} EXERCISES · {workout.duration} MIN</Text>
            <View style={styles.exerciseList}>
              {exercises.map((ex, i) => (
                <Text key={i} style={styles.exerciseListItem}>
                  {i + 1}. {ex.name} — {ex.sets}×{ex.reps} {ex.unit}
                </Text>
              ))}
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={startWorkout} activeOpacity={0.8}>
              <LinearGradient colors={[colors.electricBlue, colors.glowPurple]} style={styles.startGrad}>
                <Text style={styles.startText}>INITIATE PROTOCOL</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // === PHASE: COMPLETE ===
  if (phase === 'complete') {
    const rankColor = newRank ? rankColors[newRank] : colors.gold;
    return (
      <LinearGradient colors={[colors.background, colors.darkPurple, colors.background]} style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={styles.completeScroll}>
            <Text style={styles.completeTag}>[ PROTOCOL COMPLETE ]</Text>

            <SystemPanel glow style={styles.completePanel}>
              <Text style={styles.xpGained}>+{xpGained} XP</Text>
              <Text style={styles.xpLabel}>EXPERIENCE GAINED</Text>
              <View style={styles.completeMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>{formatTime(elapsedSeconds)}</Text>
                  <Text style={styles.metaLabel}>DURATION</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>{completedExercises.length}</Text>
                  <Text style={styles.metaLabel}>EXERCISES</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>
                    {completedExercises.reduce((acc, e) => acc + (e.sets || 1), 0)}
                  </Text>
                  <Text style={styles.metaLabel}>TOTAL SETS</Text>
                </View>
              </View>
            </SystemPanel>

            {newRank && (
              <SystemPanel glow style={[styles.rankUpPanel, { borderColor: rankColor }]}>
                <Text style={[styles.rankUpText, { color: rankColor }]}>🏆 RANK UP — {newRank} CLASS</Text>
                <Text style={styles.rankUpSub}>The System acknowledges your ascent.</Text>
              </SystemPanel>
            )}

            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>{finaleQuote}</Text>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={() => {
              if (newRank) {
                navigation.navigate('RankUp', { newRank });
              } else {
                navigation.navigate('HomeDashboard');
              }
            }}>
              <LinearGradient colors={[colors.electricBlue, colors.glowPurple]} style={styles.startGrad}>
                <Text style={styles.startText}>{newRank ? 'WITNESS YOUR RANK' : 'RETURN TO BASE'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // === PHASE: REST ===
  if (phase === 'rest') {
    return (
      <LinearGradient colors={[colors.background, colors.deepBlue, colors.background]} style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.restContainer}>
            <Text style={styles.restLabel}>REST</Text>
            <Animated.Text style={[styles.restTimer, { transform: [{ scale: pulseAnim }] }]}>
              {formatTime(restTimer)}
            </Animated.Text>
            <Text style={styles.restNext}>
              NEXT: {currentEx?.name} — SET {currentSet}/{currentEx?.sets}
            </Text>
            <TouchableOpacity style={styles.skipBtn} onPress={() => { setRestTimer(0); setPhase('active'); }}>
              <Text style={styles.skipText}>SKIP REST</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // === PHASE: ACTIVE ===
  if (!currentEx) return null;

  const setProgress = currentSet / currentEx.sets;

  return (
    <LinearGradient colors={[colors.background, colors.darkPurple + '55', colors.background]} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.activeHeader}>
          <Text style={styles.elapsedTimer}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.progressText}>{currentExIdx + 1}/{exercises.length}</Text>
          <TouchableOpacity onPress={() => Alert.alert('End Workout?', 'Save progress?', [
            { text: 'Continue', style: 'cancel' },
            { text: 'End', style: 'destructive', onPress: () => finishWorkout(completedExercises) },
          ])}>
            <Text style={styles.endText}>END</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.activeScroll}>
          {/* Current Exercise */}
          <SystemPanel glow style={styles.exercisePanel}>
            <Text style={styles.exSetLabel}>SET {currentSet} OF {currentEx.sets}</Text>
            <Text style={styles.exName}>{currentEx.name}</Text>
            <Text style={styles.exTarget}>{currentEx.reps} {currentEx.unit}</Text>

            {/* Set progress dots */}
            <View style={styles.setDots}>
              {Array.from({ length: currentEx.sets }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.setDot,
                    i < currentSet - 1 && styles.setDotDone,
                    i === currentSet - 1 && styles.setDotActive,
                  ]}
                />
              ))}
            </View>
          </SystemPanel>

          {/* RPE Slider */}
          <SystemPanel style={styles.rpePanel}>
            <Text style={styles.fieldLabel}>RPE — RATE OF PERCEIVED EXERTION</Text>
            <View style={styles.rpeRow}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.rpeBtn, rpeValue === n && styles.rpeBtnActive]}
                  onPress={() => setRpeValue(n)}
                >
                  <Text style={[styles.rpeBtnText, rpeValue === n && { color: colors.electricBlue }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.rpeDesc}>
              {rpeValue <= 3 ? 'Easy — more weight possible' :
               rpeValue <= 6 ? 'Moderate — controlled effort' :
               rpeValue <= 8 ? 'Hard — near limit' : 'Maximum — all-out effort'}
            </Text>
          </SystemPanel>

          {/* Notes */}
          <SystemPanel style={styles.notesPanel}>
            <Text style={styles.fieldLabel}>NOTES</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Form cues, weight used..."
              placeholderTextColor={colors.textDim}
              multiline
            />
          </SystemPanel>

          {/* Upcoming */}
          {currentExIdx < exercises.length - 1 && (
            <View style={styles.nextExBox}>
              <Text style={styles.nextExLabel}>NEXT:</Text>
              <Text style={styles.nextExName}>{exercises[currentExIdx + 1]?.name}</Text>
            </View>
          )}
        </ScrollView>

        {/* Complete Set Button */}
        <TouchableOpacity style={styles.completeSetBtn} onPress={completeSet} activeOpacity={0.85}>
          <LinearGradient colors={[colors.electricBlue, colors.glowPurple]} style={styles.completeSetGrad}>
            <Text style={styles.completeSetText}>
              {currentSet === currentEx.sets && currentExIdx === exercises.length - 1
                ? 'COMPLETE WORKOUT'
                : `COMPLETE SET ${currentSet}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  backBtn: { padding: 16, paddingBottom: 8 },
  backText: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 13, color: colors.danger, letterSpacing: 2 },

  // Ready
  readyContainer: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 20 },
  systemInit: { fontFamily: 'Rajdhani_500Medium', fontSize: 11, color: colors.electricBlue, letterSpacing: 3, marginBottom: 16 },
  workoutName: { fontFamily: 'Rajdhani_700Bold', fontSize: 28, color: colors.textPrimary, textAlign: 'center', letterSpacing: 2, marginBottom: 8 },
  workoutMeta: { fontFamily: 'Rajdhani_500Medium', fontSize: 13, color: colors.textSecondary, letterSpacing: 2, marginBottom: 24 },
  exerciseList: { width: '100%', marginBottom: 32 },
  exerciseListItem: { fontFamily: 'Rajdhani_400Regular', fontSize: 14, color: colors.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
  startBtn: { width: '100%', borderRadius: 2, overflow: 'hidden' },
  startGrad: { padding: 18, alignItems: 'center' },
  startText: { fontFamily: 'Rajdhani_700Bold', fontSize: 18, color: colors.textPrimary, letterSpacing: 4 },

  // Active
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  elapsedTimer: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: colors.textPrimary, letterSpacing: 2 },
  progressText: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 16, color: colors.textSecondary, letterSpacing: 1 },
  endText: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, color: colors.danger, letterSpacing: 2 },
  activeScroll: { padding: 16, paddingBottom: 100 },

  exercisePanel: { alignItems: 'center', marginBottom: 12 },
  exSetLabel: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 11, color: colors.textSecondary, letterSpacing: 3, marginBottom: 8 },
  exName: { fontFamily: 'Rajdhani_700Bold', fontSize: 32, color: colors.textPrimary, letterSpacing: 2, textAlign: 'center', marginBottom: 8 },
  exTarget: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 20, color: colors.electricBlue, letterSpacing: 2, marginBottom: 16 },
  setDots: { flexDirection: 'row', gap: 8 },
  setDot: { width: 10, height: 10, borderRadius: 2, borderWidth: 1.5, borderColor: colors.border },
  setDotDone: { backgroundColor: colors.success, borderColor: colors.success },
  setDotActive: { backgroundColor: colors.electricBlue, borderColor: colors.electricBlue },

  rpePanel: { marginBottom: 12 },
  fieldLabel: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 10, color: colors.textSecondary, letterSpacing: 2.5, marginBottom: 10 },
  rpeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  rpeBtn: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 2, alignItems: 'center' },
  rpeBtnActive: { borderColor: colors.electricBlue, backgroundColor: colors.electricBlue + '22' },
  rpeBtnText: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, color: colors.textSecondary },
  rpeDesc: { fontFamily: 'Rajdhani_400Regular', fontSize: 12, color: colors.textDim, textAlign: 'center', letterSpacing: 0.5 },

  notesPanel: { marginBottom: 12 },
  notesInput: { fontFamily: 'Rajdhani_400Regular', fontSize: 14, color: colors.textPrimary, minHeight: 60, paddingTop: 4 },

  nextExBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  nextExLabel: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 12, color: colors.textSecondary, letterSpacing: 1 },
  nextExName: { fontFamily: 'Rajdhani_500Medium', fontSize: 14, color: colors.textPrimary },

  completeSetBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 0,
    overflow: 'hidden',
  },
  completeSetGrad: { padding: 20, alignItems: 'center' },
  completeSetText: { fontFamily: 'Rajdhani_700Bold', fontSize: 18, color: colors.textPrimary, letterSpacing: 3 },

  // Rest
  restContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  restLabel: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 14, color: colors.textSecondary, letterSpacing: 4, marginBottom: 16 },
  restTimer: { fontFamily: 'Rajdhani_700Bold', fontSize: 80, color: colors.electricBlue, letterSpacing: 4 },
  restNext: { fontFamily: 'Rajdhani_500Medium', fontSize: 14, color: colors.textSecondary, letterSpacing: 1, marginTop: 24, textAlign: 'center', paddingHorizontal: 40 },
  skipBtn: { marginTop: 40, paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: colors.textDim, borderRadius: 2 },
  skipText: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 14, color: colors.textSecondary, letterSpacing: 2 },

  // Complete
  completeScroll: { padding: 20, paddingTop: 40, alignItems: 'center' },
  completeTag: { fontFamily: 'Rajdhani_500Medium', fontSize: 11, color: colors.success, letterSpacing: 3, marginBottom: 24 },
  completePanel: { width: '100%', alignItems: 'center', marginBottom: 16 },
  xpGained: { fontFamily: 'Rajdhani_700Bold', fontSize: 56, color: colors.gold, letterSpacing: 2, textShadowColor: colors.gold, textShadowRadius: 20, textShadowOffset: { width: 0, height: 0 } },
  xpLabel: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 12, color: colors.textSecondary, letterSpacing: 3, marginBottom: 16 },
  completeMeta: { flexDirection: 'row', gap: 24 },
  metaItem: { alignItems: 'center' },
  metaValue: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, color: colors.textPrimary },
  metaLabel: { fontFamily: 'Rajdhani_500Medium', fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5, marginTop: 4 },
  rankUpPanel: { width: '100%', alignItems: 'center', marginBottom: 16 },
  rankUpText: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, letterSpacing: 2, marginBottom: 6 },
  rankUpSub: { fontFamily: 'Rajdhani_400Regular', fontSize: 13, color: colors.textSecondary },
  quoteBox: { paddingHorizontal: 20, marginBottom: 32 },
  quoteText: { fontFamily: 'Rajdhani_400Regular', fontSize: 14, color: colors.textDim, fontStyle: 'italic', textAlign: 'center', letterSpacing: 0.5, lineHeight: 22 },
  doneBtn: { width: '100%', borderRadius: 2, overflow: 'hidden' },
});
