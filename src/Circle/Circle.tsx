import React, { useState, useMemo } from "react";
import * as tonal from "tonal";

const radius = 160; // outer circle radius in px
const center = 180; // center x/y in px
const circleSize = center * 2;

// Define modes with their harmonic order and display position
const modesWithOrder = [
  { name: "Ionian", order: 1, label: "1st" },
  { name: "Mixolydian", order: 2, label: "2nd" },
  { name: "Dorian", order: 3, label: "3rd" },
  { name: "Aeolian", order: 4, label: "4th" },
  { name: "Phrygian", order: 5, label: "5th" },
  { name: "Locrian", order: 6, label: "6th" },
  { name: "Lydian", order: 12, label: "12th" },
];

const modeDegreesMap: Record<string, number> = {
  ionian: 1,
  dorian: 2,
  phrygian: 3,
  lydian: 4,
  mixolydian: 5,
  aeolian: 6,
  locrian: 7,
};

const modeNames = modesWithOrder.map((m) => m.name);

// Labels you want for scale degrees 1-7, index matches degree index
const degreeLabels = ["1", "2", "3", "4", "5", "6", "7"];

// Color classes for chord triads
const chordQualityColors: Record<string, string> = {
  major: "bg-green-500 text-black", // major triads
  minor: "bg-blue-500 text-black", // minor triads
  diminished: "bg-purple-500 text-black", // diminished triads
  none: "bg-gray-800 text-white hover:bg-green-600", // not in triad
};

function Circle() {
  // Build circle of fifths notes array in order (C, G, D, A, E, B, F#, C#, G#, D#, A#, F)
  const circleOfFifths = useMemo(() => {
    const notes = [];
    let note = "C";
    for (let i = 0; i < 12; i++) {
      notes.push(tonal.Note.simplify(note));
      note = tonal.Note.transpose(note, "5P");
    }
    return notes;
  }, []);

  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedMode, setSelectedMode] = useState(0); // Ionian = mode 0

  const modeName = modeNames[selectedMode];

  // Calculate the tonic of the mode correctly based on mode degree mapping
  const majorScaleNotes = tonal.Scale.get(selectedRoot + " major").notes;
  const modeDegree = modeDegreesMap[modeName.toLowerCase()] || 1;
  const modeTonic = majorScaleNotes[modeDegree - 1];

  // Get scale notes for selected root & mode
  // Use tonal.Scale.get but with mode tonic and mode name to get accurate notes
  const scale = tonal.Scale.get(modeTonic + " " + modeName.toLowerCase()).notes;

  // Helper to build triads for each degree
  const triads = useMemo(() => {
    const triadsArray = [];
    for (let i = 0; i < 7; i++) {
      const root = scale[i];
      const third = scale[(i + 2) % 7];
      const fifth = scale[(i + 4) % 7];
      const triadNotes = [root, third, fifth];
      const qualities = tonal.Chord.detect(triadNotes);
      const quality = qualities.length > 0 ? qualities[0] : "none";
      triadsArray.push({ root, notes: triadNotes, quality });
    }
    return triadsArray;
  }, [scale]);

  // Helper to parse chord quality from triad string
  function getChordQuality(triad: string) {
    return tonal.Chord.get(triad).type.toLowerCase();
  }

  // Map each note in circleOfFifths to chord quality based on triads it belongs to
  const noteColors = useMemo(() => {
    const map: Record<string, string> = {};
    const normalizeNote = (n: string) => tonal.Note.chroma(n);

    circleOfFifths.forEach((note) => {
      map[normalizeNote(note)] = "none";
    });

    triads.forEach(({ root, notes, quality }) => {
      const rootNorm = normalizeNote(root);
      map[rootNorm] = quality;
      notes.forEach((note) => {
        const noteNorm = normalizeNote(note);
        if (noteNorm !== rootNorm && map[noteNorm] === "none") {
          map[noteNorm] = quality;
        }
      });
    });

    return map;
  }, [circleOfFifths, triads]);

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

          const colorClass =
            chordQualityColors[
              getChordQuality(noteColors[tonal.Note.chroma(note)]) || "none"
            ];

          const isParentMajor =
            tonal.Note.chroma(note) === tonal.Note.chroma(modeTonic);

          const borderClass = isParentMajor ? "border-4 border-yellow-400" : "";

          return (
            <React.Fragment key={note}>
              {/* Outer note circle */}
              <div
                onClick={() => {
                  setSelectedRoot(note);
                  setSelectedMode(0);
                }}
                className={`absolute cursor-pointer rounded-full w-14 h-14 flex items-center justify-center font-semibold text-lg transition-colors duration-300 ${colorClass} ${borderClass}`}
                style={{ left: x - 28, top: y - 28 }}
                title={`Select root: ${note}`}
              >
                {note}
              </div>

              {/* Inner degree label positioned between center and outer note */}
              {(() => {
                const degreeIndex = scale.findIndex(
                  (n) => tonal.Note.chroma(n) === tonal.Note.chroma(note)
                );
                if (degreeIndex === -1) return null;

                const innerRadius = radius * 0.6;
                const xInner =
                  center + innerRadius * Math.cos(i * angleStep - Math.PI / 2);
                const yInner =
                  center + innerRadius * Math.sin(i * angleStep - Math.PI / 2);

                return (
                  <div
                    className={`absolute rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold ${colorClass}`}
                    style={{ left: xInner - 16, top: yInner - 16 }}
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
        {modesWithOrder
          .sort((a, b) => a.order - b.order)
          .map(({ name, order, label }) => {
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
    </div>
  );
}

export default Circle;
