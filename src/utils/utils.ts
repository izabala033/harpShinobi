import { Note } from "tonal";

export type TonalNote = ReturnType<typeof Note.get>;

export const harmonicaKeys = [
  { label: "C", value: "C4" },
  { label: "D", value: "D4" },
  { label: "E", value: "E4" },
  { label: "F", value: "F4" },
  { label: "G", value: "G3" },
  { label: "A", value: "A3" },
  { label: "B", value: "B3" },
  { label: "Db", value: "Db4" },
  { label: "Eb", value: "Eb4" },
  { label: "F#", value: "F#4" },
  { label: "Ab", value: "Ab3" },
  { label: "Bb", value: "Bb3" },
];

const safeTranspose = (note: string | null, interval: string) =>
  note ? Note.get(Note.transpose(note, interval)) : null;

export function generateLayout(key: string) {
  const blowDegrees = [
    "1P",
    "3M",
    "5P",
    "8P",
    "10M",
    "12P",
    "15P",
    "17M",
    "19P",
    "22P",
  ];
  const blowRoots = blowDegrees.map((interval) =>
    Note.transpose(key, interval)
  );
  const drawDegrees = [
    "2M",
    "5P",
    "7M",
    "9M",
    "11m",
    "13M",
    "14M",
    "16M",
    "18m",
    "20M",
  ];
  const drawRoots = drawDegrees.map((interval) =>
    Note.transpose(key, interval)
  );
  const blow = blowRoots.map(Note.get);
  const draw = drawRoots.map(Note.get);

  // Define where each bend/overblow is allowed
  const wholeStepBlowBendHoles = [10]; // hole 10 only
  const overblowHoles = [8, 9, 10]; // holes that support overblow
  const halfStepDrawBendOverdrawHoles = [1, 2, 3, 4, 6];
  const wholeStepDrawBendHoles = [2, 3]; // only hole 2 and 3
  const oneAndHalfStepDrawBendHoles = [3]; // only hole 3

  return {
    blow,
    draw,

    wholeStepBlowBend: blowRoots.map((n, i) =>
      wholeStepBlowBendHoles.includes(i + 1) ? safeTranspose(n, "-2M") : null
    ),

    overblowHalfStepBlowBend: blowRoots.map((n, i) =>
      overblowHoles.includes(i + 1) ? safeTranspose(n, "-2m") : null
    ),

    halfStepDrawBendOverdraw: drawRoots.map((n, i) =>
      halfStepDrawBendOverdrawHoles.includes(i + 1)
        ? safeTranspose(n, "-2m")
        : null
    ),

    wholeStepDrawBend: drawRoots.map((n, i) =>
      wholeStepDrawBendHoles.includes(i + 1) ? safeTranspose(n, "-2M") : null
    ),

    oneAndHalfStepDrawBend: drawRoots.map((n, i) =>
      oneAndHalfStepDrawBendHoles.includes(i + 1)
        ? safeTranspose(n, "-3m")
        : null
    ),
  };
}

export function freqToNoteAndCents(freq: number) {
  const noteName = Note.fromFreq(freq); // e.g. "C4"
  if (!noteName) return null;

  const baseFreq = Note.freq(noteName);
  if (!baseFreq) return null;

  const cents = 1200 * Math.log2(freq / baseFreq);

  // Extract pitch class (C, D#, etc.)
  const noteNoOctave = Note.pitchClass(noteName); // e.g., "C"
  return {
    note: noteName, // full note with octave, e.g., "C4"
    pitchClass: noteNoOctave, // just "C"
    cents,
  };
}

export function getHarmonicaHoleForNote(
  key: string, // e.g. "C4"
  targetNote: string
): string | null {
  const layout = generateLayout(key);
  const noteMidi = Note.midi(targetNote);

  if (noteMidi === null) return null;

  const formatHole = (index: number, bend: number, isBlow: boolean) => {
    const hole = isBlow ? index + 1 : -(index + 1);
    const apostrophes = `'`.repeat(bend);
    return `${hole}${apostrophes}`;
  };

  for (let i = 0; i < 10; i++) {
    if (layout.blow[i] && Note.midi(layout.blow[i]!.name) === noteMidi)
      return formatHole(i, 0, true);
    if (
      layout.wholeStepBlowBend[i] &&
      Note.midi(layout.wholeStepBlowBend[i]!.name) === noteMidi
    )
      return formatHole(i, 1, true);
    if (
      layout.overblowHalfStepBlowBend[i] &&
      Note.midi(layout.overblowHalfStepBlowBend[i]!.name) === noteMidi
    )
      return formatHole(i, 1, true);

    if (layout.draw[i] && Note.midi(layout.draw[i]!.name) === noteMidi)
      return formatHole(i, 0, false);
    if (
      layout.halfStepDrawBendOverdraw[i] &&
      Note.midi(layout.halfStepDrawBendOverdraw[i]!.name) === noteMidi
    )
      return formatHole(i, 1, false);
    if (
      layout.wholeStepDrawBend[i] &&
      Note.midi(layout.wholeStepDrawBend[i]!.name) === noteMidi
    )
      return formatHole(i, 2, false);
    if (
      layout.oneAndHalfStepDrawBend[i] &&
      Note.midi(layout.oneAndHalfStepDrawBend[i]!.name) === noteMidi
    )
      return formatHole(i, 3, false);
  }

  return null;
}
