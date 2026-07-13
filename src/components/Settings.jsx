import React from 'react'

export default function Settings({ cloudStatus, reload }) {
  return (
    <>
      <h1>Settings</h1>
      <section className="card">
        <h2>Supabase</h2>
        <p className="status">{cloudStatus}</p>
        <button className="btn" onClick={reload}>Test / reload cloud</button>
      </section>
      <section className="card subtle">
        <h2>Strength Journey</h2>
        <p className="status">v0.5.2 · Workout Replay</p>
      </section>

      <section className="card">
        <h2>Coming next</h2>
        <p className="muted">
          Export centre, redesigned History and Progress,
          rest timer, and smarter progression recommendations.
        </p>
      </section>
    </>
  )
}
