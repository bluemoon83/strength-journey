export const profile = {
  name: 'Stephen',
  age: 43,
  gym: 'Thrive Gym, Rossendale',
  goal: 'Get stronger and lose fat',
  startingWeightKg: 89,
  targetWeightKg: '84–86',
  targetWorkouts: 36
}

export const nextWorkout = {
  name: 'Workout C',
  subtitle: 'Full Body Strength',
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

export const localSeedWorkouts = [
  {
    date: '2026-06-30',
    name: 'Workout A',
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
    name: 'Workout B',
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
