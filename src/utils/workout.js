import { workoutTemplates } from '../seed.js'

export const equipmentOptions = ['Machine', 'Dumbbells', 'Cable', 'Bodyweight']
export const weightUnitOptions = ['kg', 'lb']
export const workoutDraftKey = 'sj_workout_draft'
export const today = () => new Date().toISOString().slice(0, 10)

export function cleanWeight(value) {
  return String(value || '').replace(/[^0-9.]/g, '')
}

export function formatWeight(value, unit = 'kg') {
  const clean = cleanWeight(value)
  return clean ? `${clean} ${unit}` : ''
}

export function numberFrom(value) {
  const n = parseFloat(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : null
}

export function getLatestWorkout(workouts = []) {
  return workouts
    .map((workout, index) => ({ workout, index }))
    .filter(({ workout }) => workout?.date && workout?.name)
    .sort((left, right) => {
      const dateOrder = String(right.workout.date).localeCompare(String(left.workout.date))
      if (dateOrder) return dateOrder

      const createdOrder = String(right.workout.createdAt || right.workout.created_at || '')
        .localeCompare(String(left.workout.createdAt || left.workout.created_at || ''))
      return createdOrder || right.index - left.index
    })[0]?.workout || null
}

export function getNextWorkout(workouts) {
  if (!workouts?.length) return workoutTemplates[0]
  const latest = getLatestWorkout(workouts)
  if (!latest) return workoutTemplates[0]
  const index = workoutTemplates.findIndex(t => t.name === latest.name)
  return index === -1 ? workoutTemplates[0] : workoutTemplates[(index + 1) % workoutTemplates.length]
}

export const getTemplateByName = name => workoutTemplates.find(t => t.name === name)

export function loadStoredWorkoutDraft() {
  try {
    const saved = localStorage.getItem(workoutDraftKey)
    if (!saved) return null

    const draft = JSON.parse(saved)
    const template = workoutTemplates.find(item => item.name === draft?.workoutName)
    if (!template || !Array.isArray(draft?.exercises)) return draft

    return {
      ...draft,
      exercises: syncWorkoutDraftExercises(draft.exercises, template)
    }
  } catch {
    return null
  }
}

export function syncWorkoutDraftExercises(savedExercises = [], template) {
  const templateItems = buildWorkoutItems(template)
  const usedSavedIndexes = new Set()

  const syncedItems = templateItems.map(templateItem => {
    const savedIndex = savedExercises.findIndex((savedItem, index) =>
      !usedSavedIndexes.has(index) &&
      (savedItem.name === templateItem.name || savedItem.originalName === templateItem.name)
    )

    if (savedIndex === -1) return templateItem
    usedSavedIndexes.add(savedIndex)

    return {
      ...templateItem,
      ...savedExercises[savedIndex],
      group: templateItem.group,
      trainingOrder: templateItem.trainingOrder
    }
  })

  const extras = savedExercises.filter((exercise, index) =>
    exercise.isExtra && !usedSavedIndexes.has(index)
  )

  return [...syncedItems, ...extras]
}

export function buildWorkoutItems(workout) {
  return workout.exercises
    .map((exercise, originalIndex) => ({ exercise, originalIndex }))
    .sort((left, right) =>
      (left.exercise.trainingOrder ?? left.originalIndex) -
      (right.exercise.trainingOrder ?? right.originalIndex)
    )
    .map(({ exercise: ex }) => ({
      ...ex,
      equipment: ex.equipment || '',
      isCollapsed: true,
      isComplete: false,
      difficulty: '',
      weightUnit: ex.weightUnit || 'kg',
      sets: Array.from(
        { length: ex.type === 'target-total' ? (ex.startingSets || 3) : (ex.sets || 3) },
        () => ({ weight: ex.equipment === 'Bodyweight' ? '' : cleanWeight(ex.defaultWeight || ''), weightEdited: false, reps: '' })
      )
    }))
}

export const createWorkoutDraft = (workout, basedOnWorkoutId = null) => ({
  workoutName: workout.name,
  basedOnWorkoutId,
  workoutMode: 'standard',
  recovery: 'Good',
  notes: '',
  exercises: buildWorkoutItems(workout)
})

export function hasWorkoutDraftProgress(draft) {
  if (!draft) return false
  if (String(draft.notes || '').trim()) return true
  if (draft.recovery && draft.recovery !== 'Good') return true

  return (draft.exercises || []).some(exercise =>
    exercise.isComplete ||
    exercise.isExtra ||
    exercise.difficulty ||
    (exercise.sets || []).some(set => String(set.reps || '').trim())
  )
}

export function summariseSets(exercise) {
  const sets = exercise.sets.filter(s => s.reps).map(s => s.weight ? `${formatWeight(s.weight, exercise.weightUnit)} × ${s.reps}` : s.reps)
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
