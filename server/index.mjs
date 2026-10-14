import http from "node:http";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Firestore } from "@google-cloud/firestore";
import { createGeminiGenerator, DEFAULT_MODEL } from "./gemini.mjs";
import { createHandler } from "./handler.mjs";
const project =
  process.env.GOOGLE_CLOUD_PROJECT || "gen-lang-client-0444960702";
const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
const knowledge = JSON.parse(
  await readFile(new URL("./knowledge.json", import.meta.url), "utf8"),
);
const allowed = new Set(
  (process.env.APP_ORIGINS || "http://127.0.0.1:5180").split(","),
);
const local = process.env.LOCAL_DEV === "true";
const db = local
  ? null
  : new Firestore({ projectId: project, databaseId: "shivam-portfolio" });
async function reserveBudget(sessionId, signal) {
  if (local) return;
  const today = new Date().toISOString().slice(0, 10);
  const globalRef = db.doc(`usage/${today}`);
  const sessionRef = db.doc(
    `sessions/${today}-${createHash("sha256").update(sessionId).digest("hex").slice(0, 24)}`,
  );
  await db.runTransaction(
    async (tx) => {
      const [g, s] = await Promise.all([tx.get(globalRef), tx.get(sessionRef)]);
      signal.throwIfAborted();
      const count = g.data()?.count || 0,
        personal = s.data()?.count || 0;
      if (count >= 400 || personal >= 35)
        throw Object.assign(new Error("budget"), { publicStatus: 429 });
      const expiresAt = new Date(Date.now() + 48 * 3600000);
      tx.set(globalRef, { count: count + 1, expiresAt });
      tx.set(sessionRef, { count: personal + 1, expiresAt });
    },
    { maxAttempts: 3 },
  );
}
const generate = createGeminiGenerator({ knowledge, model, apiKey: process.env.GEMINI_API_KEY });
const handler = createHandler({
  knowledge,
  allowed,
  reserveBudget,
  getToken: async () => undefined,
  generate,
  model,
});
// Voice is temporarily disabled; /api/voice/* follows the normal 404 path.
const server = http.createServer(handler);
server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.listen(Number(process.env.PORT || 8088), "0.0.0.0", () =>
  console.log("Portfolio guide listening"),
);
