import { useState, useMemo } from "react";
import * as tonal from "tonal";
import { usePitchDetector } from "../hooks/usePitchDetector";
import { Note } from "tonal";
import { useTranslation } from "react-i18next";
import {
  harmonicaKeys,
  generateLayout,
  freqToNoteAndCents,
} from "../utils/utils";

type TonalNote = ReturnType<typeof Note.get>;
const baseKey = "C4";

function Harmonica() {
  const { t } = useTranslation();
  const { pitch, clarity } = usePitchDetector(0.7);
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

  console.log(t("D"));

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

        // Use t() to translate note pitch classes, fallback to original
        const simplifiedPitchClass = tonal.Note.simplify(
          tonal.Note.pitchClass(note.name)
        );
        const translatedNoteName = t(simplifiedPitchClass);

        return (
          <div
            key={`${label}-${idx}`}
            className={`relative rounded px-2 py-1 border border-gray-700 ${colorClass}`}
          >
            {translatedNoteName}
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
          {harmonicaKeys.map((k) => (
            <option key={k.value} value={k.value}>
              {t(k.label)}
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
          🎵 Harmonica Layout ({t(Note.pitchClass(key))} Major)
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
