/**
 * Scorekeeper Scorecard — Google Apps Script backend
 *
 * SETUP (5 minutes):
 *   1. Create a new Google Sheet. Rename the first tab to "Submissions".
 *   2. Tools → Apps Script. Paste this entire file into Code.gs (replace the default code).
 *   3. Set SUBMIT_KEY and ADMIN_KEY below to your own random strings.
 *   4. Deploy → New deployment → type: "Web app"
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Copy the resulting Web app URL.
 *   5. Paste that URL + the same keys into config.js in the site repo.
 *
 * Endpoints:
 *   POST  body=JSON scorecard, header X-Submit-Key   → appends a row.
 *   GET   ?action=list&key=ADMIN_KEY                 → returns all rows as JSON.
 */

const SUBMIT_KEY = "CHANGE_ME_SUBMIT";   // must match config.js
const ADMIN_KEY  = "CHANGE_ME_ADMIN";    // must match config.js
const SHEET_NAME = "Submissions";

const HEADERS = [
  "submittedAt","location","province","scorekeeper","dm","lm","date","atype",
  "score","verdict",
  "s1_rating","s1_comment",
  "s2_rating","s2_comment",
  "s3_rating","s3_comment",
  "s4_rating","s4_comment",
  "s5_rating","s5_comment",
  "gotIt","gotItName","followUp","additional","raw"
];

function _sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function _json(obj, status) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function _ratingValue(r) {
  if (r === "Positive") return 1;
  if (r === "Neutral") return 0.5;
  if (r === "Negative") return 0;
  return null;
}

const WEIGHTS = { s1: 0.10, s2: 0.10, s3: 0.30, s4: 0.20, s5: 0.30 };

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const submitted = body.submitKey || (e.parameter && e.parameter.key);
    if (submitted !== SUBMIT_KEY) return _json({ ok: false, error: "unauthorized" });

    const r = body.ratings || {};
    let score = 0, anyRated = false;
    Object.keys(WEIGHTS).forEach(k => {
      const v = _ratingValue(r[k]);
      if (v !== null) { score += v * WEIGHTS[k]; anyRated = true; }
    });
    const pct = anyRated ? Math.round(score * 100) : 0;
    let verdict = "Not started";
    if (anyRated) verdict = pct >= 80 ? "Exceeds" : pct >= 50 ? "Meets" : "Needs Improvement";

    const c = body.comments || {};
    const row = [
      new Date(),
      body.location || "", body.province || "", body.scorekeeper || "",
      body.dm || "", body.lm || "", body.date || "", body.atype || "",
      pct, verdict,
      r.s1 || "", c.s1 || "",
      r.s2 || "", c.s2 || "",
      r.s3 || "", c.s3 || "",
      r.s4 || "", c.s4 || "",
      r.s5 || "", c.s5 || "",
      body.gotit ? "Yes" : "No", body.gotitName || "", body.followUp || "", body.additional || "",
      JSON.stringify(body)
    ];
    _sheet().appendRow(row);
    return _json({ ok: true, score: pct, verdict: verdict });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || "list";
  const key = (e.parameter && e.parameter.key) || "";
  if (key !== ADMIN_KEY) return _json({ ok: false, error: "unauthorized" });

  const sh = _sheet();
  const last = sh.getLastRow();
  if (last < 2) return _json({ ok: true, rows: [] });
  const values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const rows = values.map(v => {
    const o = {};
    HEADERS.forEach((h, i) => o[h] = v[i] instanceof Date ? v[i].toISOString() : v[i]);
    return o;
  });
  return _json({ ok: true, rows: rows });
}
