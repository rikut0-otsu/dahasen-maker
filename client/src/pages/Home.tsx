import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CharacterCard } from '@/components/CharacterCard';
import { GoogleLoginCard } from '@/components/GoogleLoginCard';
import { Sparkles } from '@/components/Sparkles';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useDiagnosisContext } from '@/contexts/DiagnosisContext';
import typesData from '@/data/types.json';
import { ChevronDown, ScrollText } from 'lucide-react';

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

const diagnosisAxes = [
  {
    key: 'decision',
    label: '意思決定',
    summary: '合理性で組み立てるか、意義や共感で動かすか。',
    left: {
      code: 'L',
      name: 'Logic',
      alias: '論理',
      description: '合理性とデータで正解を導く',
    },
    right: {
      code: 'E',
      name: 'Emotion',
      alias: '感性',
      description: '意義、共感、納得感を重視する',
    },
  },
  {
    key: 'role',
    label: '役割',
    summary: '自ら火をつけるか、周囲をつないで力を引き出すか。',
    left: {
      code: 'D',
      name: 'Drive',
      alias: '自走',
      description: '自ら火をつけ、道を切り拓く',
    },
    right: {
      code: 'S',
      name: 'Support',
      alias: '伴走',
      description: '周囲を繋ぎ、組織の力を最大化する',
    },
  },
  {
    key: 'domain',
    label: '領域',
    summary: '枠を越えて広げるか、ひとつを深く鋭く極めるか。',
    left: {
      code: 'X',
      name: 'Expansion',
      alias: '越境',
      description: '既存の枠を超え、広く展開する',
    },
    right: {
      code: 'M',
      name: 'Mastery',
      alias: '専門',
      description: '特定の領域を深く、鋭く極める',
    },
  },
  {
    key: 'execution',
    label: '実行',
    summary: '走りながら磨くか、設計を詰めて確実に仕留めるか。',
    left: {
      code: 'A',
      name: 'Agile',
      alias: '爆速',
      description: '走りながら考え、改善を繰り返す',
    },
    right: {
      code: 'P',
      name: 'Precision',
      alias: '緻密',
      description: '緻密な設計に基づき、確実に仕留める',
    },
  },
] as const;

