export const WORKOUT_PLANS = [
  // Strength Plans
  {
    id: 'wp1',
    name: 'Shadow Strength — Upper Body',
    category: 'strength',
    rank: 'E',
    duration: 30,
    description: 'Build foundational upper body power through the Shadow Monarch\'s core regimen.',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 20, unit: 'reps', rest: 60, type: 'strength' },
      { name: 'Diamond Push-ups', sets: 3, reps: 15, unit: 'reps', rest: 60, type: 'strength' },
      { name: 'Pike Push-ups', sets: 3, reps: 12, unit: 'reps', rest: 60, type: 'strength' },
      { name: 'Tricep Dips', sets: 3, reps: 15, unit: 'reps', rest: 60, type: 'strength' },
      { name: 'Plank', sets: 3, reps: 30, unit: 'seconds', rest: 45, type: 'endurance' },
    ],
  },
  {
    id: 'wp2',
    name: 'Shadow Strength — Lower Body',
    category: 'strength',
    rank: 'E',
    duration: 35,
    description: 'Forge legs of iron through Jin-Woo\'s foundational lower body protocol.',
    exercises: [
      { name: 'Bodyweight Squats', sets: 4, reps: 30, unit: 'reps', rest: 60, type: 'strength' },
      { name: 'Lunges', sets: 3, reps: 20, unit: 'reps', rest: 60, type: 'strength' },
      { name: 'Glute Bridges', sets: 3, reps: 25, unit: 'reps', rest: 45, type: 'strength' },
      { name: 'Calf Raises', sets: 4, reps: 40, unit: 'reps', rest: 30, type: 'strength' },
      { name: 'Jump Squats', sets: 3, reps: 15, unit: 'reps', rest: 90, type: 'cardio' },
    ],
  },
  {
    id: 'wp3',
    name: 'Monarch\'s Power — Full Body',
    category: 'strength',
    rank: 'D',
    duration: 45,
    description: 'A complete full-body circuit designed for D-rank hunters pushing toward C.',
    exercises: [
      { name: 'Pull-ups', sets: 4, reps: 10, unit: 'reps', rest: 90, type: 'strength' },
      { name: 'Push-ups', sets: 4, reps: 25, unit: 'reps', rest: 60, type: 'strength' },
      { name: 'Squats', sets: 4, reps: 30, unit: 'reps', rest: 60, type: 'strength' },
      { name: 'Dips', sets: 3, reps: 20, unit: 'reps', rest: 60, type: 'strength' },
      { name: 'Burpees', sets: 3, reps: 15, unit: 'reps', rest: 90, type: 'cardio' },
      { name: 'Plank', sets: 3, reps: 60, unit: 'seconds', rest: 45, type: 'endurance' },
    ],
  },
  {
    id: 'wp4',
    name: 'Shadow Sovereign — Elite Strength',
    category: 'strength',
    rank: 'S',
    duration: 70,
    description: 'The ultimate strength protocol. For S-rank hunters only.',
    exercises: [
      { name: 'Muscle-ups', sets: 5, reps: 8, unit: 'reps', rest: 120, type: 'strength' },
      { name: 'One-arm Push-up Practice', sets: 4, reps: 10, unit: 'reps', rest: 120, type: 'strength' },
      { name: 'Pistol Squats', sets: 4, reps: 10, unit: 'reps', rest: 90, type: 'strength' },
      { name: 'Handstand Push-ups', sets: 3, reps: 8, unit: 'reps', rest: 120, type: 'strength' },
      { name: 'L-sit Hold', sets: 3, reps: 20, unit: 'seconds', rest: 60, type: 'endurance' },
      { name: 'Explosive Burpees', sets: 4, reps: 20, unit: 'reps', rest: 90, type: 'cardio' },
    ],
  },
  // Cardio Plans
  {
    id: 'wp5',
    name: 'Agility Protocol — Sprint Training',
    category: 'cardio',
    rank: 'D',
    duration: 40,
    description: 'Build explosive speed and agility through interval sprint work.',
    exercises: [
      { name: 'Warm-up Jog', sets: 1, reps: 5, unit: 'minutes', rest: 0, type: 'cardio' },
      { name: '100m Sprint', sets: 8, reps: 1, unit: 'effort', rest: 90, type: 'cardio' },
      { name: 'High Knees', sets: 4, reps: 30, unit: 'seconds', rest: 30, type: 'cardio' },
      { name: 'Lateral Shuffles', sets: 4, reps: 30, unit: 'seconds', rest: 30, type: 'cardio' },
      { name: 'Cool-down Walk', sets: 1, reps: 5, unit: 'minutes', rest: 0, type: 'cardio' },
    ],
  },
  {
    id: 'wp6',
    name: 'Shadow March — Distance Run',
    category: 'cardio',
    rank: 'C',
    duration: 60,
    description: 'Test your endurance with a sustained long-distance run.',
    exercises: [
      { name: 'Warm-up Stretch', sets: 1, reps: 5, unit: 'minutes', rest: 0, type: 'flexibility' },
      { name: 'Steady-state Run', sets: 1, reps: 45, unit: 'minutes', rest: 0, type: 'cardio' },
      { name: 'Cool-down Walk', sets: 1, reps: 5, unit: 'minutes', rest: 0, type: 'cardio' },
      { name: 'Calf Stretches', sets: 1, reps: 5, unit: 'minutes', rest: 0, type: 'flexibility' },
    ],
  },
  // Endurance
  {
    id: 'wp7',
    name: 'Iron Wall — Core Endurance',
    category: 'endurance',
    rank: 'D',
    duration: 35,
    description: 'Forge a core of absolute endurance with high-volume bodyweight work.',
    exercises: [
      { name: 'Sit-ups', sets: 5, reps: 40, unit: 'reps', rest: 30, type: 'endurance' },
      { name: 'Leg Raises', sets: 5, reps: 25, unit: 'reps', rest: 30, type: 'endurance' },
      { name: 'Bicycle Crunches', sets: 4, reps: 30, unit: 'reps', rest: 30, type: 'endurance' },
      { name: 'Plank', sets: 4, reps: 60, unit: 'seconds', rest: 45, type: 'endurance' },
      { name: 'Side Plank', sets: 3, reps: 45, unit: 'seconds', rest: 30, type: 'endurance' },
      { name: 'Mountain Climbers', sets: 3, reps: 40, unit: 'reps', rest: 45, type: 'cardio' },
    ],
  },
  // Flexibility
  {
    id: 'wp8',
    name: 'Shadow Flow — Mobility',
    category: 'flexibility',
    rank: 'E',
    duration: 25,
    description: 'Maintain peak movement quality through focused mobility work.',
    exercises: [
      { name: 'Dynamic Warm-up', sets: 1, reps: 5, unit: 'minutes', rest: 0, type: 'flexibility' },
      { name: 'Hip Flexor Stretch', sets: 3, reps: 60, unit: 'seconds', rest: 15, type: 'flexibility' },
      { name: 'Hamstring Stretch', sets: 3, reps: 45, unit: 'seconds', rest: 15, type: 'flexibility' },
      { name: 'Shoulder Circles', sets: 2, reps: 20, unit: 'reps', rest: 15, type: 'flexibility' },
      { name: 'Spinal Rotation', sets: 3, reps: 30, unit: 'seconds', rest: 15, type: 'flexibility' },
      { name: 'Child\'s Pose', sets: 2, reps: 60, unit: 'seconds', rest: 0, type: 'flexibility' },
    ],
  },
];

