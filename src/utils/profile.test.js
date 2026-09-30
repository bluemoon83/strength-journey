import test from 'node:test'
import assert from 'node:assert/strict'
import { chooseProfileId } from './profile.js'

test('chooses the profile that owns the workout history over a stale cached profile', () => {
  const profiles = [
    { id: 'stale', created_at: '2026-09-01' },
    { id: 'history', created_at: '2026-07-01' }
  ]
  const workouts = Array.from({ length: 20 }, (_, index) => ({
    id: String(index),
    profile_id: 'history'
  }))

  assert.equal(chooseProfileId(profiles, workouts, 'stale'), 'history')
})

test('uses a valid cached profile when candidates have equal workout counts', () => {
  const profiles = [
    { id: 'newest', created_at: '2026-09-01' },
    { id: 'cached', created_at: '2026-07-01' }
  ]

  assert.equal(chooseProfileId(profiles, [], 'cached'), 'cached')
})

test('falls back to the newest matching profile when there is no history or cache', () => {
  const profiles = [
    { id: 'oldest', created_at: '2026-07-01' },
    { id: 'newest', created_at: '2026-09-01' }
  ]

  assert.equal(chooseProfileId(profiles, [], null), 'newest')
  assert.equal(chooseProfileId([], [], null), null)
})
