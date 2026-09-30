import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { formatHistoryExercise } from '../utils/workout'

export default function History({ workouts }) {
  const [query, setQuery] = useState('')
  const [workoutName, setWorkoutName] = useState('All workouts')
  const [expandedId, setExpandedId] = useState(null)

  const workoutNames = useMemo(
    () => [...new Set(workouts.map(workout => workout.name).filter(Boolean))].sort(),
    [workouts]
  )

  const filteredWorkouts = useMemo(() => {
    const search = query.trim().toLowerCase()
    return [...workouts]
      .reverse()
      .filter(workout => workoutName === 'All workouts' || workout.name === workoutName)
      .filter(workout => {
        if (!search) return true
        return [
          workout.date,
          workout.name,
          workout.notes,
          ...(workout.exercises || []).map(exercise => exercise.exercise_name)
        ].some(value => String(value || '').toLowerCase().includes(search))
      })
  }, [query, workoutName, workouts])

  return (
    <>
      <header className="historyHeading">
        <div>
          <h1>History</h1>
          <p className="muted">{workouts.length} workouts logged</p>
        </div>
        <span className="pill">{filteredWorkouts.length} shown</span>
      </header>

      <section className="historyFilters" aria-label="Workout history filters">
        <label className="historySearch">
          <Search size={17} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search exercise, workout or date"
            aria-label="Search workout history"
          />
        </label>
        <select value={workoutName} onChange={event => setWorkoutName(event.target.value)} aria-label="Filter by workout">
          <option>All workouts</option>
          {workoutNames.map(name => <option key={name}>{name}</option>)}
        </select>
      </section>

      {filteredWorkouts.map((workout, index) => {
        const id = workout.id || `${workout.date}-${workout.name}-${index}`
        const isExpanded = expandedId === id
        const exerciseCount = workout.exercises?.length || 0

        return (
          <article className="historyWorkout" key={id}>
            <button
              className="historyWorkoutHeader"
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : id)}
              aria-expanded={isExpanded}
            >
              <span>
                <small>{formatDate(workout.date)}</small>
                <strong>{workout.name}</strong>
                <em>{exerciseCount} exercises</em>
              </span>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {isExpanded && (
              <div className="historyWorkoutDetails">
                {(workout.exercises || []).map((exercise, exerciseIndex) => (
                  <div className="historyExercise" key={exercise.id || `${exercise.exercise_name}-${exerciseIndex}`}>
                    {formatHistoryExercise(exercise)}
                    {exercise.difficulty && <span>{exercise.difficulty}</span>}
                  </div>
                ))}
                {workout.notes && <p className="historyNotes">{workout.notes}</p>}
              </div>
            )}
          </article>
        )
      })}

      {filteredWorkouts.length === 0 && (
        <section className="card subtle">
          <h2>No workouts found</h2>
          <p className="muted">Try another exercise, workout name or date.</p>
        </section>
      )}
    </>
  )
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
