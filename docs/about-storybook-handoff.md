# About storybook handoff

Implemented an integrated paper-book section between the About introduction and career history. Four interactive chapters connect Computer Science & Design at IIIT Delhi, delegation and people management, a personal view of the allocation economy, product judgment with AI, fresh ideas, and forward-deployed engineering close to customers.

The book uses CSS perspective, folded paper faces, cast shadows, chapter-specific symbols, and short unfolding animations. Full prose appears immediately and independently of animation. The chapter data in `src/background.ts` also feeds `scripts/prepare-knowledge.mjs`, so the AI guide and page share one account.

Removed the specified internal product name from career copy and AI knowledge, replacing it with broader work across the product portfolio. Removed authored em and en dashes from UI, metadata, titles, date ranges, source descriptions and knowledge. The AI guide prompt prohibits them, and provider-answer normalization prevents generated long dashes from reaching the displayed response.

Accessibility: native button tabs with selected state, roving focus, ArrowLeft/ArrowRight/Home/End support, labeled tabpanels, hidden inactive panels, readable text before animation, reduced-motion treatment, 44px minimum controls, and page-turn focus/scroll. The final page moves focus to the career heading. The book can reflow with enlarged text.

Validation completed:

- `npm run build`: passed.
- `npm test`: 23 passed, including content exclusions and AI-answer punctuation.
- `npm run test:e2e`: 38 passed across Chromium and mobile WebKit, including existing project navigation, lab, chat, contact, career and responsive regressions.
- Additional focused story run: 8 passed after strengthening the true 200% text-size check and adding normal-motion verification in both engines.
- New story coverage includes all chapters, keyboard navigation, focused axe checks, 320/390/600/820px portrait and 640px landscape layouts, reduced motion, dock clearance, and 200% text.
- Visual artifacts: `test-results/desktop-book-1.png` through `desktop-book-4.png` and corresponding `mobile-book-*.png`. Element screenshots temporarily hide the fixed dock for review; separate tests verify the real dock geometry.

The client build and server updates must be published together. The server changes are `server/core.mjs` and regenerated `server/knowledge.json`. No deployment, push, or commit was performed by this implementation task.
