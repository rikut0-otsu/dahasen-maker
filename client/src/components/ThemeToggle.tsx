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
      className="relative inline-flex h-10 w-28 items-center rounded-full border border-[rgba(184,155,87,0.28)] bg-[rgba(255,255,255,0.86)] p-1 shadow-[0_10px_24px_rgba(31,42,35,0.08)] transition-colors dark:border-[rgba(255,255,255,0.12)] dark:bg-[rgba(18,22,31,0.92)]"
      aria-label={isDark ? "ライトモードに切り替える" : "ダークモードに切り替える"}
    >
      <span
        className={`absolute top-1 h-8 w-[3.4rem] rounded-full transition-all duration-300 ${
          isDark
            ? "left-[4.1rem] bg-[linear-gradient(180deg,#2b5cff_0%,#2148d7_100%)] shadow-[0_10px_20px_rgba(33,72,215,0.32)]"
            : "left-1 bg-[linear-gradient(180deg,#2b5cff_0%,#2148d7_100%)] shadow-[0_10px_20px_rgba(33,72,215,0.28)]"
        }`}
      />
      <span className={`relative z-20 flex w-1/2 items-center justify-center ${!isDark ? "text-foreground" : "text-muted-foreground"}`}>
        <Sun className="h-4 w-4" />
      </span>
      <span className={`relative z-20 flex w-1/2 items-center justify-center ${isDark ? "text-white" : "text-muted-foreground"}`}>
        <Moon className="h-4 w-4" />
      </span>
      <span
        className={`pointer-events-none absolute top-1.5 h-8 w-8 rounded-full transition-all duration-300 ${
          isDark
            ? "left-[4.25rem] bg-slate-900/70"
            : "left-[2.25rem] bg-white/80"
        }`}
        style={{ boxShadow: "0 6px 14px rgba(0,0,0,0.18)" }}
      />
    </button>
  );
};

export const ThemeToggle = memo(ThemeToggleComponent);
