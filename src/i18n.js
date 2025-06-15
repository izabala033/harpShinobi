import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      notes: {
        C: "C",
        D: "D",
        E: "E",
        F: "F",
        G: "G",
        A: "A",
        B: "B",
      },
    },
  },
  solfege: {
    translation: {
      notes: {
        C: "Do",
        D: "Re",
        E: "Mi",
        F: "Fa",
        G: "Sol",
        A: "La",
        B: "Si",
      },
    },
  },
};

i18n
  .use(LanguageDetector) // Detect language from browser
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: "en", // Default if detection fails
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
