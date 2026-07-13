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
      <section className="card">
        <h2>Coming next</h2>
        <p className="muted">
          Previous workout comparison, rest timer, exercise videos,
          press-up challenge, and smarter progression recommendations.
        </p>
      </section>
    </>
  )
}
