export function chooseProfileId(profiles, workoutReferences, cachedProfileId) {
  if (!profiles?.length) return null

  const workoutCounts = new Map()
  for (const workout of workoutReferences || []) {
    if (!workout.profile_id) continue
    workoutCounts.set(
      workout.profile_id,
      (workoutCounts.get(workout.profile_id) || 0) + 1
    )
  }

  return [...profiles]
    .sort((left, right) => {
      const countDifference = (workoutCounts.get(right.id) || 0) - (workoutCounts.get(left.id) || 0)
      if (countDifference) return countDifference

      if (left.id === cachedProfileId) return -1
      if (right.id === cachedProfileId) return 1

      return String(right.created_at || '').localeCompare(String(left.created_at || ''))
    })[0].id
}