export default function Home() {
  const [, setLocation] = useLocation();
  const { reset } = useDiagnosisContext();
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [headerLogoFailed, setHeaderLogoFailed] = useState(false);
  const [headerWordmarkFailed, setHeaderWordmarkFailed] = useState(false);
  const [isCharacterMenuOpen, setIsCharacterMenuOpen] = useState(false);
  const characterMenuRef = useRef<HTMLDivElement | null>(null);

  const handleStartDiagnosis = () => {
    reset();
    window.scrollTo(0, 0);
    setLocation('/diagnosis');
  };

  const groupedTypes = eraOrder.map((era) => ({
    era,
    ...eraMeta[era],
    items: typesData.filter((type) => type.era === era),
  }));

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!characterMenuRef.current?.contains(event.target as Node)) {
        setIsCharacterMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCharacterMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isCharacterMenuOpen) {
      document.body.style.overflow = '';
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    if (!mediaQuery.matches) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCharacterMenuOpen]);

  return (
    <div className="min-h-screen bg-background paper-texture">
      <nav className="sticky top-0 z-50 border-b border-border/80 bg-[rgba(251,248,241,0.88)] backdrop-blur-none md:backdrop-blur-sm dark:bg-[rgba(8,14,24,0.78)]">
        <div className="container flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:py-4">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            {!headerLogoFailed ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src="/favicon_256.png"
                  alt="打破宣言メーカーのロゴ"
                  className="h-10 w-10 shrink-0 object-contain md:h-12 md:w-12"
                  loading="eager"
                  onError={() => setHeaderLogoFailed(true)}
                />
                {!headerWordmarkFailed ? (
                  <img
                    src="/header-wordmark.png"
                    alt="打破宣言"
                    className="h-9 w-auto max-w-[12.5rem] object-contain sm:h-10 sm:max-w-[14.5rem] md:h-11 md:max-w-[17rem]"
                    loading="eager"
                    onError={() => setHeaderWordmarkFailed(true)}
                  />
                ) : (
                  <div className="text-base font-semibold tracking-[0.08em] text-foreground sm:text-lg">
                    打破宣言
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="h-3 w-3 rounded-full bg-primary" />
                <div className="text-sm font-semibold text-foreground">打破宣言</div>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:flex-nowrap md:justify-end md:gap-3">
            <div className="relative shrink-0" ref={characterMenuRef}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCharacterMenuOpen((open) => !open)}
                className="seal-tag h-10 justify-between gap-2 rounded-full border-border/70 bg-white/80 px-4 text-sm text-foreground hover:bg-white md:h-11 md:px-5 md:text-base md:min-w-[180px]"
                aria-expanded={isCharacterMenuOpen}
                aria-controls="character-menu-panel"
              >
                <span className="inline-flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-primary" />
                  各登場人物
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    isCharacterMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>

              {isCharacterMenuOpen && (
                <div
                  id="character-menu-panel"
                  className="historical-panel fixed left-1/2 top-24 z-50 max-h-[min(70vh,36rem)] w-[calc(100vw-2rem)] max-w-[26rem] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-[1.4rem] p-3 shadow-[0_22px_60px_rgba(28,43,31,0.16)] touch-pan-y md:absolute md:left-auto md:right-0 md:top-[calc(100%+0.75rem)] md:max-h-none md:w-[min(92vw,58rem)] md:max-w-none md:translate-x-0 md:overflow-visible md:rounded-[1.75rem] md:p-6"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {groupedTypes.map((group) => (
                      <section
                        key={group.era}
                        className="wash-paper rounded-[1.5rem] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="seal-tag inline-flex rounded-full px-3 py-1 text-xs font-semibold text-primary">
                              {group.label}
                            </div>
                            <h3 className="ink-title mt-2 text-lg font-bold text-foreground">
                              {group.theme}
                            </h3>
                          </div>
                          <a
                            href={`#characters-${group.era}`}
                            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                            onClick={() => setIsCharacterMenuOpen(false)}
                          >
                            一覧を見る
                          </a>
                        </div>
                        <p className="mt-2 text-xs leading-6 text-muted-foreground">
                          {group.description}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {group.items.map((type) => (
                            <Link
                              key={type.id}
                              href={`/types/${type.id}`}
                              className="group rounded-2xl border border-border/70 bg-white/90 px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_14px_30px_rgba(45,140,60,0.12)] dark:border-[rgba(217,196,143,0.12)] dark:bg-[linear-gradient(180deg,rgba(13,22,35,0.96),rgba(9,16,28,0.98))] dark:hover:border-[rgba(130,190,40,0.4)] dark:hover:shadow-[0_16px_34px_rgba(0,0,0,0.34)]"
                              onClick={() => setIsCharacterMenuOpen(false)}
                            >
                              <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary dark:text-[rgba(240,234,216,0.96)] dark:group-hover:text-[rgba(160,218,90,0.98)]">
                                {type.name}
                              </p>
                              <p className="mt-1 text-[11px] leading-5 text-muted-foreground dark:text-[rgba(201,196,181,0.8)]">
                                {type.title}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
        <div className="pointer-events-none absolute inset-x-[8%] top-0 h-40 opacity-70 md:inset-x-[12%] md:h-52 lg:inset-x-[16%]">
          <Sparkles
            count={10}
            minSize={4}
            maxSize={10}
            topOffset={-12}
            direction="down"
            minDuration={3.1}
            maxDuration={4.8}
          />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[18vw] min-w-[9rem] max-w-[15rem] opacity-50 lg:block">
          <Sparkles
            count={8}
            minSize={4}
            maxSize={10}
            topOffset={-18}
            direction="down"
            minDuration={3.4}
            maxDuration={5.1}
          />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[18vw] min-w-[9rem] max-w-[15rem] opacity-45 lg:block">
          <Sparkles
            count={7}
            minSize={4}
            maxSize={9}
            topOffset={-22}
            direction="down"
            minDuration={3.5}
            maxDuration={5.3}
          />
        </div>

        <div className="container relative z-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 text-center">
            <div className="max-w-4xl space-y-6">
              <div className="slip-tag inline-flex items-center rounded-full px-5 py-1.5 pl-7 text-sm font-medium text-primary">
                CYBERAGENT PURPOSE
              </div>
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

            <div className="relative mx-auto w-full max-w-xl">
              <div className="frame-scroll overflow-hidden rounded-[2rem] p-4">
                {!heroImageFailed ? (
                  <img
                    src="/daha-sengen-main-visual.png"
                    alt="打破宣言メーカーのメインビジュアル"
                    className="h-auto w-full rounded-[1.5rem] object-cover"
                    loading="lazy"
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
              <div className="pointer-events-none absolute inset-0">
                <Sparkles
                  count={12}
                  minSize={5}
                  maxSize={12}
                  bottomOffset={-14}
                  direction="up"
                  minDuration={2.9}
                  maxDuration={4.4}
                />
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

            <section className="historical-panel w-full max-w-5xl rounded-[2rem] p-6 text-left md:p-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="seal-tag inline-flex rounded-full px-4 py-1.5 text-sm font-medium text-primary">
                  診断ロジック
                </div>
                <h3 className="ink-title mt-4 text-2xl font-bold text-foreground md:text-3xl">
                  4つの軸を掛け合わせて
                  <span className="mt-2 block text-primary">16タイプの登場人物に分類します</span>
                </h3>
                <p className="mt-4 text-xs leading-6 text-muted-foreground md:text-base md:leading-7">
                  診断では、4つの領域それぞれでどちらの傾向が強いかを見ています。
                  <br className="hidden md:block" />
                  その組み合わせが、あなたらしい「打破スタイル」の輪郭になります。
                </p>
              </div>

              <div className="mt-8">
                <Accordion type="single" collapsible className="space-y-3" defaultValue="decision">
                  {diagnosisAxes.map((axis) => (
                    <AccordionItem
                      key={axis.key}
                      value={axis.key}
                      className="wash-paper overflow-hidden rounded-[1.5rem] border border-border/70 px-4 dark:border-[rgba(217,196,143,0.14)]"
                    >
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div>
                          <p className="ink-title text-lg font-bold text-foreground md:text-xl">{axis.label}</p>
                          <p className="mt-1 text-xs leading-6 text-muted-foreground md:text-sm md:leading-7">
                            {axis.summary}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          {[axis.left, axis.right].map((item) => (
                            <div
                              key={item.code}
                              className="rounded-[1.3rem] border border-border/70 bg-white/85 p-4 dark:border-[rgba(217,196,143,0.14)] dark:bg-[rgba(8,14,24,0.58)]"
                            >
                              <div className="flex items-center gap-3">
                                <div className="inline-flex min-w-[3.2rem] items-center justify-center rounded-[0.85rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,237,224,0.9))] px-3 py-2 text-sm font-bold tracking-[0.18em] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-[rgba(217,196,143,0.18)] dark:bg-[linear-gradient(180deg,rgba(18,29,45,0.96),rgba(11,18,29,0.98))]">
                                  <span className="ink-title text-sm">{item.code}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.alias}</p>
                                </div>
                              </div>
                              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>

            <Button
              onClick={handleStartDiagnosis}
              className="slip-tag h-14 px-10 pl-12 text-lg font-semibold text-foreground shadow-[0_18px_38px_rgba(45,140,60,0.18)] ring-1 ring-primary/20 hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.98)] hover:shadow-[0_22px_42px_rgba(45,140,60,0.24)] dark:border dark:border-[rgba(217,196,143,0.18)] dark:bg-[linear-gradient(180deg,rgba(19,31,48,0.98),rgba(12,20,33,0.98))] dark:text-[rgba(245,240,223,0.96)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.34)] dark:hover:bg-[linear-gradient(180deg,rgba(24,38,58,0.98),rgba(14,23,37,0.98))]"
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
                id={`characters-${group.era}`}
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
