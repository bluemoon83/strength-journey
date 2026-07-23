export const profile = {
  name: 'Stephen',
  age: 43,
  gym: 'Thrive Gym, Rossendale',
  goal: 'Get stronger, build muscle and lose fat',
  startingWeightKg: 89,
  targetWeightKg: '84–86',
  targetWorkouts: 36
}

const equipmentOptions = ['Machine', 'Dumbbells', 'Cable', 'Bodyweight']

export const workoutTemplates = [
  {
    name: 'Lower Body & Push',
    subtitle: "Today's workout",
    description: 'Machine-first leg, chest, shoulders and triceps session.',
    mainTarget: 'Build leg and pressing strength',
    exercises: [
      { name: 'Leg Press', type: 'strength', equipment: 'Machine', equipmentOptions, target: 'Progress from your previous workout', defaultWeight: '77 kg', reps: '8–10', sets: 3, cue: 'Keep your lower back against the pad and avoid locking your knees.', alternatives: ['Hack Squat Machine', 'FreeMotion Squat'] },
      { name: 'Chest Press', type: 'strength', equipment: 'Machine', equipmentOptions, target: 'Controlled 8–10 reps', defaultWeight: '37 kg', reps: '8–10', sets: 3, cue: 'Keep your shoulder blades back and press without shrugging.', alternatives: ['FreeMotion Chest Press', 'Dumbbell Chest Press'] },
      { name: 'Cable Row', type: 'strength', equipment: 'Cable', equipmentOptions, target: 'Controlled 8–10 reps', defaultWeight: '45 kg', reps: '8–10', sets: 3, cue: 'Lead with your elbows and pause briefly when the handles reach you.', alternatives: ['Chest-Supported Row', 'FreeMotion Row'] },
      { name: 'Shoulder Press Machine', type: 'strength', equipment: 'Machine', equipmentOptions, target: 'Controlled 8–10 reps', defaultWeight: '27 kg', reps: '8–10', sets: 3, cue: 'Keep elbows slightly forward and avoid arching your lower back.', alternatives: ['FreeMotion Shoulder Press', 'Seated Dumbbell Press'] },
      { name: 'Leg Curl', type: 'strength', equipment: 'Machine', equipmentOptions, target: '10–12 reps', defaultWeight: '41 kg', reps: '10–12', sets: 3, cue: 'Keep your hips down and control the return.', alternatives: ['Lying Leg Curl', 'FreeMotion Hamstring Curl'] },
      { name: 'Cable Triceps Pushdown', type: 'strength', equipment: 'Cable', equipmentOptions, target: 'Find a comfortable starting weight', defaultWeight: '', reps: '10–12', sets: 3, cue: 'Keep your elbows pinned to your sides and move only the forearms.', alternatives: ['FreeMotion Triceps Extension', 'Dumbbell Overhead Extension'] },
      { name: 'Press-ups', type: 'target-total', equipment: 'Bodyweight', equipmentOptions, target: '45 total reps', targetTotal: 45, defaultWeight: 'Bodyweight', reps: 'total reps', startingSets: 3, cue: 'Keep a straight line from shoulders to heels.', alternatives: ['Incline Press-ups', 'Chest Press Machine'] },
      { name: 'Plank', type: 'timed', equipment: 'Bodyweight', equipmentOptions, target: '40–45 seconds', defaultWeight: 'Bodyweight', reps: 'seconds', sets: 3, cue: 'Brace as if preparing for a punch and keep your hips level.', alternatives: ['Pallof Press', 'Dead Bug'] }
    ]
  },
  {
    name: 'Upper Pull & Core',
    subtitle: "Today's workout",
    description: 'Back, legs, arms and core with machine and cable work.',
    mainTarget: 'Build back strength and core control',
    exercises: [
      { name: 'Leg Press', type: 'strength', equipment: 'Machine', equipmentOptions, target: 'Progress from your previous workout', defaultWeight: '82 kg', reps: '8–10', sets: 3, cue: 'Keep your lower back against the pad and use a controlled depth.', alternatives: ['Hack Squat Machine', 'FreeMotion Squat'] },
      { name: 'Lat Pulldown', type: 'strength', equipment: 'Cable', equipmentOptions, target: '8–10 reps', defaultWeight: '40 kg', reps: '8–10', sets: 3, cue: 'Pull your elbows towards your ribs rather than pulling with your hands.', alternatives: ['FreeMotion High Row', 'Assisted Pull-up'] },
      { name: 'Incline Chest Press', type: 'strength', equipment: 'Machine', equipmentOptions, target: '8–10 reps', defaultWeight: '12.5 kg', reps: '8–10', sets: 3, cue: 'Keep your shoulders down and use a smooth press.', alternatives: ['FreeMotion Incline Press', 'Incline Dumbbell Press'] },
      { name: 'Lateral Raise Machine', type: 'strength', equipment: 'Machine', equipmentOptions, target: '10–12 reps', defaultWeight: '23 kg', reps: '10–12', sets: 3, cue: 'Lead with your elbows and stop around shoulder height.', alternatives: ['Cable Lateral Raise', 'Dumbbell Lateral Raise'] },
      { name: 'Leg Extension', type: 'strength', equipment: 'Machine', equipmentOptions, target: '10–12 reps', defaultWeight: '45 kg', reps: '10–12', sets: 3, cue: 'Lift smoothly and avoid snapping your knees straight.', alternatives: ['FreeMotion Leg Extension', 'Step-ups'] },
      { name: 'Cable Hammer Curl', type: 'strength', equipment: 'Cable', equipmentOptions, target: 'Find a comfortable starting weight', defaultWeight: '', reps: '10–12', sets: 3, cue: 'Keep elbows still and use a neutral thumbs-up grip.', alternatives: ['Dumbbell Hammer Curl', 'Biceps Curl Machine'] },
      { name: 'Ab Crunch Machine', type: 'strength', equipment: 'Machine', equipmentOptions, target: '10–12 controlled reps', defaultWeight: '', reps: '10–12', sets: 3, cue: 'Curl your ribs towards your hips while keeping your hips still.', alternatives: ['Dead Bug', 'Plank'] },
      { name: 'Pallof Press', type: 'strength', equipment: 'Cable', equipmentOptions, target: '10–12 controlled reps per side', defaultWeight: '', reps: '10–12 each side', sets: 3, isOptional: true, cue: 'Brace your core and press straight ahead without allowing your torso to rotate.', alternatives: ['Dead Bug', 'Plank'] },
      { name: 'Plank', type: 'timed', equipment: 'Bodyweight', equipmentOptions, target: '40 seconds', defaultWeight: 'Bodyweight', reps: 'seconds', sets: 3, cue: 'Brace your core and breathe normally.', alternatives: ['Pallof Press', 'Dead Bug'] }
    ]
  },
  {
    name: 'Full Body Strength',
    subtitle: "Today's workout",
    description: 'Full-body machine session with posterior-chain work.',
    mainTarget: 'Balanced full-body progression',
    exercises: [
      { name: 'Leg Press', type: 'strength', equipment: 'Machine', equipmentOptions, target: 'Progress from your previous workout', defaultWeight: '86 kg', reps: '8–10', sets: 3, cue: 'Use a controlled depth and keep your knees tracking over your feet.', alternatives: ['Hack Squat Machine', 'FreeMotion Squat'] },
      { name: 'Chest-Supported Row', type: 'strength', equipment: 'Machine', equipmentOptions, target: '8–10 hard reps', defaultWeight: '41 kg', reps: '8–10', sets: 3, cue: 'Keep your chest on the pad and squeeze your shoulder blades together.', alternatives: ['FreeMotion Row', 'Cable Row'] },
      { name: 'Pec Deck', type: 'strength', equipment: 'Machine', equipmentOptions, target: 'Controlled 10–12 reps', defaultWeight: '27 kg', reps: '10–12', sets: 3, cue: 'Keep a soft bend in your elbows and avoid overstretching.', alternatives: ['FreeMotion Fly', 'Dumbbell Fly'] },
      { name: 'FreeMotion Cable Pull-Through', type: 'strength', equipment: 'Cable', equipmentOptions, target: 'Learn the movement with a light load', defaultWeight: '', reps: '10–12', sets: 3, cue: 'Push your hips backwards, then squeeze your glutes to stand tall.', alternatives: ['Dumbbell Romanian Deadlift', 'Glute Drive Machine'] },
      { name: 'Shoulder Press Machine', type: 'strength', equipment: 'Machine', equipmentOptions, target: '8–10 reps', defaultWeight: '27 kg', reps: '8–10', sets: 3, cue: 'Keep your ribs down and avoid locking your elbows.', alternatives: ['FreeMotion Shoulder Press', 'Seated Dumbbell Press'] },
      { name: 'Leg Curl', type: 'strength', equipment: 'Machine', equipmentOptions, target: '10–12 reps', defaultWeight: '41 kg', reps: '10–12', sets: 3, cue: 'Control both directions and keep your hips still.', alternatives: ['Lying Leg Curl', 'FreeMotion Hamstring Curl'] },
      { name: 'Press-ups', type: 'target-total', equipment: 'Bodyweight', equipmentOptions, target: '45 total reps', targetTotal: 45, defaultWeight: 'Bodyweight', reps: 'total reps', startingSets: 3, cue: 'Use as many sets as needed while keeping clean form.', alternatives: ['Incline Press-ups', 'Chest Press Machine'] },
      { name: 'Plank', type: 'timed', equipment: 'Bodyweight', equipmentOptions, target: '40–45 seconds', defaultWeight: 'Bodyweight', reps: 'seconds', sets: 3, cue: 'Keep your hips level and squeeze your glutes.', alternatives: ['Pallof Press', 'Dead Bug'] }
    ]
  }
]

