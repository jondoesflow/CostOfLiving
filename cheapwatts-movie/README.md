# Cheap Watts: TikTok video

A 9:16 (1080×1920) promo for cheapwatts.co.uk, built with Remotion from real
screenshots of the site. About 35 seconds; it stretches to fit the voiceover.

## Render it

```
npm install
npm run render:tiktok
```

The video lands in `out/CheapWattsTikTok.mp4`. Use the `npm run` scripts rather
than raw `npx remotion` commands, so the voiceover files are picked up first.
Preview and tweak in the browser with `npm run dev`.

## Add your voiceover (voice clone)

The script is in `narration.json`, one line per scene, written for speaking
aloud. On the PC with the voice clone:

1. In this folder, write the job file, giving the full path to `public\vo`:
   ```
   npm run vo-job -- "C:\path\to\cheapwatts-movie\public\vo"
   ```
2. In your clonemyvoice folder, render the lines (about 25 seconds of speech,
   so allow a few minutes on CPU):
   ```
   cd "C:\Users\lofty\Claude projects\clonemyvoice"
   .venv\Scripts\python.exe scripts\batch_tts.py --job "C:\path\to\cheapwatts-movie\vo-job.json"
   ```
3. Back here, render again: `npm run render:tiktok`.

Each `public/vo/<scene id>.wav` plays at the start of its scene, and the scene
lengthens to fit it. Missing files are fine: that scene just has no voice.
To redo one line, edit it in `narration.json`, rerun steps 1 and 2 (the seed is
fixed, so the other lines come out the same), and render.

## Music

Drop a track in `public/music.mp3` and render. It plays loud under the opening,
then drops to a quiet bed under the voice and fades out at the end.

## Change the video

- **Scenes:** `src/scenes.ts` is the whole timeline. Each scene is one line;
  add, remove or reorder lines and the video length follows.
- **Captions:** the `caption` on each line; words in `highlight` turn gold.
- **Screenshots:** in `public/shots/`. To refresh them from the site, run this
  from the repo root (it uses the same fixed test prices):
  `CAPTURE=1 npx playwright test capture-video --project=phone`
- **A new kind of scene:** add a component in `src/scenes/`, a line in
  `src/registry.ts`, and an entry in the `SceneConfig` union in `src/types.ts`.

## The figures shown

The prices in the screenshots are fixed test prices, set so a washing machine
costs 31p now and 13p overnight. That is the same gap seen on real Agile prices
in Yorkshire on 22 October 2026. Real prices change every day.
