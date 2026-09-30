import test from 'node:test'
import assert from 'node:assert/strict'
import { createRestorePlan, parseBackup } from './backup.js'

const backup = {
  format: 'strength-journey-backup',
  version: '0.9.2',
  workouts: [
    { id: 'existing', date: '2026-09-01', name: 'Workout A', exercises: [] },
    { id: 'new', date: '2026-09-03', name: 'Workout B', exercises: [] }
  ],
  body: [
    { update_date: '2026-09-01', weight_kg: 88, waist_cm: 90 },
    { update_date: '2026-09-03', weight_kg: 87.5, waist_cm: 89 }
  ]
}

test('validates a Strength Journey backup', () => {
  assert.deepEqual(parseBackup(JSON.stringify(backup)), backup)
  assert.throws(() => parseBackup('{bad json'), /valid JSON/)
  assert.throws(() => parseBackup(JSON.stringify({ format: 'other' })), /not a Strength Journey/)
})

test('restores only records that are not already present', () => {
  const plan = createRestorePlan(
    backup,
    [{ id: 'existing', date: '2026-09-01', name: 'Workout A', exercises: [] }],
    [{ update_date: '2026-09-01', weight_kg: 88, waist_cm: 90 }]
  )

  assert.equal(plan.workouts.length, 1)
  assert.equal(plan.workouts[0].workout_name, 'Workout B')
  assert.equal(plan.bodyUpdates.length, 1)
  assert.equal(plan.skippedWorkouts, 1)
  assert.equal(plan.skippedBodyUpdates, 1)
})

test('deduplicates repeated records inside the backup itself', () => {
  const repeated = {
    ...backup,
    workouts: [backup.workouts[1], backup.workouts[1]],
    body: [backup.body[1], backup.body[1]]
  }
  const plan = createRestorePlan(repeated)

  assert.equal(plan.workouts.length, 1)
  assert.equal(plan.bodyUpdates.length, 1)
  assert.equal(plan.skippedWorkouts, 1)
  assert.equal(plan.skippedBodyUpdates, 1)
})
