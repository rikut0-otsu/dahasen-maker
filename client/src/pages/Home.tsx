import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CharacterCard } from '@/components/CharacterCard';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import typesData from '@/data/types.json';

export default function Home() {
  const [, setLocation] = useLocation();
  const { reset } = useDiagnosisContext();
  const [showCharacters, setShowCharacters] = useState(false);

  const handleStartDiagnosis = () => {
    reset();
    setLocation('/diagnosis');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#0F1333] to-[#0A0E27]">
      {/* ナビゲーション */}
      <nav className="border-b border-[#2D3748] bg-[#0A0E27]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF3B30] flex items-center justify-center">
              <span className="text-white font-bold text-sm">打</span>
            </div>
            <h1 className="text-lg font-bold text-[#F5F5F5]">打破宣言メーカー</h1>
          </div>
        </div>
      </nav>

      {/* ヒーロー セクション */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF3B30]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#F5F5F5] leading-tight">
              あなたの<span className="text-[#FF3B30]">打破タイプ</span>を診断せよ
            </h2>
            <p className="text-lg md:text-xl text-[#A0A9B8] leading-relaxed">
              戦国武将をモチーフにした16タイプの診断。
              <br />
              あなたの仕事スタイルと人間関係の傾向を明らかにします。
            </p>

            {/* 注意事項 */}
            <div className="bg-[#1A1F3A] border border-[#2D3748] rounded-lg p-6 space-y-3 text-left">
              <h3 className="font-semibold text-[#F5F5F5]">診断について</h3>
              <ul className="space-y-2 text-sm text-[#A0A9B8]">
                <li className="flex items-start gap-3">
                  <span className="text-[#FF3B30] font-bold">•</span>
                  <span>計16問の質問に答えていただきます</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF3B30] font-bold">•</span>
                  <span>所要時間は約1分です</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF3B30] font-bold">•</span>
                  <span>結果は16種類の戦国武将タイプで表示されます</span>
                </li>
              </ul>
            </div>

            {/* CTA ボタン */}
            <Button
              onClick={handleStartDiagnosis}
              className="w-full md:w-auto h-14 px-8 bg-[#FF3B30] hover:bg-[#FF2D1F] text-white font-semibold text-lg rounded-lg transition-all duration-300 shadow-lg shadow-[#FF3B30]/50 hover:shadow-[#FF3B30]/70"
            >
              診断を開始する
            </Button>

            {/* キャラクター一覧表示トグル */}
            <button
              onClick={() => setShowCharacters(!showCharacters)}
              className="text-sm text-[#6366F1] hover:text-[#FF3B30] transition-colors duration-300 underline"
            >
              {showCharacters ? '16タイプを隠す' : '16タイプを見る'}
            </button>
          </div>
        </div>
      </section>

      {/* キャラクター一覧セクション */}
      {showCharacters && (
        <section className="py-16 md:py-24 border-t border-[#2D3748]">
          <div className="container">
            <h3 className="text-3xl font-bold text-[#F5F5F5] mb-12 text-center">
              16タイプの戦国武将
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {typesData.map((type) => (
                <CharacterCard
                  key={type.id}
                  name={type.name}
                  title={type.title}
                  color={type.color}
                  compact
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* フッター */}
      <footer className="border-t border-[#2D3748] bg-[#0A0E27]/50 py-8">
        <div className="container text-center text-sm text-[#4B5563]">
          <p>打破宣言メーカー © 2026 | 戦国武将モチーフの診断サイト</p>
        </div>
      </footer>
    </div>
  );
}
