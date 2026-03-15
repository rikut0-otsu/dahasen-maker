import React from 'react';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  questionId: number;
  text: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionId,
  text,
}) => {
  const { answerQuestion, getAnswerForQuestion } = useDiagnosisContext();
  const currentAnswer = getAnswerForQuestion(questionId);

  const handleYesStrong = () => {
    answerQuestion(questionId, 2, true); // YES ◎
  };

  const handleYesWeak = () => {
    answerQuestion(questionId, 1, true); // YES ○
  };

  const handleNoWeak = () => {
    answerQuestion(questionId, 1, false); // NO ○
  };

  const handleNoStrong = () => {
    answerQuestion(questionId, 2, false); // NO ◎
  };

  const options = [
    {
      key: 'agree-strong',
      label: 'とてもそう思う',
      score: 2,
      isPositive: true,
      onClick: handleYesStrong,
      sizeClass: 'h-12 w-12 md:h-[4.4rem] md:w-[4.4rem]',
      activeClass:
        'border-primary bg-primary/18 shadow-[0_0_0_6px_rgba(45,140,60,0.18)]',
      idleClass: 'border-primary/85 hover:border-primary hover:bg-primary/8',
    },
    {
      key: 'agree-weak',
      label: 'ややそう思う',
      score: 1,
      isPositive: true,
      onClick: handleYesWeak,
      sizeClass: 'h-9 w-9 md:h-[3.4rem] md:w-[3.4rem]',
      activeClass:
        'border-primary bg-primary/14 shadow-[0_0_0_5px_rgba(45,140,60,0.14)]',
      idleClass: 'border-primary/70 hover:border-primary hover:bg-primary/8',
    },
    {
      key: 'disagree-weak',
      label: 'ややそう思わない',
      score: 1,
      isPositive: false,
      onClick: handleNoWeak,
      sizeClass: 'h-9 w-9 md:h-[3.4rem] md:w-[3.4rem]',
      activeClass:
        'border-accent bg-accent/18 shadow-[0_0_0_5px_rgba(130,190,40,0.18)]',
      idleClass: 'border-accent/70 hover:border-accent hover:bg-accent/10',
    },
    {
      key: 'disagree-strong',
      label: 'まったくそう思わない',
      score: 2,
      isPositive: false,
      onClick: handleNoStrong,
      sizeClass: 'h-12 w-12 md:h-[4.4rem] md:w-[4.4rem]',
      activeClass:
        'border-accent bg-accent/22 shadow-[0_0_0_6px_rgba(130,190,40,0.22)]',
      idleClass: 'border-accent/85 hover:border-accent hover:bg-accent/10',
    },
  ];

  return (
    <div className="w-full rounded-[1.75rem] border border-border bg-card p-6 md:p-8 shadow-[0_18px_50px_rgba(28,43,31,0.08)]">
      <h3 className="mb-8 text-lg font-semibold leading-relaxed text-foreground md:text-xl">
        {text}
      </h3>

      <div className="rounded-2xl border border-border bg-white px-4 py-5 md:px-6 md:py-6">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          <span className="text-sm font-medium tracking-[0.04em] text-primary md:w-24 md:text-base">
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
                    'flex shrink-0 items-center justify-center rounded-full border-[3px] bg-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30',
                    option.sizeClass,
                    isSelected ? option.activeClass : option.idleClass,
                    isSelected && 'scale-105'
                  )}
                />
              );
            })}
          </div>

          <span className="text-right text-sm font-medium tracking-[0.04em] text-accent md:w-24 md:text-base">
            そう思わない
          </span>
        </div>
      </div>
    </div>
  );
};
