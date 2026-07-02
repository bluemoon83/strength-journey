import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, BarChart3, Dumbbell, Home, Settings as SettingsIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from './supabase'
import { profile, nextWorkout, localSeedWorkouts } from './seed'
import './styles.css'

const today = () => new Date().toISOString().slice(0, 10)
const numberFrom = (value) => {
  const n = parseFloat(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : null
}

function App() {
  const [tab, setTab] = useState('home')
  const [profileId, setProfileId] = useState(localStorage.getItem('sj_profile_id'))
  const [workouts, setWorkouts] = useState(localSeedWorkouts)
  const [body, setBody] = useState([{ date: '2026-07-02', weight_kg: 89, waist_cm: '' }])
  const [cloudStatus, setCloudStatus] = useState('Ready')

  useEffect(() => {
    loadCloudData()
  }, [])

  async function ensureProfile() {
    if (profileId) return profileId

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        name: profile.name,
        age: profile.age,
        gym: profile.gym,
        goal: profile.goal,
        starting_weight_kg: profile.startingWeightKg,
        target_weight_kg: profile.targetWeightKg
      })
      .select()
      .single()

    if (error) throw error
    setProfileId(data.id)
    localStorage.setItem('sj_profile_id', data.id)
    return data.id
  }

  async function loadCloudData() {
    try {
      setCloudStatus('Checking cloud...')
      const pid = await ensureProfile()

      const { data: cloudWorkouts, error: wErr } = await supabase
        .from('workouts')
        .select('id, workout_date, workout_name, notes, workout_sets(*)')
        .eq('profile_id', pid)
        .order('workout_date', { ascending: true })

      if (wErr) throw wErr

      if (cloudWorkouts?.length) {
        setWorkouts(cloudWorkouts.map(w => ({
          id: w.id,
          date: w.workout_date,
          name: w.workout_name,
          notes: w.notes,
          exercises: w.workout_sets || []
        })))
      }

      const { data: bodyRows } = await supabase
        .from('body_updates')
        .select('*')
        .eq('profile_id', pid)
        .order('update_date', { ascending: true })

      if (bodyRows?.length) setBody(bodyRows)
      setCloudStatus('Cloud sync connected')
    } catch (err) {
      setCloudStatus('Cloud error: ' + err.message)
    }
  }

  const bests = useMemo(() => {
    const out = {}
    for (const w of workouts) {
      for (const ex of w.exercises || []) {
        const name = ex.exercise_name
        const weight = numberFrom(ex.weight)
        const reps = [ex.set_1, ex.set_2, ex.set_3].map(numberFrom).filter(Boolean)
        if (!name || !reps.length) continue
        const bestRep = Math.max(...reps)
        const score = (weight || 1) * bestRep
        if (!out[name] || score > out[name].score) {
          out[name] = { display: `${ex.weight} × ${bestRep}`, score, weight: weight || 0 }
        }
      }
    }
    return out
  }, [workouts])

  const legPressChart = workouts
    .map(w => {
      const lp = (w.exercises || []).find(e => e.exercise_name === 'Leg Press')
      return lp ? { date: w.date.slice(5), weight: numberFrom(lp.weight) } : null
    })
    .filter(Boolean)

  async function saveWorkout(formData) {
    try {
      const pid = await ensureProfile()

      const { data: workout, error: wErr } = await supabase
        .from('workouts')
        .insert({
          profile_id: pid,
          workout_date: today(),
          workout_name: nextWorkout.name,
          notes: formData.notes
        })
        .select()
        .single()

      if (wErr) throw wErr

      const rows = formData.exercises.map(ex => ({
        workout_id: workout.id,
        exercise_name: ex.name,
        weight: ex.weight,
        set_1: ex.set1,
        set_2: ex.set2,
        set_3: ex.set3,
        difficulty: ex.difficulty
      }))

      const { error: sErr } = await supabase.from('workout_sets').insert(rows)
      if (sErr) throw sErr

      await loadCloudData()
      setTab('history')
      alert('Workout saved to Supabase.')
    } catch (err) {
      alert('Could not save workout: ' + err.message)
    }
  }

  async function saveBody(weight, waist) {
    try {
      const pid = await ensureProfile()
      const row = { profile_id: pid, update_date: today(), weight_kg: weight, waist_cm: waist || null }
      const { error } = await supabase.from('body_updates').insert(row)
      if (error) throw error
      await loadCloudData()
      alert('Body update saved.')
    } catch (err) {
      alert('Could not save body update: ' + err.message)
    }
  }

  return (
    <div>
      <main className="app">
        {tab === 'home' && <Dashboard workouts={workouts} body={body} bests={bests} cloudStatus={cloudStatus} legPressChart={legPressChart} />}
        {tab === 'workout' && <Workout onSave={saveWorkout} />}
        {tab === 'history' && <History workouts={workouts} />}
        {tab === 'progress' && <Progress bests={bests} body={body} onSaveBody={saveBody} legPressChart={legPressChart} />}
        {tab === 'settings' && <Settings cloudStatus={cloudStatus} reload={loadCloudData} />}
      </main>

      <nav className="tabbar">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><Home size={18}/>Home</button>
        <button className={tab === 'workout' ? 'active' : ''} onClick={() => setTab('workout')}><Dumbbell size={18}/>Workout</button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}><Activity size={18}/>History</button>
        <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}><BarChart3 size={18}/>Progress</button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}><SettingsIcon size={18}/>Settings</button>
      </nav>
    </div>
  )
}

