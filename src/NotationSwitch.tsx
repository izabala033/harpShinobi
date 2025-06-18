import { useTranslation } from "react-i18next";

export default function NotationSwitch() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "solfege" : "en";
    i18n.changeLanguage(nextLang);
  };

  // Button label shows the language *you will switch to*
  const buttonLabel = i18n.language === "en" ? "Do–Re–Mi" : "A–B–C";

  return (
    <button
      onClick={toggleLanguage}
      aria-label={`Switch notation to ${buttonLabel}`}
      type="button"
    >
      {buttonLabel}
    </button>
  );
}
