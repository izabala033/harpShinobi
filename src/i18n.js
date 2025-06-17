import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  solfege: {
    translation: {
      C: "Do",
      "C#": "Do#",
      Db: "Reb",
      D: "Re",
      "D#": "Re#",
      Eb: "Mib",
      E: "Mi",
      F: "Fa",
      "F#": "Fa#",
      Gb: "Solb",
      G: "Sol",
      "G#": "Sol#",
      Ab: "Lab",
      A: "La",
      "A#": "La#",
      Bb: "Sib",
      B: "Si",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en", // English is default
    interpolation: {
      escapeValue: false,
    },
    // If no translation found, return the key (so English keys show by default)
    parseMissingKeyHandler: (key) => key,
  });

export default i18n;
