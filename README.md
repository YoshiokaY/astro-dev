# astro-dev
Astro開発環境

## 🎯 概要

企業サイトや静的サイト制作に最適化されたAstro.js開発環境です。高速な開発体験と本格的な画像最適化機能を備えています。

## ✨ 主要機能

### 🖼️ 画像最適化
- **自動WebP変換** - .jpg/.png → .webp（オリジナル+WebP形式）
- **画像圧縮** - JPEG（85%品質）、PNG（80-90%品質）最適化
- **SVG最適化** - 不要な要素を自動削除
- **除外設定** - OGP画像、ファビコンなどを自動除外

### 🛠️ 開発環境
- **Astro 5.10.0** - 最新の静的サイトジェネレーター
- **TypeScript** - 型安全な開発（strict mode）
- **TailwindCSS v4** - 最新のユーティリティファーストCSS
- **SCSS** - グローバル変数・mixin・function対応
- **パスエイリアス** - `@/` で src/ 配下にアクセス

### 🎨 UI/UX
- **コンポーネント設計** - 再利用可能なコンポーネント
- **レスポンシブ対応** - モバイルファースト設計
- **Google Fonts** - Noto Sans JP統合
- **jQuery** - DOM操作サポート
- **アクセシビリティ** - JSX-a11y対応

### 📋 コード品質
- **ESLint** - JavaScript/TypeScript/Astro対応
- **Stylelint** - SCSS品質管理
- **MarkupLint** - HTML/PHP検証
- **Prettier** - コード自動整形
- **TypeScript Check** - 型検証

## 📁 プロジェクト構造

```
src/
├── components/             # 再利用コンポーネント
│   ├── Breadcrumbs.astro   # パンくずナビ
│   ├── ImageImport.astro   # 画像インポート
│   └── LowerTitle.astro    # 下層タイトル
├── layouts/                # レイアウトコンポーネント
│   ├── Layout.astro        # メインレイアウト
│   ├── Head.astro          # <head>要素
│   ├── Header.astro        # ヘッダー
│   └── Footer.astro        # フッター
├── pages/                  # ページファイル
│   ├── index.astro         # トップページ
│   └── hoge/               # サブページ
├── data/                   # サイト設定・データ
│   └── common.ts           # 共通設定
├── scss/                   # スタイルシート
│   ├── abstracts/          # 変数・mixin・function
│   ├── base/               # ベーススタイル
│   └── pages/              # ページ固有スタイル
└── js/                     # JavaScript
    ├── app.js              # メインJS
    └── class/              # クラス定義
```

## 🚀 開発開始

### 必要な環境
- Node.js >= 18.0.0
- npm >= 8.0.0

### セットアップ
```bash
# 依存関係をインストール
npm install

# 開発サーバー起動
npm start
# → http://localhost:3000 でアクセス
```

## 📝 開発コマンド

### 基本コマンド
```bash
npm start                # 開発サーバー起動
npm run build            # 本番ビルド（htdocs/に出力）
npm run preview          # ビルド結果をプレビュー
```

### コード品質管理
```bash
# 全リンター実行
npm run lint:all         # JavaScript + CSS + HTML

# 個別実行
npm run lint            # JavaScript/TypeScript/Astro
npm run lint:css        # SCSS
npm run lint:markup     # HTML/PHP

# CI用（レポート出力）
npm run lint:ci         # 全リンターのCI用実行
```

## ⚙️ 設定・カスタマイズ

### 環境変数による機能制御
```bash
# .env ファイルで設定可能
VITE_COMPRESS_OUTPUT=true   # コード圧縮（デフォルト: true）
VITE_CSS_SPLIT=false        # CSS分離（デフォルト: false）
VITE_IMAGEMIN=true          # 画像最適化（デフォルト: true）
VITE_CONVERT_TO_WEBP=true   # WebP変換（デフォルト: true）
VITE_ASSETS_DIR=assets      # アセットディレクトリ名
VITE_BASE_PATH=/            # ベースパス
DEV_PORT=3000               # 開発サーバーポート
```

### サイト設定
- **共通設定**: `src/data/common.ts` でサイト名、ドメイン、メニューを設定
- **レイアウト**: `src/layouts/Layout.astro` でページ共通レイアウト
- **スタイル**: `src/scss/abstracts/_variables.scss` でグローバル変数

## 🔧 技術スタック詳細

| 技術 | バージョン | 用途 |
|------|------------|------|
| Astro | ^5.10.0 | 静的サイトジェネレーター |
| TypeScript | ^5.0.0 | 型安全な開発 |
| TailwindCSS | ^4.1.10 | CSSフレームワーク |
| SASS | ^1.89.2 | CSS拡張 |
| ESLint | ^8.34.1 | JavaScript品質管理 |
| Stylelint | ^16.21.0 | CSS品質管理 |
| Prettier | ^3.5.3 | コード整形 |
| Sharp | ^0.33.0 | 画像処理 |

## 📦 出力・デプロイ

- **出力先**: `htdocs/` ディレクトリ
- **アセット**: `htdocs/_assets/` 以下に整理
- **最適化**: 画像圧縮・WebP変換・コード最適化済み
- **静的ファイル**: そのままWebサーバーにアップロード可能

---


