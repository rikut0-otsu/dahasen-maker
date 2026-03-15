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
      const resultType = submitDiagnosis();
      if (resultType) {
        setLocation(`/types/${resultType.id}`);
      }
    } else if (canProceed) {
      nextPage();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.currentPage]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <Button
            onClick={() => setLocation('/')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            ← 戻る
          </Button>
          <h1 className="text-lg font-bold text-foreground">打破宣言メーカー</h1>
          <div className="w-16"></div>
        </div>
      </nav>

      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 rounded-3xl border border-border bg-card p-6 shadow-[0_18px_50px_rgba(28,43,31,0.06)]">
            <ProgressBar currentPage={state.currentPage} totalPages={4} />
          </div>

          <div className="space-y-8">
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <span className="text-sm font-bold text-white">
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

          <div className="mt-12 flex gap-4">
            <Button
              onClick={prevPage}
              disabled={state.currentPage === 1}
              variant="outline"
              className="h-12 flex-1 border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              前へ
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="h-12 flex-1 bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastPage ? '結果を見る' : '次へ'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {!canProceed && (
            <div className="mt-6 rounded-lg border border-accent/50 bg-accent/10 p-4 text-sm text-foreground">
              このページの全ての質問に答えてください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
