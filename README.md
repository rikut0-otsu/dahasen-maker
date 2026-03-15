# 打破宣言メーカー

サイバーエージェントのパーパス「日本の閉塞感を打破する」をテーマにした、16タイプ診断形式の Web アプリです。  
4つの領域で回答傾向を判定し、歴史上の人物に重ねた「活躍宣言タイプ」を表示します。

## できること

- 16問、4ページ構成の診断フロー
- 16タイプの人物一覧と個別詳細ページ
- 診断結果ページでの傾向メーター表示
- 結果のネイティブシェア、URLコピー
- 各人物画像の表示と保存

## 技術構成

- React 19
- Vite 7
- TypeScript
- Tailwind CSS 4
- Wouter
- Express

## ローカル起動

```bash
pnpm install
pnpm dev
```

起動後は `http://localhost:3000/` で確認できます。

## よく使うコマンド

```bash
pnpm dev
pnpm check
pnpm build
pnpm preview
```

## 主要ファイル

- `client/src/pages/Home.tsx`: トップページ
- `client/src/pages/Diagnosis.tsx`: 診断フロー
- `client/src/pages/TypeDetail.tsx`: 結果兼詳細ページ
- `client/src/data/questions.json`: 診断設問
- `client/src/data/types.json`: 16タイプ定義
- `SCORING_RULES.md`: 配点ルール

## 補足

- 画像は `client/public/type-images/` に置くと反映されます。
- トップのメインビジュアルは `client/public/daha-sengen-main-visual.png` を参照します。
