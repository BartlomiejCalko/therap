import type { WritingFont } from '@/store/types';

// Text written in more than one face: each run starts at a character index and lasts until the
// next run. Changing the face mid-session starts a new run at the caret, so what was already
// written keeps the face it was written in.
//
// `after` marks a run that resumes the old face right behind the caret: text typed at that spot
// pushes it along, so new words take the new face and the words that follow keep theirs.
export type FontRun = { at: number; font: WritingFont; after?: boolean };

// Keeps runs sorted and without two neighbours in the same face.
function tidy(runs: FontRun[], length: number): FontRun[] {
  const sorted = runs
    .map((run) => ({ ...run, at: Math.max(0, Math.min(run.at, length)) }))
    .sort((a, b) => a.at - b.at || Number(!!a.after) - Number(!!b.after));
  const out: FontRun[] = [];
  for (const run of sorted) {
    const prev = out[out.length - 1];
    // At one index, a newer choice replaces an older one, unless it resumes behind the caret.
    if (prev && prev.at === run.at && !!prev.after === !!run.after) out.pop();
    const last = out[out.length - 1];
    if (last && last.font === run.font) continue;
    // Once text sits between them, a resuming run is an ordinary one.
    out.push(last && last.at === run.at && run.after ? run : { at: run.at, font: run.font });
  }
  if (!out.length || out[0].at !== 0) out.unshift({ at: 0, font: (sorted[0] ?? { font: 'mono' }).font });
  return out;
}

// Moves the runs to follow an edit from `before` to `after`: text inserted at a run's start
// belongs to that run, text after a deletion shifts back, and runs inside a deletion collapse.
export function followEdit(runs: FontRun[], before: string, after: string): FontRun[] {
  let prefix = 0;
  const max = Math.min(before.length, after.length);
  while (prefix < max && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (suffix < max - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) {
    suffix++;
  }
  const removedEnd = before.length - suffix;
  const delta = after.length - before.length;
  const moved = runs.map((run) => {
    if (run.at < prefix || (run.at === prefix && !run.after)) return run;
    if (run.at >= removedEnd) return { ...run, at: run.at + delta };
    return { ...run, at: prefix };
  });
  return tidy(moved, after.length);
}

// Writes in `font` from index `at` onward; any text already after `at` keeps its face.
export function startFont(runs: FontRun[], at: number, font: WritingFont, length: number): FontRun[] {
  const kept = runs.filter((r) => r.at !== at || r.after);
  const next: FontRun[] = [...kept, { at, font }];
  if (at < length && !kept.some((r) => r.at === at && r.after)) {
    next.push({ at, font: fontAt(runs, at), after: true });
  }
  return tidy(next, length);
}

// The face of the character at `index`: the last run (in order) that starts at or before it.
function fontAt(runs: FontRun[], index: number): WritingFont {
  let font = runs[0]?.font ?? 'mono';
  for (const run of runs) if (run.at <= index) font = run.font;
  return font;
}

// The text cut into pieces, each with its face, ready to draw.
export function splitRuns(text: string, runs: FontRun[]) {
  return runs
    .map((run, i) => ({ font: run.font, text: text.slice(run.at, runs[i + 1]?.at ?? text.length) }))
    .filter((piece) => piece.text.length > 0);
}
