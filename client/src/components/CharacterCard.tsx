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
      <div className="historical-panel isolate flex h-full flex-col overflow-hidden rounded-[1.6rem] text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_rgba(45,140,60,0.12)]">
        <div className="wash-paper relative z-10 p-3">
          <div className="frame-scroll mx-auto aspect-[13/16] w-full max-w-[190px] overflow-hidden rounded-[1.3rem] p-2">
            {imagePath && !imageFailed ? (
              <div className="h-full w-full rounded-[1rem] bg-white">
                <img
                  src={imagePath}
                  alt={`${name}の画像`}
                  className="block h-full w-full -translate-y-[2.5%] scale-x-[1.01] scale-y-[1.06] rounded-[1rem] object-contain md:-translate-y-0 md:scale-y-[1.04]"
                  loading="lazy"
                  onError={() => setImageFailed(true)}
                />
              </div>
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

        <div className="relative z-10 flex flex-1 flex-col px-4 pb-5 pt-3">
          <h4 className="ink-title text-base font-semibold text-foreground">{name}</h4>
          <p className="mt-1 min-h-[2.75rem] text-xs leading-5 text-muted-foreground md:min-h-[3rem]">
            {title}
          </p>
          {typeCode && (
            <p className="mt-auto pt-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--gold)]">
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
