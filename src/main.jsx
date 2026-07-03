import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, BarChart3, Check, Dumbbell, Flame, Home, Settings as SettingsIcon, Trophy, Weight } from 'lucide-react'
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

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', profile.name)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      setProfileId(existing.id)
      localStorage.setItem('sj_profile_id', existing.id)
      return existing.id
    }

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
          out[name] = {
            display: `${ex.weight} × ${bestRep}`,
            score,
            weight: weight || 0
          }
        }
      }
    }

    return out
  }, [workouts])

  const legPressChart = workouts
    .map(w => {
      const lp = (w.exercises || []).find(e => e.exercise_name === 'Leg Press')
      return lp ? { date: (w.date || '').slice(5), weight: numberFrom(lp.weight) } : null
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
      const row = {
        profile_id: pid,
        update_date: today(),
        weight_kg: weight,
        waist_cm: waist || null
      }

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
        {tab === 'workout' && <Workout onSave={saveWorkout} bests={bests} />}
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
          <h2>{nextWorkout.name}</h2>
          <p>Main target: <strong>82kg Leg Press</strong>. Keep planks around <strong>35 seconds</strong> with good form.</p>
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
          <div>
            <h2>Leg press trend</h2>
            <p className="muted">Your first big strength marker</p>
          </div>
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

function Workout({ onSave, bests }) {
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState(nextWorkout.exercises.map(ex => ({
    ...ex,
    weight: ex.defaultWeight || '',
    set1: '',
    set2: '',
    set3: '',
    difficulty: ''
  })))

  function update(index, key, value) {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    )
  }

  return (
    <>
      <header className="workoutHeader">
        <div>
          <div className="eyebrow">{nextWorkout.subtitle}</div>
          <h1>{nextWorkout.name}</h1>
          <p className="muted">{items.length} exercises · 45–60 minutes</p>
        </div>
      </header>

      <section className="workoutList">
        {items.map((ex, index) => (
          <div className="workoutExerciseCard" key={ex.name}>
            <h3>{index + 1}. {ex.name}</h3>
            <p className="target">Target: {ex.target} · {ex.reps}</p>
            <p className="muted">
              Previous best: <strong>{bests[ex.name]?.display || 'Not logged yet'}</strong>
            </p>

            <div className="grid">
              <Field label="Weight" value={ex.weight} onChange={v => update(index, 'weight', v)} />
              <Field label="Difficulty" value={ex.difficulty} onChange={v => update(index, 'difficulty', v)} />
            </div>

            <div className="sets">
              <Field label="Set 1" value={ex.set1} onChange={v => update(index, 'set1', v)} />
              <Field label="Set 2" value={ex.set2} onChange={v => update(index, 'set2', v)} />
              <Field label="Set 3" value={ex.set3} onChange={v => update(index, 'set3', v)} />
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <label>Session notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Energy, difficulty, anything awkward or too easy..."
        />

        <button className="btn" onClick={() => onSave({ exercises: items, notes })}>
          <Check size={18}/> Finish + save to cloud
        </button>
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
            {(w.exercises || []).map(ex => `${ex.exercise_name}: ${ex.weight} · ${ex.set_1}/${ex.set_2}/${ex.set_3}`).join('\\n')}
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
        <p className="status">{cloudStatus}</p>
        <button className="btn" onClick={reload}>Test / reload cloud</button>
      </section>
      <section className="card">
        <h2>Coming next</h2>
        <p className="muted">Automatic workout rotation, rest timer, exercise videos, press-up challenge, and smarter progression recommendations.</p>
      </section>
    </>
  )
}

function Metric({ value, label, icon }) {
  return <div className="metric"><div className="metricIcon">{icon}</div><b>{value}</b><span>{label}</span></div>
}

function Field({ label, value, onChange }) {
  return <div><label>{label}</label><input value={value} onChange={e => onChange(e.target.value)} /></div>
}

function Chart({ data }) {
  if (!data?.length) return <p className="muted">No chart data yet.</p>

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 12 }} />
          <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={4} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
