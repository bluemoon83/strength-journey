import { numberFrom } from './workout.js'

function dateValue(value) {
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getDashboardStats({ workouts = [], body = [], bests = {}, targetWorkouts = 0, now = new Date() }) {
  const datedWorkouts = workouts
    .filter(workout => dateValue(workout.date))
    .sort((left, right) => String(left.date).localeCompare(String(right.date)))

  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const recentWorkoutCount = datedWorkouts.filter(workout => {
    const date = dateValue(workout.date)
    return date >= thirtyDaysAgo && date <= now
  }).length

  const sortedBody = body
    .filter(entry => dateValue(entry.update_date || entry.date))
    .sort((left, right) => String(left.update_date || left.date).localeCompare(String(right.update_date || right.date)))

  const firstWeight = numberFrom(sortedBody[0]?.weight_kg ?? sortedBody[0]?.weightKg)
  const latestWeight = numberFrom(sortedBody.at(-1)?.weight_kg ?? sortedBody.at(-1)?.weightKg)
  const weightChange = firstWeight !== null && latestWeight !== null
    ? Math.round((latestWeight - firstWeight) * 10) / 10
    : null

  const progressPercent = targetWorkouts > 0
    ? Math.min(100, Math.round((workouts.length / targetWorkouts) * 100))
    : 0

  return {
    totalWorkouts: workouts.length,
    nextSession: workouts.length + 1,
    progressPercent,
    recentWorkoutCount,
    latestWeight,
    weightChange,
    personalBestCount: Object.keys(bests).length
  }
}

export function getTrendSummary(data = []) {
  const weights = data.map(item => numberFrom(item.weight)).filter(value => value !== null)
  if (!weights.length) return 'No data yet'
  if (weights.length === 1) return `${weights[0]}kg logged`
  return `${weights[0]} → ${weights.at(-1)}kg`
}
