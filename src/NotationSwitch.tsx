import { useTranslation } from "react-i18next";

export default function NotationSwitch() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "solfege" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="absolute top-4 right-4 z-50 bg-cyan-700 hover:bg-cyan-600 text-white text-xs px-3 py-1 rounded shadow"
    >
      {i18n.language === "en" ? "Do–Re–Mi" : "A–B–C"}
    </button>
  );
}
