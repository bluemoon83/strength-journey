const setNumbers = [1, 2, 3, 4, 5, 6]

function csvEscape(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function makeCsv(headers, rows) {
  return [
    headers.map(csvEscape).join(','),
    ...rows.map(row => headers.map(header => csvEscape(row[header])).join(','))
  ].join('\n')
}

function splitWeight(value) {
  const text = String(value || '').trim()
  const match = text.match(/^([0-9.]+)\s*(kg|lb|lbs)?$/i)

  return {
    weight: match?.[1] || text.replace(/[^0-9.]/g, ''),
    unit: match?.[2]?.toLowerCase().replace('lbs', 'lb') || ''
  }
}

function triggerDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function datedFilename(name, extension) {
  const date = new Date().toISOString().slice(0, 10)
  return `strength-journey-${name}-${date}.${extension}`
}

export function buildWorkoutSetRows(workouts) {
  const rows = []

  for (const workout of workouts || []) {
    for (const exercise of workout.exercises || []) {
      let addedSet = false

      for (const setNumber of setNumbers) {
        const reps = exercise[`set_${setNumber}`]
        const storedWeight =
          exercise[`weight_${setNumber}`] ||
          exercise.weight ||
          ''

        if (!reps && !storedWeight) continue

        const parsed = splitWeight(storedWeight)

        rows.push({
          date: workout.date || '',
          workout: workout.name || '',
          exercise: exercise.exercise_name || '',
          equipment: exercise.equipment || '',
          exercise_type: exercise.exercise_type || '',
          is_extra: exercise.is_extra ? 'Yes' : 'No',
          set: setNumber,
          weight: parsed.weight,
          unit: parsed.unit,
          reps_or_seconds: reps || '',
          difficulty: exercise.difficulty || '',
          workout_notes: workout.notes || ''
        })

        addedSet = true
      }

      if (!addedSet) {
        rows.push({
          date: workout.date || '',
          workout: workout.name || '',
          exercise: exercise.exercise_name || '',
          equipment: exercise.equipment || '',
          exercise_type: exercise.exercise_type || '',
          is_extra: exercise.is_extra ? 'Yes' : 'No',
          set: '',
          weight: '',
          unit: '',
          reps_or_seconds: '',
          difficulty: exercise.difficulty || '',
          workout_notes: workout.notes || ''
        })
      }
    }
  }

  return rows
}

export function downloadWorkoutsCsv(workouts) {
  const headers = [
    'date',
    'workout',
    'exercise',
    'equipment',
    'exercise_type',
    'is_extra',
    'set',
    'weight',
    'unit',
    'reps_or_seconds',
    'difficulty',
    'workout_notes'
  ]

  const csv = makeCsv(headers, buildWorkoutSetRows(workouts))

  triggerDownload(
    datedFilename('workouts', 'csv'),
    csv,
    'text/csv;charset=utf-8'
  )
}

export function downloadBodyCsv(body) {
  const headers = ['date', 'weight_kg', 'waist_cm']

  const rows = (body || []).map(entry => ({
    date: entry.update_date || entry.date || '',
    weight_kg: entry.weight_kg ?? entry.weightKg ?? '',
    waist_cm: entry.waist_cm ?? ''
  }))

  triggerDownload(
    datedFilename('body', 'csv'),
    makeCsv(headers, rows),
    'text/csv;charset=utf-8'
  )
}

export function downloadJsonBackup({ workouts, body, bests }) {
  const backup = {
    format: 'strength-journey-backup',
    version: '0.5.3',
    exportedAt: new Date().toISOString(),
    workouts: workouts || [],
    body: body || [],
    personalBests: bests || {}
  }

  triggerDownload(
    datedFilename('backup', 'json'),
    JSON.stringify(backup, null, 2),
    'application/json;charset=utf-8'
  )
}

function calculateSummary(workouts, body, bests) {
  const workoutRows = buildWorkoutSetRows(workouts)
  const completedSets = workoutRows.filter(row => row.set !== '')
  const totalReps = completedSets.reduce(
    (sum, row) => sum + (Number(row.reps_or_seconds) || 0),
    0
  )

  const weightedVolume = completedSets.reduce((sum, row) => {
    const weight = Number(row.weight)
    const reps = Number(row.reps_or_seconds)

    if (!Number.isFinite(weight) || !Number.isFinite(reps)) return sum
    return sum + weight * reps
  }, 0)

  const latestBody = [...(body || [])].sort((a, b) => {
    const dateA = a.update_date || a.date || ''
    const dateB = b.update_date || b.date || ''
    return dateB.localeCompare(dateA)
  })[0]

  const firstBody = [...(body || [])].sort((a, b) => {
    const dateA = a.update_date || a.date || ''
    const dateB = b.update_date || b.date || ''
    return dateA.localeCompare(dateB)
  })[0]

  return {
    workoutsCompleted: (workouts || []).length,
    exercisesLogged: new Set(
      workoutRows.map(row => row.exercise).filter(Boolean)
    ).size,
    completedSets: completedSets.length,
    totalRepsOrSeconds: totalReps,
    estimatedWeightedVolume: Math.round(weightedVolume * 100) / 100,
    firstRecordedWeightKg:
      firstBody?.weight_kg ?? firstBody?.weightKg ?? null,
    latestRecordedWeightKg:
      latestBody?.weight_kg ?? latestBody?.weightKg ?? null,
    personalBestCount: Object.keys(bests || {}).length
  }
}

export function downloadAiReviewPack({ workouts, body, bests }) {
  const pack = {
    format: 'strength-journey-ai-review',
    version: '0.5.3',
    exportedAt: new Date().toISOString(),
    instructions:
      'Review my training progress, consistency, exercise balance and progression. Suggest sensible changes to my next workouts.',
    summary: calculateSummary(workouts, body, bests),
    personalBests: bests || {},
    body: body || [],
    workoutSets: buildWorkoutSetRows(workouts),
    rawWorkouts: workouts || []
  }

  triggerDownload(
    datedFilename('ai-review', 'json'),
    JSON.stringify(pack, null, 2),
    'application/json;charset=utf-8'
  )
}

