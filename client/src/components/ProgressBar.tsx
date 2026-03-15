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
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          Page {currentPage} / {totalPages}
        </span>
        <span className="text-sm font-medium text-[var(--gold)]">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="w-full h-3 rounded-full overflow-hidden bg-[var(--meter-bg)]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: 'var(--meter-fill)' }}
        />
      </div>
    </div>
  );
};
