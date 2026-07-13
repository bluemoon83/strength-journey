import React from 'react'
import { Check, Plus } from 'lucide-react'
import ExerciseCard from './ExerciseCard'
import { cleanWeight, createWorkoutDraft, equipmentOptions } from '../utils/workout'

export default function Workout({
  onSave, bests, previousByExercise, currentWorkout, workoutDraft, setWorkoutDraft, resetWorkoutDraft
}) {
  const items = workoutDraft?.exercises || []
  const notes = workoutDraft?.notes || ''

  function updateDraft(updater) {
    setWorkoutDraft(prev => updater(prev || createWorkoutDraft(currentWorkout)))
  }

  function update(index, key, value) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) => i === index ? { ...item, [key]: value } : item)
    }))
  }

  function updateSet(exerciseIndex, setIndex, key, value) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) => {
        if (i !== exerciseIndex) return item
        const sets = [...item.sets]
        sets[setIndex] = {
          ...sets[setIndex],
          [key]: key === 'weight' ? cleanWeight(value) : value
        }
        return { ...item, sets }
      })
    }))
  }

  function addSet(exerciseIndex) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) => {
        if (i !== exerciseIndex || item.sets.length >= 6) return item
        const previousSet = item.sets[item.sets.length - 1]
        return {
          ...item,
          sets: [...item.sets, {
            weight: item.equipment === 'Bodyweight'
              ? ''
              : (previousSet?.weight || cleanWeight(item.defaultWeight) || cleanWeight(item.weight) || ''),
            reps: ''
          }]
        }
      })
    }))
  }

  function removeSet(exerciseIndex) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) => {
        if (i !== exerciseIndex || item.sets.length <= 1) return item
        return { ...item, sets: item.sets.slice(0, -1) }
      })
    }))
  }

  function addExercise() {
    updateDraft(draft => ({
      ...draft,
      exercises: [...draft.exercises, {
        name: 'Extra exercise',
        type: 'strength',
        equipment: 'Machine',
        equipmentOptions,
        weightUnit: 'kg',
        target: 'Optional extra',
        reps: '8–12',
        defaultWeight: '',
        targetTotal: null,
        isExtra: true,
        isCollapsed: false,
        isComplete: false,
        difficulty: '',
        sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }]
      }]
    }))
  }

  const removeExercise = index => updateDraft(draft => ({
    ...draft,
    exercises: draft.exercises.filter((_, i) => i !== index)
  }))

  function toggleComplete(index) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) => {
        if (i !== index) return item
        const complete = !item.isComplete
        return { ...item, isComplete: complete, isCollapsed: complete }
      })
    }))
  }

  const toggleCollapsed = index => updateDraft(draft => ({
    ...draft,
    exercises: draft.exercises.map((item, i) => i === index ? { ...item, isCollapsed: !item.isCollapsed } : item)
  }))

  const updateNotes = value => updateDraft(draft => ({ ...draft, notes: value }))

  function handleReset() {
    if (window.confirm('Clear your current workout entries and start again?')) resetWorkoutDraft()
  }

  return (
    <>
      <header className="workoutHeader">
        <div>
          <div className="eyebrow">{currentWorkout.subtitle}</div>
          <h1>{currentWorkout.name}</h1>
          <p className="muted">{items.length} exercises · 45–60 minutes</p>
        </div>
      </header>

      <section className="card subtle">
        <h2>Workout draft saved</h2>
        <p className="muted">You can check History or Progress and come back without losing this workout.</p>
      </section>

      <section className="workoutList">
        {items.map((exercise, index) => (
          <ExerciseCard
            key={`${exercise.name}-${index}`}
            index={index}
            exercise={exercise}
            best={bests[exercise.name]}
            previous={previousByExercise[exercise.name]}
            update={update}
            updateSet={updateSet}
            addSet={addSet}
            removeSet={removeSet}
            removeExercise={removeExercise}
            toggleComplete={toggleComplete}
            toggleCollapsed={toggleCollapsed}
          />
        ))}
      </section>

      <button className="secondaryBtn" type="button" onClick={addExercise}>
        <Plus size={18}/> Add extra exercise
      </button>

      <section className="card">
        <label>Session notes</label>
        <textarea
          value={notes}
          onChange={e => updateNotes(e.target.value)}
          placeholder="Energy, difficulty, anything awkward or too easy..."
        />
        <button className="btn" onClick={() => onSave({ exercises: items, notes })}>
          <Check size={18}/> Finish + save to cloud
        </button>
        <button className="secondaryBtn" type="button" onClick={handleReset}>
          Start this workout again
        </button>
      </section>
    </>
  )
}
