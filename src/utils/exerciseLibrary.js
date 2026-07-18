export const exerciseLibrary = {
  'Leg Press': {
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves'],
    cue: 'Keep your lower back against the pad, control the depth and avoid locking your knees.',
    alternatives: ['Hack Squat Machine', 'FreeMotion Squat', 'Goblet Squat']
  },
  'Chest Press': {
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front shoulders'],
    cue: 'Keep your shoulder blades back and press without shrugging.',
    alternatives: ['FreeMotion Chest Press', 'Incline Chest Press', 'Dumbbell Chest Press']
  },
  'Cable Row': {
    primaryMuscles: ['Mid back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Rear shoulders'],
    cue: 'Lead with your elbows and pause briefly when the handles reach you.',
    alternatives: ['Chest-Supported Row', 'FreeMotion Row', 'Seated Row Machine']
  },
  'Shoulder Press Machine': {
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps'],
    cue: 'Keep your ribs down, elbows slightly forward and avoid arching your lower back.',
    alternatives: ['FreeMotion Shoulder Press', 'Seated Dumbbell Press', 'Incline Chest Press']
  },
  'Leg Curl': {
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    cue: 'Keep your hips down and control both directions.',
    alternatives: ['Lying Leg Curl', 'FreeMotion Hamstring Curl', 'Cable Pull-Through']
  },
  'Cable Triceps Pushdown': {
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    cue: 'Keep your elbows pinned to your sides and move only your forearms.',
    alternatives: ['FreeMotion Triceps Extension', 'Dumbbell Overhead Extension', 'Assisted Dip Machine']
  },
  'Press-ups': {
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
    cue: 'Keep a straight line from shoulders to heels and lower under control.',
    alternatives: ['Incline Press-ups', 'Chest Press Machine', 'FreeMotion Chest Press']
  },
  'Plank': {
    primaryMuscles: ['Core'],
    secondaryMuscles: ['Glutes', 'Shoulders'],
    cue: 'Brace as if preparing for a punch, squeeze your glutes and keep your hips level.',
    alternatives: ['Pallof Press', 'Dead Bug', 'Ab Crunch Machine']
  },
  'Lat Pulldown': {
    primaryMuscles: ['Lats'],
    secondaryMuscles: ['Biceps', 'Upper back'],
    cue: 'Pull your elbows towards your ribs rather than pulling with your hands.',
    alternatives: ['FreeMotion High Row', 'Assisted Pull-up', 'Chest-Supported Row']
  },
  'Incline Chest Press': {
    primaryMuscles: ['Upper chest'],
    secondaryMuscles: ['Triceps', 'Front shoulders'],
    cue: 'Keep your shoulders down and use a smooth, controlled press.',
    alternatives: ['FreeMotion Incline Press', 'Chest Press Machine', 'Incline Dumbbell Press']
  },
  'Lateral Raise Machine': {
    primaryMuscles: ['Side shoulders'],
    secondaryMuscles: [],
    cue: 'Lead with your elbows and stop around shoulder height.',
    alternatives: ['Cable Lateral Raise', 'Dumbbell Lateral Raise', 'FreeMotion Lateral Raise']
  },
  'Leg Extension': {
    primaryMuscles: ['Quads'],
    secondaryMuscles: [],
    cue: 'Lift smoothly, pause briefly and avoid snapping your knees straight.',
    alternatives: ['FreeMotion Leg Extension', 'Step-ups', 'Leg Press']
  },
  'Cable Hammer Curl': {
    primaryMuscles: ['Biceps', 'Brachialis'],
    secondaryMuscles: ['Forearms'],
    cue: 'Keep your elbows still and use a neutral thumbs-up grip.',
    alternatives: ['Dumbbell Hammer Curl', 'Biceps Curl Machine', 'Cable Curl']
  },
  'Cable Crunch': {
    primaryMuscles: ['Abs'],
    secondaryMuscles: [],
    cue: 'Curl your ribs towards your hips rather than pulling with your arms.',
    alternatives: ['Ab Crunch Machine', 'Dead Bug', 'Plank']
  },
  'Chest-Supported Row': {
    primaryMuscles: ['Mid back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Rear shoulders'],
    cue: 'Keep your chest on the pad and squeeze your shoulder blades together.',
    alternatives: ['FreeMotion Row', 'Cable Row', 'Seated Row Machine']
  },
  'Pec Deck': {
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front shoulders'],
    cue: 'Keep a soft bend in your elbows and avoid overstretching.',
    alternatives: ['FreeMotion Fly', 'Chest Press Machine', 'Dumbbell Fly']
  },
  'FreeMotion Cable Pull-Through': {
    primaryMuscles: ['Glutes', 'Hamstrings'],
    secondaryMuscles: ['Lower back', 'Core'],
    cue: 'Push your hips backwards, then squeeze your glutes to stand tall.',
    alternatives: ['Dumbbell Romanian Deadlift', 'Glute Drive Machine', 'Leg Curl']
  }
}

export function exerciseDetails(exercise) {
  const library = exerciseLibrary[exercise.name] || {}
  return {
    primaryMuscles: exercise.primaryMuscles || library.primaryMuscles || [],
    secondaryMuscles: exercise.secondaryMuscles || library.secondaryMuscles || [],
    cue: exercise.cue || library.cue || '',
    alternatives: exercise.alternatives || library.alternatives || []
  }
}

export function swapExercise(exercise, replacementName) {
  const replacement = exerciseLibrary[replacementName] || {}
  return {
    ...exercise,
    name: replacementName,
    originalName: exercise.originalName || exercise.name,
    primaryMuscles: replacement.primaryMuscles || [],
    secondaryMuscles: replacement.secondaryMuscles || [],
    cue: replacement.cue || '',
    alternatives: replacement.alternatives || [],
    isSwap: true,
    isComplete: false,
    isCollapsed: false,
    difficulty: '',
    sets: exercise.sets.map(set => ({ ...set, reps: '' }))
  }
}
