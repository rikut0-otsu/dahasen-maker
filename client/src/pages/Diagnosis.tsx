import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/QuestionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Diagnosis() {
  const [, setLocation] = useLocation();
  const {
    state,
    getQuestionsForPage,
    nextPage,
    prevPage,
    submitDiagnosis,
  } = useDiagnosisContext();

  const currentQuestions = getQuestionsForPage(state.currentPage);
  const isLastPage = state.currentPage === 4;
  const canProceed = currentQuestions.every((q) =>
    state.answers.some((a) => a.questionId === q.id)
  );

  const handleNext = () => {
    if (isLastPage && canProceed) {
      submitDiagnosis();
      setLocation('/result');
    } else if (canProceed) {
      nextPage();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#0F1333] to-[#0A0E27]">
      {/* ナビゲーション */}
      <nav className="border-b border-[#2D3748] bg-[#0A0E27]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Button
            onClick={() => setLocation('/')}
            variant="ghost"
            className="text-[#A0A9B8] hover:text-[#F5F5F5]"
          >
            ← 戻る
          </Button>
          <h1 className="text-lg font-bold text-[#F5F5F5]">打破宣言メーカー</h1>
          <div className="w-16"></div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* 進捗バー */}
          <div className="mb-12">
            <ProgressBar currentPage={state.currentPage} totalPages={4} />
          </div>

          {/* 質問セクション */}
          <div className="space-y-8">
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF3B30] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {(state.currentPage - 1) * 4 + index + 1}
                    </span>
                  </div>
                </div>
                <QuestionCard
                  questionId={question.id}
                  text={question.text}
                />
              </div>
            ))}
          </div>

          {/* ボタン */}
          <div className="mt-12 flex gap-4">
            <Button
              onClick={prevPage}
              disabled={state.currentPage === 1}
              variant="outline"
              className="flex-1 h-12 border-[#2D3748] text-[#A0A9B8] hover:bg-[#1A1F3A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              前へ
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1 h-12 bg-[#FF3B30] hover:bg-[#FF2D1F] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastPage ? '結果を見る' : '次へ'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* 未回答警告 */}
          {!canProceed && (
            <div className="mt-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-lg text-sm text-[#FF6B6B]">
              このページの全ての質問に答えてください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
