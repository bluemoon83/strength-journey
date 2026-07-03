export const profile = {
  name: 'Stephen',
  age: 43,
  gym: 'Thrive Gym, Rossendale',
  goal: 'Get stronger and lose fat',
  startingWeightKg: 89,
  targetWeightKg: '84–86',
  targetWorkouts: 36
}

export const workoutTemplates = [
  {
    name: 'Lower Body & Push',
    subtitle: "Today's workout",
    description: 'Leg power, chest press, shoulders and core.',
    mainTarget: 'Build leg and pressing strength',
    exercises: [
      { name: 'Leg Press', target: '72–77 kg', defaultWeight: '72 kg', reps: '8–10' },
      { name: 'Chest Press', target: '37 kg', defaultWeight: '37 kg', reps: '8–10' },
      { name: 'Cable Row', target: '40 kg', defaultWeight: '40 kg', reps: '8–10' },
      { name: 'Shoulder Press Machine', target: '23 kg', defaultWeight: '23 kg', reps: '8–10' },
      { name: 'Leg Curl', target: '25–30 kg', defaultWeight: '25 kg', reps: '10–12' },
      { name: 'Press-ups', target: '40 daily challenge / finisher', defaultWeight: 'Bodyweight', reps: 'comfortable' },
      { name: 'Plank', target: '35–40 seconds', defaultWeight: 'Bodyweight', reps: 'seconds' }
    ]
  },
  {
    name: 'Upper Pull & Core',
    subtitle: "Today's workout",
    description: 'Back, posture, leg extension and core.',
    mainTarget: 'Build back strength and core control',
    exercises: [
      { name: 'Leg Press', target: '77–82 kg', defaultWeight: '77 kg', reps: '8–10' },
      { name: 'Lat Pulldown', target: '40 kg', defaultWeight: '40 kg', reps: '8–10' },
      { name: 'Incline Chest Press', target: '12.5 kg', defaultWeight: '12.5 kg', reps: '8–10' },
      { name: 'Lateral Raise Machine', target: '23 kg', defaultWeight: '23 kg', reps: '10' },
      { name: 'Leg Extension', target: '45 kg', defaultWeight: '45 kg', reps: '8–10' },
      { name: 'Cable Crunch', target: '50 kg', defaultWeight: '50 kg', reps: '10–12' },
      { name: 'Press-ups', target: '40 daily challenge / finisher', defaultWeight: 'Bodyweight', reps: 'comfortable' },
      { name: 'Plank', target: '35–40 seconds', defaultWeight: 'Bodyweight', reps: 'seconds' }
    ]
  },
  {
    name: 'Full Body Strength',
    subtitle: "Today's workout",
    description: 'Full body session with a heavier leg press focus.',
    mainTarget: '82 kg Leg Press',
    exercises: [
      { name: 'Leg Press', target: '82 kg', defaultWeight: '82 kg', reps: '8–10' },
      { name: 'Chest-Supported Row', target: 'Find 8–10 hard reps', defaultWeight: '', reps: '8–10' },
      { name: 'Pec Deck', target: 'Controlled reps', defaultWeight: '', reps: '10' },
      { name: 'Shoulder Press Machine', target: '23 kg', defaultWeight: '23 kg', reps: '8–10' },
      { name: 'Leg Curl', target: '30 kg', defaultWeight: '30 kg', reps: '10–12' },
      { name: 'Press-ups', target: '40 daily challenge / finisher', defaultWeight: 'Bodyweight', reps: 'comfortable' },
      { name: 'Plank', target: '35 / 35 / 35 sec', defaultWeight: 'Bodyweight', reps: 'seconds' }
    ]
  }
]

// Fallback used before cloud data loads.
export const nextWorkout = workoutTemplates[2]

export const localSeedWorkouts = [
  {
    date: '2026-06-30',
    name: 'Lower Body & Push',
    exercises: [
      { exercise_name: 'Leg Press', weight: '68 kg', set_1: '8', set_2: '8', set_3: '8' },
      { exercise_name: 'Chest Press', weight: '37 kg', set_1: '8', set_2: '8', set_3: '7' },
      { exercise_name: 'Cable Row', weight: '40 kg', set_1: '10', set_2: '10', set_3: '9' },
      { exercise_name: 'Shoulder Press Machine', weight: '23 kg', set_1: '10', set_2: '9', set_3: '8' },
      { exercise_name: 'Leg Curl', weight: '25 kg', set_1: '12', set_2: '12', set_3: '11' }
    ]
  },
  {
    date: '2026-07-02',
    name: 'Upper Pull & Core',
    exercises: [
      { exercise_name: 'Leg Press', weight: '77 kg', set_1: '10', set_2: '10', set_3: '10' },
      { exercise_name: 'Lat Pulldown', weight: '40 kg', set_1: '8', set_2: '8', set_3: '8' },
      { exercise_name: 'Incline Chest Press', weight: '12.5 kg', set_1: '8', set_2: '8', set_3: '10' },
      { exercise_name: 'Lateral Raise Machine', weight: '23 kg', set_1: '10', set_2: '10', set_3: '10' },
      { exercise_name: 'Leg Extension', weight: '45 kg', set_1: '8', set_2: '8', set_3: '8' },
      { exercise_name: 'Cable Crunch', weight: '50 kg', set_1: '10', set_2: '10', set_3: '10' }
    ]
  }
]
