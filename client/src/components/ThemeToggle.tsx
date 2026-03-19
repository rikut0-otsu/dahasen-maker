import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { memo } from "react";

const ThemeToggleComponent = () => {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-20 items-center rounded-full border border-[rgba(184,155,87,0.24)] bg-[rgba(255,255,255,0.9)] px-1.5 shadow-[0_8px_20px_rgba(31,42,35,0.08)] transition-all duration-300 dark:border-[rgba(255,255,255,0.1)] dark:bg-[rgba(12,18,28,0.92)]"
      aria-label={isDark ? "ライトモードに切り替える" : "ダークモードに切り替える"}
    >
      <span
        className={`absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 ${
          isDark
            ? "left-[2.85rem] bg-[linear-gradient(180deg,#365cff_0%,#2148d7_100%)] text-white shadow-[0_10px_20px_rgba(33,72,215,0.34)]"
            : "left-1 bg-[linear-gradient(180deg,#fffdf8_0%,#f2ead8_100%)] text-[rgba(120,96,45,0.92)] shadow-[0_8px_16px_rgba(140,116,62,0.18)]"
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
      <span
        className={`relative z-10 flex w-1/2 items-center justify-center transition-colors duration-300 ${
          isDark ? "text-slate-500" : "text-[rgba(120,96,45,0.92)]"
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
      </span>
      <span
        className={`relative z-10 flex w-1/2 items-center justify-center transition-colors duration-300 ${
          isDark ? "text-white/90" : "text-slate-400"
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
      </span>
    </button>
  );
};

export const ThemeToggle = memo(ThemeToggleComponent);
