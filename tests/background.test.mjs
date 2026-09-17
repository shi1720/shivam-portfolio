import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { validateAnswer } from "../server/core.mjs";

const forbiddenProduct = "Metrics" + "Hub";
function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(tsx?|mjs|json|css)$/.test(file) ? [file] : [];
  });
}
test("public authored content, metadata and AI grounding exclude removed product and long dashes", () => {
  for (const file of ["index.html", ...["src", "server", "shared", "scripts"].flatMap(sourceFiles)]) {
    const text = fs.readFileSync(file, "utf8");
    assert.ok(!text.includes(forbiddenProduct), `Removed product remains in ${file}`);
    assert.ok(!/[\u2013\u2014]/u.test(text), `Long dash remains in ${file}`);
  }
});
test("AI grounding contains the actual background chapters and broad portfolio contribution", () => {
  const knowledge = JSON.parse(fs.readFileSync("server/knowledge.json", "utf8"));
  const background = knowledge.find((item) => item.id === "background");
  assert.equal(background.content.chapters.length, 4);
  assert.match(JSON.stringify(background), /allocation economy/);
  assert.match(JSON.stringify(background), /I see product management becoming more important/);
  assert.match(JSON.stringify(background), /forward-deployed engineering/);
  assert.match(JSON.stringify(background), /Computer Science & Design at IIIT Delhi/);
  assert.match(JSON.stringify(knowledge.find((item) => item.id === "experience")), /Built various products across the product portfolio/);
});
test("model answer punctuation cannot reintroduce long dashes", () => {
  const result = validateAnswer({ answer: "People\u2014then systems. From 2024\u20132025.", sourceIds: [] }, []);
  assert.equal(result.answer, "People, then systems. From 2024-2025.");
  assert.ok(!/[\u2013\u2014]/u.test(result.answer));
});
