import React, { useState } from "react";
import * as tonal from "tonal";

const radius = 160; // outer circle radius in px
const center = 180; // center x/y in px
const circleSize = center * 2;

// Define modes with their harmonic order and display position
const modesWithOrder = [
  { name: "Ionian", order: 1, label: "1st" },
  { name: "Mixolydian", order: 2, label: "2nd" },
  { name: "Dorian", order: 3, label: "3rd" },
  { name: "Phrygian", order: 4, label: "4th" },
  { name: "Aeolian", order: 5, label: "5th" },
  { name: "Locrian", order: 6, label: "6th" },
  { name: "Lydian", order: 12, label: "12th" },
];

const modeNames = modesWithOrder.map((m) => m.name);

// Sort by harmonic order ascending
const sortedModes = modesWithOrder.sort((a, b) => a.order - b.order);

// Labels you want for scale degrees 1-7, index matches degree index
const degreeLabels = ["1", "2m", "3m", "4", "5", "6m", "7dim"];

// Color classes matching degree type (same as your outer note colors)
const degreeColors: Record<number, string> = {
  0: "bg-green-500 text-black", // 1 (I)
  3: "bg-green-500 text-black", // 4 (IV)
  4: "bg-green-500 text-black", // 5 (V)
  1: "bg-blue-500 text-black", // 2m (ii)
  2: "bg-blue-500 text-black", // 3m (iii)
  5: "bg-blue-500 text-black", // 6m (vi)
  6: "bg-purple-500 text-black", // 7dim (vii°)
};

function Circle() {
  // Build circle of fifths notes array in order (C, G, D, A, E, B, F#, C#, G#, D#, A#, F)
  const circleOfFifths = (() => {
    const notes = [];
    let note = "C";
    for (let i = 0; i < 12; i++) {
      notes.push(tonal.Note.simplify(note));
      note = tonal.Note.transpose(note, "5P");
    }
    return notes;
  })();

  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedMode, setSelectedMode] = useState(0); // Ionian = mode 0

  // Get scale notes for selected root & mode
  const scaleName = `${selectedRoot} ${modeNames[selectedMode]}`;
  const scale = tonal.Scale.get(scaleName).notes;

  // Get major scale notes for color/degree matching
  const majorScale = tonal.Scale.get(`${selectedRoot} major`).notes;

  // Calculate angle step for 12 notes evenly spaced
  const angleStep = (2 * Math.PI) / circleOfFifths.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 select-none">
      <h1 className="text-3xl font-bold mb-6">Circle of Fifths</h1>

      {/* Outer circle container */}
      <div
        className="relative"
        style={{ width: circleSize, height: circleSize, marginBottom: 40 }}
      >
        {/* Outer notes on circle of fifths */}
        {circleOfFifths.map((note, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          const isSelected = note === selectedRoot;

          // Find scale degree index (0 to 6) for this note in major scale, use enharmonic to match
          const degreeIndex = majorScale.findIndex(
            (n) => tonal.Note.enharmonic(n) === tonal.Note.enharmonic(note)
          );

          // Outer note color by degree
          let colorClass = "bg-gray-800 hover:bg-green-600 text-white";
          if ([0, 3, 4].includes(degreeIndex)) {
            colorClass = "bg-green-500 text-black"; // I, IV, V
          } else if ([1, 2, 5].includes(degreeIndex)) {
            colorClass = "bg-blue-500 text-black"; // ii, iii, vi
          } else if (degreeIndex === 6) {
            colorClass = "bg-purple-500 text-black"; // vii°
          }

          const borderClass = isSelected ? "border-4 border-yellow-400" : "";

          return (
            <React.Fragment key={note}>
              {/* Outer note circle */}
              <div
                onClick={() => setSelectedRoot(note)}
                className={`absolute cursor-pointer rounded-full w-14 h-14 flex items-center justify-center font-semibold text-lg transition-colors duration-300 ${colorClass} ${borderClass}`}
                style={{ left: x - 28, top: y - 28 }}
                title={`Select root: ${note}`}
              >
                {note}
              </div>

              {/* Inner degree label positioned between center and outer note */}
              {degreeIndex !== -1 &&
                (() => {
                  const innerRadius = radius * 0.6; // 60% radius inside the circle
                  const xInner =
                    center +
                    innerRadius * Math.cos(i * angleStep - Math.PI / 2);
                  const yInner =
                    center +
                    innerRadius * Math.sin(i * angleStep - Math.PI / 2);
                  return (
                    <div
                      className={`absolute rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold ${degreeColors[degreeIndex]}`}
                      style={{ left: xInner - 16, top: yInner - 16 }}
                      title={`Scale degree: ${degreeLabels[degreeIndex]} (${note})`}
                    >
                      {degreeLabels[degreeIndex]}
                    </div>
                  );
                })()}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mode selector with harmonic order */}
      <div className="flex gap-3 overflow-x-auto max-w-full px-4 mt-4">
        {sortedModes.map(({ name, order, label }) => {
          // Find index of mode in original modeNames array to match selectedMode
          const modeIndex = modeNames.indexOf(name);
          const isSelected = modeIndex === selectedMode;

          return (
            <div
              key={name}
              onClick={() => setSelectedMode(modeIndex)}
              className={`cursor-pointer px-4 py-2 rounded font-semibold whitespace-nowrap
          ${
            isSelected
              ? "bg-green-500 text-black shadow-lg"
              : "bg-gray-800 hover:bg-green-600 transition-colors"
          }`}
              title={`Select mode: ${name}`}
            >
              {name} ({label})
            </div>
          );
        })}
      </div>

      {/* Display scale notes */}
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
