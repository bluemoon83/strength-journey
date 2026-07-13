import React from 'react'
import { Dumbbell, Flame, Trophy, Weight } from 'lucide-react'
import { profile } from '../seed'
import { Chart, Metric } from './Ui'

export default function Dashboard({ workouts, body, bests, cloudStatus, legPressChart, currentWorkout }) {
  const latestWeight = body?.[body.length - 1]?.weight_kg || profile.startingWeightKg
  const pct = Math.round((workouts.length / profile.targetWorkouts) * 100)
  const nextSession = workouts.length + 1

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
        <Metric icon={<Weight/>} value={`${latestWeight}kg`} label="Latest weight" />
        <Metric icon={<Trophy/>} value={`${workouts.length}/${profile.targetWorkouts}`} label="Sessions done" />
        <Metric icon={<Flame/>} value="40" label="July press-ups" />
        <Metric icon={<Dumbbell/>} value={bests['Leg Press']?.display?.split('×')[0] || '77kg'} label="Leg press PB" />
      </section>

      <section className="card progressCard">
        <div className="row">
          <div>
            <h2>12-week block</h2>
            <p className="muted">Session {nextSession} of {profile.targetWorkouts}</p>
          </div>
          <span className="ring">{pct}%</span>
        </div>
        <div className="progress"><div className="bar" style={{ width: `${pct}%` }} /></div>
      </section>

      <section className="card">
        <div className="row">
          <div><h2>Leg press trend</h2><p className="muted">Your first big strength marker</p></div>
          <span className="pill">68 → 77kg</span>
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
