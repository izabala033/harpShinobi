import React, { useState } from "react";
import * as tonal from "tonal";

const radius = 150; // circle radius in px
const center = 180; // center x/y in px
const circleSize = center * 2;

const modeNames = [
  "Ionian",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
  "Aeolian",
  "Locrian",
];

function Circle() {
  // Get circle of fifths notes in order
  // tonal.Scale.notes("C major") returns the notes of C major
  // tonal.Key.keysOfMode("major") not available but tonal.Scale is good.
  // Instead, use tonal.Progression or tonal.Scale.circleOfFifths

  // Tonal doesn't expose a built-in circleOfFifths, so we build it manually:
  const circleOfFifths = (() => {
    const notes = [];
    let note = "C";
    for (let i = 0; i < 12; i++) {
      notes.push(tonal.Note.simplify(note)); // only simplify for display
      note = tonal.Note.transpose(note, "5P");
    }
    return notes;
  })();

  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedMode, setSelectedMode] = useState(0); // Ionian = mode 0

  // Get scale notes for selected root & mode
  // Use tonal.Scale.get(`${root} ${modeName}`)
  const scaleName = `${selectedRoot} ${modeNames[selectedMode]}`;
  const scale = tonal.Scale.get(scaleName).notes;

  // For positioning notes around the circle
  const angleStep = (2 * Math.PI) / circleOfFifths.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 select-none">
      <h1 className="text-3xl font-bold mb-6">Circle of Fifths</h1>

      {/* Circle container */}
      <div
        className="relative"
        style={{ width: circleSize, height: circleSize, marginBottom: 40 }}
      >
        {circleOfFifths.map((note, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          const isSelected = note === selectedRoot;

          const majorScale = tonal.Scale.get(`${selectedRoot} major`).notes;
          const degreeIndex = majorScale.findIndex(
            (n) => tonal.Note.enharmonic(n) === tonal.Note.enharmonic(note)
          );

          console.log(
            `Note: ${note}, Degree Index: ${degreeIndex}, Selected Root: ${selectedRoot}`
          );
          // Base styles
          let colorClass = "bg-gray-800 hover:bg-green-600 text-white";
          let borderClass = "";

          if (degreeIndex === 0 || degreeIndex === 3 || degreeIndex === 4) {
            colorClass = "bg-green-500 text-black"; // I, IV, V
          } else if (
            degreeIndex === 1 ||
            degreeIndex === 2 ||
            degreeIndex === 5
          ) {
            colorClass = "bg-blue-500 text-black"; // ii, iii, vi
          } else if (degreeIndex === 6) {
            colorClass = "bg-purple-500 text-black"; // vii°
          }

          if (isSelected) {
            borderClass = "border-4 border-yellow-400";
          }

          return (
            <div
              key={note}
              onClick={() => setSelectedRoot(note)}
              className={`absolute cursor-pointer rounded-full w-14 h-14 flex items-center justify-center font-semibold text-lg transition-colors duration-300 ${colorClass} ${borderClass}`}
              style={{ left: x - 28, top: y - 28 }}
              title={`Select root: ${note}`}
            >
              {note}
            </div>
          );
        })}
      </div>

      {/* Mode selector */}
      <div className="flex gap-3 overflow-x-auto max-w-full px-4">
        {modeNames.map((modeName, i) => (
          <div
            key={modeName}
            onClick={() => setSelectedMode(i)}
            className={`cursor-pointer px-4 py-2 rounded font-semibold whitespace-nowrap
              ${
                selectedMode === i
                  ? "bg-green-500 text-black shadow-lg"
                  : "bg-gray-800 hover:bg-green-600 transition-colors"
              }`}
            title={`Select mode: ${modeName}`}
          >
            {modeName}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center max-w-xl">
        <h2 className="text-xl mb-2">
          {selectedRoot} {modeNames[selectedMode]} scale notes:
        </h2>
        <div className="flex flex-wrap justify-center gap-3 text-lg">
          {scale.map((note) => (
            <div
              key={note}
              className="bg-green-700 px-3 py-1 rounded shadow"
              title={`Note: ${note}`}
            >
              {note}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Circle;
