import http from "node:http";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { GoogleAuth } from "google-auth-library";
import { Firestore } from "@google-cloud/firestore";
import { systemPrompt, sourceContext } from "./core.mjs";
import { createHandler } from "./handler.mjs";
const project =
  process.env.GOOGLE_CLOUD_PROJECT || "gen-lang-client-0444960702";
const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const knowledge = JSON.parse(
  await readFile(new URL("./knowledge.json", import.meta.url), "utf8"),
);
const allowed = new Set(
  (process.env.APP_ORIGINS || "http://127.0.0.1:5180").split(","),
);
const local = process.env.LOCAL_DEV === "true";
const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});
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
async function generate({ messages, token, signal }) {
  const response = await fetch(
    `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:generateContent`,
    {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt + sourceContext(knowledge) }],
        },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: 1,
          maxOutputTokens: 1100,
          thinkingConfig: { thinkingLevel: "MINIMAL" },
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              answer: { type: "STRING" },
              sourceIds: {
                type: "ARRAY",
                items: { type: "STRING" },
                maxItems: 6,
              },
            },
            required: ["answer", "sourceIds"],
          },
        },
      }),
    },
  );
  if (!response.ok)
    throw Object.assign(new Error("Provider unavailable"), {
      code: response.status,
    });
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts
    ?.filter((p) => !p.thought)
    .map((p) => p.text || "")
    .join("");
  if (!text) throw new Error("Provider returned no answer");
  return JSON.parse(text);
}
const handler = createHandler({
  knowledge,
  allowed,
  reserveBudget,
  getToken: () => auth.getAccessToken(),
  generate,
  model,
});
const server = http.createServer(handler);
server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.listen(Number(process.env.PORT || 8088), "0.0.0.0", () =>
  console.log("Portfolio guide listening"),
);
