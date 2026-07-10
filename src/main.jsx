import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, BarChart3, Check, ChevronDown, ChevronUp, Dumbbell, Flame, Home, Plus, Settings as SettingsIcon, Trash2, Trophy, Weight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from './supabase'
import { profile, workoutTemplates, localSeedWorkouts } from './seed'
import './styles.css'

const today = () => new Date().toISOString().slice(0, 10)
const equipmentOptions = ['Machine', 'Dumbbells', 'Cable', 'Bodyweight']
const weightUnitOptions = ['kg', 'lb']
const workoutDraftKey = 'sj_workout_draft'

const numberFrom = (value) => {
  const n = parseFloat(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : null
}

const cleanWeight = (value) => String(value || '').replace(/[^\d.]/g, '')

function formatWeight(value, unit = 'kg') {
  const clean = cleanWeight(value)
  return clean ? `${clean} ${unit}` : ''
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

function getTemplateByName(name) {
  return workoutTemplates.find(template => template.name === name)
}

function loadStoredWorkoutDraft() {
  try {
    const saved = localStorage.getItem(workoutDraftKey)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function createWorkoutDraft(workout) {
  return {
    workoutName: workout.name,
    notes: '',
    rating: '',
    exercises: buildWorkoutItems(workout)
  }
}

function App() {
  const [tab, setTab] = useState('home')
  const [profileId, setProfileId] = useState(localStorage.getItem('sj_profile_id'))
  const [workouts, setWorkouts] = useState(localSeedWorkouts)
  const [body, setBody] = useState([{ date: '2026-07-02', weight_kg: 89, waist_cm: '' }])
  const [cloudStatus, setCloudStatus] = useState('Ready')
  const [workoutDraft, setWorkoutDraft] = useState(loadStoredWorkoutDraft)

  useEffect(() => {
    loadCloudData()
  }, [])

  const nextWorkout = useMemo(() => getNextWorkout(workouts), [workouts])

  const currentWorkout = useMemo(() => {
    if (workoutDraft?.workoutName) {
      return getTemplateByName(workoutDraft.workoutName) || nextWorkout
    }

    return nextWorkout
  }, [nextWorkout, workoutDraft?.workoutName])

  useEffect(() => {
    if (!workoutDraft) {
      setWorkoutDraft(createWorkoutDraft(nextWorkout))
    }
  }, [nextWorkout.name, workoutDraft])

  useEffect(() => {
    if (workoutDraft) {
      localStorage.setItem(workoutDraftKey, JSON.stringify(workoutDraft))
    } else {
      localStorage.removeItem(workoutDraftKey)
    }
  }, [workoutDraft])

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

  const previousByExercise = useMemo(() => {
    const out = {}

    for (const workout of [...workouts].reverse()) {
      for (const exercise of workout.exercises || []) {
        if (!exercise.exercise_name || out[exercise.exercise_name]) continue
        out[exercise.exercise_name] = exercise
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
          notes: [formData.notes, formData.rating ? `Session rating: ${formData.rating}` : ''].filter(Boolean).join('\n')
        })
        .select()
        .single()

      if (wErr) throw wErr

      const rows = formData.exercises.map(ex => ({
        workout_id: workout.id,
        exercise_name: ex.name,
        exercise_type: ex.type,
        equipment: ex.equipment,
        weight: formatWeight(ex.sets?.[0]?.weight, ex.weightUnit),
        weight_1: formatWeight(ex.sets?.[0]?.weight, ex.weightUnit),
        weight_2: formatWeight(ex.sets?.[1]?.weight, ex.weightUnit),
        weight_3: formatWeight(ex.sets?.[2]?.weight, ex.weightUnit),
        weight_4: formatWeight(ex.sets?.[3]?.weight, ex.weightUnit),
        weight_5: formatWeight(ex.sets?.[4]?.weight, ex.weightUnit),
        weight_6: formatWeight(ex.sets?.[5]?.weight, ex.weightUnit),
        set_1: ex.sets?.[0]?.reps || '',
        set_2: ex.sets?.[1]?.reps || '',
        set_3: ex.sets?.[2]?.reps || '',
        set_4: ex.sets?.[3]?.reps || '',
        set_5: ex.sets?.[4]?.reps || '',
        set_6: ex.sets?.[5]?.reps || '',
        target_total: ex.targetTotal || null,
        is_extra: ex.isExtra || false,
        difficulty: [ex.difficulty, ex.exerciseNotes ? `Notes: ${ex.exerciseNotes}` : ''].filter(Boolean).join(' | ')
      }))

      const { error: sErr } = await supabase.from('workout_sets').insert(rows)
      if (sErr) throw sErr

      setWorkoutDraft(null)
      await loadCloudData()
      setTab('history')
      alert('Workout saved to Supabase.')
    } catch (err) {
      alert('Could not save workout: ' + err.message)
    }
  }

  function resetWorkoutDraft() {
    const freshDraft = createWorkoutDraft(nextWorkout)
    setWorkoutDraft(freshDraft)
    localStorage.setItem(workoutDraftKey, JSON.stringify(freshDraft))
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
        {tab === 'workout' && <Workout onSave={saveWorkout} bests={bests} previousByExercise={previousByExercise} currentWorkout={currentWorkout} workoutDraft={workoutDraft} setWorkoutDraft={setWorkoutDraft} resetWorkoutDraft={resetWorkoutDraft} />}
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

function Workout({ onSave, bests, previousByExercise, currentWorkout, workoutDraft, setWorkoutDraft, resetWorkoutDraft }) {
  const items = workoutDraft?.exercises || []
  const notes = workoutDraft?.notes || ''
  const rating = workoutDraft?.rating || ''

  function updateDraft(updater) {
    setWorkoutDraft(prev => {
      const base = prev || createWorkoutDraft(currentWorkout)
      return updater(base)
    })
  }

  function update(index, key, value) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    }))
  }

  function updateSet(exerciseIndex, setIndex, key, value) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) => {
        if (i !== exerciseIndex) return item
        const sets = [...item.sets]
        sets[setIndex] = { ...sets[setIndex], [key]: key === 'weight' ? cleanWeight(value) : value }
        return { ...item, sets }
      })
    }))
  }

  function addSet(exerciseIndex) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) => {
        if (i !== exerciseIndex) return item
        if (item.sets.length >= 6) return item

        const previousSet = item.sets[item.sets.length - 1]
        const nextSet = {
          weight: item.equipment === 'Bodyweight' ? '' : (previousSet?.weight || cleanWeight(item.defaultWeight) || cleanWeight(item.weight) || ''),
          reps: ''
        }

        return { ...item, sets: [...item.sets, nextSet] }
      })
    }))
  }

  function removeSet(exerciseIndex) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) => {
        if (i !== exerciseIndex) return item
        if (item.sets.length <= 1) return item
        return { ...item, sets: item.sets.slice(0, -1) }
      })
    }))
  }

  function addExercise() {
    updateDraft(draft => ({
      ...draft,
      exercises: [
        ...draft.exercises,
        {
          name: 'Extra exercise',
          type: 'strength',
          equipment: 'Machine',
          equipmentOptions,
          weightUnit: 'kg',
          target: 'Optional extra',
          reps: '8–12',
          defaultWeight: '',
          targetTotal: null,
          isExtra: true,
          isCollapsed: false,
          isComplete: false,
          difficulty: '',
          exerciseNotes: '',
          sets: [
            { weight: '', reps: '' },
            { weight: '', reps: '' }
          ]
        }
      ]
    }))
  }

  function removeExercise(exerciseIndex) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.filter((_, i) => i !== exerciseIndex)
    }))
  }

  function toggleComplete(exerciseIndex) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) => {
        if (i !== exerciseIndex) return item
        const nextComplete = !item.isComplete
        return { ...item, isComplete: nextComplete, isCollapsed: nextComplete }
      })
    }))
  }

  function toggleCollapsed(exerciseIndex) {
    updateDraft(draft => ({
      ...draft,
      exercises: draft.exercises.map((item, i) =>
        i === exerciseIndex ? { ...item, isCollapsed: !item.isCollapsed } : item
      )
    }))
  }

  function updateNotes(value) {
    updateDraft(draft => ({ ...draft, notes: value }))
  }

  function updateRating(value) {
    updateDraft(draft => ({ ...draft, rating: value }))
  }

  function handleReset() {
    const confirmed = window.confirm('Clear your current workout entries and start again?')
    if (confirmed) resetWorkoutDraft()
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

      <section className="card subtle">
        <h2>Workout draft saved</h2>
        <p className="muted">You can check History or Progress and come back without losing this workout.</p>
      </section>

      <section className="workoutList">
        {items.map((ex, index) => (
          <ExerciseCard
            key={`${ex.name}-${index}`}
            index={index}
            exercise={ex}
            best={bests[ex.name]}
            previous={previousByExercise[ex.name]}
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
        <label>How did it feel?</label>
        <div className="ratingGrid">
          {['Excellent', 'Good', 'Average', 'Tough', 'Very tough'].map(option => (
            <button
              key={option}
              type="button"
              className={rating === option ? 'ratingBtn active' : 'ratingBtn'}
              onClick={() => updateRating(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <label>Session notes</label>
        <textarea
          value={notes}
          onChange={e => updateNotes(e.target.value)}
          placeholder="Energy, difficulty, anything awkward or too easy..."
        />

        <button className="btn" onClick={() => onSave({ exercises: items, notes, rating })}>
          <Check size={18}/> Finish + save to cloud
        </button>

        <button className="secondaryBtn" type="button" onClick={handleReset}>
          Start this workout again
        </button>
      </section>
    </>
  )
}

function buildWorkoutItems(workout) {
  return workout.exercises.map(ex => ({
    ...ex,
    equipment: ex.equipment || '',
    weightUnit: 'kg',
    isCollapsed: false,
    isComplete: false,
    difficulty: '',
    exerciseNotes: '',
    sets: Array.from(
      { length: ex.type === 'target-total' ? (ex.startingSets || 3) : (ex.sets || 3) },
      () => ({
        weight: ex.equipment === 'Bodyweight' ? '' : cleanWeight(ex.defaultWeight || ''),
        reps: ''
      })
    )
  }))
}

function ExerciseCard({ index, exercise, best, previous, update, updateSet, addSet, removeSet, removeExercise, toggleComplete, toggleCollapsed }) {
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

          <PreviousExercise previous={previous} best={best} />

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

            {!isBodyweight && (
              <SelectField
                label="Weight unit"
                value={exercise.weightUnit || 'kg'}
                options={weightUnitOptions}
                onChange={v => update(index, 'weightUnit', v)}
              />
            )}

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
                    placeholder={exercise.weightUnit || 'kg'}
                    inputMode="decimal"
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

          <label>Exercise notes</label>
          <textarea
            value={exercise.exerciseNotes || ''}
            onChange={e => update(index, 'exerciseNotes', e.target.value)}
            placeholder="Seat position, machine setting, anything to remember next time..."
          />

          <button type="button" className="completeBtn" onClick={() => toggleComplete(index)}>
            <Check size={18}/> {exercise.isComplete ? 'Reopen exercise' : 'Mark exercise complete'}
          </button>
        </>
      )}
    </div>
  )
}

function PreviousExercise({ previous, best }) {
  if (!previous && !best) {
    return <p className="muted">Previous: <strong>Not logged yet</strong></p>
  }

  const previousSummary = previous
    ? formatHistoryExercise(previous)
        .replace(`${previous.exercise_name}${previous.equipment ? ` (${previous.equipment})` : ''}:`, '')
        .trim()
    : 'Not logged yet'

  return (
    <div className="previousBox">
      <div>
        <span>Last time</span>
        <strong>{previousSummary}</strong>
      </div>
      <div>
        <span>Best</span>
        <strong>{best?.display || 'Not logged yet'}</strong>
      </div>
    </div>
  )
}

function summariseSets(exercise) {
  const sets = exercise.sets
    .filter(set => set.reps)
    .map(set => set.weight ? `${formatWeight(set.weight, exercise.weightUnit)} × ${set.reps}` : set.reps)

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
          {w.notes && <p className="muted">{w.notes}</p>}
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
