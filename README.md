# Scorekeeper Scorecard

Live web app for District Managers to evaluate Scorekeepers — automates the original Excel scorecard with live weighted scoring, draft auto-save, and a full history of past evaluations.

**Live site:** https://joeymathews-ops.github.io/scorekeeper-scorecard/

## Features
- **New Scorecard tab** — header info, 5 weighted standards (Negative / Neutral / Positive), per-standard comments, sign-off, additional comments. Live weighted score in the sticky bar.
- **Submissions tab** — every Submit appends to a list with summary stats, search, location/verdict filters, full per-row detail view, delete, and CSV export.
- **Backup All / Import Backup** — JSON export/import to move data between devices.
- **Print PDF** — prints the current scorecard or detail view for sign-off copies.

## Storage
All data is stored in this browser's `localStorage` — no external database, no Google Sheet, no account.

**Tradeoff:** each browser/device sees only what was submitted on it. To move data between devices, use Backup All on one device and Import Backup on the other. Clearing browser data will erase submissions, so back up periodically.

If you want true cross-device sync, you'd need a small backend (e.g. Supabase free tier, ~3 min setup).