function Dashboard({ workouts, body, bests, cloudStatus, legPressChart }) {
  const latestWeight = body?.[body.length - 1]?.weight_kg || profile.startingWeightKg
  const pct = Math.round((workouts.length / profile.targetWorkouts) * 100)

  return (
    <>
      <header>
        <h1>Stephen's Strength Journey</h1>
        <p className="muted">{profile.gym} · {profile.goal}</p>
      </header>

      <section className="card hero">
        <div className="row">
          <div>
            <h2>{nextWorkout.name} is ready</h2>
            <p className="muted">{nextWorkout.subtitle}</p>
          </div>
          <span className="pill">Session {workouts.length + 1}</span>
        </div>
      </section>

      <section className="grid">
        <Metric value={`${latestWeight}kg`} label="Latest weight" />
        <Metric value={`${workouts.length}/${profile.targetWorkouts}`} label="Workouts done" />
        <Metric value="40" label="July press-ups/day" />
        <Metric value={bests['Leg Press']?.display?.split('×')[0] || '77kg'} label="Leg press PB" />
      </section>

      <section className="card">
        <div className="row">
          <h2>12-week progress</h2>
          <span className="pill">{pct}%</span>
        </div>
        <div className="progress"><div className="bar" style={{ width: `${pct}%` }} /></div>
        <p className="muted">Goal: 36 workouts, stronger lifts, and body weight trending toward {profile.targetWeightKg}kg.</p>
      </section>

      <section className="card">
        <h2>Leg press trend</h2>
        <Chart data={legPressChart} />
      </section>

      <section className="card">
        <h2>Cloud status</h2>
        <p className="status">{cloudStatus}</p>
      </section>
    </>
  )
}

function Workout({ onSave }) {
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState(nextWorkout.exercises.map(ex => ({
    ...ex, weight: ex.defaultWeight || '', set1: '', set2: '', set3: '', difficulty: ''
  })))

  function update(index, key, value) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item))
  }

  return (
    <>
      <h1>{nextWorkout.name}</h1>
      <p className="muted">{nextWorkout.subtitle}</p>

      <section className="card">
        {items.map((ex, i) => (
          <div className="exercise" key={ex.name}>
            <h3>{ex.name}</h3>
            <p className="target">Target: {ex.target} · {ex.reps}</p>

            <div className="grid">
              <Field label="Weight" value={ex.weight} onChange={v => update(i, 'weight', v)} />
              <Field label="Difficulty 1–10" value={ex.difficulty} onChange={v => update(i, 'difficulty', v)} />
            </div>

            <div className="sets">
              <Field label="Set 1" value={ex.set1} onChange={v => update(i, 'set1', v)} />
              <Field label="Set 2" value={ex.set2} onChange={v => update(i, 'set2', v)} />
              <Field label="Set 3" value={ex.set3} onChange={v => update(i, 'set3', v)} />
            </div>
          </div>
        ))}

        <label>Session notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Energy, difficulty, anything awkward or too easy..." />

        <button className="btn" onClick={() => onSave({ exercises: items, notes })}>Finish + save to cloud</button>
      </section>
    </>
  )
}

function History({ workouts }) {
  return (
    <>
      <h1>History</h1>
      <p className="muted">{workouts.length} workouts logged</p>
      {workouts.slice().reverse().map((w, i) => (
        <section className="logitem" key={w.id || i}>
          <div className="row">
            <strong>{w.date}</strong>
            <span className="pill">{w.name}</span>
          </div>
          <p className="muted">
            {(w.exercises || []).map(ex => `${ex.exercise_name}: ${ex.weight} · ${ex.set_1}/${ex.set_2}/${ex.set_3}`).join('\n')}
          </p>
        </section>
      ))}
    </>
  )
}

function Progress({ bests, body, onSaveBody, legPressChart }) {
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')

  return (
    <>
      <h1>Progress</h1>
      <section className="card">
        <h2>Personal bests</h2>
        {Object.keys(bests).map(name => (
          <div className="logitem" key={name}>
            <div className="row">
              <span>{name}</span>
              <strong>{bests[name].display}</strong>
            </div>
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

        {body.slice().reverse().map((b, i) => (
          <div className="logitem" key={i}>
            {b.update_date || b.date}: <strong>{b.weight_kg || b.weightKg}kg</strong>{b.waist_cm ? ` · Waist ${b.waist_cm}cm` : ''}
          </div>
        ))}
      </section>
    </>
  )
}

function Settings({ cloudStatus, reload }) {
  return (
    <>
      <h1>Settings</h1>
      <section className="card">
        <h2>Supabase</h2>
        <p className="muted">{cloudStatus}</p>
        <button className="btn" onClick={reload}>Test / reload cloud</button>
      </section>
      <section className="card">
        <h2>Next build</h2>
        <p className="muted">Next step: add login, exercise videos, press-up challenge tracking, and better automatic coaching recommendations.</p>
      </section>
    </>
  )
}

function Metric({ value, label }) {
  return <div className="metric"><b>{value}</b><span>{label}</span></div>
}

function Field({ label, value, onChange }) {
  return <div><label>{label}</label><input value={value} onChange={e => onChange(e.target.value)} /></div>
}

function Chart({ data }) {
  if (!data?.length) return <p className="muted">No chart data yet.</p>
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
