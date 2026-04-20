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
import { XP_REWARDS, checkRankUp, STAT_REWARDS, getRankForXP } from '../utils/xpSystem';

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
