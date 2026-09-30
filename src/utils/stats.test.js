import test from 'node:test'
import assert from 'node:assert/strict'
import { getDashboardStats, getTrendSummary } from './stats.js'

test('calculates dashboard values from live data', () => {
  const stats = getDashboardStats({
    workouts: [
      { date: '2026-09-02' },
      { date: '2026-09-15' },
      { date: '2026-09-29' }
    ],
    body: [
      { update_date: '2026-07-01', weight_kg: 89 },
      { update_date: '2026-09-29', weight_kg: 86.4 }
    ],
    bests: { 'Leg Press': {}, 'Chest Press': {} },
    targetWorkouts: 12,
    now: new Date('2026-09-30T12:00:00')
  })

  assert.deepEqual(stats, {
    totalWorkouts: 3,
    nextSession: 4,
    progressPercent: 25,
    recentWorkoutCount: 3,
    latestWeight: 86.4,
    weightChange: -2.6,
    personalBestCount: 2
  })
})

test('caps programme progress and summarises a trend', () => {
  const stats = getDashboardStats({
    workouts: Array.from({ length: 15 }, () => ({})),
    targetWorkouts: 12
  })

  assert.equal(stats.progressPercent, 100)
  assert.equal(getTrendSummary([{ weight: 68 }, { weight: 86 }]), '68 → 86kg')
  assert.equal(getTrendSummary([]), 'No data yet')
})
