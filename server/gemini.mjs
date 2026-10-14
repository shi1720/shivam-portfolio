import { generationRequest } from './core.mjs';
export const DEFAULT_MODEL = 'gemini-3.8-flash';
export function createGeminiGenerator({ knowledge, model = DEFAULT_MODEL, apiKey, fetchImpl = fetch }) {
  return async ({ messages, signal }) => {
    if (!apiKey) throw new Error('Gemini is not configured');
    const response = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST', signal,
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(generationRequest(messages, knowledge)),
      },
    );
    if (!response.ok) throw Object.assign(new Error('Provider unavailable'), { code: response.status });
    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason !== 'STOP') throw new Error('Provider returned an incomplete answer');
    const text = candidate.content?.parts?.filter(p => !p.thought).map(p => p.text || '').join('');
    if (!text) throw new Error('Provider returned no answer');
    return JSON.parse(text);
  };
}
