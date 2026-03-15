import React from 'react';
import { Button } from '@/components/ui/button';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import questionsData from '@/data/questions.json';

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

  const question = questionsData.find((q) => q.id === questionId);

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

  return (
    <div className="w-full bg-gradient-to-b from-[#1A1F3A] to-[#0A0E27] rounded-lg p-8 border border-[#2D3748]">
      <h3 className="text-lg md:text-xl font-semibold text-[#F5F5F5] mb-8 leading-relaxed">
        {text}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* YES ◎ (強い同意) */}
        <Button
          onClick={handleYesStrong}
          variant={currentAnswer?.score === 2 && currentAnswer?.isPositive ? 'default' : 'outline'}
          className={`h-20 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
            currentAnswer?.score === 2 && currentAnswer?.isPositive
              ? 'bg-[#FF3B30] border-[#FF3B30] text-white shadow-lg shadow-[#FF3B30]/50'
              : 'bg-[#1A1F3A] border-[#2D3748] text-[#F5F5F5] hover:border-[#FF3B30] hover:bg-[#2D3748]'
          }`}
        >
          <span className="text-sm font-medium">YES</span>
          <span className="text-2xl">◎</span>
        </Button>

        {/* YES ○ (弱い同意) */}
        <Button
          onClick={handleYesWeak}
          variant={currentAnswer?.score === 1 && currentAnswer?.isPositive ? 'default' : 'outline'}
          className={`h-20 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
            currentAnswer?.score === 1 && currentAnswer?.isPositive
              ? 'bg-[#FF3B30] border-[#FF3B30] text-white shadow-lg shadow-[#FF3B30]/50'
              : 'bg-[#1A1F3A] border-[#2D3748] text-[#F5F5F5] hover:border-[#FF3B30] hover:bg-[#2D3748]'
          }`}
        >
          <span className="text-sm font-medium">YES</span>
          <span className="text-2xl">○</span>
        </Button>

        {/* NO ○ (弱い否定) */}
        <Button
          onClick={handleNoWeak}
          variant={currentAnswer?.score === 1 && !currentAnswer?.isPositive ? 'default' : 'outline'}
          className={`h-20 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
            currentAnswer?.score === 1 && !currentAnswer?.isPositive
              ? 'bg-[#6366F1] border-[#6366F1] text-white shadow-lg shadow-[#6366F1]/50'
              : 'bg-[#1A1F3A] border-[#2D3748] text-[#F5F5F5] hover:border-[#6366F1] hover:bg-[#2D3748]'
          }`}
        >
          <span className="text-sm font-medium">NO</span>
          <span className="text-2xl">○</span>
        </Button>

        {/* NO ◎ (強い否定) */}
        <Button
          onClick={handleNoStrong}
          variant={currentAnswer?.score === 2 && !currentAnswer?.isPositive ? 'default' : 'outline'}
          className={`h-20 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
            currentAnswer?.score === 2 && !currentAnswer?.isPositive
              ? 'bg-[#6366F1] border-[#6366F1] text-white shadow-lg shadow-[#6366F1]/50'
              : 'bg-[#1A1F3A] border-[#2D3748] text-[#F5F5F5] hover:border-[#6366F1] hover:bg-[#2D3748]'
          }`}
        >
          <span className="text-sm font-medium">NO</span>
          <span className="text-2xl">◎</span>
        </Button>
      </div>
    </div>
  );
};
