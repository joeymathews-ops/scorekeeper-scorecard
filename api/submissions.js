import { kv } from "@vercel/kv";

const HASH_KEY = "scorecards";

function getPasscode(req) {
  const auth = req.headers["authorization"] || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return req.headers["x-passcode"] || "";
}

function unauthorized(res) {
  res.status(401).json({ ok: false, error: "unauthorized" });
}

function recompute(row) {
  const W = { s1: 0.10, s2: 0.10, s3: 0.30, s4: 0.20, s5: 0.30 };
  const v = (r) => (r === "Positive" ? 1 : r === "Neutral" ? 0.5 : r === "Negative" ? 0 : null);
  let total = 0, any = false;
  Object.keys(W).forEach((k) => {
    const x = v((row.ratings || {})[k]);
    if (x !== null) { total += x * W[k]; any = true; }
  });
  const pct = any ? Math.round(total * 100) : 0;
  const verdict = pct >= 80 ? "Exceeds" : pct >= 50 ? "Meets" : "Needs Improvement";
  return { score: pct, verdict };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const PASSCODE = process.env.PASSCODE;
  if (!PASSCODE) {
    return res.status(500).json({ ok: false, error: "PASSCODE env var not set on the server" });
  }
  if (getPasscode(req) !== PASSCODE) return unauthorized(res);

  try {
    if (req.method === "GET") {
      const all = await kv.hgetall(HASH_KEY);
      const rows = all
        ? Object.values(all).map((v) => (typeof v === "string" ? JSON.parse(v) : v))
        : [];
      rows.sort((a, b) => String(b.submittedAt || "").localeCompare(String(a.submittedAt || "")));
      return res.status(200).json({ ok: true, rows });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      if (!body.id) return res.status(400).json({ ok: false, error: "id required" });
      if (!body.submittedAt) body.submittedAt = new Date().toISOString();
      const { score, verdict } = recompute(body);
      body.score = score;
      body.verdict = verdict;
      await kv.hset(HASH_KEY, { [body.id]: JSON.stringify(body) });
      return res.status(200).json({ ok: true, row: body });
    }

    if (req.method === "DELETE") {
      const id = (req.query && req.query.id) || "";
      if (!id) return res.status(400).json({ ok: false, error: "id required" });
      await kv.hdel(HASH_KEY, id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err && err.message || err) });
  }
}
