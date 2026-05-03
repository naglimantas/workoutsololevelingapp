// XP thresholds per rank — Solo Leveling progression
export const RANK_THRESHOLDS = {
  E: 0,
  D: 1200,
  C: 4000,
  B: 9500,
  A: 22000,
  S: 50000,
  National: 110000,
  Monarch: 250000,
  Sovereign: 600000,
};

export const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S', 'National', 'Monarch', 'Sovereign'];

// XP awarded per quest completion
export const XP_REWARDS = {
  quest: 50,
  allQuestsBonus: 100,
  workout: 75,
  bossDefeat: 500,
  streak7: 200,
  streak30: 1000,
};

// Stat points awarded per exercise type
export const STAT_REWARDS = {
  strength: { strength: 3, endurance: 1 },
  cardio: { agility: 3, endurance: 2 },
  endurance: { endurance: 4, vitality: 1 },
  flexibility: { agility: 2, vitality: 2 },
  rest: { vitality: 3 },
  quest: { intelligence: 2 },
};

export function getRankForXP(totalXP) {
  let currentRank = 'E';
  for (const rank of RANK_ORDER) {
    if (totalXP >= RANK_THRESHOLDS[rank]) {
      currentRank = rank;
    }
  }
  return currentRank;
}

export function getNextRank(currentRank) {
  const idx = RANK_ORDER.indexOf(currentRank);
  return idx < RANK_ORDER.length - 1 ? RANK_ORDER[idx + 1] : null;
}

export function getXPForNextRank(currentRank) {
  const next = getNextRank(currentRank);
  return next ? RANK_THRESHOLDS[next] : null;
}

export function getXPProgress(totalXP, currentRank) {
  const currentThreshold = RANK_THRESHOLDS[currentRank];
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return { progress: 1, xpInRank: 0, xpNeeded: 0 };

  const nextThreshold = RANK_THRESHOLDS[nextRank];
  const xpInRank = totalXP - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progress = xpInRank / xpNeeded;
  return { progress, xpInRank, xpNeeded };
}

export function getLevelFromXP(totalXP) {
  return Math.floor(totalXP / 100) + 1;
}

export function calcXPForWorkout(exercises, durationMinutes) {
  let base = XP_REWARDS.workout;
  const durationBonus = Math.floor(durationMinutes / 10) * 10;
  return base + durationBonus + exercises.length * 5;
}

export function calcStatGains(exerciseType, intensity = 1) {
  const base = STAT_REWARDS[exerciseType] || STAT_REWARDS.quest;
  const result = {};
  for (const [stat, val] of Object.entries(base)) {
    result[stat] = Math.round(val * intensity);
  }
  return result;
}

export function checkRankUp(oldXP, newXP) {
  const oldRank = getRankForXP(oldXP);
  const newRank = getRankForXP(newXP);
  return oldRank !== newRank ? { didRankUp: true, newRank, oldRank } : { didRankUp: false };
}

export const RANK_MESSAGES = {
  D: 'The System has acknowledged your effort. A new designation has been bestowed.',
  C: 'You have surpassed the average. The shadows grow deeper around you.',
  B: 'Only the elite walk this path. The System watches you closely.',
  A: 'You stand among the chosen few. The Monarch\'s power stirs within.',
  S: 'You have ascended. The Shadow Monarch acknowledges your dominion.',
  National: 'You walk among the National Level Hunters. Nations bow before your strength.',
  Monarch: 'You have transcended mortal limits. The throne of a Monarch is yours.',
  Sovereign: 'You are the Shadow Sovereign. Reality itself trembles in your presence.',
};
