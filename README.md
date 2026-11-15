# Stephen's Strength Journey

React + Supabase version.

## Setup

1. Install Node.js if you do not already have it.
2. Unzip this folder.
3. Open the folder in VS Code or Terminal.
4. Create a file called `.env` in the project root.
5. Copy the contents of `.env.example` into `.env`.
6. Replace `your_publishable_or_anon_key_here` with your Supabase publishable key.

Your `.env` should look like:

```env
VITE_SUPABASE_URL=https://oydbgyzcmrjznshwwjpt.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

7. Run:

```bash
npm install
npm run dev
```

8. Open the local URL shown in Terminal.

## Supabase migrations

Version 0.9.2 uses transactional database functions so a workout and all of its
sets either save together or do not save at all. Apply the SQL files in
`supabase/migrations` to the Supabase project before deploying that version.

The migration creates functions only and does not update, delete or migrate
existing workout records.

## Keeping a free Supabase project active

The workflow in `.github/workflows/keep-supabase-active.yml` makes one small
database query each day and can also be run manually from the GitHub Actions
page. Add these repository secrets before enabling it:

- `SUPABASE_URL`: the value of `VITE_SUPABASE_URL` from the local `.env`
- `SUPABASE_PUBLISHABLE_KEY`: the value of `VITE_SUPABASE_ANON_KEY` from the local `.env`

In GitHub, open **Settings → Secrets and variables → Actions**, add both
repository secrets, push the workflow to the default branch, then run it once
using **Actions → Keep Supabase active → Run workflow**.

This reduces inactivity pauses on the Supabase Free plan but does not provide
an uptime guarantee. GitHub may disable scheduled workflows after 60 days with
no repository activity.

## Important

Do not commit or share secret/service role keys. The publishable/anon key is okay for a frontend app, but before making the app public we should tighten Supabase Row Level Security and add login.
