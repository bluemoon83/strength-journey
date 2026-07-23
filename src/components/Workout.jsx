import React from 'react'
import { Check, Plus } from 'lucide-react'
import ExerciseCard from './ExerciseCard'
import { cleanWeight, createWorkoutDraft, equipmentOptions } from '../utils/workout'
import { swapExercise } from '../utils/exerciseLibrary'
import '../workoutFlow.css'

export default function Workout({
  onSave, bests, previousByExercise, currentWorkout, workoutDraft, setWorkoutDraft, resetWorkoutDraft
}) {
  const items = workoutDraft?.exercises || []
  const notes = workoutDraft?.notes || ''
  const recovery = workoutDraft?.recovery || 'Good'
  const workoutMode = workoutDraft?.workoutMode || 'standard'

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
        isOptional: false,
        isCollapsed: true,
        isComplete: false,
        difficulty: '',
        sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }]
      }]
    }))
  }

  function replaceExercise(index, replacementName) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) =>
        i === index ? swapExercise(item, replacementName) : item
      )
    }))
  }

  function restoreExercise(index) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) =>
        i === index && item.originalName
          ? swapExercise({ ...item, originalName: null }, item.originalName)
          : item
      )
    }))
  }

  const removeExercise = index => updateDraft(draft => ({
    ...draft,
    exercises: draft.exercises.filter((_, i) => i !== index)
  }))

  const isVisible = (item, mode = workoutMode) => mode === 'extended' || !item.isOptional

  function toggleComplete(index) {
    updateDraft(draft => {
      const complete = !draft.exercises[index].isComplete
      const mode = draft.workoutMode || 'standard'
      const nextIndex = complete
        ? draft.exercises.findIndex((item, i) => i > index && !item.isComplete && isVisible(item, mode))
        : -1

      return {
        ...draft,
        exercises: draft.exercises.map((item, i) => {
          if (i === index) return { ...item, isComplete: complete, isCollapsed: complete }
          if (complete && i === nextIndex) return { ...item, isCollapsed: false }
          return item
        })
      }
    })

    window.setTimeout(() => {
      document.querySelector('.workoutExerciseCard.activeExercise')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  const toggleCollapsed = index => updateDraft(draft => ({
    ...draft,
    exercises: draft.exercises.map((item, i) => {
      if (i === index) return { ...item, isCollapsed: !item.isCollapsed }
      return item.isComplete ? item : { ...item, isCollapsed: true }
    })
  }))

  const setWorkoutMode = mode => updateDraft(draft => ({
    ...draft,
    workoutMode: mode,
    exercises: draft.exercises.map(item => ({ ...item, isCollapsed: true }))
  }))

  const updateNotes = value => updateDraft(draft => ({ ...draft, notes: value }))
  const updateRecovery = value => updateDraft(draft => ({ ...draft, recovery: value }))

  function handleReset() {
    if (window.confirm('Clear your current workout entries and start again?')) resetWorkoutDraft()
  }

  const recoveryOptions = [
    ['Great', '😀'],
    ['Good', '🙂'],
    ['Average', '😐'],
    ['Tired', '😫']
  ]

  const visibleItems = items
    .map((exercise, originalIndex) => ({ exercise, originalIndex }))
    .filter(({ exercise }) => isVisible(exercise))
  const completedCount = visibleItems.filter(({ exercise }) => exercise.isComplete).length
  const progress = visibleItems.length ? Math.round((completedCount / visibleItems.length) * 100) : 0

  return (
    <>
      <header className="workoutHeader">
        <div>
          <div className="eyebrow">{currentWorkout.subtitle}</div>
          <h1>{currentWorkout.name}</h1>
          <p className="muted">{visibleItems.length} exercises · {workoutMode === 'extended' ? '60–75' : '45–60'} minutes</p>
        </div>
      </header>

      <section className="card recoveryCard">
        <h2>How are you feeling today?</h2>
        <p className="muted">The coach will adjust its recommendations.</p>
        <div className="recoveryOptions">
          {recoveryOptions.map(([option, icon]) => (
            <button
              key={option}
              type="button"
              className={recovery === option ? 'recoveryButton active' : 'recoveryButton'}
              onClick={() => updateRecovery(option)}
            >
              <span>{icon}</span>{option}
            </button>
          ))}
        </div>
      </section>

      <section className="card workoutModeCard">
        <h2>Choose your workout</h2>
        <div className="workoutModeOptions">
          <button type="button" className={workoutMode === 'standard' ? 'workoutModeButton active' : 'workoutModeButton'} onClick={() => setWorkoutMode('standard')}>
            <strong>Standard</strong><span>45–60 minutes</span>
          </button>
          <button type="button" className={workoutMode === 'extended' ? 'workoutModeButton active' : 'workoutModeButton'} onClick={() => setWorkoutMode('extended')}>
            <strong>Extended</strong><span>Adds optional exercises</span>
          </button>
        </div>
      </section>

      <section className="workoutProgressCard">
        <div className="workoutProgressHeading">
          <strong>{completedCount} / {visibleItems.length} exercises complete</strong>
          <span>{progress}%</span>
        </div>
        <div className="workoutProgressTrack">
          <div className="workoutProgressFill" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="workoutList">
        {visibleItems.map(({ exercise, originalIndex }, displayIndex) => (
          <ExerciseCard
            key={`${exercise.name}-${originalIndex}`}
            index={originalIndex}
            displayIndex={displayIndex}
            exercise={exercise}
            best={bests[exercise.name]}
            previous={previousByExercise[exercise.name]}
            recovery={recovery}
            update={update}
            updateSet={updateSet}
            addSet={addSet}
            removeSet={removeSet}
            removeExercise={removeExercise}
            replaceExercise={replaceExercise}
            restoreExercise={restoreExercise}
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
        <button className="btn" onClick={() => onSave({ exercises: visibleItems.map(({ exercise }) => exercise), notes })}>
          <Check size={18}/> Finish + save to cloud
        </button>
        <button className="secondaryBtn" type="button" onClick={handleReset}>
          Start this workout again
        </button>
      </section>
    </>
  )
}
