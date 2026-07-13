import React, { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Dumbbell, Home, Settings as SettingsIcon } from 'lucide-react'
import { supabase } from './supabase'
import { localSeedWorkouts, profile } from './seed'
import Dashboard from './components/Dashboard'
import Workout from './components/Workout'
import History from './components/History'
import Progress from './components/Progress'
import Settings from './components/Settings'
import {
  createWorkoutDraft,
  getNextWorkout,
  getTemplateByName,
  loadStoredWorkoutDraft,
  formatWeight,
  numberFrom,
  today,
  workoutDraftKey
} from './utils/workout'

export default function App() {
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
    if (!workoutDraft) setWorkoutDraft(createWorkoutDraft(nextWorkout))
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

      const { data: cloudWorkouts, error: workoutError } = await supabase
        .from('workouts')
        .select('id, workout_date, workout_name, notes, workout_sets(*)')
        .eq('profile_id', pid)
        .order('workout_date', { ascending: true })

      if (workoutError) throw workoutError

      if (cloudWorkouts?.length) {
        setWorkouts(cloudWorkouts.map(workout => ({
          id: workout.id,
          date: workout.workout_date,
          name: workout.workout_name,
          notes: workout.notes,
          exercises: workout.workout_sets || []
        })))
      }

      const { data: bodyRows } = await supabase
        .from('body_updates')
        .select('*')
        .eq('profile_id', pid)
        .order('update_date', { ascending: true })

      if (bodyRows?.length) setBody(bodyRows)
      setCloudStatus('Cloud sync connected')
    } catch (error) {
      setCloudStatus('Cloud error: ' + error.message)
    }
  }

  const bests = useMemo(() => {
    const output = {}

    for (const workout of workouts) {
      for (const exercise of workout.exercises || []) {
        const name = exercise.exercise_name
        const reps = [
          exercise.set_1, exercise.set_2, exercise.set_3,
          exercise.set_4, exercise.set_5, exercise.set_6
        ].map(numberFrom).filter(Boolean)

        const weights = [
          exercise.weight_1, exercise.weight_2, exercise.weight_3,
          exercise.weight_4, exercise.weight_5, exercise.weight_6
        ]

        const firstWeight = weights.find(Boolean) || exercise.weight
        const weightNumber = numberFrom(firstWeight)

        if (!name || !reps.length) continue

        const bestRep = Math.max(...reps)
        const score = (weightNumber || 1) * bestRep

        if (!output[name] || score > output[name].score) {
          output[name] = {
            display: `${firstWeight || exercise.equipment || ''} × ${bestRep}`.trim(),
            score,
            weight: weightNumber || 0
          }
        }
      }
    }

    return output
  }, [workouts])

  const legPressChart = workouts
    .map(workout => {
      const legPress = (workout.exercises || []).find(
        exercise => exercise.exercise_name === 'Leg Press'
      )
      if (!legPress) return null
      const firstWeight = legPress.weight_1 || legPress.weight
      return firstWeight
        ? { date: (workout.date || '').slice(5), weight: numberFrom(firstWeight) }
        : null
    })
    .filter(Boolean)

  async function saveWorkout(formData) {
    try {
      const pid = await ensureProfile()

      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          profile_id: pid,
          workout_date: today(),
          workout_name: currentWorkout.name,
          notes: formData.notes
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      const rows = formData.exercises.map(exercise => ({
        workout_id: workout.id,
        exercise_name: exercise.name,
        exercise_type: exercise.type,
        equipment: exercise.equipment,
        weight: formatWeight(exercise.sets?.[0]?.weight, exercise.weightUnit),
        weight_1: formatWeight(exercise.sets?.[0]?.weight, exercise.weightUnit),
        weight_2: formatWeight(exercise.sets?.[1]?.weight, exercise.weightUnit),
        weight_3: formatWeight(exercise.sets?.[2]?.weight, exercise.weightUnit),
        weight_4: formatWeight(exercise.sets?.[3]?.weight, exercise.weightUnit),
        weight_5: formatWeight(exercise.sets?.[4]?.weight, exercise.weightUnit),
        weight_6: formatWeight(exercise.sets?.[5]?.weight, exercise.weightUnit),
        set_1: exercise.sets?.[0]?.reps || '',
        set_2: exercise.sets?.[1]?.reps || '',
        set_3: exercise.sets?.[2]?.reps || '',
        set_4: exercise.sets?.[3]?.reps || '',
        set_5: exercise.sets?.[4]?.reps || '',
        set_6: exercise.sets?.[5]?.reps || '',
        target_total: exercise.targetTotal || null,
        is_extra: exercise.isExtra || false,
        difficulty: exercise.difficulty
      }))

      const { error: setError } = await supabase.from('workout_sets').insert(rows)
      if (setError) throw setError

      setWorkoutDraft(null)
      await loadCloudData()
      setTab('history')
      alert('Workout saved to Supabase.')
    } catch (error) {
      alert('Could not save workout: ' + error.message)
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
      const { error } = await supabase.from('body_updates').insert({
        profile_id: pid,
        update_date: today(),
        weight_kg: weight,
        waist_cm: waist || null
      })

      if (error) throw error
      await loadCloudData()
      alert('Body update saved.')
    } catch (error) {
      alert('Could not save body update: ' + error.message)
    }
  }

  return (
    <div>
      <main className="app">
        {tab === 'home' && (
          <Dashboard
            workouts={workouts}
            body={body}
            bests={bests}
            cloudStatus={cloudStatus}
            legPressChart={legPressChart}
            currentWorkout={currentWorkout}
          />
        )}

        {tab === 'workout' && (
          <Workout
            onSave={saveWorkout}
            bests={bests}
            currentWorkout={currentWorkout}
            workoutDraft={workoutDraft}
            setWorkoutDraft={setWorkoutDraft}
            resetWorkoutDraft={resetWorkoutDraft}
          />
        )}

        {tab === 'history' && <History workouts={workouts} />}

        {tab === 'progress' && (
          <Progress
            bests={bests}
            body={body}
            onSaveBody={saveBody}
            legPressChart={legPressChart}
          />
        )}

        {tab === 'settings' && (
          <Settings cloudStatus={cloudStatus} reload={loadCloudData} />
        )}
      </main>

      <nav className="tabbar">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}>
          <Home size={18}/>Home
        </button>
        <button className={tab === 'workout' ? 'active' : ''} onClick={() => setTab('workout')}>
          <Dumbbell size={18}/>Workout
        </button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          <Activity size={18}/>History
        </button>
        <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}>
          <BarChart3 size={18}/>Progress
        </button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          <SettingsIcon size={18}/>Settings
        </button>
      </nav>
    </div>
  )
}
