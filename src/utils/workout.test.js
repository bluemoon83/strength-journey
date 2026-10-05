import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildWorkoutItems,
  getLatestWorkout,
  getNextWorkout,
  hasWorkoutDraftProgress,
  syncWorkoutDraftExercises
} from './workout.js'

test('moves to the workout after the latest cloud session', () => {
  const workouts = [
    { id: 'one', date: '2026-10-01', createdAt: '2026-10-01T09:00:00Z', name: 'Lower Body & Push' },
    { id: 'two', date: '2026-10-05', createdAt: '2026-10-05T11:00:00Z', name: 'Upper Pull & Core' }
  ]

  assert.equal(getLatestWorkout(workouts).id, 'two')
  assert.equal(getNextWorkout(workouts).name, 'Full Body Strength')
})

test('uses creation time to rotate correctly when two sessions share a date', () => {
  const workouts = [
    { id: 'older', date: '2026-10-05', createdAt: '2026-10-05T09:00:00Z', name: 'Lower Body & Push' },
    { id: 'newer', date: '2026-10-05', createdAt: '2026-10-05T12:00:00Z', name: 'Upper Pull & Core' }
  ]

  assert.equal(getLatestWorkout(workouts).id, 'newer')
  assert.equal(getNextWorkout(workouts).name, 'Full Body Strength')
})

test('orders a workout by its training sequence', () => {
  const items = buildWorkoutItems({
    exercises: [
      { name: 'Row', trainingOrder: 30, type: 'strength', sets: 1 },
      { name: 'Leg Press', trainingOrder: 10, type: 'strength', sets: 1 },
      { name: 'Chest Press', trainingOrder: 20, type: 'strength', sets: 1 }
    ]
  })

  assert.deepEqual(items.map(item => item.name), ['Leg Press', 'Chest Press', 'Row'])
})

test('distinguishes untouched drafts from workouts with entered results', () => {
  assert.equal(hasWorkoutDraftProgress({ recovery: 'Good', notes: '', exercises: [] }), false)
  assert.equal(hasWorkoutDraftProgress({
    recovery: 'Good',
    notes: '',
    exercises: [{ sets: [{ weight: '80', reps: '10' }] }]
  }), true)
})

test('updates a saved draft when the programme replaces an exercise', () => {
  const exercises = syncWorkoutDraftExercises([
    { name: 'Leg Press', sets: [{ weight: '80', reps: '10' }] },
    { name: 'Plank', sets: [{ reps: '40' }] }
  ], {
    exercises: [
      { name: 'Leg Press', group: 'Lower body', trainingOrder: 10, type: 'strength', sets: 1 },
      { name: 'Ab Crunch Machine', group: 'Core', trainingOrder: 20, type: 'strength', sets: 1 }
    ]
  })

  assert.deepEqual(exercises.map(exercise => exercise.name), ['Leg Press', 'Ab Crunch Machine'])
  assert.equal(exercises[0].sets[0].reps, '10')
  assert.equal(exercises[1].sets[0].reps, '')
})
