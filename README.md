# Unload

A therapeutic "empty your head" writing app — not a journal. React Native + Expo (SDK 57, expo-router).

Design direction: warm paper and sumi ink, serif for thoughts, letterspaced small caps for labels, hairlines,
pill buttons and a floating pill tab bar inspired by Cosmos. No emoji.

## Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on a phone, or press `w` for the web preview.

## Structure

- `src/app/(tabs)` — Today, Capture, Unload, Breath, Calendar
- `src/app/session` — setup (design your session) → ground (1-min breath) → write → complete → shift
- `src/app/checkin.tsx`, `affirmation.tsx`, `choose.tsx`, `how-to-write.tsx` — the Today flow
- `src/app/settings` — method, theme, session options, PIN, data, account, subscription
- `src/content/copy.ts` — all product copy (states, sessions, starters, companion phrases, breath patterns)
- `src/store` — local data (AsyncStorage); nothing leaves the device
- `src/components` — design system (`ui.tsx`, `T.tsx`, icons, session marks, tab bar, breath, ensō)
- `scripts/generate-sounds.mjs` — synthesises the three focus-sound loops (`npm run sounds`)
- `scripts/generate-paper.mjs` — generates the washi paper grain in `assets/textures` (`npm run paper`)

## Today window

The window at the top of Today paints a pastel landscape for the part of the day (morning 5–11,
afternoon 11–17, evening 17–21, night 21–5). To use photos instead, add them to `DAY_WINDOW_PHOTOS`
in `src/content/dayWindow.ts` — one or more per part of the day, with `ink: 'dark' | 'light'` for the
greeting colour. Parts without photos keep the painted scene.

## Not wired yet

- In-app purchases: subscription screen shows a trial derived from the install date and placeholder plan prices.
- Accounts / sync: name and email are stored locally only.
