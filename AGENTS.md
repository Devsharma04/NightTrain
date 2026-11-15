# Agent guide

This project is a Video.js HTML skin made by `videojs skin create`; `skin.json` records how. The skin is everything in `src/`, starting from `src/video/skin`. `apps/preview/` is a workbench that previews it; change it only when asked, except `apps/preview/src/frame/player` for the media the preview plays. `README.md` describes the rest.

- Use the `videojs-skin` skill when changing the skin. `npx @videojs/cli agents skills` prints how to install it.
- Keep every control keyboard operable, labeled, with a visible focus indicator, and in source order that matches its visual order. Keep the error dialog, hotkeys, and status announcer unless you replace them.
- Run `npm run typecheck` and `npm run build` after changes, and check the skin in the workbench with `npm run dev`. Deploy the workbench with `npm run deploy <vercel|netlify|cloudflare>` only when asked.

# Night Train skin rules (v2)

- Video.js v10 only. Plain CSS using the tokens in the spec.
- Real buttons and Video.js controls. Decorative train parts are aria-hidden.
- aria-labels stay literal ("Seek", "Volume", "Playback speed", "Quality", "Captions").
- Train front = max(playhead %, 112px). It must never cover the Departed board.
- Mobile: one control row, extras in the More sheet, targets 48px minimum, no horizontal scroll at 320px.
- Motion (wheels, steam, pulse, tunnel, swing, needle easing) only under prefers-reduced-motion: no-preference.
- Document only keyboard shortcuts you have tested.
- Before finishing: run the audit, then npm run deploy.

- Reference: night-train-reference.html wins for looks and motion.
- Train starts with only its nose visible under the Departed board; never clamp it fully into view.
- Steam: four real elements, visible while playing, never clipped.
- Controls row: three-column grid, right group ends at the bar edge.
- Verify in a real browser before saying done; report unverified items.
