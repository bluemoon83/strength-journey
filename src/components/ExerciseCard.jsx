import React, { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Play, Plus, RefreshCw, Trash2, Wrench } from 'lucide-react'
import { Field, SelectField } from './Ui'
import ExerciseDemoModal from './ExerciseDemoModal'
import { getCoachRecommendation } from '../utils/coachEngine'
import { exerciseDetails } from '../utils/exerciseLibrary'
import { equipmentOptions, numberFrom, summariseSets, weightUnitOptions } from '../utils/workout'
import '../machineCoach.css'

const difficultyOptions = [
  ['Easy', '😀 Easy'],
  ['Good', '🙂 Good'],
  ['Challenging', '🥵 Challenging'],
  ['Failure', '💀 Failure']
]

export default function ExerciseCard({
  index, displayIndex = index, exercise, best, previous, recovery, update, updateSet, addSet, removeSet,
  removeExercise, replaceExercise, restoreExercise, toggleComplete, toggleCollapsed
}) {
  const [showSwaps, setShowSwaps] = useState(false)
  const [demoExercise, setDemoExercise] = useState(null)
  const total = exercise.sets.reduce((sum, set) => sum + (numberFrom(set.reps) || 0), 0)
  const isTargetTotal = exercise.type === 'target-total'
  const isBodyweight = exercise.equipment === 'Bodyweight'
  const targetComplete = isTargetTotal && exercise.targetTotal && total >= exercise.targetTotal
  const summary = summariseSets(exercise)
  const coach = getCoachRecommendation(exercise, previous, recovery)
  const details = exerciseDetails(exercise)

  function showDemo(name) {
    const demo = exerciseDetails(name)
    setDemoExercise({ name, demoQuery: demo.demoQuery })
  }

  return (
    <>
      <div className={`workoutExerciseCard ${exercise.isComplete ? 'completedExercise' : ''} ${!exercise.isCollapsed && !exercise.isComplete ? 'activeExercise' : ''}`}>
        <div className="exerciseTitleRow">
          <button className="collapseHeader" type="button" onClick={() => toggleCollapsed(index)}>
            <span className="collapseIcon">
              {exercise.isComplete
                ? <Check size={18}/>
                : exercise.isCollapsed ? <ChevronDown size={18}/> : <ChevronUp size={18}/>} 
            </span>
            <span>
              {exercise.isExtra
                ? <span className="extraTitle">Extra exercise</span>
                : <h3>{displayIndex + 1}. {exercise.name}</h3>}
              {exercise.isOptional && <span className="optionalPill">Extended</span>}
              {exercise.isSwap && <span className="swapPill">Substitution</span>}
              <span className="collapsedSummary">{exercise.isComplete ? (summary || 'Completed') : (summary || exercise.target)}</span>
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

            <button className="demoButton" type="button" onClick={() => showDemo(exercise.name)}>
              <Play size={18} fill="currentColor"/> Watch quick demo
            </button>

            <CoachCard recommendation={coach} />
            <WorkoutReplay previous={previous} best={best} />

            <div className="muscleGrid">
              <div>
                <span className="guideLabel">Primary</span>
                <strong>{details.primaryMuscles.join(' · ') || 'Not set'}</strong>
              </div>
              {details.secondaryMuscles.length > 0 && (
                <div>
                  <span className="guideLabel">Also works</span>
                  <strong>{details.secondaryMuscles.join(' · ')}</strong>
                </div>
              )}
            </div>

            {details.cue && (
              <div className="techniqueCard">
                <span className="guideLabel">Technique</span>
                <p>{details.cue}</p>
              </div>
            )}

            {details.alternatives.length > 0 && (
              <div className="machineBusy">
                <button className="busyButton" type="button" onClick={() => setShowSwaps(value => !value)}>
                  <Wrench size={17}/> {showSwaps ? 'Hide alternatives' : 'Machine busy?'}
                </button>

                {showSwaps && (
                  <div className="swapOptions">
                    <p>Choose an alternative for today:</p>
                    {details.alternatives.map(name => (
                      <div className="swapOptionRow" key={name}>
                        <button className="swapDemoButton" type="button" onClick={() => showDemo(name)}>
                          <Play size={15}/> Demo
                        </button>
                        <button
                          className="swapChoiceButton"
                          type="button"
                          onClick={() => {
                            replaceExercise(index, name)
                            setShowSwaps(false)
                          }}
                        >
                          <strong>{name}</strong>
                          <span>Use this exercise</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {exercise.isSwap && exercise.originalName && (
                  <button className="restoreButton" type="button" onClick={() => restoreExercise(index)}>
                    <RefreshCw size={15}/> Restore {exercise.originalName}
                  </button>
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
            </div>

            <div className="difficultyPicker">
              <label>How did it feel?</label>
              <div className="difficultyOptions">
                {difficultyOptions.map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    className={exercise.difficulty === value ? 'active' : ''}
                    onClick={() => update(index, 'difficulty', exercise.difficulty === value ? '' : value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
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

      {demoExercise && (
        <ExerciseDemoModal
          exerciseName={demoExercise.name}
          demoQuery={demoExercise.demoQuery}
          onClose={() => setDemoExercise(null)}
        />
      )}
    </>
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
          {previous?.workoutDate && <small>{formatReplayDate(previous.workoutDate)}</small>}
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
  const weights = [1, 2, 3, 4, 5, 6].map(index => previous[`weight_${index}`])
  const reps = [1, 2, 3, 4, 5, 6].map(index => previous[`set_${index}`])
  return reps.map((rep, index) => {
    if (!rep) return null
    const weight = weights[index] || previous.weight
    return weight ? `${weight} × ${rep}` : `${rep}`
  }).filter(Boolean)
}

function formatReplayDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateValue
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
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
      <div className="confidence">
        <span>Confidence</span>
        <strong>{'★'.repeat(recommendation.confidence || 3)}{'☆'.repeat(5 - (recommendation.confidence || 3))}</strong>
      </div>
    </div>
  )
}
