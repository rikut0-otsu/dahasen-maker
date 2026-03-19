import { useMemo } from "react";

export function Sparkles() {
  const sparks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${10 + i * 10}%`,
        delay: `${(i * 0.16).toFixed(2)}s`,
        size: `${4 + (i % 3) * 2}px`,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="sparkle"
          style={{
            left: spark.left,
            bottom: "-10px",
            width: spark.size,
            height: spark.size,
            animationDelay: spark.delay,
          }}
        />
      ))}
    </div>
  );
}
