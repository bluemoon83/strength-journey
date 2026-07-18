const demo = query => ({ demoQuery: query })

export const exerciseLibrary = {
  'Leg Press': {
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves'],
    cue: 'Keep your lower back against the pad, control the depth and avoid locking your knees.',
    alternatives: ['Hack Squat Machine', 'FreeMotion Squat', 'Goblet Squat'],
    demoQuery: 'leg press machine exercise demonstration'
  },
  'Chest Press': {
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front shoulders'],
    cue: 'Keep your shoulder blades back and press without shrugging.',
    alternatives: ['FreeMotion Chest Press', 'Incline Chest Press', 'Dumbbell Chest Press'],
    demoQuery: 'chest press machine exercise demonstration'
  },
  'Cable Row': {
    primaryMuscles: ['Mid back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Rear shoulders'],
    cue: 'Lead with your elbows and pause briefly when the handles reach you.',
    alternatives: ['Chest-Supported Row', 'FreeMotion Row', 'Seated Row Machine'],
    demoQuery: 'seated cable row exercise demonstration'
  },
  'Shoulder Press Machine': {
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps'],
    cue: 'Keep your ribs down, elbows slightly forward and avoid arching your lower back.',
    alternatives: ['FreeMotion Shoulder Press', 'Seated Dumbbell Press', 'Incline Chest Press'],
    demoQuery: 'shoulder press machine exercise demonstration'
  },
  'Leg Curl': {
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    cue: 'Keep your hips down and control both directions.',
    alternatives: ['Lying Leg Curl', 'FreeMotion Hamstring Curl', 'Cable Pull-Through'],
    demoQuery: 'seated leg curl machine exercise demonstration'
  },
  'Cable Triceps Pushdown': {
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    cue: 'Keep your elbows pinned to your sides and move only your forearms.',
    alternatives: ['FreeMotion Triceps Extension', 'Dumbbell Overhead Extension', 'Assisted Dip Machine'],
    demoQuery: 'cable triceps pushdown exercise demonstration'
  },
  'Press-ups': {
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
    cue: 'Keep a straight line from shoulders to heels and lower under control.',
    alternatives: ['Incline Press-ups', 'Chest Press Machine', 'FreeMotion Chest Press'],
    demoQuery: 'press up push up exercise demonstration'
  },
  'Plank': {
    primaryMuscles: ['Core'],
    secondaryMuscles: ['Glutes', 'Shoulders'],
    cue: 'Brace as if preparing for a punch, squeeze your glutes and keep your hips level.',
    alternatives: ['Pallof Press', 'Dead Bug', 'Ab Crunch Machine'],
    demoQuery: 'forearm plank exercise demonstration'
  },
  'Lat Pulldown': {
    primaryMuscles: ['Lats'],
    secondaryMuscles: ['Biceps', 'Upper back'],
    cue: 'Pull your elbows towards your ribs rather than pulling with your hands.',
    alternatives: ['FreeMotion High Row', 'Assisted Pull-up', 'Chest-Supported Row'],
    demoQuery: 'lat pulldown exercise demonstration'
  },
  'Incline Chest Press': {
    primaryMuscles: ['Upper chest'],
    secondaryMuscles: ['Triceps', 'Front shoulders'],
    cue: 'Keep your shoulders down and use a smooth, controlled press.',
    alternatives: ['FreeMotion Incline Press', 'Chest Press Machine', 'Incline Dumbbell Press'],
    demoQuery: 'incline chest press machine exercise demonstration'
  },
  'Lateral Raise Machine': {
    primaryMuscles: ['Side shoulders'],
    secondaryMuscles: [],
    cue: 'Lead with your elbows and stop around shoulder height.',
    alternatives: ['Cable Lateral Raise', 'Dumbbell Lateral Raise', 'FreeMotion Lateral Raise'],
    demoQuery: 'lateral raise machine exercise demonstration'
  },
  'Leg Extension': {
    primaryMuscles: ['Quads'],
    secondaryMuscles: [],
    cue: 'Lift smoothly, pause briefly and avoid snapping your knees straight.',
    alternatives: ['FreeMotion Leg Extension', 'Step-ups', 'Leg Press'],
    demoQuery: 'leg extension machine exercise demonstration'
  },
  'Cable Hammer Curl': {
    primaryMuscles: ['Biceps', 'Brachialis'],
    secondaryMuscles: ['Forearms'],
    cue: 'Keep your elbows still and use a neutral thumbs-up grip.',
    alternatives: ['Dumbbell Hammer Curl', 'Biceps Curl Machine', 'Cable Curl'],
    demoQuery: 'rope cable hammer curl exercise demonstration'
  },
  'Cable Crunch': {
    primaryMuscles: ['Abs'],
    secondaryMuscles: [],
    cue: 'Curl your ribs towards your hips rather than pulling with your arms.',
    alternatives: ['Ab Crunch Machine', 'Dead Bug', 'Plank'],
    demoQuery: 'kneeling cable crunch exercise demonstration'
  },
  'Chest-Supported Row': {
    primaryMuscles: ['Mid back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Rear shoulders'],
    cue: 'Keep your chest on the pad and squeeze your shoulder blades together.',
    alternatives: ['FreeMotion Row', 'Cable Row', 'Seated Row Machine'],
    demoQuery: 'chest supported row machine exercise demonstration'
  },
  'Pec Deck': {
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front shoulders'],
    cue: 'Keep a soft bend in your elbows and avoid overstretching.',
    alternatives: ['FreeMotion Fly', 'Chest Press Machine', 'Dumbbell Fly'],
    demoQuery: 'pec deck machine exercise demonstration'
  },
  'FreeMotion Cable Pull-Through': {
    primaryMuscles: ['Glutes', 'Hamstrings'],
    secondaryMuscles: ['Lower back', 'Core'],
    cue: 'Push your hips backwards, then squeeze your glutes to stand tall.',
    alternatives: ['Dumbbell Romanian Deadlift', 'Glute Drive Machine', 'Leg Curl'],
    demoQuery: 'cable pull through exercise demonstration'
  },

  'Hack Squat Machine': demo('hack squat machine exercise demonstration'),
  'FreeMotion Squat': demo('freemotion cable squat exercise demonstration'),
  'Goblet Squat': demo('goblet squat exercise demonstration'),
  'FreeMotion Chest Press': demo('freemotion cable chest press exercise demonstration'),
  'Dumbbell Chest Press': demo('dumbbell chest press exercise demonstration'),
  'FreeMotion Row': demo('freemotion cable row exercise demonstration'),
  'Seated Row Machine': demo('seated row machine exercise demonstration'),
  'FreeMotion Shoulder Press': demo('freemotion cable shoulder press exercise demonstration'),
  'Seated Dumbbell Press': demo('seated dumbbell shoulder press exercise demonstration'),
  'Lying Leg Curl': demo('lying leg curl machine exercise demonstration'),
  'FreeMotion Hamstring Curl': demo('freemotion cable hamstring curl demonstration'),
  'Cable Pull-Through': demo('cable pull through exercise demonstration'),
  'FreeMotion Triceps Extension': demo('freemotion cable triceps extension demonstration'),
  'Dumbbell Overhead Extension': demo('dumbbell overhead triceps extension demonstration'),
  'Assisted Dip Machine': demo('assisted dip machine exercise demonstration'),
  'Incline Press-ups': demo('incline push up exercise demonstration'),
  'Chest Press Machine': demo('chest press machine exercise demonstration'),
  'Pallof Press': demo('pallof press exercise demonstration'),
  'Dead Bug': demo('dead bug core exercise demonstration'),
  'Ab Crunch Machine': demo('ab crunch machine exercise demonstration'),
  'FreeMotion High Row': demo('freemotion high row exercise demonstration'),
  'Assisted Pull-up': demo('assisted pull up machine demonstration'),
  'FreeMotion Incline Press': demo('freemotion incline chest press demonstration'),
  'Incline Dumbbell Press': demo('incline dumbbell press exercise demonstration'),
  'Cable Lateral Raise': demo('single arm cable lateral raise demonstration'),
  'Dumbbell Lateral Raise': demo('dumbbell lateral raise demonstration'),
  'FreeMotion Lateral Raise': demo('freemotion lateral raise demonstration'),
  'FreeMotion Leg Extension': demo('freemotion leg extension demonstration'),
  'Step-ups': demo('step up exercise demonstration'),
  'Dumbbell Hammer Curl': demo('dumbbell hammer curl demonstration'),
  'Biceps Curl Machine': demo('biceps curl machine demonstration'),
  'Cable Curl': demo('cable biceps curl demonstration'),
  'FreeMotion Fly': demo('freemotion cable chest fly demonstration'),
  'Dumbbell Fly': demo('dumbbell chest fly demonstration'),
  'Dumbbell Romanian Deadlift': demo('dumbbell romanian deadlift demonstration'),
  'Glute Drive Machine': demo('glute drive machine demonstration')
}

export function exerciseDetails(exerciseOrName) {
  const name = typeof exerciseOrName === 'string' ? exerciseOrName : exerciseOrName.name
  const exercise = typeof exerciseOrName === 'string' ? {} : exerciseOrName
  const library = exerciseLibrary[name] || {}
  return {
    primaryMuscles: exercise.primaryMuscles || library.primaryMuscles || [],
    secondaryMuscles: exercise.secondaryMuscles || library.secondaryMuscles || [],
    cue: exercise.cue || library.cue || '',
    alternatives: exercise.alternatives || library.alternatives || [],
    demoQuery: exercise.demoQuery || library.demoQuery || `${name} exercise demonstration`
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
    demoQuery: replacement.demoQuery || `${replacementName} exercise demonstration`,
    isSwap: true,
    isComplete: false,
    isCollapsed: false,
    difficulty: '',
    sets: exercise.sets.map(set => ({ ...set, reps: '' }))
  }
}
