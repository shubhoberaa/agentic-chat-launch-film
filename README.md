# Agentic Chat launch film

An 18-second Remotion product launch film for Agentic Chat. The default `Launch` composition is 1920×1080 at 60 fps and 120 BPM; the longer source cut is also available as `Extended`.

## Render the video

```sh
npm ci
npm run typecheck
npm run render        # out/agentic-chat-launch-film.mp4
# Optional higher-resolution masters:
npm run render:1440
npm run render:4k
```

The film follows one request as it routes through Search, Compare, and Slack, resolves to a posted result, then becomes the product mark. The Cinetic brief and shot treatment are in `BRIEF.md` and `TREATMENT.md`.
