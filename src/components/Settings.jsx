import React, { useState } from 'react'
import {
  ArchiveRestore,
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
import { createRestorePlan, parseBackup } from '../utils/backup'

export default function Settings({
  cloudStatus,
  reload,
  workouts,
  body,
  bests,
  onRestoreBackup
}) {
  const [restorePreview, setRestorePreview] = useState(null)
  const [restoreMessage, setRestoreMessage] = useState('')
  const [restoreError, setRestoreError] = useState('')
  const [restoring, setRestoring] = useState(false)

  async function selectBackup(event) {
    setRestoreMessage('')
    setRestoreError('')
    setRestorePreview(null)

    const file = event.target.files?.[0]
    if (!file) return

    try {
      const backup = parseBackup(await file.text())
      const plan = createRestorePlan(backup, workouts, body)
      setRestorePreview({ backup, plan, filename: file.name })
    } catch (error) {
      setRestoreError(error.message)
    } finally {
      event.target.value = ''
    }
  }

  async function restoreBackup() {
    if (!restorePreview || restoring) return
    const { plan } = restorePreview

    if (!plan.workouts.length && !plan.bodyUpdates.length) {
      setRestoreMessage('Everything in this backup is already present. Nothing was changed.')
      return
    }

    const approved = window.confirm(
      `Restore ${plan.workouts.length} missing workouts and ${plan.bodyUpdates.length} missing body updates? Existing records will not be changed.`
    )
    if (!approved) return

    try {
      setRestoring(true)
      setRestoreError('')
      const result = await onRestoreBackup(restorePreview.backup)
      setRestoreMessage(`Restored ${result.workouts} workouts and ${result.bodyUpdates} body updates.`)
      setRestorePreview(null)
    } catch (error) {
      setRestoreError(error.message)
    } finally {
      setRestoring(false)
    }
  }

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

        <div className="restorePanel">
          <div className="row">
            <div>
              <h3>Restore a backup</h3>
              <p>Choose a full JSON backup. The app previews it and skips records already in Supabase.</p>
            </div>
            <ArchiveRestore size={22} />
          </div>

          <label className="secondaryBtn">
            Choose backup file
            <input type="file" accept="application/json,.json" onChange={selectBackup} hidden />
          </label>

          {restorePreview && (
            <div className="restorePreview">
              <strong>{restorePreview.filename}</strong>
              <p>
                Ready to restore: {restorePreview.plan.workouts.length} workouts and{' '}
                {restorePreview.plan.bodyUpdates.length} body updates. Skipping{' '}
                {restorePreview.plan.skippedWorkouts + restorePreview.plan.skippedBodyUpdates} existing or invalid records.
              </p>
              <button className="btn" type="button" onClick={restoreBackup} disabled={restoring}>
                <ArchiveRestore size={18} /> {restoring ? 'Restoring safely...' : 'Restore missing records'}
              </button>
            </div>
          )}

          {restoreMessage && <p className="restoreMessage">{restoreMessage}</p>}
          {restoreError && <p className="restoreMessage restoreError" role="alert">{restoreError}</p>}
        </div>
      </section>

      <section className="card subtle">
        <h2>Strength Journey</h2>
        <p className="status">v0.9.2 • Reliable History</p>
      </section>

      <section className="card">
        <h2>Coming next</h2>
        <p className="muted">
          Account security, estimated one-rep max, volume trends and weekly coaching summaries.
        </p>
      </section>
    </>
  )
}
