import React from 'react'
import {
  Database,
  Download,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react'
import {
  downloadAiReviewPack,
  downloadBodyCsv,
  downloadJsonBackup,
  downloadWorkoutsCsv
} from '../utils/exportData'

export default function Settings({
  cloudStatus,
  reload,
  workouts,
  body,
  bests
}) {
  return (
    <>
      <h1>Settings</h1>

      <section className="card">
        <h2>Supabase</h2>
        <p className="status">{cloudStatus}</p>
        <button className="btn" onClick={reload}>
          Test / reload cloud
        </button>
      </section>

      <section className="card">
        <div className="row">
          <div>
            <h2>Export Centre</h2>
            <p className="muted">
              Download your training data for analysis or backup.
            </p>
          </div>
          <Download size={22} />
        </div>

        <div className="exportGrid">
          <button className="exportButton" type="button" onClick={() => downloadWorkoutsCsv(workouts)}>
            <FileSpreadsheet size={20} />
            <span><strong>Workouts CSV</strong><small>One row per set</small></span>
          </button>

          <button className="exportButton" type="button" onClick={() => downloadBodyCsv(body)}>
            <FileSpreadsheet size={20} />
            <span><strong>Body CSV</strong><small>Weight and waist history</small></span>
          </button>

          <button className="exportButton" type="button" onClick={() => downloadJsonBackup({ workouts, body, bests })}>
            <Database size={20} />
            <span><strong>Full backup</strong><small>Complete JSON copy</small></span>
          </button>

          <button className="exportButton exportButtonPrimary" type="button" onClick={() => downloadAiReviewPack({ workouts, body, bests })}>
            <Sparkles size={20} />
            <span><strong>AI Review Pack</strong><small>Upload this file to ChatGPT</small></span>
          </button>
        </div>

        <p className="exportHelp">
          The AI Review Pack is one JSON file containing your workout
          sets, body measurements, personal bests and summary totals.
        </p>
      </section>

      <section className="card subtle">
        <h2>Strength Journey</h2>
        <p className="status">v0.8.1 • Guided Workout Progress</p>
      </section>

      <section className="card">
        <h2>Coming next</h2>
        <p className="muted">
          Estimated one-rep max, volume trends and weekly coaching summaries.
        </p>
      </section>
    </>
  )
}
