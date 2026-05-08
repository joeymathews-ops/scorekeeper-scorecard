# Scorekeeper Scorecard

Live web app for District Managers to evaluate Scorekeepers — automates the original Excel scorecard, calculates the weighted score live, submits to Google Sheets, and lets you browse all past evaluations on the Submissions tab (admin-key gated).

## Setup (one-time, ~5 minutes)

### 1. Create the Google Sheet + Apps Script backend
1. Create a new Google Sheet.
2. Tools → Apps Script. Replace the default `Code.gs` with the contents of `apps-script.gs` from this repo.
3. At the top of `Code.gs`, set `SUBMIT_KEY` and `ADMIN_KEY` to your own random strings.
4. Click **Deploy → New deployment** → select type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the **Web app URL**.

### 2. Configure the site
Edit `config.js`:
```js
window.SCORECARD_CONFIG = {
  APPS_SCRIPT_URL: "<paste the web app URL>",
  SUBMIT_KEY: "<same as in Code.gs>",
  ADMIN_KEY:  "<same as in Code.gs>"
};
```

Commit + push. GitHub Pages auto-rebuilds on push.

## How it's used
- **New Scorecard tab** — fill out header info, rate each of the 5 standards (Negative / Neutral / Positive), add comments, sign off. Live weighted score in the sticky bar.
- **Submit to Sheet** — appends a row to the Sheet.
- **Submissions tab** — enter the admin key once per session to view all submissions with filters, summary stats, and a CSV export.

## Notes
- Drafts auto-save in the browser (localStorage).
- The submit key is a light spam guard, not real auth — anyone with the deployed URL can submit, but only people with the admin key can read.
- For real access control, put this behind Google IAP / Cloudflare Access.
