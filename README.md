# Scorekeeper Scorecard

District Manager assessment tool with a Vercel KV backend so submissions are accessible from any device with the passcode.

## Architecture
- **Frontend** — static `index.html`, deployed on Vercel
- **API** — `api/submissions.js` serverless function (GET / POST / DELETE)
- **Storage** — Vercel KV (Redis), keyed by submission id
- **Auth** — single passcode set as an env var; required for every API call

## Deploy to Vercel (one-time, ~5 min)

### 1. Import the repo
1. Go to [vercel.com/new](https://vercel.com/new) and sign in (GitHub).
2. Click **Import** on `joeymathews-ops/scorekeeper-scorecard`.
3. Leave defaults and click **Deploy**. The first deploy will succeed but the API will return 500 until the next two steps are done.

### 2. Add a KV (Redis) database
1. In your project on Vercel, open the **Storage** tab.
2. Click **Create Database** → choose **Upstash for Redis** (or any "KV / Redis" Marketplace integration).
3. Connect it to the project — Vercel auto-injects `KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc. as env vars.

### 3. Set the passcode
1. Project **Settings → Environment Variables**.
2. Add `PASSCODE` = a strong string of your choice (this is what users type to unlock the site).
3. Apply to **Production** (and Preview if you want).

### 4. Redeploy
- **Deployments** tab → top deployment → **⋯ → Redeploy**. The site is now live.

## Use it
- Open the deployed URL on any device.
- Enter the passcode (cached in that browser).
- Fill out scorecards on the **New Scorecard** tab and click **Submit**.
- See all past evaluations on the **Submissions** tab — search, filter, view detail, delete, export CSV / JSON backup.
- Click the **Connected** badge in the header to lock the device (clears the passcode cache).

## Dev notes
- Drafts (in-progress scorecards) auto-save in browser localStorage; submitted scorecards live in KV.
- To rotate the passcode, just change the `PASSCODE` env var in Vercel and redeploy. All clients will be forced to re-enter on next request.
- This is a single shared passcode — there's no per-user auth. For role-based access, put the site behind Vercel Authentication or Cloudflare Access.
