import { numberFrom } from './workout'

const setKeys = [1, 2, 3, 4, 5, 6]

function previousSets(previous) {
  if (!previous) return []

  return setKeys
    .map(index => {
      const reps = numberFrom(previous[`set_${index}`])
      const weightText = previous[`weight_${index}`] || previous.weight || ''
      const weight = numberFrom(weightText)

      if (reps === null) return null

      return {
        reps,
        weight,
        weightText
      }
    })
    .filter(Boolean)
}

function targetRange(exercise) {
  const matches = String(exercise.reps || '').match(/(\d+)(?:\D+(\d+))?/)
  if (!matches) return { low: 8, high: 10 }

  const low = Number(matches[1])
  const high = matches[2] ? Number(matches[2]) : low

  return { low, high }
}

function hasHardNote(previous) {
  const text = `${previous?.difficulty || ''} ${previous?.workoutNotes || ''}`.toLowerCase()
  return ['hard', 'very hard', 'struggle', 'sore', 'tired'].some(word => text.includes(word))
}

export function getCoachRecommendation(exercise, previous, recovery = 'Good') {
  if (!previous) {
    return {
      action: 'Start steady',
      tone: 'neutral',
      target: exercise.target || 'Use a comfortable starting weight',
      reason: 'There is no previous result for this exercise yet.'
    }
  }

  if (exercise.type === 'target-total') {
    const total = previousSets(previous).reduce((sum, set) => sum + set.reps, 0)
    const target = exercise.targetTotal || 40

    if (recovery === 'Tired') {
      return {
        action: 'Keep it comfortable',
        tone: 'hold',
        target: `${Math.max(20, target - 5)} total reps`,
        reason: 'You marked recovery as tired, so today is not the day to chase a record.'
      }
    }

    return total >= target
      ? {
          action: 'Progress',
          tone: 'increase',
          target: `${target + 5} total reps`,
          reason: `You completed ${total} reps last time. Add five reps, or complete the same total in fewer sets.`
        }
      : {
          action: 'Repeat',
          tone: 'hold',
          target: `${target} total reps`,
          reason: `You completed ${total} reps last time. Build towards the current target first.`
        }
  }

  if (exercise.type === 'timed') {
    const sets = previousSets(previous)
    const best = Math.max(...sets.map(set => set.reps), 0)

    return recovery === 'Tired'
      ? {
          action: 'Hold',
          tone: 'hold',
          target: `${Math.max(20, best - 5)} seconds per set`,
          reason: 'Keep the holds controlled while recovery is lower.'
        }
      : {
          action: 'Add a little time',
          tone: 'increase',
          target: `${best + 5} seconds on the first set`,
          reason: `Your longest previous hold was ${best} seconds.`
        }
  }

  const sets = previousSets(previous)
  if (!sets.length) {
    return {
      action: 'Repeat the plan',
      tone: 'neutral',
      target: exercise.target,
      reason: 'The previous workout does not contain completed sets.'
    }
  }

  const { low, high } = targetRange(exercise)
  const completedReps = sets.map(set => set.reps)
  const allAtTop = completedReps.every(reps => reps >= high)
  const allInRange = completedReps.every(reps => reps >= low)
  const lastWeight = sets[sets.length - 1].weightText || previous.weight || exercise.defaultWeight
  const hard = hasHardNote(previous)

  if (recovery === 'Tired') {
    return {
      action: 'Ease back',
      tone: 'reduce',
      target: `Use the previous weight, but stop 1–2 reps earlier`,
      reason: 'Recovery is lower today. Keep the movement quality high and avoid grinding.'
    }
  }

  if (hard) {
    return {
      action: 'Repeat',
      tone: 'hold',
      target: `${lastWeight || exercise.target}`,
      reason: 'The previous session was marked hard or sore. Own this load before increasing.'
    }
  }

  if (allAtTop) {
    return {
      action: 'Increase',
      tone: 'increase',
      target: `Use the next small machine increment above ${lastWeight}`,
      reason: `You reached the top of the ${low}–${high} rep range on every completed set.`
    }
  }

  if (allInRange) {
    return {
      action: 'Repeat and improve',
      tone: 'hold',
      target: `${lastWeight || exercise.target}`,
      reason: `All sets were in range. Aim to add one rep somewhere before increasing the load.`
    }
  }

  return {
    action: 'Hold or slightly reduce',
    tone: 'reduce',
    target: `${lastWeight || exercise.target}`,
    reason: `Some sets fell below ${low} reps. Prioritise controlled reps before progressing.`
  }
}
