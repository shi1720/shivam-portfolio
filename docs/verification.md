# Verification record

Initial release verified on 17 September 2026.

## Automated checks

- `npm test`: 20 passing tests, including all nine JavaScript/Python simulator parity combinations and backend input, grounding, budget, cancellation and deadline regression tests.
- `npm run build`: TypeScript and production Vite build pass.
- `npm run test:e2e`: 18 passing checks across desktop Chromium and mobile WebKit (iPhone viewport). Includes the five rooms, project search, filters, deep links, browser back, malformed URL recovery, dialogs, lab results, Python export, simulated provider errors/retry and IME input.
- Axe WCAG A/AA checks found no serious or critical violations in any of the five rooms at the tested viewports. No horizontal overflow at those sizes. These checks are not complete accessibility or device certification.
- `npm audit --omit=dev --audit-level=moderate`: zero production dependency vulnerabilities at verification time.

## Manual and live checks

- Reviewed desktop and mobile screenshots, including the 3D studio, project preview, career, lab and orange contact room. Independent design and security reviews informed subsequent fixes.
- A real deployed Vertex AI request returned a grounded Khoros career answer with a source link. A second live check through the Firebase-hosted browser UI returned RepoGym and ToolStorm explanations, two project-source links, and the correct hiring email. This is a live integration smoke check, not a broad model-quality evaluation.
- Native WebMCP registration verified in the Codex in-app browser: `search_public_projects` returned Toolstorm; invalid query type intentionally failed. `open_project_case_study` with exact ID `toolstorm` returned success after the same visible case dialog opened; unknown identifiers failed without replacing that dialog. Both schemas and read-only annotations were inspected.
- Firestore TTL policies on `usage.expiresAt` and `sessions.expiresAt` reported ACTIVE. Client rules deny access.

Browser automated chat tests use a mocked provider to make edge cases repeatable. End-to-end provider behavior, every third-party project demo, and every possible device are not covered by the browser suite. External demos can change independently of this site. Resume outcomes are self-reported professional contributions, clearly separated from public project evidence.
