# 打破宣言メーカー - プロジェクトガイド

## 概要

「打破宣言メーカー」は、4領域の回答傾向から16タイプを導き出し、歴史上の人物になぞらえた「活躍宣言」のヒントを返す診断サイトです。  
診断結果は単なる適性判定ではなく、「どんな突破の仕方で価値を出していきたいか」を言語化するための入口として設計しています。

## 現在のUI方針

- 白ベースの画面設計
- ブランドカラーは `#2d8c3c` と `#82be28`
- 緑はベタ面ではなく、CTA・進捗・タグ・強調に限定して使う
- 画像、余白、カードの読みやすさを優先する

## 体験の流れ

1. トップページで世界観と16タイプ一覧を見る
2. `診断をはじめる` から16問に回答する
3. 結果は個別タイプ詳細ページにそのまま遷移する
4. 診断結果として来た場合のみ、傾向メーターと `もう一度診断する` を表示する

## 技術構成

- フロントエンド: React 19 / Vite 7 / TypeScript
- UI: Tailwind CSS 4 / shadcn-ui 系コンポーネント
- ルーティング: Wouter
- サーバー: Express

## ディレクトリ構成

```text
dahasen-maker/
├── client/
│   ├── public/
│   │   ├── daha-sengen-main-visual.png
│   │   └── type-images/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── data/
│       ├── hooks/
│       └── pages/
├── server/
├── shared/
├── README.md
├── PROJECT_GUIDE.md
└── SCORING_RULES.md
```

## 主要ファイル

- `client/src/pages/Home.tsx`
  - トップページ
  - ヒーロー、16タイプ一覧、時代別セクション

- `client/src/pages/Diagnosis.tsx`
  - 4ページの診断画面
  - MBTI風の4段階回答UI

- `client/src/pages/TypeDetail.tsx`
  - 結果ページと詳細ページを兼用
  - 診断結果として来た場合のみ傾向メーターを表示

- `client/src/hooks/useDiagnosis.ts`
  - 回答管理
  - 配点計算
  - 16タイプへのマッピング

- `client/src/data/questions.json`
  - 16問の設問定義
  - `positive`, `negative`, `weight` を保持

- `client/src/data/types.json`
  - 16タイプ分の人物情報
  - ラベル、説明文、画像パス、詳細セクションを保持

## 診断ロジック

判定対象は次の4領域です。

- 意思決定: `Logic / Emotion`
- 役割: `Drive / Support`
- 領域: `Expansion / Mastery`
- 実行: `Agile / Precision`

各領域で高得点だった側を採用し、最終的に16タイプへマッピングします。  
配点の詳細は `SCORING_RULES.md` を参照してください。

## ローカル起動

### 前提

- Node.js 18 以上
- pnpm 10 以上

### コマンド

```bash
pnpm install
pnpm dev
```

確認URL:

- `http://localhost:3000/`

### よく使うコマンド

```bash
pnpm check
pnpm build
pnpm preview
pnpm format
```

## 画像運用

- トップのメイン画像:
  - `client/public/daha-sengen-main-visual.png`

- 各人物の画像:
  - `client/public/type-images/*.png`

`types.json` の `imagePath` に対応するファイルを置くと、トップ一覧と詳細ページの両方に反映されます。

## ドキュメント運用メモ

- 仕様変更時は `SCORING_RULES.md` と `PROJECT_GUIDE.md` を先に更新する
- UI方針のメモは `ideas.md` に集約する
- タイプ説明の追加は `client/src/data/types.json` を正とする