export const nextWorkout = workoutTemplates[2]

export const localSeedWorkouts = [
  {
    date: '2026-06-30',
    name: 'Lower Body & Push',
    exercises: [
      { exercise_name: 'Leg Press', weight: '68 kg', set_1: '8', set_2: '8', set_3: '8', equipment: 'Machine' },
      { exercise_name: 'Chest Press', weight: '37 kg', set_1: '8', set_2: '8', set_3: '7', equipment: 'Machine' },
      { exercise_name: 'Cable Row', weight: '40 kg', set_1: '10', set_2: '10', set_3: '9', equipment: 'Cable' },
      { exercise_name: 'Shoulder Press Machine', weight: '23 kg', set_1: '10', set_2: '9', set_3: '8', equipment: 'Machine' },
      { exercise_name: 'Leg Curl', weight: '25 kg', set_1: '12', set_2: '12', set_3: '11', equipment: 'Machine' }
    ]
  },
  {
    date: '2026-07-02',
    name: 'Upper Pull & Core',
    exercises: [
      { exercise_name: 'Leg Press', weight: '77 kg', set_1: '10', set_2: '10', set_3: '10', equipment: 'Machine' },
      { exercise_name: 'Lat Pulldown', weight: '40 kg', set_1: '8', set_2: '8', set_3: '8', equipment: 'Cable' },
      { exercise_name: 'Incline Chest Press', weight: '12.5 kg', set_1: '8', set_2: '8', set_3: '10', equipment: 'Machine' },
      { exercise_name: 'Lateral Raise Machine', weight: '23 kg', set_1: '10', set_2: '10', set_3: '10', equipment: 'Machine' },
      { exercise_name: 'Leg Extension', weight: '45 kg', set_1: '8', set_2: '8', set_3: '8', equipment: 'Machine' },
      { exercise_name: 'Cable Crunch', weight: '50 kg', set_1: '10', set_2: '10', set_3: '10', equipment: 'Cable' }
    ]
  }
]
