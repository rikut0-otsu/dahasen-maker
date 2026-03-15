# 打破宣言メーカー - プロジェクトガイド

## プロジェクト概要

「打破宣言メーカー」は、戦国武将をモチーフにした16タイプのMBTI風診断サイトです。ユーザーの仕事スタイルと人間関係の傾向を4つの軸で診断し、対応する戦国武将タイプを表示します。

### 主な特徴

- **Abema風モダンUI** - 黒ベース + 赤アクセントのミニマルデザイン
- **16タイプ診断** - 4軸 × 2タイプで16種類の結果
- **レスポンシブ対応** - モバイル・タブレット・デスクトップに対応
- **高速な診断フロー** - 4ページ × 4問で約1分で完了

---

## プロジェクト構造

```
hahasen-maker/
├── client/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuestionCard.tsx      # 質問カードコンポーネント
│   │   │   ├── ProgressBar.tsx       # 進捗バーコンポーネント
│   │   │   ├── CharacterCard.tsx     # キャラクターカードコンポーネント
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ui/                   # shadcn/ui コンポーネント
│   │   ├── contexts/
│   │   │   ├── DiagnosisContext.tsx  # 診断状態管理コンテキスト
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/
│   │   │   └── useDiagnosis.ts       # 診断ロジックカスタムフック
│   │   ├── pages/
│   │   │   ├── Home.tsx              # トップページ
│   │   │   ├── Diagnosis.tsx         # 診断ページ
│   │   │   ├── Result.tsx            # 結果ページ
│   │   │   └── NotFound.tsx
│   │   ├── data/
│   │   │   ├── questions.json        # 16問の質問データ
│   │   │   └── types.json            # 16タイプのキャラクターデータ
│   │   ├── App.tsx                   # メインアプリケーション
│   │   ├── main.tsx                  # エントリーポイント
│   │   └── index.css                 # グローバルスタイル
│   └── index.html
├── server/
│   └── index.ts                      # Express サーバー
├── shared/
│   └── const.ts
├── package.json
└── tsconfig.json
```

---

## 診断ロジック

### 4つの軸

| 軸 | 左側 | 右側 |
|---|------|------|
| **Speed** | 爆速 (fast) | 緻密 (careful) |
| **Scope** | 越境 (broad) | 専門 (deep) |
| **Logic** | 論理 (logic) | 感性 (intuition) |
| **Style** | 自走 (solo) | 伴走 (support) |

### スコア計算

- 各質問に対して、ユーザーは4段階で回答します
  - YES ◎ = 2点 (強い同意)
  - YES ○ = 1点 (弱い同意)
  - NO ○ = 1点 (弱い否定)
  - NO ◎ = 2点 (強い否定)

- 各軸のスコアが8点以上で「左側」、8点未満で「右側」に分類
- 最終的に16タイプのいずれかに決定

### 16タイプの例

| タイプID | 名前 | 軸の組み合わせ |
|---------|------|-------------|
| `fast_broad_logic_solo` | 織田信長 | 爆速 × 越境 × 論理 × 自走 |
| `careful_deep_intuition_support` | ねね（北政所） | 緻密 × 専門 × 感性 × 伴走 |

---

## ローカル起動方法

### 前提条件

- Node.js 18以上
- pnpm 10以上

### セットアップ

```bash
# 1. プロジェクトディレクトリに移動
cd hahasen-maker

# 2. 依存関係をインストール
pnpm install

# 3. 開発サーバーを起動
pnpm dev
```

開発サーバーが起動すると、以下のURLでアクセスできます：
- ローカル: `http://localhost:3000/`
- ネットワーク: `http://{your-ip}:3000/`

### 開発中の便利なコマンド

```bash
# TypeScript型チェック
pnpm check

# コード整形
pnpm format

# ビルド
pnpm build

# プロダクション環境で起動
pnpm start

# プレビュー
pnpm preview
```

---

## デプロイ方法

### Manus プラットフォームでの公開

このプロジェクトはManus プラットフォームで管理されています。以下の手順で公開できます：

1. **チェックポイント作成**
   - プロジェクトの変更を完了したら、`webdev_save_checkpoint` で保存

2. **Publish ボタンをクリック**
   - 管理画面の右上にある「Publish」ボタンをクリック
   - チェックポイントが自動的にデプロイされます