// Boss Battle configurations
export const BOSS_BATTLES = [
  {
    id: 'boss1',
    name: 'Ant King\'s Gauntlet',
    description: 'Face the wrath of the Ant King. 500 reps stand between you and victory.',
    difficulty: 'S',
    xpReward: 500,
    titleReward: 'Ant Slayer',
    timeLimit: 3600,
    exercises: [
      { name: 'Push-ups', totalReps: 150, type: 'strength' },
      { name: 'Squats', totalReps: 150, type: 'strength' },
      { name: 'Burpees', totalReps: 100, type: 'cardio' },
      { name: 'Sit-ups', totalReps: 100, type: 'endurance' },
    ],
    bossHP: 500,
    lore: 'The Ant King descended upon you with overwhelming force. Only 500 reps can drive it back into the shadows.',
  },
  {
    id: 'boss2',
    name: 'Demon Castle Siege',
    description: 'Storm the Demon Castle. Every rep shatters another gate.',
    difficulty: 'A',
    xpReward: 400,
    titleReward: 'Castle Breaker',
    timeLimit: 2700,
    exercises: [
      { name: 'Pull-ups', totalReps: 80, type: 'strength' },
      { name: 'Dips', totalReps: 100, type: 'strength' },
      { name: 'Jump Squats', totalReps: 80, type: 'cardio' },
      { name: 'Plank', totalReps: 300, type: 'endurance', unit: 'seconds' },
    ],
    bossHP: 560,
    lore: 'The Demon Castle looms before you. Its gates will not yield to the weak.',
  },
  {
    id: 'boss3',
    name: 'Shadow Soldier Trial',
    description: 'Prove your worth to command shadow soldiers. A foundational test.',
    difficulty: 'C',
    xpReward: 300,
    titleReward: 'Shadow Commander',
    timeLimit: 2400,
    exercises: [
      { name: 'Push-ups', totalReps: 100, type: 'strength' },
      { name: 'Squats', totalReps: 100, type: 'strength' },
      { name: 'Sit-ups', totalReps: 100, type: 'endurance' },
    ],
    bossHP: 300,
    lore: 'The shadow soldiers await a worthy commander. Prove yourself worthy of their loyalty.',
  },
  {
    id: 'boss4',
    name: 'Ice Elf Queen\'s Fury',
    description: 'Withstand the Ice Elf Queen\'s relentless assault. Speed is your only salvation.',
    difficulty: 'S',
    xpReward: 600,
    titleReward: 'Frost Conqueror',
    timeLimit: 3000,
    exercises: [
      { name: 'High Knees', totalReps: 200, type: 'cardio' },
      { name: 'Burpees', totalReps: 150, type: 'cardio' },
      { name: 'Mountain Climbers', totalReps: 150, type: 'cardio' },
      { name: 'Jump Squats', totalReps: 100, type: 'strength' },
    ],
    bossHP: 600,
    lore: 'The Ice Elf Queen moves with devastating speed. Match her pace or be consumed by frost.',
  },
];

// Motivational quotes from Sung Jin-Woo
export const JINWOO_QUOTES = [
  '"I alone am the exception."',
  '"The strong prey on the weak. That is the law of nature."',
  '"Getting stronger is the only option."',
  '"Rise. And prove your worth to the System."',
  '"Even if no one else acknowledges it, I will keep moving forward."',
  '"The day I stop growing is the day I die."',
  '"Fear is for those who have something to lose. I have only goals."',
  '"Shadows never retreat."',
  '"Power is everything. Earn it."',
  '"The System rewards those who do not falter."',
];

export function getRandomQuote() {
  return JINWOO_QUOTES[Math.floor(Math.random() * JINWOO_QUOTES.length)];
}

export function getWeeklyBoss() {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return BOSS_BATTLES[week % BOSS_BATTLES.length];
}

export const CATEGORY_LABELS = {
  strength: 'Strength',
  cardio: 'Cardio',
  endurance: 'Endurance',
  flexibility: 'Flexibility',
};
