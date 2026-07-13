import React from 'react'
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Field, SelectField } from './Ui'
import { getCoachRecommendation } from '../utils/coachEngine'
import {
  equipmentOptions,
  numberFrom,
  summariseSets,
  weightUnitOptions
} from '../utils/workout'

export default function ExerciseCard({
  index, exercise, best, previous, recovery, update, updateSet, addSet, removeSet,
  removeExercise, toggleComplete, toggleCollapsed
}) {
  const total = exercise.sets.reduce((sum, set) => sum + (numberFrom(set.reps) || 0), 0)
  const isTargetTotal = exercise.type === 'target-total'
  const isBodyweight = exercise.equipment === 'Bodyweight'
  const targetComplete = isTargetTotal && exercise.targetTotal && total >= exercise.targetTotal
  const summary = summariseSets(exercise)
  const coach = getCoachRecommendation(exercise, previous, recovery)

  return (
    <div className={`workoutExerciseCard ${exercise.isComplete ? 'completedExercise' : ''}`}>
      <div className="exerciseTitleRow">
        <button className="collapseHeader" type="button" onClick={() => toggleCollapsed(index)}>
          <span className="collapseIcon">
            {exercise.isCollapsed ? <ChevronDown size={18}/> : <ChevronUp size={18}/>}
          </span>
          <span>
            {exercise.isExtra
              ? <span className="extraTitle">Extra exercise</span>
              : <h3>{index + 1}. {exercise.name}</h3>}
            <span className="collapsedSummary">{summary || exercise.target}</span>
          </span>
        </button>

        <div className="titleActions">
          {(exercise.isComplete || targetComplete) && <span className="completePill">Complete</span>}
          {exercise.isExtra && (
            <button className="iconBtn" type="button" onClick={() => removeExercise(index)} aria-label="Remove exercise">
              <Trash2 size={16}/>
            </button>
          )}
        </div>
      </div>

      {!exercise.isCollapsed && (
        <>
          {exercise.isExtra
            ? <Field label="Exercise name" value={exercise.name} onChange={v => update(index, 'name', v)} />
            : <p className="target">Target: {exercise.target} · {exercise.reps}</p>}

          <CoachCard recommendation={coach} />
          <WorkoutReplay previous={previous} best={best} />

          {(exercise.cue || exercise.alternatives?.length) && (
            <div className="exerciseGuide">
              {exercise.cue && (
                <p><strong>Technique cue:</strong> {exercise.cue}</p>
              )}
              {exercise.alternatives?.length > 0 && (
                <p><strong>If busy:</strong> {exercise.alternatives.join(' · ')}</p>
              )}
            </div>
          )}

          {isTargetTotal && (
            <div className="totalBox">
              <span>Running total</span>
              <strong>{targetComplete ? '✓ ' : ''}{total} / {exercise.targetTotal}</strong>
            </div>
          )}

          <div className="grid">
            <SelectField
              label="Equipment"
              value={exercise.equipment}
              options={exercise.equipmentOptions || equipmentOptions}
              onChange={v => update(index, 'equipment', v)}
            />
            {!isBodyweight && (
              <SelectField
                label="Weight unit"
                value={exercise.weightUnit || 'kg'}
                options={weightUnitOptions}
                onChange={v => update(index, 'weightUnit', v)}
              />
            )}
            <Field label="Difficulty" value={exercise.difficulty} onChange={v => update(index, 'difficulty', v)} />
          </div>

          <div className="setRows">
            <div className={isBodyweight ? 'setRowHeader bodyweightSetHeader' : 'setRowHeader'}>
              <span>Set</span>
              {!isBodyweight && <span>Weight</span>}
              <span>{exercise.type === 'timed' ? 'Seconds' : 'Reps'}</span>
            </div>

            {exercise.sets.map((set, setIndex) => (
              <div className={isBodyweight ? 'setRow bodyweightSetRow' : 'setRow'} key={setIndex}>
                <span className="setNumber">{setIndex + 1}</span>
                {!isBodyweight && (
                  <input
                    value={set.weight}
                    onChange={e => updateSet(index, setIndex, 'weight', e.target.value)}
                    placeholder={exercise.weightUnit || 'kg'}
                    inputMode="decimal"
                  />
                )}
                <input
                  value={set.reps}
                  onChange={e => updateSet(index, setIndex, 'reps', e.target.value)}
                  placeholder={exercise.type === 'timed' ? 'sec' : 'reps'}
                  inputMode="numeric"
                />
              </div>
            ))}
          </div>

          <div className="setControls">
            <button type="button" className="miniBtn" onClick={() => addSet(index)}><Plus size={16}/> Add set</button>
            <button type="button" className="miniBtn" onClick={() => removeSet(index)}>Remove set</button>
          </div>

          <button type="button" className="completeBtn" onClick={() => toggleComplete(index)}>
            <Check size={18}/> {exercise.isComplete ? 'Reopen exercise' : 'Mark exercise complete'}
          </button>
        </>
      )}
    </div>
  )
}


function WorkoutReplay({ previous, best }) {
  const previousSets = getPreviousSets(previous)

  if (!previousSets.length && !best) {
    return (
      <div className="replayBox">
        <span className="replayLabel">Workout replay</span>
        <p className="muted">No previous result logged for this exercise.</p>
      </div>
    )
  }

  return (
    <div className="replayBox">
      <div className="replayHeading">
        <div>
          <span className="replayLabel">Last workout</span>
          {previous?.workoutDate && (
            <small>{formatReplayDate(previous.workoutDate)}</small>
          )}
        </div>

        <div className="replayBest">
          <span className="replayLabel">Best</span>
          <strong>{best?.display || '—'}</strong>
        </div>
      </div>

      {previousSets.length > 0 && (
        <div className="replaySets">
          {previousSets.map((set, index) => (
            <div className="replaySet" key={index}>
              <span>Set {index + 1}</span>
              <strong>{set}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getPreviousSets(previous) {
  if (!previous) return []

  const weights = [
    previous.weight_1,
    previous.weight_2,
    previous.weight_3,
    previous.weight_4,
    previous.weight_5,
    previous.weight_6
  ]

  const reps = [
    previous.set_1,
    previous.set_2,
    previous.set_3,
    previous.set_4,
    previous.set_5,
    previous.set_6
  ]

  return reps
    .map((rep, index) => {
      if (!rep) return null
      const weight = weights[index] || previous.weight
      return weight ? `${weight} × ${rep}` : `${rep}`
    })
    .filter(Boolean)
}

function formatReplayDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateValue

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}


function CoachCard({ recommendation }) {
  return (
    <div className={`coachRecommendation coach-${recommendation.tone}`}>
      <div className="coachRecommendationHeader">
        <span>Coach recommendation</span>
        <strong>{recommendation.action}</strong>
      </div>
      <p className="coachTarget">{recommendation.target}</p>
      <p className="coachReason">{recommendation.reason}</p>
    </div>
  )
}
