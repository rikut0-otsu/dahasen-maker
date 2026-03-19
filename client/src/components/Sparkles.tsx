import { useMemo } from "react";

type SparklesProps = {
  count?: number;
  minSize?: number;
  maxSize?: number;
  bottomOffset?: number;
  topOffset?: number;
  direction?: "up" | "down";
};

export function Sparkles({
  count = 10,
  minSize = 4,
  maxSize = 9,
  bottomOffset = -10,
  topOffset,
  direction = "up",
}: SparklesProps) {
  const sparks = useMemo(() => {
    const span = Math.max(maxSize - minSize, 0);

    return Array.from({ length: count }, (_, i) => {
      const progress = count === 1 ? 0.5 : i / (count - 1);
      const sizeBias = (i * 7) % 11;
      const size = minSize + Math.round((span * sizeBias) / 10);
      const drift = `${-18 + ((i * 13) % 37)}px`;
      const rise = `${132 + ((i * 19) % 92)}px`;
      const scale = (1.1 + ((i * 5) % 6) * 0.1).toFixed(2);
      const duration = `${1.5 + ((i * 3) % 5) * 0.22}s`;

      return {
        id: i,
        left: `${8 + progress * 84}%`,
        delay: `${(i * 0.14).toFixed(2)}s`,
        duration,
        size: `${size}px`,
        drift,
        translateY: `${direction === "down" ? 1 : -1}${rise}`,
        scale,
      };
    });
  }, [count, direction, maxSize, minSize]);

  const anchorStyle =
    topOffset !== undefined
      ? { top: `${topOffset}px` }
      : { bottom: `${bottomOffset}px` };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="sparkle"
          style={{
            left: spark.left,
            ...anchorStyle,
            width: spark.size,
            height: spark.size,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
            ["--sparkle-drift" as string]: spark.drift,
            ["--sparkle-translate-y" as string]: spark.translateY,
            ["--sparkle-scale" as string]: spark.scale,
          }}
        />
      ))}
    </div>
  );
}
