import React from 'react'
import { Activity, Dumbbell, Flame, Trophy, Weight } from 'lucide-react'
import { profile } from '../seed'
import { Chart, Metric } from './Ui'
import { getDashboardStats, getTrendSummary } from '../utils/stats'

export default function Dashboard({ workouts, body, bests, cloudStatus, legPressChart, currentWorkout }) {
  const stats = getDashboardStats({
    workouts,
    body,
    bests,
    targetWorkouts: profile.targetWorkouts
  })
  const weightChange = stats.weightChange === null
    ? 'No weight trend yet'
    : `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}kg overall`

  return (
    <>
      <header className="topHero">
        <div className="eyebrow">Strength Journey</div>
        <h1>Welcome back, Stephen</h1>
        <p className="muted">{profile.gym} · {profile.goal}</p>
      </header>

      <section className="coachCard">
        <div className="coachIcon"><Flame size={22}/></div>
        <div>
          <div className="coachLabel">Today&apos;s workout</div>
          <h2>{currentWorkout.name}</h2>
          <p>Main focus: <strong>{currentWorkout.mainTarget}</strong>. {currentWorkout.description}</p>
        </div>
      </section>

      <section className="quickGrid">
        <Metric icon={<Weight/>} value={stats.latestWeight === null ? '—' : `${stats.latestWeight}kg`} label={weightChange} />
        <Metric icon={<Trophy/>} value={`${stats.totalWorkouts}/${profile.targetWorkouts}`} label="Sessions done" />
        <Metric icon={<Activity/>} value={stats.recentWorkoutCount} label="Last 30 days" />
        <Metric icon={<Dumbbell/>} value={stats.personalBestCount} label="Personal bests" />
      </section>

      <section className="card progressCard">
        <div className="row">
          <div>
            <h2>12-week block</h2>
            <p className="muted">Session {stats.nextSession} of {profile.targetWorkouts}</p>
          </div>
          <span className="ring">{stats.progressPercent}%</span>
        </div>
        <div className="progress"><div className="bar" style={{ width: `${stats.progressPercent}%` }} /></div>
      </section>

      <section className="card">
        <div className="row">
          <div><h2>Leg press trend</h2><p className="muted">Your first big strength marker</p></div>
          <span className="pill">{getTrendSummary(legPressChart)}</span>
        </div>
        <Chart data={legPressChart} />
      </section>

      <section className="card subtle">
        <h2>Cloud status</h2>
        <p className="status">{cloudStatus}</p>
      </section>
    </>
  )
}
