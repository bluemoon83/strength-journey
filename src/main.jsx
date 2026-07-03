import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, BarChart3, Check, ChevronDown, ChevronUp, Dumbbell, Flame, Home, Plus, Settings as SettingsIcon, Trash2, Trophy, Weight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from './supabase'
import { profile, workoutTemplates, localSeedWorkouts } from './seed'
import './styles.css'

const today = () => new Date().toISOString().slice(0, 10)
const equipmentOptions = ['Machine', 'Dumbbells', 'Cable', 'Bodyweight']

const numberFrom = (value) => {
  const n = parseFloat(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : null
}

function getNextWorkout(workouts) {
  if (!workouts?.length) return workoutTemplates[0]

  const latestWorkout = [...workouts]
    .filter(w => w?.date && w?.name)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  if (!latestWorkout) return workoutTemplates[0]

  const currentIndex = workoutTemplates.findIndex(template => template.name === latestWorkout.name)

  if (currentIndex === -1) return workoutTemplates[0]

  return workoutTemplates[(currentIndex + 1) % workoutTemplates.length]
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

  const currentWorkout = useMemo(() => getNextWorkout(workouts), [workouts])

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
        const reps = [ex.set_1, ex.set_2, ex.set_3, ex.set_4, ex.set_5, ex.set_6].map(numberFrom).filter(Boolean)
        const weights = [ex.weight_1, ex.weight_2, ex.weight_3, ex.weight_4, ex.weight_5, ex.weight_6]
        const firstWeight = weights.find(Boolean) || ex.weight
        const weightNumber = numberFrom(firstWeight)

        if (!name || !reps.length) continue

        const bestRep = Math.max(...reps)
        const score = (weightNumber || 1) * bestRep

        if (!out[name] || score > out[name].score) {
          out[name] = {
            display: `${firstWeight || ex.equipment || ''} × ${bestRep}`.trim(),
            score,
            weight: weightNumber || 0
          }
        }
      }
    }

    return out
  }, [workouts])

  const legPressChart = workouts
    .map(w => {
      const lp = (w.exercises || []).find(e => e.exercise_name === 'Leg Press')
      if (!lp) return null
      const firstWeight = lp.weight_1 || lp.weight
      return firstWeight ? { date: (w.date || '').slice(5), weight: numberFrom(firstWeight) } : null
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
          workout_name: currentWorkout.name,
          notes: formData.notes
        })
        .select()
        .single()

      if (wErr) throw wErr

      const rows = formData.exercises.map(ex => ({
        workout_id: workout.id,
        exercise_name: ex.name,
        exercise_type: ex.type,
        equipment: ex.equipment,
        weight: ex.sets?.[0]?.weight || ex.weight || '',
        weight_1: ex.sets?.[0]?.weight || '',
        weight_2: ex.sets?.[1]?.weight || '',
        weight_3: ex.sets?.[2]?.weight || '',
        weight_4: ex.sets?.[3]?.weight || '',
        weight_5: ex.sets?.[4]?.weight || '',
        weight_6: ex.sets?.[5]?.weight || '',
        set_1: ex.sets?.[0]?.reps || '',
        set_2: ex.sets?.[1]?.reps || '',
        set_3: ex.sets?.[2]?.reps || '',
        set_4: ex.sets?.[3]?.reps || '',
        set_5: ex.sets?.[4]?.reps || '',
        set_6: ex.sets?.[5]?.reps || '',
        target_total: ex.targetTotal || null,
        is_extra: ex.isExtra || false,
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
        {tab === 'home' && <Dashboard workouts={workouts} body={body} bests={bests} cloudStatus={cloudStatus} legPressChart={legPressChart} currentWorkout={currentWorkout} />}
        {tab === 'workout' && <Workout onSave={saveWorkout} bests={bests} currentWorkout={currentWorkout} />}
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

function Dashboard({ workouts, body, bests, cloudStatus, legPressChart, currentWorkout }) {
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

function Workout({ onSave, bests, currentWorkout }) {
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState(() => buildWorkoutItems(currentWorkout))

  useEffect(() => {
    setItems(buildWorkoutItems(currentWorkout))
    setNotes('')
  }, [currentWorkout.name])

  function update(index, key, value) {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    )
  }

  function updateSet(exerciseIndex, setIndex, key, value) {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== exerciseIndex) return item
        const sets = [...item.sets]
        sets[setIndex] = { ...sets[setIndex], [key]: value }
        return { ...item, sets }
      })
    )
  }

  function addSet(exerciseIndex) {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== exerciseIndex) return item
        if (item.sets.length >= 6) return item

        const previousSet = item.sets[item.sets.length - 1]
        const nextSet = {
          weight: item.equipment === 'Bodyweight' ? '' : (previousSet?.weight || item.defaultWeight || item.weight || ''),
          reps: ''
        }

        return { ...item, sets: [...item.sets, nextSet] }
      })
    )
  }

  function removeSet(exerciseIndex) {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== exerciseIndex) return item
        if (item.sets.length <= 1) return item
        return { ...item, sets: item.sets.slice(0, -1) }
      })
    )
  }

  function addExercise() {
    setItems(prev => [
      ...prev,
      {
        name: 'Extra exercise',
        type: 'strength',
        equipment: 'Machine',
        equipmentOptions,
        target: 'Optional extra',
        reps: '8–12',
        defaultWeight: '',
        targetTotal: null,
        isExtra: true,
        isCollapsed: false,
        isComplete: false,
        difficulty: '',
        sets: [
          { weight: '', reps: '' },
          { weight: '', reps: '' }
        ]
      }
    ])
  }

  function removeExercise(exerciseIndex) {
    setItems(prev => prev.filter((_, i) => i !== exerciseIndex))
  }

  function toggleComplete(exerciseIndex) {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== exerciseIndex) return item
        const nextComplete = !item.isComplete
        return { ...item, isComplete: nextComplete, isCollapsed: nextComplete }
      })
    )
  }

  function toggleCollapsed(exerciseIndex) {
    setItems(prev =>
      prev.map((item, i) =>
        i === exerciseIndex ? { ...item, isCollapsed: !item.isCollapsed } : item
      )
    )
  }

  return (
    <>
      <header className="workoutHeader">
        <div>
          <div className="eyebrow">{currentWorkout.subtitle}</div>
          <h1>{currentWorkout.name}</h1>
          <p className="muted">{items.length} exercises · 45–60 minutes</p>
        </div>
      </header>

      <section className="workoutList">
        {items.map((ex, index) => (
          <ExerciseCard
            key={`${ex.name}-${index}`}
            index={index}
            exercise={ex}
            best={bests[ex.name]}
            update={update}
            updateSet={updateSet}
            addSet={addSet}
            removeSet={removeSet}
            removeExercise={removeExercise}
            toggleComplete={toggleComplete}
            toggleCollapsed={toggleCollapsed}
          />
        ))}
      </section>

      <button className="secondaryBtn" type="button" onClick={addExercise}>
        <Plus size={18}/> Add extra exercise
      </button>

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

function buildWorkoutItems(workout) {
  return workout.exercises.map(ex => ({
    ...ex,
    equipment: ex.equipment || '',
    isCollapsed: false,
    isComplete: false,
    difficulty: '',
    sets: Array.from(
      { length: ex.type === 'target-total' ? (ex.startingSets || 3) : (ex.sets || 3) },
      () => ({
        weight: ex.equipment === 'Bodyweight' ? '' : (ex.defaultWeight || ''),
        reps: ''
      })
    )
  }))
}

function ExerciseCard({ index, exercise, best, update, updateSet, addSet, removeSet, removeExercise, toggleComplete, toggleCollapsed }) {
  const total = exercise.sets.reduce((sum, set) => sum + (numberFrom(set.reps) || 0), 0)
  const isTargetTotal = exercise.type === 'target-total'
  const isBodyweight = exercise.equipment === 'Bodyweight'
  const targetComplete = isTargetTotal && exercise.targetTotal && total >= exercise.targetTotal
  const summary = summariseSets(exercise)

  return (
    <div className={`workoutExerciseCard ${exercise.isComplete ? 'completedExercise' : ''}`}>
      <div className="exerciseTitleRow">
        <button className="collapseHeader" type="button" onClick={() => toggleCollapsed(index)}>
          <span className="collapseIcon">{exercise.isCollapsed ? <ChevronDown size={18}/> : <ChevronUp size={18}/>}</span>
          <span>
            {exercise.isExtra ? (
              <span className="extraTitle">Extra exercise</span>
            ) : (
              <h3>{index + 1}. {exercise.name}</h3>
            )}
            <span className="collapsedSummary">{summary || exercise.target}</span>
          </span>
        </button>

        <div className="titleActions">
          {(exercise.isComplete || targetComplete) && <span className="completePill">Complete</span>}
          {exercise.isExtra && (
            <button className="iconBtn" type="button" onClick={() => removeExercise(index)} aria-label="Remove exercise">
              <Trash2 size={16}/>
            </button>
          )}
        </div>
      </div>

      {!exercise.isCollapsed && (
        <>
          {exercise.isExtra ? (
            <Field label="Exercise name" value={exercise.name} onChange={v => update(index, 'name', v)} />
          ) : (
            <p className="target">Target: {exercise.target} · {exercise.reps}</p>
          )}

          <p className="muted">
            Previous best: <strong>{best?.display || 'Not logged yet'}</strong>
          </p>

          {isTargetTotal && (
            <div className="totalBox">
              <span>Running total</span>
              <strong>{targetComplete ? '✓ ' : ''}{total} / {exercise.targetTotal}</strong>
            </div>
          )}

          <div className="grid">
            <SelectField
              label="Equipment"
              value={exercise.equipment}
              options={exercise.equipmentOptions || equipmentOptions}
              onChange={v => update(index, 'equipment', v)}
            />

            <Field label="Difficulty" value={exercise.difficulty} onChange={v => update(index, 'difficulty', v)} />
          </div>

          <div className="setRows">
            <div className={isBodyweight ? 'setRowHeader bodyweightSetHeader' : 'setRowHeader'}>
              <span>Set</span>
              {!isBodyweight && <span>Weight</span>}
              <span>{exercise.type === 'timed' ? 'Seconds' : 'Reps'}</span>
            </div>

            {exercise.sets.map((set, setIndex) => (
              <div className={isBodyweight ? 'setRow bodyweightSetRow' : 'setRow'} key={setIndex}>
                <span className="setNumber">{setIndex + 1}</span>

                {!isBodyweight && (
                  <input
                    value={set.weight}
                    onChange={e => updateSet(index, setIndex, 'weight', e.target.value)}
                    placeholder="kg"
                  />
                )}

                <input
                  value={set.reps}
                  onChange={e => updateSet(index, setIndex, 'reps', e.target.value)}
                  placeholder={exercise.type === 'timed' ? 'sec' : 'reps'}
                  inputMode="numeric"
                />
              </div>
            ))}
          </div>

          <div className="setControls">
            <button type="button" className="miniBtn" onClick={() => addSet(index)}><Plus size={16}/> Add set</button>
            <button type="button" className="miniBtn" onClick={() => removeSet(index)}>Remove set</button>
          </div>

          <button type="button" className="completeBtn" onClick={() => toggleComplete(index)}>
            <Check size={18}/> {exercise.isComplete ? 'Reopen exercise' : 'Mark exercise complete'}
          </button>
        </>
      )}
    </div>
  )
}

function summariseSets(exercise) {
  const sets = exercise.sets
    .filter(set => set.reps)
    .map(set => set.weight ? `${set.weight} × ${set.reps}` : set.reps)

  if (!sets.length) return ''

  if (exercise.type === 'target-total') {
    const total = exercise.sets.reduce((sum, set) => sum + (numberFrom(set.reps) || 0), 0)
    return `${sets.join(' / ')} · Total ${total}`
  }

  return sets.join(' / ')
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
            {(w.exercises || []).map(formatHistoryExercise).join('\n')}
          </p>
        </section>
      ))}
    </>
  )
}

function formatHistoryExercise(ex) {
  const weights = [ex.weight_1, ex.weight_2, ex.weight_3, ex.weight_4, ex.weight_5, ex.weight_6]
  const reps = [ex.set_1, ex.set_2, ex.set_3, ex.set_4, ex.set_5, ex.set_6]
  const sets = reps
    .map((rep, index) => {
      if (!rep) return null
      const weight = weights[index] || ex.weight
      return weight ? `${weight} × ${rep}` : rep
    })
    .filter(Boolean)
    .join(' / ')

  const equipment = ex.equipment ? ` (${ex.equipment})` : ''
  return `${ex.exercise_name}${equipment}: ${sets}`.trim()
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
        <p className="muted">Previous workout comparison, rest timer, exercise videos, press-up challenge, and smarter progression recommendations.</p>
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

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  )
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
