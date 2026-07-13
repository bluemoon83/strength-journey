import React from 'react'
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Field, SelectField } from './Ui'
import {
  equipmentOptions,
  numberFrom,
  summariseSets,
  weightUnitOptions
} from '../utils/workout'

export default function ExerciseCard({
  index, exercise, best, update, updateSet, addSet, removeSet,
  removeExercise, toggleComplete, toggleCollapsed
}) {
  const total = exercise.sets.reduce((sum, set) => sum + (numberFrom(set.reps) || 0), 0)
  const isTargetTotal = exercise.type === 'target-total'
  const isBodyweight = exercise.equipment === 'Bodyweight'
  const targetComplete = isTargetTotal && exercise.targetTotal && total >= exercise.targetTotal
  const summary = summariseSets(exercise)

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

          <p className="muted">Previous best: <strong>{best?.display || 'Not logged yet'}</strong></p>

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
