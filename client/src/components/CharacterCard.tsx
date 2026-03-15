import React from 'react';

interface CharacterCardProps {
  name: string;
  title: string;
  color: string;
  description?: string;
  compact?: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  title,
  color,
  description,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-[#1A1F3A] rounded-lg border border-[#2D3748] hover:border-[#4B5563] transition-all duration-300 hover:shadow-lg hover:shadow-[#FF3B30]/20">
        {/* キャラクターアイコン */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0)}
        </div>

        {/* 名前とタイトル */}
        <div className="text-center">
          <h4 className="text-sm font-semibold text-[#F5F5F5]">{name}</h4>
          <p className="text-xs text-[#A0A9B8] mt-1">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#1A1F3A] to-[#0A0E27] rounded-lg border border-[#2D3748] overflow-hidden">
      {/* ヘッダー */}
      <div
        className="h-24 flex items-center justify-center text-4xl font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {name.charAt(0)}
      </div>

      {/* コンテンツ */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[#F5F5F5]">{name}</h3>
          <p className="text-sm text-[#FF3B30] font-semibold mt-1">{title}</p>
        </div>

        {description && (
          <p className="text-sm text-[#A0A9B8] leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
