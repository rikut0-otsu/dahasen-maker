import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CharacterCard } from '@/components/CharacterCard';
import { GoogleLoginCard } from '@/components/GoogleLoginCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import typesData from '@/data/types.json';

const eraOrder = ['sengoku', 'edo', 'bakumatsu', 'heian'] as const;

const eraMeta = {
  sengoku: {
    label: '戦国',
    theme: '戦略突破型',
    description: 'ロジック × 自走。自ら前線に立ち、構造を見抜いて突破する4人。',
  },
  edo: {
    label: '江戸',
    theme: '構造統率型',
    description: 'ロジック × 伴走。仕組みと運用で安定を作り、組織を前に進める4人。',
  },
  bakumatsu: {
    label: '幕末',
    theme: 'ビジョン突破型',
    description: '感性 × 自走。志と行動で時代を動かし、新しい流れを生んだ4人。',
  },
  heian: {
    label: '平安',
    theme: '調和創造型',
    description: '感性 × 伴走。言葉や思想、文化の設計で閉塞をほどいた4人。',
  },
};

const typeCodeById: Record<string, string> = {
  fast_broad_logic_solo: 'L-D-X-A',
  careful_broad_logic_solo: 'L-D-X-P',
  fast_deep_logic_solo: 'L-D-M-A',
  careful_deep_logic_solo: 'L-D-M-P',
  fast_broad_logic_support: 'L-S-X-A',
  careful_broad_logic_support: 'L-S-X-P',
  fast_deep_logic_support: 'L-S-M-A',
  careful_deep_logic_support: 'L-S-M-P',
  fast_broad_intuition_solo: 'E-D-X-A',
  careful_broad_intuition_solo: 'E-D-X-P',
  fast_deep_intuition_solo: 'E-D-M-A',
  careful_deep_intuition_solo: 'E-D-M-P',
  fast_broad_intuition_support: 'E-S-X-A',
  careful_broad_intuition_support: 'E-S-X-P',
  fast_deep_intuition_support: 'E-S-M-A',
  careful_deep_intuition_support: 'E-S-M-P',
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { reset } = useDiagnosisContext();
  const { user } = useAuth();
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  const handleStartDiagnosis = () => {
    reset();
    setLocation('/diagnosis');
  };

  const groupedTypes = eraOrder.map((era) => ({
    era,
    ...eraMeta[era],
    items: typesData.filter((type) => type.era === era),
  }));

  return (
    <div className="min-h-screen bg-background paper-texture">
      <nav className="sticky top-0 z-50 border-b border-border/80 bg-[rgba(251,248,241,0.88)] backdrop-blur-none md:backdrop-blur-sm dark:bg-[rgba(8,14,24,0.78)]">
        <div className="container flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <div className="ink-title text-lg font-bold text-foreground">打破宣言メーカー</div>
          <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
            <GoogleLoginCard />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="night-sky hidden dark:md:block">
          <div className="night-clouds" />
          <div className="night-castle" />
          <div className="night-pines" />
        </div>
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[-4rem] top-16 h-56 w-56 rounded-full bg-primary/8 blur-3xl"></div>
          <div className="absolute right-[-3rem] top-8 h-56 w-56 rounded-full bg-accent/15 blur-3xl"></div>
        </div>

        <div className="container relative z-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 text-center">
            <div className="max-w-4xl space-y-6">
              <div className="slip-tag inline-flex items-center rounded-full px-5 py-1.5 pl-7 text-sm font-medium text-primary">
                CYBERAGENT PURPOSE
              </div>
              {user ? (
                <div className="mx-auto inline-flex max-w-full items-center gap-3 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-sm shadow-sm dark:bg-[rgba(8,14,24,0.62)]">
                  <span className="font-semibold text-foreground">
                    {user.name}さん、ログイン中
                  </span>
                  <span className="truncate text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              ) : null}
              <div className="space-y-5">
                <h2 className="ink-title text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
                  日本の閉塞感を打破する。
                  <span className="mt-2 block text-primary">新卒としての活躍宣言をつくろう！</span>
                </h2>
                <p className="text-base leading-8 text-muted-foreground md:text-lg">
                  サイバーエージェントのパーパスは、「日本の閉塞感を打破する」こと。
                  <br />
                  日本の歴史の中で、その時代ごとの閉塞感を自分の力で切り拓いてきた先人に自分を重ね併せて、
                  新たに会社を担う新卒としての「活躍宣言」をつくろう！
                </p>
              </div>
            </div>

            <div className="mx-auto w-full max-w-xl">
              <div className="frame-scroll overflow-hidden rounded-[2rem] p-4">
                {!heroImageFailed ? (
                  <img
                    src="/daha-sengen-main-visual.png"
                    alt="打破宣言メーカーのメインビジュアル"
                    className="h-auto w-full rounded-[1.5rem] object-cover"
                    onError={() => setHeroImageFailed(true)}
                  />
                ) : (
                  <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-[1.5rem] bg-[radial-gradient(circle_at_top,_rgba(130,190,40,0.15),_transparent_45%),linear-gradient(180deg,#fcfdf9_0%,#f1f6eb_100%)] px-8 text-center">
                    <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary">
                      MAIN VISUAL
                    </div>
                    <p className="text-4xl font-bold tracking-[0.2em] text-foreground md:text-5xl">
                      打破宣言
                    </p>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      メイン画像枠は実装済みです。
                      <br />
                      `/daha-sengen-main-visual.png` が置かれるとこの場所に表示されます。
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2 md:text-left">
              <div className="historical-panel rounded-3xl p-6 text-left">
                <h3 className="ink-title mb-3 text-base font-semibold text-foreground">※注意事項</h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  これは適正診断ではなく、あくまで「どんな活躍をしていきたいか？」の活躍宣言をつくるヒントにしていただきたいものです！
                </p>
              </div>

              <div className="historical-panel rounded-3xl p-6 space-y-3 text-left">
                <h3 className="ink-title font-semibold text-foreground">診断について</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-[var(--gold)]">•</span>
                    <span>計16問の質問に答えていただきます</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-[var(--gold)]">•</span>
                    <span>所要時間は約1分です</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-[var(--gold)]">•</span>
                    <span>結果は16種類の戦国武将タイプで表示されます</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handleStartDiagnosis}
              className="slip-tag h-14 px-10 pl-12 text-lg font-semibold text-foreground shadow-lg shadow-primary/10 hover:bg-[rgba(255,255,255,0.96)]"
            >
              診断を開始する
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-5xl text-center">
            <h3 className="ink-title text-3xl font-bold text-foreground">
              16タイプの登場人物
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              時代ごとに4人ずつ分類しています。気になる人物名を押すと、その人物像や強み・弱み、向いている役割の詳細を見られます。
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-6xl space-y-10">
            {groupedTypes.map((group) => (
              <section
                key={group.era}
                className="historical-panel rounded-[2rem] p-6 md:p-8"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span className="crest-mark" aria-hidden="true" />
                    <div className="seal-tag inline-flex rounded-full px-4 py-1.5 text-sm font-medium text-primary">
                      {group.label}
                    </div>
                    <span className="crest-mark" aria-hidden="true" />
                  </div>
                  <h4 className="ink-title mt-4 text-2xl font-bold text-foreground">
                    #{group.theme}
                  </h4>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {group.description}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {group.items.map((type) => (
                    <CharacterCard
                      key={type.id}
                      id={type.id}
                      name={type.name}
                      title={type.title}
                      color={type.color}
                      imagePath={type.imagePath}
                      typeCode={typeCodeById[type.id]}
                      compact
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-[rgba(251,248,241,0.72)] py-8 dark:bg-[rgba(8,14,24,0.72)]">
        <div className="container text-center text-sm text-muted-foreground">
          <p>打破宣言メーカー © 2026 | 戦国武将モチーフの診断サイト</p>
        </div>
      </footer>
    </div>
  );
}
