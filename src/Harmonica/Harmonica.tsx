import { useState, useMemo } from "react";
import * as tonal from "tonal";
import { usePitchDetector } from "../hooks/usePitchDetector";
import { Note } from "tonal";

// TODO: ADD OVERBLOWS
type TonalNote = ReturnType<typeof Note.get>;
const baseKey = "C4";
const generateLayout = (key: string) => {
  const blowDegrees = [
    "1P", // unison
    "3M", // major 3rd
    "5P", // perfect 5th
    "8P", // octave
    "10M", // major 10th (3M + 8P)
    "12P", // perfect 12th (5P + 8P)
    "15P", // two octaves
    "17M", // major 17th (3M + 15P)
    "19P", // perfect 19th (5P + 15P)
    "22P", // two octaves + octave (optional)
  ];
  const blowRoots = blowDegrees.map((interval) =>
    Note.transpose(key, interval)
  );
  const drawDegrees = [
    "2M", // D4  (major 2nd)
    "5P", // G4  (perfect 5th)
    "7M", // B4  (major 7th)
    "9M", // D5  (octave + major 2nd)
    "11m", // F5  (octave + perfect 4th)
    "13M", // A5  (octave + major 6th)
    "14M", // B5  (octave + major 7th)
    "16M", // D6  (two octaves + major 2nd)
    "18m", // F6  (two octaves + perfect 4th)
    "20M", // A6  (two octaves + major 6th)
  ];

  const drawRoots = drawDegrees.map((interval) =>
    Note.transpose(key, interval)
  );

  const blow = blowRoots.map(Note.get);
  const draw = drawRoots.map(Note.get);

  const safeTranspose = (note: string | null, interval: string) =>
    note ? Note.get(Note.transpose(note, interval)) : null;

  // Define where each bend/overblow is allowed
  const wholeStepBlowBendHoles = [10]; // hole 10 only
  const overblowHoles = [8, 9, 10]; // holes that support overblow
  const halfStepDrawBendOverdrawHoles = [1, 2, 3, 4, 6];
  const wholeStepDrawBendHoles = [2, 3]; // only hole 2
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
};

const keys = [
  { label: "C", value: "C4" },
  { label: "D", value: "D4" },
  { label: "E", value: "E4" },
  { label: "F", value: "F4" },
  { label: "G", value: "G4" },
  { label: "A", value: "A3" },
  { label: "B", value: "B4" },
  { label: "Db", value: "Db4" },
  { label: "Eb", value: "Eb4" },
  { label: "F#", value: "F#4" },
  { label: "Ab", value: "Ab4" },
  { label: "Bb", value: "Bb4" },
];

function freqToNoteAndCents(freq: number) {
  const noteName = tonal.Note.fromFreq(freq); // e.g. "C4"
  if (!noteName) return null;

  const baseFreq = tonal.Note.freq(noteName);
  if (!baseFreq) return null;

  const cents = 1200 * Math.log2(freq / baseFreq);

  // Extract pitch class (C, D#, etc.)
  const noteNoOctave = tonal.Note.pitchClass(noteName); // e.g., "C"
  return {
    note: noteName, // full note with octave, e.g., "C4"
    pitchClass: noteNoOctave, // just "C"
    cents,
  };
}

function Harmonica() {
  const { pitch, clarity } = usePitchDetector();
  const [key, setKey] = useState(baseKey);
  const layout = useMemo(() => generateLayout(key), [key]);
  // Get detected note and cents offset from pitch
  const detectedNote = useMemo(() => {
    if (!pitch) return null;
    return freqToNoteAndCents(Number(pitch));
  }, [pitch]);

  // Render a horizontal line inside the note box
  // offsetY: vertical offset in px from center, positive moves line down
  const renderLine = (offsetY: number) => {
    // Clamp offset to ±8 px max to stay inside the box (box ~ 32px height)
    const clampedOffset = Math.max(-8, Math.min(8, offsetY));
    return (
      <div
        className="absolute left-0 right-0 h-[2px] bg-green-400"
        style={{
          top: `calc(50% + ${clampedOffset}px)`,
          pointerEvents: "none",
        }}
      />
    );
  };

  const renderRow = (
    notes: (TonalNote | null)[],
    label?: string,
    colorClass = "text-white"
  ) => (
    <div className="grid grid-cols-10 gap-2 mb-1 text-center">
      {notes.map((note, idx) => {
        if (!note) return <div key={`${label}-${idx}`} />;

        // Check if note matches detected note
        let showLine = false;
        let offsetY = 0;

        if (
          detectedNote &&
          tonal.Note.midi(detectedNote.note) === tonal.Note.midi(note.name)
        ) {
          showLine = true;
          // Map cents offset (±50 cents) to ±8px vertical offset
          // 0 cents = center (0px), 50 cents = 8px
          offsetY = -(detectedNote.cents / 50) * 8;
        }

        return (
          <div
            key={`${label}-${idx}`}
            className={`relative rounded px-2 py-1 border border-gray-700 ${colorClass}`}
          >
            {tonal.Note.pitchClass(note.name)}
            {showLine && renderLine(offsetY)}
          </div>
        );
      })}
    </div>
  );

  const renderHoleNumbers = () => (
    <div className="grid grid-cols-10 gap-2 mb-2 text-center text-gray-400 font-semibold select-none">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={`hole-${i + 1}`}>{i + 1}</div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
        🎶 Harmonica Pitch Visualizer
      </h1>

      <div className="mb-6">
        <label
          htmlFor="key-select"
          className="block mb-2 font-semibold text-lg text-gray-300"
        >
          Select Harmonica Key:
        </label>
        <select
          id="key-select"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
        >
          {keys.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative w-full max-w-md mx-auto h-[5.5rem] sm:h-[6rem]">
        {/* Visible when pitch is detected */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            pitch ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="text-xl sm:text-2xl font-semibold text-green-400">
            Pitch: {pitch} Hz
          </div>
          <div className="text-lg sm:text-xl text-gray-300">
            Clarity: {clarity}
          </div>
          {detectedNote && (
            <div className="text-gray-400">
              Detected Note: {detectedNote.note} (
              {detectedNote.cents.toFixed(1)} cents)
            </div>
          )}
        </div>
        {/* Placeholder when no pitch detected */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            pitch ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="text-gray-500 text-lg sm:text-xl animate-pulse">
            Listening for pitch...
          </div>
        </div>
      </div>

      {/* Harmonica layout */}
      <div className="max-w-xl w-full text-center">
        <h2 className="text-xl font-semibold mb-4">
          🎵 Harmonica Layout ({Note.pitchClass(key)} Major)
        </h2>

        {renderRow(
          layout.wholeStepBlowBend,
          "Whole Step Blow Bend",
          "bg-purple-700 text-white"
        )}
        {renderRow(
          layout.overblowHalfStepBlowBend,
          "Overblow + Half Step Blow Bend",
          "bg-indigo-700 text-white"
        )}
        {renderRow(layout.blow, "Blow", "bg-blue-600 text-white")}
        {renderHoleNumbers()}
        {renderRow(layout.draw, "Draw", "bg-red-600 text-white")}
        {renderRow(
          layout.halfStepDrawBendOverdraw,
          "Half Step Draw Bend + Overdraw",
          "bg-pink-700 text-white"
        )}
        {renderRow(
          layout.wholeStepDrawBend,
          "Whole Step Draw Bend",
          "bg-rose-700 text-white"
        )}
        {renderRow(
          layout.oneAndHalfStepDrawBend,
          "1.5 Step Draw Bend",
          "bg-amber-700 text-white"
        )}
      </div>
    </div>
  );
}

export default Harmonica;
