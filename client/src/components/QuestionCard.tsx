import React, { memo, useCallback } from 'react';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  questionId: number;
  text: string;
}

const QuestionCardComponent: React.FC<QuestionCardProps> = ({
  questionId,
  text,
}) => {
  const { answerQuestion, getAnswerForQuestion } = useDiagnosisContext();
  const currentAnswer = getAnswerForQuestion(questionId);

  const handleYesStrong = useCallback(() => {
    answerQuestion(questionId, 2, true); // YES ◎
  }, [questionId, answerQuestion]);

  const handleYesWeak = useCallback(() => {
    answerQuestion(questionId, 1, true); // YES ○
  }, [questionId, answerQuestion]);

  const handleNoWeak = useCallback(() => {
    answerQuestion(questionId, 1, false); // NO ○
  }, [questionId, answerQuestion]);

  const handleNoStrong = useCallback(() => {
    answerQuestion(questionId, 2, false); // NO ◎
  }, [questionId, answerQuestion]);

  const options = [
    {
      key: 'agree-strong',
      label: 'とてもそう思う',
      score: 2,
      isPositive: true,
      onClick: handleYesStrong,
      sizeClass: 'h-12 w-12 md:h-[4.4rem] md:w-[4.4rem]',
      activeClass:
        'border-primary bg-primary shadow-[0_0_0_7px_rgba(45,140,60,0.22)]',
      idleClass: 'border-primary/90 bg-white hover:border-primary hover:bg-primary/12',
    },
    {
      key: 'agree-weak',
      label: 'ややそう思う',
      score: 1,
      isPositive: true,
      onClick: handleYesWeak,
      sizeClass: 'h-9 w-9 md:h-[3.4rem] md:w-[3.4rem]',
      activeClass:
        'border-primary bg-primary/80 shadow-[0_0_0_6px_rgba(45,140,60,0.18)]',
      idleClass: 'border-primary/75 bg-white hover:border-primary hover:bg-primary/12',
    },
    {
      key: 'disagree-weak',
      label: 'ややそう思わない',
      score: 1,
      isPositive: false,
      onClick: handleNoWeak,
      sizeClass: 'h-9 w-9 md:h-[3.4rem] md:w-[3.4rem]',
      activeClass:
        'border-accent bg-accent/85 shadow-[0_0_0_6px_rgba(130,190,40,0.2)]',
      idleClass: 'border-accent/75 bg-white hover:border-accent hover:bg-accent/14',
    },
    {
      key: 'disagree-strong',
      label: 'まったくそう思わない',
      score: 2,
      isPositive: false,
      onClick: handleNoStrong,
      sizeClass: 'h-12 w-12 md:h-[4.4rem] md:w-[4.4rem]',
      activeClass:
        'border-accent bg-accent shadow-[0_0_0_7px_rgba(130,190,40,0.24)]',
      idleClass: 'border-accent/90 bg-white hover:border-accent hover:bg-accent/14',
    },
  ];

  return (
    <div className="historical-panel w-full rounded-[1.75rem] p-6 md:p-8">
      <h3 className="ink-title mb-8 text-lg font-semibold leading-relaxed text-foreground md:text-2xl">
        {text}
      </h3>

      <div className="wash-paper rounded-2xl px-4 py-5 md:px-6 md:py-6">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          <span className="ink-title text-sm font-medium tracking-[0.08em] text-primary md:w-24 md:text-base">
            そう思う
          </span>

          <div className="flex flex-1 items-center justify-center gap-4 md:gap-7">
            {options.map((option) => {
              const isSelected =
                currentAnswer?.score === option.score &&
                currentAnswer?.isPositive === option.isPositive;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={option.onClick}
                  aria-pressed={isSelected}
                  aria-label={option.label}
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-full border-[3px] transition-[box-shadow,border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40',
                    option.sizeClass,
                    isSelected ? option.activeClass : option.idleClass,
                    isSelected && 'scale-105'
                  )}
                />
              );
            })}
          </div>

          <span className="ink-title text-right text-sm font-medium tracking-[0.08em] text-accent md:w-24 md:text-base">
            そう思わない
          </span>
        </div>
      </div>
    </div>
  );
};

export const QuestionCard = memo(QuestionCardComponent);
