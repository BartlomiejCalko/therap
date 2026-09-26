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

## Languages

The interface follows the device language (`expo-localization`): the first of the person's preferred
languages that Unload supports, otherwise English. Supported now: English (default) and Polish.
Planned: German, French, Spanish, Norwegian.

- `src/i18n/en.ts` is the source of truth; every other dictionary is typed as `Dict`, so a missing
  string is a type error. Plural rules live in `src/i18n/plural.ts`.
- To add a language: create `src/i18n/<code>.ts`, register it in `DICTS` in `src/i18n/index.tsx`,
  add a plural helper if needed, and add the code to `supportedLocales` for `expo-localization` in
  `app.json` (this also enables the per-app language setting on iOS/Android).
- Web preview only, in development: add `?lang=pl` to the URL to see a language without changing the
  browser's.

## Today window

The window at the top of Today paints a pastel landscape for the part of the day (morning 5–11,
afternoon 11–17, evening 17–21, night 21–5). To use photos instead, add them to `DAY_WINDOW_PHOTOS`
in `src/content/dayWindow.ts` — one or more per part of the day, with `ink: 'dark' | 'light'` for the
greeting colour. Parts without photos keep the painted scene.

## Not wired yet

- In-app purchases: subscription screen shows a trial derived from the install date and placeholder plan prices.
- Accounts / sync: name and email are stored locally only.
