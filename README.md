# Agentic Chat launch film

A standalone Remotion project for the 58.7-second Agentic Chat launch film. The composition is authored at 1920×1080 and 60 fps. Render with Remotion's `--scale` option so the motion layout, cursor targets, and typography scale together.

## Render

From the repository root:

```sh
cd launch-film
npm ci
npm run typecheck
npm run render:4k       # 3840×2160, 60 fps
# or
npm run render:1440     # 2560×1440, 60 fps
```

The commands write MP4s under `out/`. A 4K still was checked at 3840×2160 and downsampled against the approved 1080p frame to confirm layout alignment. The project includes the Mixkit soundtrack and SFX used in the film.
