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

## Important

Do not commit or share secret/service role keys. The publishable/anon key is okay for a frontend app, but before making the app public we should tighten Supabase Row Level Security and add login.
