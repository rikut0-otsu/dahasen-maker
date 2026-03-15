import React from 'react';

interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentPage,
  totalPages,
}) => {
  const progress = (currentPage / totalPages) * 100;

  return (
    <div className="w-full space-y-3">
      {/* ページ表示 */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[#A0A9B8]">
          Page {currentPage} / {totalPages}
        </span>
        <span className="text-sm font-medium text-[#A0A9B8]">
          {Math.round(progress)}%
        </span>
      </div>

      {/* プログレスバー */}
      <div className="w-full h-2 bg-[#2D3748] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FF3B30] to-[#FF6B6B] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
