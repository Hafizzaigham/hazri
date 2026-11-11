# Hazri

Morning attendance register for a private school and a PEF partner school.

## Run on this computer

```bash
npm install
npm run dev
```

Open the Local address in the terminal. A phone on the same Wi-Fi can use the Network address.

## Free web address

GitHub Pages publishes the site when this repo is on GitHub and the `Publish Hazri` action has run. The address looks like:

`https://YOUR-NAME.github.io/hazri/`

In the GitHub repo, open Settings → Pages → Build and deployment, and choose **GitHub Actions** if it is not already selected.

## Free database

1. Create a free project at [supabase.com](https://supabase.com). No credit card.
2. Paste `supabase/schema.sql` into the Supabase SQL editor and run it.
3. Copy the project URL and the anon key into `.env.local` (see `.env.example`).
4. For the public site, add the same two values as repository secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Until those keys exist, every browser keeps its own copy. After they exist, a laptop and a phone see the same marks.

The sample `0300` numbers are not real parents. The demo database is open, so do not store real parent numbers in it.
