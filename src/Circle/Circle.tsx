import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as tonal from "tonal";

const getResponsiveSize = () => {
  const width = window.innerWidth;
  if (width < 400) return { radius: 100, center: 120 };
  if (width < 640) return { radius: 120, center: 140 };
  if (width < 768) return { radius: 140, center: 160 };
  return { radius: 160, center: 180 };
};

const modes = [
  { name: "Ionian", degree: 1, harmonicaPosition: "1st", harmonicaOrder: 1 },
  {
    name: "Mixolydian",
    degree: 5,
    harmonicaPosition: "2nd",
    harmonicaOrder: 2,
  },
  { name: "Dorian", degree: 2, harmonicaPosition: "3rd", harmonicaOrder: 3 },
  { name: "Aeolian", degree: 6, harmonicaPosition: "4th", harmonicaOrder: 4 },
  { name: "Phrygian", degree: 3, harmonicaPosition: "5th", harmonicaOrder: 5 },
  { name: "Locrian", degree: 7, harmonicaPosition: "6th", harmonicaOrder: 6 },
  { name: "Lydian", degree: 4, harmonicaPosition: "12th", harmonicaOrder: 12 },
];

const modeNames = modes.map((m) => m.name);
const modeDegreesMap: Record<string, number> = Object.fromEntries(
  modes.map((m) => [m.name.toLowerCase(), m.degree])
);

const chordQualityColors: Record<string, string> = {
  major: "bg-yellow-400 text-black",
  minor: "bg-blue-600 text-white",
  diminished: "bg-red-500 text-white",
  none: "bg-gray-800 text-white hover:bg-green-600",
};

function Circle() {
  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedMode, setSelectedMode] = useState(0);
  const [dimensions, setDimensions] = useState(getResponsiveSize());
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => setDimensions(getResponsiveSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { radius, center } = dimensions;
  const circleSize = center * 2;
  const modeName = modeNames[selectedMode];

  const circleOfFifths = useMemo(() => {
    const notes = [];
    let note = "C";
    for (let i = 0; i < 12; i++) {
      notes.push(tonal.Note.simplify(note));
      note = tonal.Note.transpose(note, "5P");
    }
    return notes;
  }, []);

  const majorScaleNotes = tonal.Scale.get(selectedRoot + " major").notes;
  const modeDegree = modeDegreesMap[modeName.toLowerCase()] || 1;
  const modeTonic = majorScaleNotes[modeDegree - 1];
  const scale = tonal.Scale.get(modeTonic + " " + modeName.toLowerCase()).notes;

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

  const angleStep = (2 * Math.PI) / circleOfFifths.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
        🎵 Circle of Fifths
      </h1>

      <div
        className="relative"
        style={{ width: circleSize, height: circleSize, marginBottom: 40 }}
      >
        {circleOfFifths.map((note, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          const chroma = tonal.Note.chroma(note);
          const colorClass =
            chordQualityColors[
              tonal.Chord.get(noteColors[chroma] || "").type || "none"
            ] || chordQualityColors.none;

          const isTonicNote =
            tonal.Note.chroma(note) === tonal.Note.chroma(modeTonic);
          const borderClass = isTonicNote ? "border-4 border-cyan-300" : "";

          return (
            <React.Fragment key={note}>
              <div
                onClick={() => {
                  setSelectedRoot(note);
                  setSelectedMode(0);
                }}
                className={`absolute cursor-pointer rounded-full w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center font-semibold text-sm sm:text-lg transition-colors duration-300 ${colorClass} ${borderClass}`}
                style={{ left: x - 20, top: y - 20 }}
                title={`Select root: ${t(note)}`}
              >
                {t(note)}
              </div>

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
                    className={`absolute rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-bold ${colorClass}`}
                    style={{ left: xInner - 12, top: yInner - 12 }}
                  >
                    {degreeIndex + 1}
                  </div>
                );
              })()}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto max-w-full px-2 sm:px-4 mt-2 sm:mt-4 pb-2">
        {modes
          .sort((a, b) => a.harmonicaOrder - b.harmonicaOrder)
          .map(({ name, harmonicaPosition }) => {
            const modeIndex = modeNames.indexOf(name);
            const isSelected = modeIndex === selectedMode;

            return (
              <div
                key={name}
                onClick={() => setSelectedMode(modeIndex)}
                className={`cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 rounded font-medium text-sm sm:text-base whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-400 text-black shadow-md"
                    : "bg-gray-800 text-white hover:bg-indigo-500 transition-colors"
                }`}
              >
                {name} ({harmonicaPosition})
              </div>
            );
          })}
      </div>

      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 mt-6 sm:mt-8 w-full px-2 sm:px-4 max-w-5xl">
        <div className="bg-gray-900 p-4 rounded-lg w-full text-sm space-y-2">
          <h2 className="text-lg font-bold mb-2">
            Triads in {t(modeTonic)} {modeName}
          </h2>
          <ul className="space-y-1">
            {triads.map(({ root, notes, quality }, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between px-2 py-1 bg-gray-800 rounded text-xs sm:text-sm"
              >
                <span className="font-medium">
                  {idx + 1}. {t(root)}
                </span>
                <span>{notes.map((note) => t(note)).join(" - ")}</span>{" "}
                <span
                  className={`text-xs px-2 py-1 rounded font-semibold capitalize ${
                    chordQualityColors[tonal.Chord.get(quality).type || "none"]
                  }`}
                >
                  {(() => {
                    const chordData = tonal.Chord.get(quality); // e.g., C#m → { tonic: "C#", type: "m", name: "C#m" }

                    if (!chordData.tonic) return quality; // fallback

                    const translatedRoot = t(chordData.tonic);
                    const suffix = chordData.type; // e.g., "m", "maj7", "dim"

                    return `${translatedRoot} ${suffix}`;
                  })()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg w-full text-sm space-y-2">
          <h2 className="text-lg font-bold mb-2">Legend</h2>
          <ul className="space-y-1">
            <li>
              <span className="inline-block w-4 h-4 bg-yellow-400 rounded-sm align-middle mr-2 border border-black"></span>
              Major triad
            </li>
            <li>
              <span className="inline-block w-4 h-4 bg-blue-600 rounded-sm align-middle mr-2"></span>
              Minor triad
            </li>
            <li>
              <span className="inline-block w-4 h-4 bg-red-500 rounded-sm align-middle mr-2"></span>
              Diminished triad
            </li>
            <li>
              <span className="inline-block w-4 h-4 bg-gray-800 rounded-sm align-middle mr-2 border border-white"></span>
              No triad / unclassified
            </li>
            <li>
              <span className="inline-block w-4 h-4 border-4 border-cyan-300 rounded-full align-middle mr-2"></span>
              Tonic of selected mode (starting note)
            </li>
            <li>
              <span className="inline-block w-4 h-4 bg-gray-600 rounded-sm align-middle mr-2"></span>
              Numbers inside circle = scale degrees
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Circle;
