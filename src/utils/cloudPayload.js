import { formatWeight } from './workout.js'

export function buildCloudWorkoutSets(exercises = []) {
  return exercises.map(exercise => ({
    exercise_name: exercise.name,
    exercise_type: exercise.type,
    equipment: exercise.equipment,
    weight: formatWeight(exercise.sets?.[0]?.weight, exercise.weightUnit),
    weight_1: formatWeight(exercise.sets?.[0]?.weight, exercise.weightUnit),
    weight_2: formatWeight(exercise.sets?.[1]?.weight, exercise.weightUnit),
    weight_3: formatWeight(exercise.sets?.[2]?.weight, exercise.weightUnit),
    weight_4: formatWeight(exercise.sets?.[3]?.weight, exercise.weightUnit),
    weight_5: formatWeight(exercise.sets?.[4]?.weight, exercise.weightUnit),
    weight_6: formatWeight(exercise.sets?.[5]?.weight, exercise.weightUnit),
    set_1: exercise.sets?.[0]?.reps || '',
    set_2: exercise.sets?.[1]?.reps || '',
    set_3: exercise.sets?.[2]?.reps || '',
    set_4: exercise.sets?.[3]?.reps || '',
    set_5: exercise.sets?.[4]?.reps || '',
    set_6: exercise.sets?.[5]?.reps || '',
    target_total: exercise.targetTotal || null,
    is_extra: exercise.isExtra || false,
    difficulty: exercise.difficulty || ''
  }))
}
