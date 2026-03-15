import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-12 w-[10rem] items-center rounded-full border border-[rgba(184,155,87,0.28)] bg-[rgba(255,255,255,0.86)] p-1 shadow-[0_10px_24px_rgba(31,42,35,0.08)] transition-colors dark:border-[rgba(255,255,255,0.12)] dark:bg-[rgba(18,22,31,0.92)]"
      aria-label={isDark ? "ライトモードに切り替える" : "ダークモードに切り替える"}
    >
      <span
        className={`absolute top-1 h-10 w-[4.5rem] rounded-full transition-all duration-300 ${
          isDark
            ? "left-[5.1rem] bg-[linear-gradient(180deg,#2b5cff_0%,#2148d7_100%)] shadow-[0_10px_20px_rgba(33,72,215,0.32)]"
            : "left-1 bg-[linear-gradient(180deg,#2b5cff_0%,#2148d7_100%)] shadow-[0_10px_20px_rgba(33,72,215,0.28)]"
        }`}
      />
      <span className={`relative z-10 flex w-1/2 items-center justify-center ${!isDark ? "text-white" : "text-muted-foreground"}`}>
        <Sun className="h-5 w-5" />
      </span>
      <span className={`relative z-10 flex w-1/2 items-center justify-center ${isDark ? "text-white" : "text-muted-foreground"}`}>
        <Moon className="h-5 w-5" />
      </span>
      <span
        className={`pointer-events-none absolute top-1.5 h-9 w-9 rounded-full bg-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-all duration-300 ${
          isDark ? "left-[5.55rem]" : "left-[2.85rem]"
        }`}
      />
    </button>
  );
}