3. **カスタムドメイン設定（オプション）**
   - 管理画面の「Settings」→「Domains」で独自ドメインを設定可能

### 外部ホスティングへのデプロイ

Vercel、Netlify、Railway などのプラットフォームにデプロイする場合：

```bash
# ビルド
pnpm build

# dist/ ディレクトリの内容をデプロイ
```

**注意:** このプロジェクトはスタティックサイトなため、サーバーサイドの機能は不要です。

---

## スタイリング・カラーパレット

### Abema風ダークテーマ

```css
/* 背景色 */
--background: #0A0E27;      /* 深紺黒 */
--card: #1A1F3A;             /* やや明るい黒 */

/* テキスト色 */
--foreground: #F5F5F5;       /* オフホワイト */
--muted-foreground: #A0A9B8; /* グレー */

/* アクセント色 */
--accent: #FF3B30;           /* 鮮烈な赤 */
--secondary: #6366F1;        /* インディゴ */

/* ボーダー */
--border: #2D3748;           /* ダークグレー */
```

### フォント

- **フォントファミリー:** Noto Sans JP
- **見出し:** Bold (700)
- **本文:** Regular (400)

---

## 質問データ構造

### questions.json

```json
[
  {
    "id": 1,
    "text": "質問テキスト",
    "axis": "speed",           // speed, scope, logic, style
    "positive": "fast",        // 肯定的な回答の軸値
    "negative": "careful"      // 否定的な回答の軸値
  }
]
```

### types.json

```json
[
  {
    "id": "fast_broad_logic_solo",
    "name": "織田信長",
    "title": "革新の覇王",
    "description": "説明文",
    "traits": {
      "speed": "fast",
      "scope": "broad",
      "logic": "logic",
      "style": "solo"
    },
    "strengths": ["強み1", "強み2", ...],
    "weaknesses": ["弱み1", "弱み2", ...],
    "roles": ["役割1", "役割2", ...],
    "color": "#FF3B30"
  }
]
```

---

## 主要なコンポーネント

### QuestionCard

質問を表示し、4段階の選択肢を提供するコンポーネント。

```tsx
<QuestionCard
  questionId={1}
  text="質問テキスト"
/>
```

### ProgressBar

診断の進捗を表示するコンポーネント。

```tsx
<ProgressBar currentPage={1} totalPages={4} />
```

### CharacterCard

戦国武将のキャラクターカードを表示するコンポーネント。

```tsx
<CharacterCard
  name="織田信長"
  title="革新の覇王"
  color="#FF3B30"
  description="説明文"
  compact={false}
/>
```

---

## 診断フロー

```
トップページ (Home)
  ↓
  [診断を開始] ボタンをクリック
  ↓
診断ページ (Diagnosis)
  ├─ Page 1/4: Q1-Q4
  ├─ Page 2/4: Q5-Q8
  ├─ Page 3/4: Q9-Q12
  └─ Page 4/4: Q13-Q16
  ↓
  [結果を見る] ボタンをクリック
  ↓
結果ページ (Result)
  ├─ キャラクター表示
  ├─ 説明・強み・弱み
  └─ [シェア] [もう一度診断]
```

---

## トラブルシューティング

### 開発サーバーが起動しない

```bash
# ポート 3000 が使用中の場合
# 自動的に 3001, 3002... にフォールバックします

# キャッシュをクリアして再起動
rm -rf node_modules .pnpm-store
pnpm install
pnpm dev
```

### TypeScript エラーが表示される

```bash
# 型チェックを実行
pnpm check

# 問題がある場合は、該当ファイルを確認
```

### スタイルが反映されない

- `client/src/index.css` が正しく読み込まれているか確認
- ブラウザのキャッシュをクリア (Ctrl+Shift+Delete)
- 開発サーバーを再起動

---

## 今後の拡張案

1. **結果の保存機能** - ユーザーの診断結果をローカルストレージに保存
2. **SNS シェア機能の強化** - OGP メタタグを追加して、シェア時に結果を表示
3. **複数言語対応** - 英語、中国語などの言語サポート
4. **アナリティクス** - ユーザーの診断結果の統計情報を収集
5. **結果の詳細ページ** - 各タイプの詳細情報や相性診断

---

## ライセンス

MIT License

---

## サポート

質問や問題がある場合は、プロジェクトの管理画面から報告してください。
