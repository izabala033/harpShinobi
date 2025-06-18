import { Note, Interval } from "tonal";

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
  const halfStepBlowBendHoles = [8, 9, 10]; // holes that support
  const halfStepDrawBendHoles = [1, 2, 3, 4, 6];
  const wholeStepDrawBendHoles = [2, 3]; // only hole 2 and 3
  const oneAndHalfStepDrawBendHoles = [3]; // only hole 3

  // Not used because the seminotes vary for each hole
  // const overblowHoles = [1, 4, 5, 6];
  // const overdrawHoles = [7, 9, 10];

  const overblowinterval146 = Interval.fromSemitones(3);
  const overblowinterval5 = Interval.fromSemitones(2);

  const overdraw7 = Interval.fromSemitones(2);
  const overdraw9 = Interval.fromSemitones(3);
  const overdraw10 = Interval.fromSemitones(4);

  const overblowNotes = blowRoots.map((note, i) => {
    const hole = i + 1;
    if ([1, 4, 6].includes(hole)) {
      return safeTranspose(note, overblowinterval146);
    }
    if (hole === 5) {
      return safeTranspose(note, overblowinterval5);
    }
    return null;
  });

  const overdrawNotes = drawRoots.map((note, i) => {
    const hole = i + 1;
    if (hole === 7) {
      return safeTranspose(note, overdraw7);
    }
    if (hole === 9) {
      return safeTranspose(note, overdraw9);
    }
    if (hole === 10) {
      return safeTranspose(note, overdraw10);
    }
    return null;
  });

  return {
    blow,
    draw,

    wholeStepBlowBend: blowRoots.map((n, i) =>
      wholeStepBlowBendHoles.includes(i + 1) ? safeTranspose(n, "-2M") : null
    ),

    HalfStepBlowBend: blowRoots.map((n, i) =>
      halfStepBlowBendHoles.includes(i + 1) ? safeTranspose(n, "-2m") : null
    ),

    halfStepDrawBendOverdraw: drawRoots.map((n, i) =>
      halfStepDrawBendHoles.includes(i + 1) ? safeTranspose(n, "-2m") : null
    ),

    wholeStepDrawBend: drawRoots.map((n, i) =>
      wholeStepDrawBendHoles.includes(i + 1) ? safeTranspose(n, "-2M") : null
    ),

    oneAndHalfStepDrawBend: drawRoots.map((n, i) =>
      oneAndHalfStepDrawBendHoles.includes(i + 1)
        ? safeTranspose(n, "-3m")
        : null
    ),
    overblow: overblowNotes,
    overdraw: overdrawNotes,
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

  const formatHole = (
    index: number,
    bend: number,
    isBlow: boolean,
    isOverdrawOrOverblow: boolean
  ) => {
    const hole = isBlow ? index + 1 : -(index + 1);
    const apostrophes = `'`.repeat(bend);
    const overnote = isOverdrawOrOverblow ? "o" : "";
    return `${hole}${apostrophes}${overnote}`;
  };

  for (let i = 0; i < 10; i++) {
    if (layout.blow[i] && Note.midi(layout.blow[i]!.name) === noteMidi)
      return formatHole(i, 0, true, false);
    if (
      layout.wholeStepBlowBend[i] &&
      Note.midi(layout.wholeStepBlowBend[i]!.name) === noteMidi
    )
      return formatHole(i, 1, true, false);
    if (
      layout.HalfStepBlowBend[i] &&
      Note.midi(layout.HalfStepBlowBend[i]!.name) === noteMidi
    )
      return formatHole(i, 1, true, false);

    if (layout.draw[i] && Note.midi(layout.draw[i]!.name) === noteMidi)
      return formatHole(i, 0, false, false);
    if (
      layout.halfStepDrawBendOverdraw[i] &&
      Note.midi(layout.halfStepDrawBendOverdraw[i]!.name) === noteMidi
    )
      return formatHole(i, 1, false, false);
    if (
      layout.wholeStepDrawBend[i] &&
      Note.midi(layout.wholeStepDrawBend[i]!.name) === noteMidi
    )
      return formatHole(i, 2, false, false);
    if (
      layout.oneAndHalfStepDrawBend[i] &&
      Note.midi(layout.oneAndHalfStepDrawBend[i]!.name) === noteMidi
    )
      return formatHole(i, 3, false, false);

    if (layout.overblow[i] && Note.midi(layout.overblow[i]!.name) === noteMidi)
      return formatHole(i, 0, true, true);
    if (layout.overdraw[i] && Note.midi(layout.overdraw[i]!.name) === noteMidi)
      return formatHole(i, 0, false, true);
  }

  return null;
}
