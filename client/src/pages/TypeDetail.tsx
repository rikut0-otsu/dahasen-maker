import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import typesData from '@/data/types.json';
import { Copy, Download, RotateCcw, Share2 } from 'lucide-react';
import { useLayoutEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';

const axisMeta = {
  decision: {
    title: '意思決定',
    leftLabel: '論理',
    rightLabel: '感性',
    leftKey: 'logic',
    rightKey: 'emotion',
    barClassName: 'bg-[linear-gradient(90deg,#2d8c3c_0%,#82be28_100%)]',
  },
  role: {
    title: '役割',
    leftLabel: '自走',
    rightLabel: '伴走',
    leftKey: 'drive',
    rightKey: 'support',
    barClassName: 'bg-[linear-gradient(90deg,#1f6f31_0%,#88c425_100%)]',
  },
  domain: {
    title: '領域',
    leftLabel: '越境',
    rightLabel: '専門',
    leftKey: 'expansion',
    rightKey: 'mastery',
    barClassName: 'bg-[linear-gradient(90deg,#82be28_0%,#2d8c3c_100%)]',
  },
  execution: {
    title: '実行',
    leftLabel: '爆速',
    rightLabel: '緻密',
    leftKey: 'agile',
    rightKey: 'precision',
    barClassName: 'bg-[linear-gradient(90deg,#9ed448_0%,#2d8c3c_100%)]',
  },
} as const;

type AxisMetaKey = keyof typeof axisMeta;

export default function TypeDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/types/:typeId');
  const [imageFailed, setImageFailed] = useState(false);
  const { user } = useAuth();
  const { reset, state, calculateIndicatorScores, calculateResult } = useDiagnosisContext();

  const type = useMemo(() => {
    if (!match || !params?.typeId) {
      return null;
    }

    return typesData.find((item) => item.id === params.typeId) ?? null;
  }, [match, params]);

  useLayoutEffect(() => {
    // ページ遷移直後に必ずトップに移動する
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [type?.id]);

  if (!type) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-[0_18px_50px_rgba(28,43,31,0.08)]">
          <h1 className="text-2xl font-bold text-foreground">タイプが見つかりません</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            指定されたタイプ情報を読み込めませんでした。トップページからもう一度選択してください。
          </p>
          <Button className="mt-6" onClick={() => setLocation('/')}>
            トップに戻る
          </Button>
        </div>
      </div>
    );
  }

  const hasDetailedContent =
    Boolean(type.detailHeading) ||
    Boolean(type.detailIntro?.length) ||
    Boolean(type.detailStrengths?.length) ||
    Boolean(type.detailCautions?.length) ||
    Boolean(type.detailScenes?.length) ||
    Boolean(type.detailStyle?.length) ||
    Boolean(type.detailWhy?.length);
  const typeImagePath = type.imagePath ?? `/type-images/${type.id}.png`;
  const hasTypeImage = !imageFailed;
  const indicatorScores = calculateIndicatorScores();
  const axisResult = calculateResult();
  const shouldShowScoreboard = state.result?.id === type.id && state.answers.length > 0;
  const scoreRows = [
    { axis: 'decision' as AxisMetaKey, winner: axisResult.decision },
    { axis: 'role' as AxisMetaKey, winner: axisResult.role },
    { axis: 'domain' as AxisMetaKey, winner: axisResult.domain },
    { axis: 'execution' as AxisMetaKey, winner: axisResult.execution },
  ].map((row) => {
    const meta = axisMeta[row.axis];
    const leftScore = indicatorScores[meta.leftKey];
    const rightScore = indicatorScores[meta.rightKey];
    const total = leftScore + rightScore || 1;
    const leftRatio = leftScore / total;

    return {
      ...meta,
      winningLabel: row.winner === meta.leftKey ? meta.leftLabel : meta.rightLabel,
      winningPercent: Math.round(Math.max(leftRatio, 1 - leftRatio) * 100),
      markerPosition: `${(1 - leftRatio) * 100}%`,
    };
  });

  const shareUrl = useMemo(() => {
    const url = new URL(`/types/${type.id}`, window.location.origin);

    if (user?.name) {
      url.searchParams.set('shareName', user.name);
    } else {
      url.searchParams.delete('shareName');
    }

    return url.toString();
  }, [type.id, user?.name]);

  const handleShare = () => {
    const sharerLabel = user?.name ? `${user.name}さんが` : 'だれかが';
    const text = `${sharerLabel}打破宣言しました！\n\n診断結果は「${type.name}」です。\n${type.title}\n\nログインして結果を見てみよう！`;
    if (navigator.share) {
      navigator.share({
        title: `${sharerLabel}打破宣言しました！`,
        text,
        url: shareUrl,
      });
      return;
    }

    navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    alert('結果をコピーしました');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('URLをコピーしました');
  };

  const handleRetry = () => {
    reset();
    setLocation('/diagnosis');
  };

  return (
    <div className="min-h-screen bg-background paper-texture">
      <nav className="sticky top-0 z-50 border-b border-border/80 bg-[rgba(251,248,241,0.88)] backdrop-blur-none md:backdrop-blur-sm dark:bg-[rgba(8,14,24,0.78)]">
        <div className="container flex items-center justify-between py-4">
          <Button
            onClick={() => setLocation('/')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            ← トップへ戻る
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container py-10 md:py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="historical-panel relative rounded-[2.2rem] p-6 md:p-8">
            <div className="night-sky hidden dark:md:block">
              <div className="night-clouds !bottom-10 opacity-55" />
              <div className="night-castle !bottom-6 !h-28 !w-[30rem] opacity-28" />
            </div>
            <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-center">
              <div className="frame-scroll mx-auto w-full max-w-[360px] overflow-hidden rounded-[2rem] p-4">
                <div className="washi-image-stage aspect-[3/4] overflow-hidden rounded-[1.5rem] border border-border/70 bg-white">
                {!imageFailed ? (
                  <img
                    src={typeImagePath}
                    alt={`${type.name}のメイン画像`}
                    className="washi-image h-full w-full object-contain"
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-7xl font-bold text-white"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.name.charAt(0)}
                  </div>
                )}
                </div>
              </div>

              <div className="space-y-5 text-center lg:text-left">
                <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                  <div className="seal-tag inline-flex rounded-full px-4 py-1.5 text-sm font-medium text-primary">
                    {type.eraLabel}
                  </div>
                  <div className="slip-tag inline-flex rounded-full px-4 py-1.5 pl-7 text-sm font-medium text-foreground">
                    #{type.eraTheme}
                  </div>
                  {type.fullTypeLabel && (
                    <div className="seal-tag inline-flex rounded-full px-4 py-1.5 text-sm font-medium text-foreground">
                      {type.fullTypeLabel}
                    </div>
                  )}
                  <div className="seal-tag inline-flex rounded-full px-4 py-1.5 text-sm font-medium text-accent-foreground">
                    {type.combinationLabel}
                  </div>
                </div>
                <div>
                  <h2 className="ink-title text-5xl font-bold text-foreground md:text-6xl">{type.name}</h2>
                  <p className="mt-2 text-xl font-semibold text-primary">{type.title}</p>
                </div>
                {hasTypeImage ? (
                  <div className="flex justify-center lg:justify-start">
                    <a
                      href={typeImagePath}
                      download
                      className="slip-tag inline-flex items-center gap-2 rounded-full px-4 py-2 pl-7 text-sm font-medium text-primary transition-colors hover:bg-[rgba(255,255,255,0.96)]"
                    >
                      <Download className="h-4 w-4" />
                      画像を保存
                    </a>
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-muted-foreground">
                    この人物画像はまだ未設定です。`{typeImagePath}` に追加すると反映されます。
                  </p>
                )}
              </div>
            </div>
          </div>

          {!hasDetailedContent && (
            <section className="historical-panel rounded-3xl p-6 md:p-8">
              <h3 className="ink-title text-xl font-bold text-foreground">詳細説明</h3>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                このタイプの詳細説明はまだ反映前です。今後追加された内容のみをここに表示します。
              </p>
            </section>
          )}

          {shouldShowScoreboard && (
            <section className="historical-panel rounded-3xl p-6 md:p-8">
              <div className="seal-tag inline-flex rounded-full px-4 py-1.5 text-sm font-medium text-primary">
                診断スコア
              </div>
              <h3 className="ink-title mt-4 text-left text-2xl font-bold text-foreground [text-wrap:initial] [word-break:keep-all]">
                あなたはこの結果になりました
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                実際の点数ではなく、各軸がどちらに寄っていたかだけを見やすくまとめています。
              </p>

              <div className="mt-6 grid gap-4">
                {scoreRows.map((row) => (
                  <div key={row.title} className="wash-paper rounded-[1.75rem] p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold tracking-[0.08em] text-muted-foreground">
                        {row.title}
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {row.winningPercent}% {row.winningLabel}寄り
                      </p>
                    </div>

                    <div className="mt-4 rounded-[1.4rem] bg-white px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      <div className={`relative h-3 rounded-full ${row.barClassName}`}>
                        <div
                          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-foreground shadow-[0_10px_22px_rgba(28,43,31,0.16)]"
                          style={{ left: row.markerPosition }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm font-medium text-muted-foreground">
                        <span>{row.leftLabel}</span>
                        <span>{row.rightLabel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {type.detailHeading && (
            <section className="historical-panel rounded-3xl p-6 md:p-8">
              <div className="seal-tag inline-flex rounded-full px-4 py-1.5 text-sm font-medium text-primary">
                詳細説明
              </div>
              <h3 className="ink-title mt-4 text-left text-2xl font-bold leading-relaxed text-foreground [text-wrap:initial] [word-break:keep-all]">
                {type.detailHeading}
              </h3>
              <div className="mt-5 space-y-4">
                {type.detailIntro?.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {type.detailStrengths && (
            <section className="historical-panel rounded-3xl p-6 md:p-8">
              <h3 className="ink-title text-xl font-bold text-foreground">強み｜仕事の中で出やすい特徴</h3>
              <div className="mt-5 space-y-4">
                {type.detailStrengths.map((item) => (
                  <div key={item.title} className="wash-paper rounded-2xl p-4">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {type.detailCautions && (
            <section className="historical-panel rounded-3xl p-6 md:p-8">
              <h3 className="ink-title text-xl font-bold text-foreground">注意点｜陥りやすいパターン</h3>
              <div className="mt-5 space-y-4">
                {type.detailCautions.map((item) => (
                  <div key={item.title} className="wash-paper rounded-2xl p-4">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {type.detailScenes && (
            <section className="historical-panel rounded-3xl p-6 md:p-8">
              <h3 className="ink-title text-xl font-bold text-foreground">活躍しやすい場面</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {type.detailScenes.map((item) => (
                  <div key={item.title} className="wash-paper rounded-2xl p-4">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {type.detailStyle && (
            <section className="historical-panel rounded-3xl p-6 md:p-8">
              <h3 className="ink-title text-xl font-bold text-foreground">このタイプの打破スタイル</h3>
              <div className="mt-5 space-y-4">
                {type.detailStyle.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {type.detailWhy && (
            <section className="historical-panel rounded-3xl p-6 md:p-8">
              <h3 className="ink-title text-xl font-bold text-foreground">なぜ{type.name}？</h3>
              <div className="mt-5 space-y-4">
                {type.detailWhy.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-4 md:flex-row">
            <Button
              onClick={handleShare}
              variant="outline"
              className="slip-tag h-12 flex-1 pl-8 text-primary hover:bg-[rgba(255,255,255,0.96)]"
            >
              <Share2 className="mr-2 h-4 w-4" />
              結果をシェア
            </Button>
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              className="seal-tag h-12 flex-1 text-foreground hover:bg-muted/50"
            >
              <Copy className="mr-2 h-4 w-4" />
              URLをコピー
            </Button>
            {shouldShowScoreboard && (
              <Button
                onClick={handleRetry}
                className="slip-tag h-12 flex-1 pl-8 text-foreground hover:bg-[rgba(255,255,255,0.96)]"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                もう一度診断する
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
