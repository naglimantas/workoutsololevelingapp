import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import SystemPanel from '../components/SystemPanel';
import QuestCard from '../components/QuestCard';
import {
  getHunterProfile,
  saveHunterProfile,
  getDailyQuests,
  saveDailyQuests,
  getTodayKey,
} from '../utils/storage';
import {
  getRandomQuests,
  createCustomQuest,
  generatePenaltyQuest,
  getRandomPenaltyMessage,
  EXERCISE_TYPES,
  UNIT_OPTIONS,
} from '../utils/questData';
import { XP_REWARDS, checkRankUp, STAT_REWARDS } from '../utils/xpSystem';

export default function DailyQuestsScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [hasPenalty, setHasPenalty] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('strength');
  const [customTarget, setCustomTarget] = useState('');
  const [customUnit, setCustomUnit] = useState('reps');
  const [penaltyMessage] = useState(getRandomPenaltyMessage());
  const successAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const p = await getHunterProfile();
    setProfile(p);
    const todayKey = getTodayKey();
    let data = await getDailyQuests(todayKey);
    if (!data || !data.quests) {
      // Generate new quests for today
      const count = Math.floor(Math.random() * 3) + 3; // 3-5 quests
      const newQuests = getRandomQuests(count, p?.fitnessLevel);
      data = { date: todayKey, quests: newQuests, allCompleted: false };
      await saveDailyQuests(data, todayKey);
    }
    setQuests(data.quests || []);
    setHasPenalty(data.quests?.some(q => q.isPenalty) || false);
  }

  async function handleToggleQuest(quest) {
    const updated = quests.map(q =>
      q.id === quest.id ? { ...q, completed: !q.completed } : q
    );
    setQuests(updated);

    const todayKey = getTodayKey();
    const allCompleted = updated.every(q => q.completed);
    await saveDailyQuests({ date: todayKey, quests: updated, allCompleted }, todayKey);

    if (!quest.completed) {
      // Quest was just completed — award XP
      await awardQuestXP(quest, updated, allCompleted);
    } else {
      // Deduct XP if un-completing
      const p = await getHunterProfile();
      if (p) {
        p.xp = Math.max(0, p.xp - quest.xp);
        await saveHunterProfile(p);
        setProfile(p);
      }
    }
  }

  async function awardQuestXP(quest, updatedQuests, allCompleted) {
    const p = await getHunterProfile();
    if (!p) return;

    const oldXP = p.xp;
    p.xp += quest.xp;

    // Award stat points
    const statType = quest.statType || 'quest';
    const gains = STAT_REWARDS[statType] || STAT_REWARDS.quest;
    for (const [stat, val] of Object.entries(gains)) {
      if (p.stats[stat] !== undefined) p.stats[stat] += val;
    }
    p.stats.intelligence += 1; // bonus for completing any quest

    // All quests bonus
    if (allCompleted) {
      p.xp += XP_REWARDS.allQuestsBonus;
      p.lastQuestDate = getTodayKey();
      // Update streak
      const lastDate = p.lastQuestDate;
      // Simple streak: increment if completed today
      p.streak = (p.streak || 0) + 1;
    }

    const rankCheck = checkRankUp(oldXP, p.xp);
    p.rank = require('../utils/xpSystem').getRankForXP(p.xp);
    await saveHunterProfile(p);
    setProfile({ ...p });

    // Success animation
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(successAnim, { toValue: 0, duration: 600, delay: 800, useNativeDriver: true }),
    ]).start();

    if (rankCheck.didRankUp) {
      setTimeout(() => navigation.navigate('RankUp', { newRank: rankCheck.newRank }), 500);
    }
  }

  function handleAddCustomQuest() {
    if (!customName.trim() || !customTarget) return;
    const quest = createCustomQuest({
      name: customName.trim(),
      type: customType,
      target: customTarget,
      unit: customUnit,
    });
    const updated = [...quests, quest];
    setQuests(updated);
    const todayKey = getTodayKey();
    saveDailyQuests({ date: todayKey, quests: updated, allCompleted: false }, todayKey);
    setShowAddModal(false);
    setCustomName('');
    setCustomTarget('');
  }

  const completedCount = quests.filter(q => q.completed).length;
  const totalCount = quests.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <LinearGradient colors={[colors.background, hasPenalty ? colors.penaltyDark : colors.darkPurple + '44', colors.background]} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTag}>[ DAILY QUEST SYSTEM ]</Text>

          {/* Penalty Banner */}
          {hasPenalty && (
            <SystemPanel penalty style={styles.penaltyBanner}>
              <Text style={styles.penaltyTitle}>⚠ PENALTY QUEST ACTIVE</Text>
              <Text style={styles.penaltyMsg}>"{penaltyMessage}"</Text>
            </SystemPanel>
          )}

          {/* Progress Overview */}
          <SystemPanel style={styles.progressPanel} glow={completedCount === totalCount && totalCount > 0}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>TODAY'S MISSIONS</Text>
              <Text style={[
                styles.progressCount,
                completedCount === totalCount && totalCount > 0 ? { color: colors.success } : {},
              ]}>
                {completedCount}/{totalCount}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${progress * 100}%`,
                backgroundColor: completedCount === totalCount ? colors.success : colors.electricBlue,
              }]} />
            </View>
            {completedCount === totalCount && totalCount > 0 && (
              <Text style={styles.allDoneText}>ALL MISSIONS COMPLETE — +{XP_REWARDS.allQuestsBonus} BONUS XP</Text>
            )}
          </SystemPanel>

          {/* Success Flash */}
          <Animated.View style={[styles.successFlash, { opacity: successAnim }]}>
            <Text style={styles.successText}>+XP AWARDED</Text>
          </Animated.View>

          {/* Quest List */}
          {quests.map(quest => (
            <QuestCard key={quest.id} quest={quest} onToggle={handleToggleQuest} />
          ))}

          {/* Add Quest */}
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>+ ADD CUSTOM QUEST</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Quests reset at midnight. Incomplete quests will trigger penalty missions tomorrow.
            </Text>
          </View>
        </ScrollView>

        {/* Add Quest Modal */}
        <Modal visible={showAddModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalPanel}>
              <Text style={styles.modalTitle}>[ CUSTOM QUEST ]</Text>

              <Text style={styles.modalLabel}>QUEST NAME</Text>
              <TextInput
                style={styles.modalInput}
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g. 50 Pull-ups"
                placeholderTextColor={colors.textDim}
              />

              <Text style={styles.modalLabel}>TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {EXERCISE_TYPES.map(et => (
                  <TouchableOpacity
                    key={et.value}
                    style={[styles.typeOption, customType === et.value && styles.typeSelected]}
                    onPress={() => setCustomType(et.value)}
                  >
                    <Text style={styles.typeText}>{et.icon} {et.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.targetRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>TARGET</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={customTarget}
                    onChangeText={setCustomTarget}
                    placeholder="100"
                    placeholderTextColor={colors.textDim}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.modalLabel}>UNIT</Text>
                  <ScrollView>
                    {UNIT_OPTIONS.map(u => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitOption, customUnit === u && styles.typeSelected]}
                        onPress={() => setCustomUnit(u)}
                      >
                        <Text style={styles.unitText}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleAddCustomQuest}>
                  <Text style={styles.confirmText}>ADD QUEST</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  backBtn: { padding: 16, paddingBottom: 0 },
  backText: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 13, color: colors.electricBlue, letterSpacing: 2 },
  scroll: { padding: 16, paddingBottom: 40 },
  screenTag: { fontFamily: 'Rajdhani_500Medium', fontSize: 11, color: colors.electricBlue, letterSpacing: 3, textAlign: 'center', marginBottom: 16 },

  penaltyBanner: { marginBottom: 12 },
  penaltyTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 14, color: colors.penalty, letterSpacing: 2, marginBottom: 6 },
  penaltyMsg: { fontFamily: 'Rajdhani_400Regular', fontSize: 13, color: colors.penalty + 'cc', fontStyle: 'italic', letterSpacing: 0.5 },

  progressPanel: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 12, color: colors.textSecondary, letterSpacing: 2 },
  progressCount: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: colors.textPrimary },
  progressTrack: { height: 6, backgroundColor: colors.surface, borderRadius: 1, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  progressFill: { height: '100%', borderRadius: 1 },
  allDoneText: { fontFamily: 'Rajdhani_700Bold', fontSize: 11, color: colors.success, letterSpacing: 2, marginTop: 8, textAlign: 'center' },

  successFlash: { alignItems: 'center', marginBottom: 8 },
  successText: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, color: colors.gold, letterSpacing: 3 },

  addBtn: {
    borderWidth: 1,
    borderColor: colors.electricBlue,
    borderStyle: 'dashed',
    padding: 14,
    borderRadius: 2,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  addBtnText: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 14, color: colors.electricBlue, letterSpacing: 2 },

  infoBox: { alignItems: 'center', paddingHorizontal: 20 },
  infoText: { fontFamily: 'Rajdhani_400Regular', fontSize: 11, color: colors.textDim, textAlign: 'center', letterSpacing: 0.5, lineHeight: 17 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 20 },
  modalPanel: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.electricBlue, padding: 20, borderRadius: 2 },
  modalTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 14, color: colors.electricBlue, letterSpacing: 3, textAlign: 'center', marginBottom: 16 },
  modalLabel: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 10, color: colors.textSecondary, letterSpacing: 2.5, marginBottom: 6 },
  modalInput: { fontFamily: 'Rajdhani_500Medium', fontSize: 16, color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 6, marginBottom: 14 },
  typeOption: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 2, marginRight: 8 },
  typeSelected: { borderColor: colors.electricBlue, backgroundColor: colors.electricBlue + '22' },
  typeText: { fontFamily: 'Rajdhani_500Medium', fontSize: 13, color: colors.textPrimary },
  targetRow: { flexDirection: 'row', marginBottom: 16 },
  unitOption: { paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 2, marginBottom: 4 },
  unitText: { fontFamily: 'Rajdhani_500Medium', fontSize: 12, color: colors.textPrimary },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: colors.textDim, borderRadius: 2, alignItems: 'center' },
  cancelText: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 14, color: colors.textSecondary, letterSpacing: 1 },
  confirmBtn: { flex: 1, padding: 12, backgroundColor: colors.electricBlue, borderRadius: 2, alignItems: 'center' },
  confirmText: { fontFamily: 'Rajdhani_700Bold', fontSize: 14, color: colors.textPrimary, letterSpacing: 1 },
});
