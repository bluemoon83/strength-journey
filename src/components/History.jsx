import React from 'react'
import { formatHistoryExercise } from '../utils/workout'

export default function History({ workouts }) {
  return (
    <>
      <h1>History</h1>
      <p className="muted">{workouts.length} workouts logged</p>
      {workouts.slice().reverse().map((workout, index) => (
        <section className="logitem" key={workout.id || index}>
          <div className="row">
            <strong>{workout.date}</strong>
            <span className="pill">{workout.name}</span>
          </div>
          <p className="muted">
            {(workout.exercises || []).map(formatHistoryExercise).join('\n')}
          </p>
        </section>
      ))}
    </>
  )
}
