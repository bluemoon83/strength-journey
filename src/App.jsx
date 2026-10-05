import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, AlertTriangle, BarChart3, CheckCircle2, Dumbbell, Home, LoaderCircle, RefreshCw, Settings as SettingsIcon } from 'lucide-react'
import { supabase, supabaseConfigError } from './supabase'
import { profile } from './seed'
import Dashboard from './components/Dashboard'
import Workout from './components/Workout'
import History from './components/History'
import Progress from './components/Progress'
import Settings from './components/Settings'
import {
  createWorkoutDraft,
  getLatestWorkout,
  getNextWorkout,
  getTemplateByName,
  hasWorkoutDraftProgress,
  loadStoredWorkoutDraft,
  numberFrom,
  today,
  workoutDraftKey
} from './utils/workout'
import { chooseProfileId } from './utils/profile'
import { buildCloudWorkoutSets } from './utils/cloudPayload'
import { createRestorePlan } from './utils/backup'

export default function App() {
  const [tab, setTab] = useState('home')
  const [workouts, setWorkouts] = useState([])
  const [body, setBody] = useState([])
  const [cloudState, setCloudState] = useState({
    status: 'loading',
    message: 'Loading workout history from Supabase...'
  })
  const [workoutDraft, setWorkoutDraft] = useState(loadStoredWorkoutDraft)
  const loadRequestId = useRef(0)
  const hasLoadedCloudData = useRef(false)

  useEffect(() => {
    loadCloudData()
  }, [])

  const nextWorkout = useMemo(() => getNextWorkout(workouts), [workouts])
  const latestWorkout = useMemo(() => getLatestWorkout(workouts), [workouts])

  const currentWorkout = useMemo(() => {
    if (workoutDraft?.workoutName) {
      return getTemplateByName(workoutDraft.workoutName) || nextWorkout
    }
    return nextWorkout
  }, [nextWorkout, workoutDraft?.workoutName])

  useEffect(() => {
    if (cloudState.status === 'loading') return

    setWorkoutDraft(existingDraft => {
      if (!existingDraft) {
        return createWorkoutDraft(nextWorkout, latestWorkout?.id || null)
      }

      const draftMatchesSchedule = existingDraft.workoutName === nextWorkout.name
      if (draftMatchesSchedule || hasWorkoutDraftProgress(existingDraft)) {
        return existingDraft
      }

      return createWorkoutDraft(nextWorkout, latestWorkout?.id || null)
    })
  }, [cloudState.status, latestWorkout?.id, nextWorkout.name])

  useEffect(() => {
    if (workoutDraft) {
      localStorage.setItem(workoutDraftKey, JSON.stringify(workoutDraft))
    } else {
      localStorage.removeItem(workoutDraftKey)
    }
  }, [workoutDraft])

  function requireSupabase() {
    if (supabaseConfigError) throw supabaseConfigError
    return supabase
  }

  async function ensureProfile({ createIfMissing = false } = {}) {
    const client = requireSupabase()
    const cachedProfileId = localStorage.getItem('sj_profile_id')
    const { data: matchingProfiles, error: profileError } = await client
      .from('profiles')
      .select('id, created_at')
      .eq('name', profile.name)

    if (profileError) throw profileError

    if (matchingProfiles?.length) {
      const profileIds = matchingProfiles.map(item => item.id)
      const { data: workoutReferences, error: referenceError } = await client
        .from('workouts')
        .select('id, profile_id')
        .in('profile_id', profileIds)

      if (referenceError) throw referenceError

      const resolvedProfileId = chooseProfileId(
        matchingProfiles,
        workoutReferences,
        cachedProfileId
      )

      localStorage.setItem('sj_profile_id', resolvedProfileId)
      return resolvedProfileId
    }

    if (!createIfMissing) {
      throw new Error(`No cloud profile was found for ${profile.name}.`)
    }

    const { data, error } = await client
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

    localStorage.setItem('sj_profile_id', data.id)
    return data.id
  }

  async function loadCloudData() {
    const requestId = ++loadRequestId.current

    try {
      setCloudState({
        status: 'loading',
        message: hasLoadedCloudData.current
          ? 'Refreshing workout history from Supabase...'
          : 'Loading workout history from Supabase...'
      })

      const client = requireSupabase()
      const pid = await ensureProfile()

      const { data: cloudWorkouts, error: workoutError } = await client
        .from('workouts')
        .select('id, workout_date, workout_name, notes, created_at, workout_sets(*)')
        .eq('profile_id', pid)
        .order('workout_date', { ascending: true })

      if (workoutError) throw workoutError

      const { data: bodyRows, error: bodyError } = await client
        .from('body_updates')
        .select('*')
        .eq('profile_id', pid)
        .order('update_date', { ascending: true })

      if (bodyError) throw bodyError
      if (requestId !== loadRequestId.current) return

      setWorkouts((cloudWorkouts || []).map(workout => ({
        id: workout.id,
        date: workout.workout_date,
        createdAt: workout.created_at,
        name: workout.workout_name,
        notes: workout.notes,
        exercises: workout.workout_sets || []
      })))
      setBody(bodyRows || [])
      hasLoadedCloudData.current = true
      setCloudState({
        status: 'connected',
        message: `Cloud connected · ${cloudWorkouts?.length || 0} workouts loaded`
      })
    } catch (error) {
      if (requestId !== loadRequestId.current) return

      setCloudState({
        status: 'error',
        message: hasLoadedCloudData.current
          ? `Cloud refresh failed. Showing the last cloud data loaded in this session. ${error.message}`
          : `Workout history could not be loaded. No sample or cached workouts are being shown. ${error.message}`
      })
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

  const previousByExercise = useMemo(() => {
    const output = {}

    for (const workout of [...workouts].reverse()) {
      for (const exercise of workout.exercises || []) {
        const name = exercise.exercise_name
        if (!name || output[name]) continue

        output[name] = {
          ...exercise,
          workoutDate: workout.date,
          workoutName: workout.name
        }
      }
    }

    return output
  }, [workouts])

  const exerciseProgress = useMemo(() => {
    const output = {}

    for (const workout of workouts) {
      for (const exercise of workout.exercises || []) {
        const name = exercise.exercise_name
        if (!name) continue

        const weights = [
          exercise.weight_1, exercise.weight_2, exercise.weight_3,
          exercise.weight_4, exercise.weight_5, exercise.weight_6,
          exercise.weight
        ]
          .map(numberFrom)
          .filter(value => Number.isFinite(value) && value > 0)

        if (!weights.length) continue

        if (!output[name]) output[name] = []
        output[name].push({
          date: formatChartDate(workout.date),
          fullDate: workout.date,
          weight: Math.max(...weights)
        })
      }
    }

    for (const name of Object.keys(output)) {
      output[name].sort((a, b) => String(a.fullDate).localeCompare(String(b.fullDate)))
    }

    return output
  }, [workouts])

  const legPressChart = exerciseProgress['Leg Press'] || []

  async function saveWorkout(formData) {
    try {
      const client = requireSupabase()
      const pid = await ensureProfile({ createIfMissing: true })
      const { error } = await client.rpc('save_workout_with_sets', {
        p_profile_id: pid,
        p_workout_date: today(),
        p_workout_name: currentWorkout.name,
        p_notes: formData.notes || '',
        p_sets: buildCloudWorkoutSets(formData.exercises)
      })

      if (error) throw explainDatabaseFunctionError(error)

      setWorkoutDraft(null)
      await loadCloudData()
      setTab('history')
      alert('Workout saved to Supabase.')
    } catch (error) {
      alert('Could not save workout: ' + error.message)
    }
  }

  function resetWorkoutDraft() {
    const freshDraft = createWorkoutDraft(nextWorkout, latestWorkout?.id || null)
    setWorkoutDraft(freshDraft)
    localStorage.setItem(workoutDraftKey, JSON.stringify(freshDraft))
  }

  function startScheduledWorkout() {
    setWorkoutDraft(createWorkoutDraft(nextWorkout, latestWorkout?.id || null))
  }

  async function saveBody(weight, waist) {
    try {
      const client = requireSupabase()
      const pid = await ensureProfile({ createIfMissing: true })
      const { error } = await client.from('body_updates').insert({
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

  async function restoreBackup(backup) {
    const client = requireSupabase()
    const pid = await ensureProfile({ createIfMissing: true })
    const plan = createRestorePlan(backup, workouts, body)

    if (!plan.workouts.length && !plan.bodyUpdates.length) {
      return { workouts: 0, bodyUpdates: 0 }
    }

    const { data, error } = await client.rpc('restore_strength_journey_backup', {
      p_profile_id: pid,
      p_workouts: plan.workouts,
      p_body_updates: plan.bodyUpdates
    })

    if (error) throw explainDatabaseFunctionError(error)
    await loadCloudData()

    return {
      workouts: Number(data?.workouts ?? plan.workouts.length),
      bodyUpdates: Number(data?.body_updates ?? plan.bodyUpdates.length)
    }
  }

  return (
    <div>
      <main className="app">
        <CloudStatusBanner cloudState={cloudState} onRetry={loadCloudData} />

        {tab === 'home' && (
          <Dashboard
            workouts={workouts}
            body={body}
            bests={bests}
            cloudStatus={cloudState.message}
            legPressChart={legPressChart}
            currentWorkout={currentWorkout}
          />
        )}

        {tab === 'workout' && (
          <Workout
            onSave={saveWorkout}
            bests={bests}
            previousByExercise={previousByExercise}
            currentWorkout={currentWorkout}
            workoutDraft={workoutDraft}
            setWorkoutDraft={setWorkoutDraft}
            resetWorkoutDraft={resetWorkoutDraft}
            scheduledWorkout={nextWorkout}
            startScheduledWorkout={startScheduledWorkout}
            draftIsOffSchedule={Boolean(
              cloudState.status === 'connected' &&
              workoutDraft?.workoutName &&
              workoutDraft.workoutName !== nextWorkout.name
            )}
          />
        )}

        {tab === 'history' && <History workouts={workouts} />}

        {tab === 'progress' && (
          <Progress
            bests={bests}
            body={body}
            onSaveBody={saveBody}
            exerciseProgress={exerciseProgress}
          />
        )}

        {tab === 'settings' && (
          <Settings
            cloudStatus={cloudState.message}
            reload={loadCloudData}
            workouts={workouts}
            body={body}
            bests={bests}
            onRestoreBackup={restoreBackup}
          />
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

function explainDatabaseFunctionError(error) {
  if (error?.code === 'PGRST202' || /function|schema cache/i.test(error?.message || '')) {
    return new Error('The v0.9.2 Supabase migration has not been installed yet. No data was changed.')
  }
  return error
}

function CloudStatusBanner({ cloudState, onRetry }) {
  const Icon = cloudState.status === 'connected'
    ? CheckCircle2
    : cloudState.status === 'error'
      ? AlertTriangle
      : LoaderCircle

  return (
    <section
      className={`cloudBanner cloudBanner-${cloudState.status}`}
      role={cloudState.status === 'error' ? 'alert' : 'status'}
    >
      <Icon className={cloudState.status === 'loading' ? 'cloudSpinner' : ''} size={20} />
      <p>{cloudState.message}</p>
      {cloudState.status === 'error' && (
        <button type="button" onClick={onRetry}>
          <RefreshCw size={16} /> Retry
        </button>
      )}
    </section>
  )
}

function formatChartDate(dateValue) {
  if (!dateValue) return ''
  const date = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateValue
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}
