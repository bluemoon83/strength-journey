import React, { useState } from 'react'
import { Chart, Field } from './Ui'

export default function Progress({ bests, body, onSaveBody, legPressChart }) {
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')

  return (
    <>
      <h1>Progress</h1>

      <section className="card">
        <h2>Personal bests</h2>
        {Object.keys(bests).map(name => (
          <div className="record" key={name}>
            <span>{name}</span>
            <strong>{bests[name].display}</strong>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Leg press chart</h2>
        <Chart data={legPressChart} />
      </section>

      <section className="card">
        <h2>Body update</h2>
        <div className="grid">
          <Field label="Weight kg" value={weight} onChange={setWeight} />
          <Field label="Waist cm" value={waist} onChange={setWaist} />
        </div>
        <button className="btn" onClick={() => onSaveBody(weight, waist)}>Save body update</button>

        {body.slice().reverse().map((entry, index) => (
          <div className="logitem" key={index}>
            {entry.update_date || entry.date}: <strong>{entry.weight_kg || entry.weightKg}kg</strong>
            {entry.waist_cm ? ` · Waist ${entry.waist_cm}cm` : ''}
          </div>
        ))}
      </section>
    </>
  )
}
