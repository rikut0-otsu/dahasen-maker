import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { QuestionCard } from '@/components/QuestionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import { persistDiagnosisResult } from '@/lib/diagnosisPersistence';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Diagnosis() {
  const [, setLocation] = useLocation();
  const { user, isLoading, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    state,
    getQuestionsForPage,
    nextPage,
    prevPage,
    submitDiagnosis,
    calculateIndicatorScores,
    calculateResult,
  } = useDiagnosisContext();

  // ページ遷移時にスクロール位置をリセット
  useLayoutEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const rafId = window.requestAnimationFrame(scrollToTop);
    const timeoutId = window.setTimeout(scrollToTop, 0);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [state.currentPage]);

  const currentQuestions = getQuestionsForPage(state.currentPage);
  const isLastPage = state.currentPage === 4;
  const canProceed = currentQuestions.every((q) =>
    state.answers.some((a) => a.questionId === q.id)
  );

  const handleNext = async () => {
    if (isSubmitting) {
      return;
    }

    if (isLastPage && canProceed) {
      const resultType = submitDiagnosis();
      if (resultType) {
        setIsSubmitting(true);

        try {
          const resolvedUser = user ?? (isLoading ? await refreshUser() : null);
          if (!resolvedUser) {
            throw new Error('AUTH_USER_MISSING');
          }

          await persistDiagnosisResult({
            typeId: resultType.id,
            answers: state.answers,
            indicatorScores: calculateIndicatorScores(),
            axisResult: calculateResult(),
          });
          await refreshUser();
        } catch (error: unknown) {
          console.error('Failed to save diagnosis result', error);
          toast.error('診断結果を端末に退避しました。再ログイン後または通信回復後に自動で保存します。');
        } finally {
          setIsSubmitting(false);
        }

        setLocation(`/types/${resultType.id}`);
      }
    } else if (canProceed) {
      nextPage();
    }
  };

  return (
    <div className="min-h-screen bg-background paper-texture">
      <nav className="sticky top-0 z-50 border-b border-border/80 bg-[rgba(251,248,241,0.88)] backdrop-blur-none md:backdrop-blur-sm dark:bg-[rgba(8,14,24,0.78)]">
        <div className="container py-4 flex items-center justify-between">
          <Button
            onClick={() => setLocation('/')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            ← 戻る
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="historical-panel mb-12 rounded-3xl p-6">
            <ProgressBar currentPage={state.currentPage} totalPages={4} />
          </div>

          <div className="space-y-8">
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="seal-tag flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
                    <span className="text-sm font-bold text-primary">
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
              className="h-12 flex-1 border-[rgba(184,155,87,0.65)] bg-white text-foreground hover:bg-[rgba(242,238,226,0.95)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              前へ
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="h-12 flex-1 bg-primary text-white font-semibold shadow-[0_12px_24px_rgba(45,140,60,0.22)] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : isLastPage ? '結果を見る' : '次へ'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {!canProceed && (
            <div className="historical-panel mt-6 rounded-2xl p-4 text-sm text-foreground">
              このページの全ての質問に答えてください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
