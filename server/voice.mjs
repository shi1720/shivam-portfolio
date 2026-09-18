import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { GoogleAuth, OAuth2Client } from "google-auth-library";
const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  }),
  verifier = new OAuth2Client();
const limits = new Map();
async function raw(req, max = 24000) {
  let n = 0,
    out = "";
  for await (const c of req) {
    n += c.length;
    if (n > max) throw Object.assign(new Error("size"), { status: 413 });
    out += c;
  }
  return out;
}
function send(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(value));
}
export function createVoiceHandler({
  db,
  allowed,
  instructions,
  brand = "siloed",
  allowBrief = false,
  local = false,
}) {
  const project =
      process.env.GOOGLE_CLOUD_PROJECT || "gen-lang-client-0444960702",
    base = process.env.VOICE_SERVICE_URL,
    sa = process.env.VOICE_TASK_ACCOUNT;
  const headers = () => ({
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  });
  const stopCall = async (callId) => {
    if (!/^rtc_[a-zA-Z0-9_-]+$/.test(callId)) throw new Error("Invalid call");
    const r = await fetch(
      `https://api.openai.com/v1/realtime/calls/${callId}/hangup`,
      {
        method: "POST",
        headers: headers(),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!r.ok && ![400, 404, 410].includes(r.status))
      throw new Error("Hangup failed");
  };
  const calls = new Map();
  async function expire(callId) {
    await stopCall(callId);
    if (db) {
      const rows = await db
        .collection(`${brand}_voice`)
        .where("callId", "==", callId)
        .limit(1)
        .get();
      await Promise.all(
        rows.docs.map((d) => d.ref.set({ ended: true }, { merge: true })),
      );
    }
  }
  async function budget(sessionId, ip) {
    const day = new Date().toISOString().slice(0, 10),
      hash = createHash("sha256")
        .update(ip || sessionId)
        .digest("hex")
        .slice(0, 24);
    if (!db) return;
    await db.runTransaction(async (tx) => {
      const a = db.doc(`${brand}_voice_usage/${day}`),
        b = db.doc(`${brand}_voice_usage/${day}-${hash}`);
      const [g, s] = await Promise.all([tx.get(a), tx.get(b)]);
      if ((g.data()?.count || 0) >= 30 || (s.data()?.count || 0) >= 5)
        throw Object.assign(
          new Error(
            "Voice allowance reached. Please continue in text or contact us directly.",
          ),
          { status: 429 },
        );
      const expiresAt = new Date(Date.now() + 172800000);
      tx.set(a, { count: (g.data()?.count || 0) + 1, expiresAt });
      tx.set(b, { count: (s.data()?.count || 0) + 1, expiresAt });
    });
  }
  async function schedule(callId) {
    if (local) {
      const timer = setTimeout(
        () => void stopCall(callId).catch(() => {}),
        240000,
      );
      timer.unref();
      return;
    }
    if (!base || !sa) throw new Error("Voice expiry is not configured");
    const token = await auth.getAccessToken();
    const response = await fetch(
      `https://cloudtasks.googleapis.com/v2/projects/${project}/locations/us-central1/queues/siloed-voice-expiry/tasks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: {
            scheduleTime: new Date(Date.now() + 240000).toISOString(),
            httpRequest: {
              httpMethod: "POST",
              url: base + "/api/voice/expire",
              headers: { "Content-Type": "application/json" },
              body: Buffer.from(JSON.stringify({ callId })).toString("base64"),
              oidcToken: { serviceAccountEmail: sa, audience: base },
            },
          },
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) throw new Error("Could not schedule voice expiry");
  }
  return async function voice(req, res) {
    if (!req.url?.startsWith("/api/voice/")) return false;
    if (req.method !== "POST") {
      send(res, 405, { error: "Use POST" });
      return true;
    }
    try {
      if (req.url === "/api/voice/expire") {
        if (!base || !sa)
          throw Object.assign(new Error("Not authorized"), { status: 403 });
        let payload;
        try {
          const ticket = await verifier.verifyIdToken({
            idToken: String(req.headers.authorization || "").replace(
              /^Bearer /,
              "",
            ),
            audience: base,
          });
          payload = ticket.getPayload();
        } catch {
          throw Object.assign(new Error("Not authorized"), { status: 403 });
        }
        if (payload?.email !== sa || !payload.email_verified)
          throw Object.assign(new Error("Not authorized"), { status: 403 });
        const { callId } = JSON.parse(await raw(req, 2000));
        await expire(callId);
        send(res, 200, { ok: true });
        return true;
      }
      if (!allowed.has(req.headers.origin))
        throw Object.assign(new Error("Open voice from the website."), {
          status: 403,
        });
      if (req.url === "/api/voice/stop") {
        const { token } = JSON.parse(await raw(req, 2000));
        if (typeof token !== "string" || !/^[-a-f0-9]{36}$/.test(token))
          throw Object.assign(new Error("Invalid session"), { status: 400 });
        let callId = calls.get(token);
        if (db) {
          const d = await db.doc(`${brand}_voice/${token}`).get();
          if (d.data()?.ended) {
            send(res, 200, { ok: true });
            return true;
          }
          callId = d.data()?.callId;
        }
        if (callId) await expire(callId);
        calls.delete(token);
        send(res, 200, { ok: true });
        return true;
      }
      if (req.url !== "/api/voice/session") {
        send(res, 404, { error: "Not found" });
        return true;
      }
      if (!process.env.OPENAI_API_KEY)
        throw new Error("Voice is not configured");
      if (!req.headers["content-type"]?.startsWith("application/sdp"))
        throw Object.assign(new Error("Send audio session data"), {
          status: 415,
        });
      const session = String(req.headers["x-voice-session"] || "");
      if (!/^[-a-f0-9]{36}$/.test(session))
        throw Object.assign(new Error("Invalid session"), { status: 400 });
      const now = Date.now();
      for (const [k, v] of limits) if (v.until < now) limits.delete(k);
      const limit = limits.get(brand) || { count: 0, until: now + 60000 };
      limit.count++;
      limits.set(brand, limit);
      if (limit.count > 6)
        throw Object.assign(
          new Error("Voice is busy. Please try again shortly."),
          { status: 429 },
        );
      const sdp = await raw(req);
      if (!sdp.startsWith("v=0") || !sdp.includes("m=audio"))
        throw Object.assign(new Error("Invalid audio session"), {
          status: 400,
        });
      await budget(
        session,
        String(req.headers["x-forwarded-for"] || req.socket.remoteAddress)
          .split(",")
          .at(-1)
          ?.trim(),
      );
      const sessionConfig = {
        type: "realtime",
        model: process.env.REALTIME_MODEL || "gpt-realtime-2.1",
        instructions:
          instructions +
          " Speak in short, natural sentences. Keep ordinary replies to two or three short sentences, usually under 60 words. Do not recite the full company profile or resume unless asked. You are an AI guide, not the founder. Never impersonate a real person. No em dashes. Ask one useful question at a time. Do not invent facts, prices, commitments or outcomes. Never claim a message has been sent. Do not request sensitive data.",
        max_output_tokens: 1800,
        audio: {
          input: {
            transcription: { model: "gpt-4o-mini-transcribe" },
            turn_detection: { type: "semantic_vad", eagerness: "medium" },
          },
          output: { voice: "marin" },
        },
        ...(allowBrief
          ? {
              tools: [
                {
                  type: "function",
                  name: "prepare_project_brief",
                  description:
                    "Prepare a draft for the visitor to review. This never sends a message. Use only information supplied by the visitor, mark missing details as to be discussed.",
                  parameters: {
                    type: "object",
                    properties: { brief: { type: "string" } },
                    required: ["brief"],
                    additionalProperties: false,
                  },
                },
              ],
              tool_choice: "auto",
            }
          : {}),
      };
      const form = new FormData();
      form.set("sdp", sdp);
      form.set("session", JSON.stringify(sessionConfig));
      const result = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: {
          ...headers(),
          "OpenAI-Safety-Identifier": createHash("sha256")
            .update(session)
            .digest("hex"),
        },
        body: form,
        signal: AbortSignal.timeout(20000),
      });
      if (!result.ok) {
        console.error(
          JSON.stringify({
            event: "voice_provider_error",
            status: result.status,
            detail: (await result.text()).slice(0, 500),
          }),
        );
        throw new Error(
          "Voice is temporarily unavailable. You can still use text chat.",
        );
      }
      const callId = result.headers.get("location")?.split("/").pop(),
        answer = await result.text();
      if (!callId) throw new Error("Missing call reference");
      const token = randomUUID();
      try {
        await schedule(callId);
        if (db)
          await db
            .doc(`${brand}_voice/${token}`)
            .set({
              callId,
              ended: false,
              expiresAt: new Date(Date.now() + 172800000),
            });
        calls.set(token, callId);
      } catch (e) {
        await stopCall(callId).catch(() => {});
        throw e;
      }
      res.writeHead(200, {
        "Content-Type": "application/sdp",
        "Cache-Control": "no-store",
        "X-Voice-Token": token,
      });
      res.end(answer);
      return true;
    } catch (e) {
      console.error(
        JSON.stringify({
          event: "voice_error",
          type: e.name,
          status: e.status,
        }),
      );
      send(res, e.status || 503, {
        error: e.status
          ? e.message
          : "Voice is temporarily unavailable. Please use text chat or try again shortly.",
      });
      return true;
    }
  };
}
