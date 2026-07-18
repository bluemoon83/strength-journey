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
      return { reps, weight, weightText }
    })
    .filter(Boolean)
}

function targetRange(exercise) {
  const matches = String(exercise.reps || '').match(/(\d+)(?:\D+(\d+))?/)
  if (!matches) return { low: 8, high: 10 }
  return {
    low: Number(matches[1]),
    high: matches[2] ? Number(matches[2]) : Number(matches[1])
  }
}

function difficultyText(previous) {
  return `${previous?.difficulty || ''} ${previous?.workoutNotes || ''}`.toLowerCase()
}

function wasHard(previous) {
  return ['challenging', 'failure', 'hard', 'struggle', 'sore', 'tired']
    .some(word => difficultyText(previous).includes(word))
}

function wasEasy(previous) {
  return ['easy'].some(word => difficultyText(previous).includes(word))
}

export function getCoachRecommendation(exercise, previous, recovery = 'Good') {
  if (!previous) {
    return {
      action: 'Start steady',
      tone: 'neutral',
      target: exercise.target || 'Use a comfortable starting weight',
      reason: 'There is no previous result for this exercise yet.',
      confidence: 1
    }
  }

  const sets = previousSets(previous)

  if (exercise.type === 'target-total') {
    const total = sets.reduce((sum, set) => sum + set.reps, 0)
    const target = exercise.targetTotal || 40
    const setCount = sets.length

    if (recovery === 'Tired') {
      return {
        action: 'Keep it comfortable',
        tone: 'hold',
        target: `${Math.max(20, target - 5)} total reps`,
        reason: 'Recovery is lower today, so keep clean form and leave a little in reserve.',
        confidence: 4
      }
    }

    if (total >= target && setCount <= 3) {
      return {
        action: 'Progress',
        tone: 'increase',
        target: `${target + 5} total reps`,
        reason: `You reached ${total} reps in ${setCount} sets. Add five total reps.`,
        confidence: 4
      }
    }

    if (total >= target) {
      return {
        action: 'Consolidate',
        tone: 'hold',
        target: `${target} total reps in fewer sets`,
        reason: `You reached the total, but needed ${setCount} sets. Match it more efficiently before adding reps.`,
        confidence: 4
      }
    }

    return {
      action: 'Repeat',
      tone: 'hold',
      target: `${target} total reps`,
      reason: `You completed ${total} reps last time. Build towards the existing target.`,
      confidence: 4
    }
  }

  if (exercise.type === 'timed') {
    const best = Math.max(...sets.map(set => set.reps), 0)
    if (recovery === 'Tired') {
      return {
        action: 'Hold',
        tone: 'hold',
        target: `${Math.max(20, best - 5)} seconds per set`,
        reason: 'Keep the holds controlled while recovery is lower.',
        confidence: 4
      }
    }
    return {
      action: 'Add a little time',
      tone: 'increase',
      target: `${best + 5} seconds on the first set`,
      reason: `Your longest previous hold was ${best} seconds.`,
      confidence: 3
    }
  }

  if (!sets.length) {
    return {
      action: 'Repeat the plan',
      tone: 'neutral',
      target: exercise.target,
      reason: 'The previous workout does not contain completed sets.',
      confidence: 1
    }
  }

  const { low, high } = targetRange(exercise)
  const completedReps = sets.map(set => set.reps)
  const allAtTop = completedReps.every(reps => reps >= high)
  const allInRange = completedReps.every(reps => reps >= low)
  const weights = sets.map(set => set.weight).filter(weight => weight !== null)
  const uniqueWeights = [...new Set(weights)]
  const finalSet = sets[sets.length - 1]
  const lastWeight = finalSet.weightText || previous.weight || exercise.defaultWeight
  const onlyFinalSetHeavier = uniqueWeights.length > 1 &&
    finalSet.weight === Math.max(...weights) &&
    sets.filter(set => set.weight === finalSet.weight).length === 1

  if (recovery === 'Tired') {
    return {
      action: 'Ease back',
      tone: 'reduce',
      target: 'Use the previous weight, but stop 1–2 reps earlier',
      reason: 'Recovery is lower today. Keep movement quality high and avoid grinding.',
      confidence: 5
    }
  }

  if (wasHard(previous)) {
    return {
      action: 'Repeat',
      tone: 'hold',
      target: `${lastWeight || exercise.target}`,
      reason: 'The previous session was challenging. Own this load before increasing.',
      confidence: 5
    }
  }

  if (onlyFinalSetHeavier) {
    return {
      action: 'Build the new weight',
      tone: 'hold',
      target: `Repeat ${lastWeight} on two sets`,
      reason: 'The heavier load was used for one successful set. Make it repeatable before increasing again.',
      confidence: 5
    }
  }

  if (allAtTop && wasEasy(previous)) {
    return {
      action: 'Increase confidently',
      tone: 'increase',
      target: `Use the next machine increment above ${lastWeight}`,
      reason: `You reached the top of the range and marked the exercise easy.`,
      confidence: 5
    }
  }

  if (allAtTop) {
    return {
      action: 'Increase',
      tone: 'increase',
      target: `Try the next small increment on the final set`,
      reason: `You reached the top of the ${low}–${high} rep range on every set.`,
      confidence: 4
    }
  }

  if (allInRange) {
    return {
      action: 'Repeat and improve',
      tone: 'hold',
      target: `${lastWeight || exercise.target}`,
      reason: 'All sets were in range. Add one rep somewhere before increasing the load.',
      confidence: 4
    }
  }

  return {
    action: 'Hold or slightly reduce',
    tone: 'reduce',
    target: `${lastWeight || exercise.target}`,
    reason: `Some sets fell below ${low} reps. Prioritise controlled reps before progressing.`,
    confidence: 4
  }
}
