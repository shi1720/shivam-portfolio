# Shivam Gupta — A mind in motion

**[Enter the studio →](https://shivam-web-app.web.app)**

A spatial portfolio for my work in applied AI, engineering, and product. The studio is a folded 3D map of 29 public projects, with a searchable work index, source-linked case studies, a career room, and ways to work together through Siloed.

The AI guide answers from curated public project notes and my resume. The reliability lab is different: a deterministic local simulation that lets you break a tool response, compare recovery policies, and export a runnable Python experiment.

## Run locally

Requires Node 22+ and Python 3 for the export-parity tests.

```sh
npm ci
npm run dev
```

The interface runs at `http://127.0.0.1:5180`. The default dev proxy expects the optional AI server at port 8088. The rest of the portfolio works without cloud credentials.

To run the real guide locally, configure Google Application Default Credentials with Vertex AI access, then use `LOCAL_DEV=true npm start`. Local mode skips the persistent request budget; it is never enabled in deployment. A question still invokes the configured live model. Never put service-account keys or provider credentials in frontend environment variables.

## Verification

```sh
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
npm audit --omit=dev --audit-level=moderate
```

Tests cover:

- All nine failure/policy combinations, including JavaScript/Python parity.
- Grounding source validation, request bounds, origin rules, abort-before-generation, full request deadlines, and budget rejection.
- Desktop Chromium and mobile WebKit navigation, deep links, filtering, case studies, keyboard dismissal, lab execution, Python download, chat error/retry history, and IME composition.
- All five rooms for horizontal overflow and serious/critical WCAG A/AA automated findings. Automated scanning is not a complete accessibility certification.

Browser chat tests mock the provider to make failures reproducible. Live deployment smoke checks are documented in [verification](docs/verification.md).

## Architecture

- **React + TypeScript + Vite:** the five rooms, accessible dialogs, project index and local lab.
- **Three.js:** custom parametric folded bands, physical materials, project nodes, pointer rotation and a keyboard-accessible project alternative. WebGL is lazy-loaded; animation respects reduced motion and pauses offscreen.
- **Firebase Hosting:** the static application and same-origin `/api/**` rewrite pinned to the Cloud Run revision.
- **Cloud Run + Vertex AI:** a dedicated service account, `gemini-3.1-flash-lite`, a bounded curated knowledge corpus, schema-validated responses, and source IDs mapped to trusted URLs. No model tools, browsing, private-repo access, or secret-bearing prompts.
- **Named Firestore database:** transactional limits of 400 requests per UTC day globally and 35 per anonymous session; counts expire after 48 hours via TTL. No prompts or answers are stored by application code. Cloud infrastructure retains ordinary request logs; messages are processed by Google’s AI service. Per-process burst limits and five active requests bound concurrency.

The runtime service account can access only this named Firestore database and Vertex AI. No other app's database or deployment was changed.

## Content and scope

`src/catalog.json` lists public projects only. `src/stories.ts` holds curated case studies. `src/data.ts` holds professional experience. Run `node scripts/prepare-knowledge.mjs` after editing stories or knowledge material, inspect the resulting `server/knowledge.json`, and redeploy the server as needed.

Professional figures are resume-reported contributions, not independent measurements. Employer work remains separate from personal demos. Case studies explicitly distinguish prototypes, simulations, reference tools, and production experience.

The site does not publish the original resume PDF or its phone number. Public contact: **shivam1720406@gmail.com**.

## Deployment and rollback

See [operations](docs/operations.md). Hosting deploys only `shivam-web-app`; server deploys only `shivam-portfolio-ai`. Credentials remain outside the repository. There is no automatic production deployment on push.

## License

MIT for the code. Personal biographical content and identity assets remain specific to Shivam Gupta; reuse the implementation with your own identity and facts.
