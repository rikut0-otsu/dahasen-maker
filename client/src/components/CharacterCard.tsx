import React, { useState, memo } from 'react';
import { Link } from 'wouter';

interface CharacterCardProps {
  id?: string;
  name: string;
  title: string;
  color: string;
  imagePath?: string;
  typeCode?: string;
  description?: string;
  compact?: boolean;
}

const CharacterCardComponent: React.FC<CharacterCardProps> = ({
  id,
  name,
  title,
  color,
  imagePath,
  typeCode,
  description,
  compact = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (compact) {
    const content = (
      <div className="historical-panel overflow-hidden rounded-[1.6rem] text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_rgba(45,140,60,0.12)]">
        <div className="wash-paper p-3">
          <div className="frame-scroll mx-auto aspect-[3/4] w-full max-w-[190px] overflow-hidden rounded-[1.3rem] p-2">
            {imagePath && !imageFailed ? (
              <img
                src={imagePath}
                alt={`${name}の画像`}
                className="h-full w-full rounded-[1rem] object-contain bg-white"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-[1rem] text-4xl font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1 px-4 pb-5 pt-3">
          <h4 className="ink-title text-base font-semibold text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground">{title}</p>
          {typeCode && (
            <p className="pt-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--gold)]">
              【{typeCode}】
            </p>
          )}
        </div>
      </div>
    );

    if (id) {
      return (
        <Link href={`/types/${id}`} className="block">
          {content}
        </Link>
      );
    }

    return (
      content
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border bg-card">
      <div
        className="flex h-24 items-center justify-center text-4xl font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {name.charAt(0)}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
          <p className="mt-1 text-sm font-semibold text-primary">{title}</p>
        </div>

        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export const CharacterCard = memo(CharacterCardComponent);
