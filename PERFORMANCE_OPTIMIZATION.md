# パフォーマンス最適化ガイド

このドキュメントでは、サイトのパフォーマンス改善について記載しています。

## 実装済みの改善

### 1. **画像の遅延ロード（Lazy Loading）**
- ✅ 実装済み
- すべての画像に `loading="lazy"` を追加
- ページ読み込み時にビューポート外の画像は読み込まない
- ユーザーのスクロール時に必要な画像だけロード

**修正ファイル:**
- `client/src/components/CharacterCard.tsx` - 16人分の人物カード
- `client/src/pages/Home.tsx` - メインビジュアル
- `client/src/pages/TypeDetail.tsx` - 詳細ページの人物画像

### 2. **画像圧縮プラグイン（vite-plugin-imagemin）**
- ✅ 実装済み
- ビルド時に自動的に画像を圧縮
- PNG、JPG、GIF、SVG に対応
- デフォルト設定：
  - PNG: 品質レベル 7（オプティマイズ）
  - JPG: 品質 75%
  - GIF: 品質レベル 7、インターレース無効

**追加されたライブラリ:**
- `vite-plugin-imagemin@^0.6.1`

## 次のステップ

### 必須：依存関係をインストール
```bash
pnpm install
```

### 推奨：画像形式の最適化
以下の対策で、さらなるパフォーマンス改善が見込めます：

1. **PNG → WebP 変換**
   - ブラウザ互換性が高い最新形式
   - 従来の PNG より 25-35% ファイルサイズ削減
   
2. **メインビジュアルのサイズ最適化**
   - `/client/public/daha-sengen-main-visual.png` を確認
   - 推奨解像度：1400x1900px 程度
   - ツール例：ImageOptim（Mac）、JPEGmini、TinyPNG

3. **Responsive Images 対応**
   - `Picture` タグでカスタマイズして、デバイス別に異なるサイズを配信

### オプション：追加の最適化
- **CDN 配信**: CloudFlare Images を検討
- **キャッシング**: Service Worker の実装
- **Preload**: 重要な画像に `rel="preload"` を指定

## パフォーマンス検証

ビルド後、以下で効果を確認できます：

```bash
# 本番ビルド
pnpm build

# LightHouse で検査（Chrome DevTools）
# Audit → Performance を実行
```

**期待される改善:**
- 初期ロード時間: 約 20-30% 削減
- LCP（Largest Contentful Paint）: 約 15-20% 改善
- FCP（First Contentful Paint）: 約 10-15% 改善

## 注意事項

- Vite の画像圧縮は **ビルド時のみ** 実行されます
- 開発環境では圧縮が無効です（`pnpm dev` 時は最適化されません）
- デプロイ前に必ず `pnpm build` でビルドを確認してください
