import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCloudWorkoutSets } from './cloudPayload.js'

test('builds the atomic workout payload without a workout id', () => {
  const rows = buildCloudWorkoutSets([{
    name: 'Leg Press',
    type: 'strength',
    equipment: 'Machine',
    weightUnit: 'kg',
    sets: [{ weight: '86', reps: '10' }, { weight: '90', reps: '8' }],
    targetTotal: null,
    isExtra: false,
    difficulty: 'Good'
  }])

  assert.equal(rows.length, 1)
  assert.equal(rows[0].exercise_name, 'Leg Press')
  assert.equal(rows[0].weight_1, '86 kg')
  assert.equal(rows[0].weight_2, '90 kg')
  assert.equal(rows[0].set_2, '8')
  assert.equal('workout_id' in rows[0], false)
})
