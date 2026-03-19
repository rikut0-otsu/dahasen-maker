import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

const ThemeToggleComponent = () => {
  const { theme, setTheme, switchable } = useTheme();

  if (!switchable || !setTheme) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <div
      className="inline-grid h-9 grid-cols-2 gap-1 rounded-full border border-[rgba(184,155,87,0.24)] bg-[rgba(255,255,255,0.9)] p-1 shadow-[0_8px_20px_rgba(31,42,35,0.08)] dark:border-[rgba(255,255,255,0.1)] dark:bg-[rgba(12,18,28,0.92)]"
      role="group"
      aria-label="テーマ切り替え"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        aria-label="ライトモードに切り替える"
        className={cn(
          "flex h-7 w-8 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
          !isDark
            ? "bg-[linear-gradient(180deg,#fffdf8_0%,#f2ead8_100%)] text-[rgba(120,96,45,0.96)] shadow-[0_8px_16px_rgba(140,116,62,0.18)]"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        )}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        aria-label="ダークモードに切り替える"
        className={cn(
          "flex h-7 w-8 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
          isDark
            ? "bg-[linear-gradient(180deg,#365cff_0%,#2148d7_100%)] text-white shadow-[0_10px_20px_rgba(33,72,215,0.34)]"
            : "text-slate-400 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200"
        )}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const ThemeToggle = memo(ThemeToggleComponent);
