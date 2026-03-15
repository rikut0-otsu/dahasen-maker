import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';

export default function Result() {
  const [, setLocation] = useLocation();
  const { state } = useDiagnosisContext();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (state.result) {
      setLocation(`/types/${state.result.id}`);
    }
  }, []);

  if (!state.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">診断結果を読み込み中...</p>
          <Button onClick={() => setLocation('/')}>トップに戻る</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-[0_18px_50px_rgba(28,43,31,0.08)]">
        <h1 className="text-2xl font-bold text-foreground">結果ページを統合しました</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          診断結果は、人物一覧から開く詳細ページと同じページへ遷移します。
        </p>
        <Button className="mt-6" onClick={() => setLocation(`/types/${state.result?.id ?? ''}`)}>
          詳細ページへ移動
        </Button>
      </div>
    </div>
  );
}
