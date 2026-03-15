import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import { Share2, RotateCcw } from 'lucide-react';

export default function Result() {
  const [, setLocation] = useLocation();
  const { state, reset } = useDiagnosisContext();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!state.result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#0F1333] to-[#0A0E27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A0A9B8] mb-4">診断結果を読み込み中...</p>
          <Button onClick={() => setLocation('/')}>トップに戻る</Button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (!state.result) return;
    const text = `私の打破タイプは「${state.result.name}」です！\n\n${state.result.title}\n\n打破宣言メーカーで診断してみてください！`;
    if (navigator.share) {
      navigator.share({
        title: '打破宣言メーカー',
        text: text,
      });
    } else {
      // フォールバック: クリップボードにコピー
      navigator.clipboard.writeText(text);
      alert('結果をコピーしました');
    }
  };

  const handleRetry = () => {
    reset();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#0F1333] to-[#0A0E27]">
      {/* ナビゲーション */}
      <nav className="border-b border-[#2D3748] bg-[#0A0E27]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#F5F5F5]">打破宣言メーカー</h1>
          <div className="w-16"></div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* キャラクター表示 */}
          <div className="mb-12">
            <div
              className="w-full h-64 md:h-80 rounded-lg flex items-center justify-center text-6xl md:text-8xl font-bold text-white shadow-2xl"
              style={{ backgroundColor: state.result.color }}
            >
              {state.result.name.charAt(0)}
            </div>
          </div>

          {/* 結果情報 */}
          <div className="space-y-6 mb-12">
            {/* 名前とタイトル */}
            <div className="text-center space-y-2">
              <h2 className="text-4xl md:text-5xl font-bold text-[#F5F5F5]">
                {state.result.name}
              </h2>
              <p className="text-2xl font-semibold text-[#FF3B30]">
                {state.result.title}
              </p>
            </div>

            {/* 説明 */}
            <div className="bg-[#1A1F3A] border border-[#2D3748] rounded-lg p-6">
              <p className="text-lg text-[#A0A9B8] leading-relaxed">
                {state.result.description}
              </p>
            </div>

            {/* 強み */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-[#F5F5F5]">強み</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {state.result.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="bg-[#1A1F3A] border border-[#2D3748] rounded-lg p-4 flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#FF3B30] mt-2 flex-shrink-0"></div>
                    <span className="text-[#A0A9B8]">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 弱み */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-[#F5F5F5]">弱み</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {state.result.weaknesses.map((weakness, index) => (
                  <div
                    key={index}
                    className="bg-[#1A1F3A] border border-[#2D3748] rounded-lg p-4 flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#6366F1] mt-2 flex-shrink-0"></div>
                    <span className="text-[#A0A9B8]">{weakness}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 向いている役割 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-[#F5F5F5]">向いている役割</h3>
              <div className="flex flex-wrap gap-2">
                {state.result.roles.map((role, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[#FF3B30]/20 border border-[#FF3B30]/50 rounded-full text-sm text-[#FF6B6B]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={handleShare}
              className="flex-1 h-12 bg-[#6366F1] hover:bg-[#5558D0] text-white font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              結果をシェア
            </Button>
            <Button
              onClick={handleRetry}
              className="flex-1 h-12 bg-[#FF3B30] hover:bg-[#FF2D1F] text-white font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              もう一度診断
            </Button>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="border-t border-[#2D3748] bg-[#0A0E27]/50 py-8 mt-16">
        <div className="container text-center text-sm text-[#4B5563]">
          <p>打破宣言メーカー © 2026 | 戦国武将モチーフの診断サイト</p>
        </div>
      </footer>
    </div>
  );
}
