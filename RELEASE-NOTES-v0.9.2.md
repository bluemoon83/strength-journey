# Strength Journey v0.9.2 — Reliable History

## Safer cloud writes

- Workouts and exercise sets are saved in one Supabase transaction.
- A failed save now rolls back completely instead of leaving a workout without its sets.
- Backup restoration is also transactional and never updates or deletes existing records.

## Honest dashboard

- Replaced hard-coded figures with live workout, body-weight and personal-best data.
- The 30-day workout count and leg-press trend now update automatically.

## Better history

- Search by exercise, workout or date.
- Filter by workout type.
- Expand a workout to review every exercise, difficulty rating and note.

## Backup restoration

- Preview a Strength Journey JSON backup before restoring it.
- Existing workouts and body updates are detected and skipped.
- A confirmation is required before missing records are inserted.

## Verification

- Added automated coverage for profile selection, dashboard statistics, cloud payloads and backup validation/deduplication.
