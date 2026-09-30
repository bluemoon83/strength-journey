-- v0.9.2: save a workout and all of its exercise rows in one transaction.
-- This migration creates functions only; it does not modify existing records.

create or replace function public.save_workout_with_sets(
  p_profile_id uuid,
  p_workout_date date,
  p_workout_name text,
  p_notes text,
  p_sets jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_workout_id uuid;
begin
  insert into public.workouts (profile_id, workout_date, workout_name, notes)
  values (p_profile_id, p_workout_date, p_workout_name, nullif(p_notes, ''))
  returning id into v_workout_id;

  insert into public.workout_sets (
    workout_id,
    exercise_name,
    exercise_type,
    equipment,
    weight,
    weight_1,
    weight_2,
    weight_3,
    weight_4,
    weight_5,
    weight_6,
    set_1,
    set_2,
    set_3,
    set_4,
    set_5,
    set_6,
    target_total,
    is_extra,
    difficulty
  )
  select
    v_workout_id,
    item.exercise_name,
    item.exercise_type,
    item.equipment,
    item.weight,
    item.weight_1,
    item.weight_2,
    item.weight_3,
    item.weight_4,
    item.weight_5,
    item.weight_6,
    item.set_1,
    item.set_2,
    item.set_3,
    item.set_4,
    item.set_5,
    item.set_6,
    item.target_total,
    coalesce(item.is_extra, false),
    item.difficulty
  from jsonb_to_recordset(coalesce(p_sets, '[]'::jsonb)) as item (
    exercise_name text,
    exercise_type text,
    equipment text,
    weight text,
    weight_1 text,
    weight_2 text,
    weight_3 text,
    weight_4 text,
    weight_5 text,
    weight_6 text,
    set_1 text,
    set_2 text,
    set_3 text,
    set_4 text,
    set_5 text,
    set_6 text,
    target_total integer,
    is_extra boolean,
    difficulty text
  );

  return v_workout_id;
end;
$$;

create or replace function public.restore_strength_journey_backup(
  p_profile_id uuid,
  p_workouts jsonb,
  p_body_updates jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_workout jsonb;
  v_workout_count integer := 0;
  v_body_count integer := 0;
begin
  for v_workout in
    select value from jsonb_array_elements(coalesce(p_workouts, '[]'::jsonb))
  loop
    perform public.save_workout_with_sets(
      p_profile_id,
      (v_workout->>'workout_date')::date,
      v_workout->>'workout_name',
      coalesce(v_workout->>'notes', ''),
      coalesce(v_workout->'sets', '[]'::jsonb)
    );
    v_workout_count := v_workout_count + 1;
  end loop;

  insert into public.body_updates (profile_id, update_date, weight_kg, waist_cm)
  select
    p_profile_id,
    item.update_date,
    item.weight_kg,
    item.waist_cm
  from jsonb_to_recordset(coalesce(p_body_updates, '[]'::jsonb)) as item (
    update_date date,
    weight_kg numeric,
    waist_cm numeric
  );
  get diagnostics v_body_count = row_count;

  return jsonb_build_object(
    'workouts', v_workout_count,
    'body_updates', v_body_count
  );
end;
$$;

grant execute on function public.save_workout_with_sets(uuid, date, text, text, jsonb) to anon, authenticated;
grant execute on function public.restore_strength_journey_backup(uuid, jsonb, jsonb) to anon, authenticated;
