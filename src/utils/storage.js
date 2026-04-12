import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  HUNTER_PROFILE: 'hunter_profile',
  DAILY_QUESTS: 'daily_quests',
  WORKOUT_HISTORY: 'workout_history',
  BOSS_BATTLES: 'boss_battles',
  PERSONAL_RECORDS: 'personal_records',
  NOTIFICATION_SETTINGS: 'notification_settings',
  CUSTOM_WORKOUTS: 'custom_workouts',
  LEADERBOARD: 'leaderboard',
  WEEKLY_STATS: 'weekly_stats',
};

// Hunter Profile
export async function getHunterProfile() {
  try {
    const data = await AsyncStorage.getItem(KEYS.HUNTER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveHunterProfile(profile) {
  await AsyncStorage.setItem(KEYS.HUNTER_PROFILE, JSON.stringify(profile));
}

export function createDefaultProfile({ name, age, bodyWeight, fitnessLevel }) {
  return {
    name,
    age: parseInt(age),
    bodyWeight: parseFloat(bodyWeight),
    fitnessLevel,
    level: 1,
    xp: 0,
    rank: 'E',
    stats: {
      strength: 10,
      agility: 10,
      endurance: 10,
      intelligence: 10,
      vitality: 10,
    },
    streak: 0,
    totalWorkouts: 0,
    lastWorkoutDate: null,
    lastQuestDate: null,
    titles: [],
    createdAt: new Date().toISOString(),
  };
}

// Daily Quests
export function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function getDailyQuests(dateKey) {
  const key = `${KEYS.DAILY_QUESTS}_${dateKey || getTodayKey()}`;
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveDailyQuests(quests, dateKey) {
  const key = `${KEYS.DAILY_QUESTS}_${dateKey || getTodayKey()}`;
  await AsyncStorage.setItem(key, JSON.stringify(quests));
}

// Workout History
export async function getWorkoutHistory() {
  try {
    const data = await AsyncStorage.getItem(KEYS.WORKOUT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addWorkoutToHistory(session) {
  const history = await getWorkoutHistory();
  history.unshift({ ...session, id: Date.now().toString(), date: new Date().toISOString() });
  // Keep last 200 workouts
  const trimmed = history.slice(0, 200);
  await AsyncStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(trimmed));
  return trimmed;
}

// Boss Battles
export async function getBossData() {
  try {
    const data = await AsyncStorage.getItem(KEYS.BOSS_BATTLES);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveBossData(bossData) {
  await AsyncStorage.setItem(KEYS.BOSS_BATTLES, JSON.stringify(bossData));
}

export function getWeekStartDate() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Personal Records
export async function getPersonalRecords() {
  try {
    const data = await AsyncStorage.getItem(KEYS.PERSONAL_RECORDS);
    return data ? JSON.parse(data) : { exercises: {}, weekly: [], streaks: [] };
  } catch {
    return { exercises: {}, weekly: [], streaks: [] };
  }
}

export async function updatePersonalRecord(exerciseName, value, unit) {
  const records = await getPersonalRecords();
  const existing = records.exercises[exerciseName];
  if (!existing || value > existing.value) {
    records.exercises[exerciseName] = { value, unit, date: new Date().toISOString() };
    await AsyncStorage.setItem(KEYS.PERSONAL_RECORDS, JSON.stringify(records));
    return true;
  }
  return false;
}

// Notification Settings
export async function getNotificationSettings() {
  try {
    const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
    return data ? JSON.parse(data) : { enabled: true, morningHour: 8, morningMinute: 0 };
  } catch {
    return { enabled: true, morningHour: 8, morningMinute: 0 };
  }
}

export async function saveNotificationSettings(settings) {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
}

// Custom Workouts
export async function getCustomWorkouts() {
  try {
    const data = await AsyncStorage.getItem(KEYS.CUSTOM_WORKOUTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveCustomWorkout(workout) {
  const workouts = await getCustomWorkouts();
  const idx = workouts.findIndex(w => w.id === workout.id);
  if (idx >= 0) {
    workouts[idx] = workout;
  } else {
    workouts.unshift(workout);
  }
  await AsyncStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(workouts));
}

// Weekly Stats for charts
export async function getWeeklyStats() {
  try {
    const data = await AsyncStorage.getItem(KEYS.WEEKLY_STATS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function recordWeeklySnapshot(profile) {
  const stats = await getWeeklyStats();
  const today = getTodayKey();
  const snapshot = {
    date: today,
    xp: profile.xp,
    stats: { ...profile.stats },
    workouts: profile.totalWorkouts,
    streak: profile.streak,
  };
  // Only one snapshot per day
  const filtered = stats.filter(s => s.date !== today);
  filtered.push(snapshot);
  const recent = filtered.slice(-90); // keep 90 days
  await AsyncStorage.setItem(KEYS.WEEKLY_STATS, JSON.stringify(recent));
}

// Leaderboard (local personal records)
export async function getLeaderboard() {
  try {
    const data = await AsyncStorage.getItem(KEYS.LEADERBOARD);
    return data ? JSON.parse(data) : { entries: [] };
  } catch {
    return { entries: [] };
  }
}

export async function updateLeaderboard(category, value, label) {
  const lb = await getLeaderboard();
  const entry = { category, value, label, date: new Date().toISOString() };
  const existing = lb.entries.find(e => e.category === category);
  if (!existing || value > existing.value) {
    lb.entries = lb.entries.filter(e => e.category !== category);
    lb.entries.push(entry);
    await AsyncStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(lb));
  }
}

// Clear all data (for reset)
export async function clearAllData() {
  await AsyncStorage.clear();
}
