import { workoutTemplates } from '../seed'

export const equipmentOptions = ['Machine', 'Dumbbells', 'Cable', 'Bodyweight']
export const workoutDraftKey = 'sj_workout_draft'
export const today = () => new Date().toISOString().slice(0, 10)

export function numberFrom(value) {
  const n = parseFloat(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : null
}

export function getNextWorkout(workouts) {
  if (!workouts?.length) return workoutTemplates[0]
  const latest = [...workouts]
    .filter(w => w?.date && w?.name)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  if (!latest) return workoutTemplates[0]
  const index = workoutTemplates.findIndex(t => t.name === latest.name)
  return index === -1 ? workoutTemplates[0] : workoutTemplates[(index + 1) % workoutTemplates.length]
}

export const getTemplateByName = name => workoutTemplates.find(t => t.name === name)

export function loadStoredWorkoutDraft() {
  try {
    const saved = localStorage.getItem(workoutDraftKey)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function buildWorkoutItems(workout) {
  return workout.exercises.map(ex => ({
    ...ex,
    equipment: ex.equipment || '',
    isCollapsed: false,
    isComplete: false,
    difficulty: '',
    sets: Array.from(
      { length: ex.type === 'target-total' ? (ex.startingSets || 3) : (ex.sets || 3) },
      () => ({ weight: ex.equipment === 'Bodyweight' ? '' : (ex.defaultWeight || ''), reps: '' })
    )
  }))
}

export const createWorkoutDraft = workout => ({
  workoutName: workout.name,
  notes: '',
  exercises: buildWorkoutItems(workout)
})

export function summariseSets(exercise) {
  const sets = exercise.sets.filter(s => s.reps).map(s => s.weight ? `${s.weight} × ${s.reps}` : s.reps)
  if (!sets.length) return ''
  if (exercise.type === 'target-total') {
    const total = exercise.sets.reduce((sum, s) => sum + (numberFrom(s.reps) || 0), 0)
    return `${sets.join(' / ')} · Total ${total}`
  }
  return sets.join(' / ')
}

export function formatHistoryExercise(ex) {
  const weights = [ex.weight_1, ex.weight_2, ex.weight_3, ex.weight_4, ex.weight_5, ex.weight_6]
  const reps = [ex.set_1, ex.set_2, ex.set_3, ex.set_4, ex.set_5, ex.set_6]
  const sets = reps.map((rep, i) => {
    if (!rep) return null
    const weight = weights[i] || ex.weight
    return weight ? `${weight} × ${rep}` : rep
  }).filter(Boolean).join(' / ')
  const equipment = ex.equipment ? ` (${ex.equipment})` : ''
  return `${ex.exercise_name}${equipment}: ${sets}`.trim()
}
