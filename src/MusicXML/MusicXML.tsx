import React, { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { getHarmonicaHoleForNote, harmonicaKeys } from "../utils/utils";
import { Note, Interval } from "tonal";
import { useTranslation } from "react-i18next";

const TestFileLoader: React.FC = () => {
  const { t } = useTranslation();
  const [rawFileContent, setRawFileContent] = useState<string | null>(null);
  const [transpose, setTranspose] = useState<number>(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>("C4");
  const [noOverblowOrDraw, setNoOverblowOrDraw] = useState(true);
  const [noBend, setNoBend] = useState(false);

  const osmdRef = useRef<HTMLDivElement>(null);
  const osmdInstance = useRef<OpenSheetMusicDisplay | null>(null);
  useEffect(() => {
    fetch("/NoteBender/IntroSong.musicxml")
      .then((res) => {
        console.log("Fetch status:", res.status);
        if (!res.ok) throw new Error("Failed to load default musicxml");
        return res.text();
      })
      .then((text) => {
        console.log("Loaded default file content length:", text.length);
        setFileName("IntroSong.musicxml");
        setRawFileContent(text);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, []);

  const autoTransposeWithFilters = () => {
    if (!rawFileContent) return;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawFileContent, "application/xml");
    const noteElements = Array.from(xmlDoc.getElementsByTagName("note"));

    for (let interval = -36; interval <= 36; interval++) {
      let hasInvalidNotes = false;

      for (const note of noteElements) {
        const pitch = note.getElementsByTagName("pitch")[0];
        if (!pitch) continue;

        const step = pitch.getElementsByTagName("step")[0]?.textContent ?? "";
        const octave =
          pitch.getElementsByTagName("octave")[0]?.textContent ?? "";
        const originalNote = `${step}${octave}`;
        const transposed = Note.transpose(
          originalNote,
          Interval.fromSemitones(interval)
        );
        const tab = getHarmonicaHoleForNote(selectedKey, transposed);

        if (!tab) {
          hasInvalidNotes = true;
          break;
        }

        if (noOverblowOrDraw && tab.endsWith("o")) {
          hasInvalidNotes = true;
          break;
        }

        if (noBend && tab.endsWith("'")) {
          hasInvalidNotes = true;
          break;
        }
      }

      if (!hasInvalidNotes) {
        setTranspose(interval);
        return;
      }
    }

    alert("Couldn't find a transposition matching your selected filters.");
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const content = await file.text();
    setRawFileContent(content);
  };

  useEffect(() => {
    if (!rawFileContent) return;
    const injected = injectHarmonicaTabs(rawFileContent);
    setFileContent(injected);
  }, [rawFileContent, selectedKey, transpose]);

  const injectHarmonicaTabs = (xml: string): string => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");
    const noteElements = xmlDoc.getElementsByTagName("note");

    Array.from(noteElements).forEach((note) => {
      const pitch = note.getElementsByTagName("pitch")[0];
      if (!pitch) return;

      const step = pitch.getElementsByTagName("step")[0]?.textContent ?? "";
      const octave = pitch.getElementsByTagName("octave")[0]?.textContent ?? "";
      const originalNote = `${step}${octave}`;
      const interval = Interval.fromSemitones(transpose);
      const transposedNote = Note.transpose(originalNote, interval);
      const tab = getHarmonicaHoleForNote(selectedKey, transposedNote);
      if (!tab) return;

      // ➕ Now add your custom notations
      const notations = xmlDoc.createElement("notations");
      const technical = xmlDoc.createElement("technical");
      const fingering = xmlDoc.createElement("fingering");
      fingering.setAttribute("placement", "below");
      fingering.textContent = tab;

      technical.appendChild(fingering);
      notations.appendChild(technical);
      note.appendChild(notations);
    });

    return new XMLSerializer().serializeToString(xmlDoc);
  };

  useEffect(() => {
    if (!fileContent || !osmdRef.current) return;

    if (!osmdInstance.current) {
      osmdInstance.current = new OpenSheetMusicDisplay(osmdRef.current, {
        backend: "svg",
        drawTitle: true,
        drawComposer: true,
        drawFingerings: true,
        fingeringPosition: "below",
        autoResize: true,
      });
    }

    osmdInstance.current
      .load(fileContent)
      .then(() => osmdInstance.current?.render())
      .catch((err) => console.error("OSMD Load Error:", err));
  }, [fileContent]);
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        🎼 MusicXML Viewer with Harmonica Tabs
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Configuration Sidebar */}
        <div className="w-full lg:w-80 bg-gray-900 rounded-lg shadow p-6 space-y-5 border border-gray-700">
          {/* Key Selector */}
          <div>
            <label
              htmlFor="harmonicaKey"
              className="block mb-1 text-gray-300 font-medium"
            >
              Select Harmonica Key:
            </label>
            <select
              id="harmonicaKey"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 w-full text-white"
            >
              {harmonicaKeys.map((key) => (
                <option key={key.value} value={key.value}>
                  {t(key.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Transpose Input */}
          <div>
            <label className="block mb-1 text-gray-300 font-medium">
              Transpose (semitones):
            </label>
            <input
              type="number"
              value={transpose}
              onChange={(e) => setTranspose(parseInt(e.target.value, 10) || 0)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 w-full text-white"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block mb-1 text-gray-300 font-medium">
              Upload MusicXML File:
            </label>
            <label className="inline-block cursor-pointer text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              📂 Browse MusicXML File
              <input
                type="file"
                accept=".xml,.musicxml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {fileName && (
              <p className="mt-1 text-sm text-gray-500">Loaded: {fileName}</p>
            )}
          </div>

          <button
            onClick={autoTransposeWithFilters}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition w-full"
          >
            🎯 Auto Transpose (Apply Filters)
          </button>

          {/* Filter Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={noOverblowOrDraw}
                onChange={(e) => setNoOverblowOrDraw(e.target.checked)}
                className="accent-blue-600"
              />
              No Overblow or Overdraw Notes
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={noBend}
                onChange={(e) => setNoBend(e.target.checked)}
                className="accent-blue-600"
              />
              No Bends
            </label>
          </div>
        </div>

        {/* Sheet Music Viewer */}
        <div className="flex-1 w-full bg-white text-black rounded shadow overflow-x-auto p-4 min-h-[60vh]">
          <div ref={osmdRef} />
        </div>
      </div>
    </div>
  );
};

export default TestFileLoader;
