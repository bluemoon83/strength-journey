const BACKUP_FORMAT = 'strength-journey-backup'

function workoutSignature(workout) {
  return JSON.stringify([
    workout.date || workout.workout_date || '',
    workout.name || workout.workout_name || '',
    (workout.exercises || workout.sets || []).map(exercise => [
      exercise.exercise_name || exercise.name || '',
      exercise.weight || '',
      exercise.weight_1 || '',
      exercise.weight_2 || '',
      exercise.weight_3 || '',
      exercise.weight_4 || '',
      exercise.weight_5 || '',
      exercise.weight_6 || '',
      exercise.set_1 || '',
      exercise.set_2 || '',
      exercise.set_3 || '',
      exercise.set_4 || '',
      exercise.set_5 || '',
      exercise.set_6 || ''
    ])
  ])
}

function bodySignature(entry) {
  return JSON.stringify([
    entry.update_date || entry.date || '',
    entry.weight_kg ?? entry.weightKg ?? '',
    entry.waist_cm ?? ''
  ])
}

export function parseBackup(text) {
  let backup
  try {
    backup = JSON.parse(text)
  } catch {
    throw new Error('This is not a valid JSON backup file.')
  }

  if (backup?.format !== BACKUP_FORMAT) {
    throw new Error('This file is not a Strength Journey full backup.')
  }

  if (!Array.isArray(backup.workouts) || !Array.isArray(backup.body)) {
    throw new Error('The backup is missing its workouts or body history.')
  }

  return backup
}

export function createRestorePlan(backup, existingWorkouts = [], existingBody = []) {
  const seenWorkoutIds = new Set(existingWorkouts.map(item => item.id).filter(Boolean))
  const seenWorkoutSignatures = new Set(existingWorkouts.map(workoutSignature))
  const seenBodySignatures = new Set(existingBody.map(bodySignature))
  const workouts = []
  const bodyUpdates = []

  for (const workout of backup.workouts) {
    if (!workout?.date || !workout?.name || !Array.isArray(workout.exercises)) continue
    const signature = workoutSignature(workout)
    if ((workout.id && seenWorkoutIds.has(workout.id)) || seenWorkoutSignatures.has(signature)) continue

    workouts.push({
      workout_date: workout.date,
      workout_name: workout.name,
      notes: workout.notes || '',
      sets: workout.exercises
    })
    if (workout.id) seenWorkoutIds.add(workout.id)
    seenWorkoutSignatures.add(signature)
  }

  for (const entry of backup.body) {
    if (!(entry.update_date || entry.date) || (entry.weight_kg ?? entry.weightKg) === undefined) continue
    const signature = bodySignature(entry)
    if (seenBodySignatures.has(signature)) continue

    bodyUpdates.push({
      update_date: entry.update_date || entry.date,
      weight_kg: entry.weight_kg ?? entry.weightKg,
      waist_cm: entry.waist_cm ?? null
    })
    seenBodySignatures.add(signature)
  }

  return {
    workouts,
    bodyUpdates,
    skippedWorkouts: backup.workouts.length - workouts.length,
    skippedBodyUpdates: backup.body.length - bodyUpdates.length
  }
}
