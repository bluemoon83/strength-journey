import React, { useEffect, useMemo, useState } from 'react'
import { Chart, Field, SelectField } from './Ui'

export default function Progress({
  bests,
  body,
  onSaveBody,
  exerciseProgress
}) {
  const exerciseNames = useMemo(
    () => Object.keys(exerciseProgress || {}).sort((a, b) => a.localeCompare(b)),
    [exerciseProgress]
  )

  const preferredExercise = exerciseNames.includes('Leg Press')
    ? 'Leg Press'
    : (exerciseNames[0] || '')

  const [selectedExercise, setSelectedExercise] = useState(preferredExercise)
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')

  useEffect(() => {
    if (!selectedExercise || !exerciseNames.includes(selectedExercise)) {
      setSelectedExercise(preferredExercise)
    }
  }, [exerciseNames, preferredExercise, selectedExercise])

  const selectedData = exerciseProgress?.[selectedExercise] || []

  return (
    <>
      <h1>Progress</h1>

      <section className="card">
        <h2>Exercise progress</h2>
        <p className="muted">
          Select any weighted exercise to see the highest weight recorded in each workout.
        </p>

        {exerciseNames.length > 0 ? (
          <>
            <SelectField
              label="Exercise"
              value={selectedExercise}
              options={exerciseNames}
              onChange={setSelectedExercise}
            />

            <div style={{ marginTop: 16 }}>
              <h3>{selectedExercise}</h3>
              <Chart data={selectedData} />
            </div>

            {selectedData.length === 1 && (
              <p className="muted">
                One result logged so far. The trend line will become more useful after another session.
              </p>
            )}
          </>
        ) : (
          <p className="muted">
            No weighted exercise results have been logged yet.
          </p>
        )}
      </section>

      <section className="card">
        <h2>Personal bests</h2>
        {Object.keys(bests).length === 0 && (
          <p className="muted">No personal bests recorded yet.</p>
        )}
        {Object.keys(bests)
          .sort((a, b) => a.localeCompare(b))
          .map(name => (
            <div className="record" key={name}>
              <span>{name}</span>
              <strong>{bests[name].display}</strong>
            </div>
          ))}
      </section>

      <section className="card">
        <h2>Body update</h2>
        <div className="grid">
          <Field label="Weight kg" value={weight} onChange={setWeight} />
          <Field label="Waist cm" value={waist} onChange={setWaist} />
        </div>
        <button className="btn" onClick={() => onSaveBody(weight, waist)}>
          Save body update
        </button>

        {body.slice().reverse().map((entry, index) => (
          <div className="logitem" key={index}>
            {entry.update_date || entry.date}:{' '}
            <strong>{entry.weight_kg || entry.weightKg}kg</strong>
            {entry.waist_cm ? ` · Waist ${entry.waist_cm}cm` : ''}
          </div>
        ))}
      </section>
    </>
  )
}
