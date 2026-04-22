# astro-dev
コンポーネント指向のAstro開発環境

## 🎯 概要

企業サイトや静的サイト制作に最適化されたAstro.js開発環境です。再利用可能なコンポーネント設計を中心とした高速な開発体験と本格的な画像最適化機能を備えています。

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

### 🎨 コンポーネント設計
- **再利用可能なコンポーネント** - モジュール化された編集可能なUIパーツ
- **レイアウトコンポーネント** - 共通レイアウトの統一管理
- **パーツコンポーネント** - ページ固有の部品管理
- **レスポンシブ対応** - モバイルファースト設計
- **jQuery** - レガシーライブラリサポート
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
├── components/             # 再利用可能なコンポーネント
│   ├── Breadcrumbs.astro   # パンくずリスト
│   ├── Picture.astro       # 画像コンポーネント（WebP対応）
│   ├── SetTime.astro       # 日時表示コンポーネント
│   └── LowerTitle.astro    # 下層ページタイトル
├── layouts/                # レイアウトコンポーネント
│   ├── Layout.astro        # 🔧 メインレイアウト（編集の起点）
│   ├── Common.astro        # サイト共通設定・変数
│   ├── Head.astro          # head要素の管理
│   ├── Header.astro        # 🎨 ヘッダー（編集可能）
│   ├── Footer.astro        # 🎨 フッター（編集可能）
│   ├── BeginHead.astro     # headタグ開始直後の挿入エリア
│   ├── BeginBody.astro     # bodyタグ開始直後の挿入エリア
│   └── JsonLd.astro        # 構造化データ
├── pages/                  # ページとコンポーネントパーツ
│   ├── index.astro         # 🏠 トップページ
│   ├── hoge/               # 📄 サブページディレクトリ
│   │   └── index.astro     # サブページ
│   └── _parts/             # 📦 ページ固有コンポーネント
│       ├── _top/           # トップページ専用パーツ
│       │   └── _about.astro # About セクション
│       └── _hoge/          # hogeページ専用パーツ
│           └── _hoge.astro # Hoge セクション
├── scss/                   # スタイルシート（コンポーネント対応）
│   ├── abstracts/          # 設計トークン
│   │   ├── _variables.scss # 🎨 デザイントークン（編集推奨）
│   │   ├── _mixins.scss    # 共通mixin
│   │   ├── _functions.scss # SCSS関数
│   │   └── _config.scss    # 設定値
│   ├── base/               # ベーススタイル
│   ├── components/         # 🧩 コンポーネント専用スタイル
│   │   ├── _c_ttl.scss     # タイトルコンポーネント
│   │   └── _c_bread.scss   # パンくずコンポーネント
│   ├── layouts/            # レイアウト専用スタイル
│   │   ├── _l_header.scss  # ヘッダーレイアウト
│   │   ├── _l_footer.scss  # フッターレイアウト
│   │   └── _l_main.scss    # メインレイアウト
│   ├── pages/              # ページ固有スタイル
│   │   ├── _top.scss       # トップページ
│   │   └── _sample.scss    # サンプルページ
│   └── vendors/            # 外部ライブラリ
├── js/                     # JavaScript（コンポーネント対応）
│   ├── app.js              # 🔧 メインJS（編集の起点）
│   └── class/              # クラス定義・モジュール
└── public/                 # 静的ファイル
    ├── _assets/img/        # 🖼️ 画像アセット
    └── favicon.ico         # ファビコン
```

## 🚀 開発開始

### 必要な環境
- Node.js >= 18.0.0
- npm >= 8.0.0

### セットアップ
```bash
# 依存関係をインストール
npm install

# 環境変数ファイルを作成（初回のみ）
cp .env.example .env

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

`.env` ファイルはGit管理対象外です。初回セットアップ時にテンプレートからコピーしてください。

```bash
# .env ファイルを作成
cp .env.example .env
```

```bash
# .env ファイルで設定可能
VITE_COMPRESS_OUTPUT=true     # コード圧縮（デフォルト: true）
VITE_CSS_SPLIT=false          # CSS分離（デフォルト: false = 全てのcssファイルを統合）
VITE_IMAGEMIN=true            # 画像最適化（デフォルト: true）
VITE_CONVERT_TO_WEBP=true     # WebP変換（デフォルト: true）
VITE_ASSETS_DIR=assets        # アセットディレクトリ名
VITE_BASE_PATH=/              # ベースパス
VITE_USE_RELATIVE_PATHS=false # 相対パス使用（デフォルト: false = ルート相対）
```

> **注意**: `.env` にAPIキーやパスワードなどの機密情報を追加した場合でも、Git管理外のため安全です。設定項目を追加する際は `.env.example` にもテンプレートとして反映してください。

### サイト設定
- **共通設定**: `src/layouts/Common.astro` でサイト名、ドメイン、メニューを設定
- **レイアウト**: `src/layouts/Layout.astro` でページ共通レイアウト
- **スタイル**: `src/scss/abstracts/_variables.scss` でグローバル変数

## 📦 出力・デプロイ

- **出力先**: `htdocs/` ディレクトリ
- **アセット**: `htdocs/_assets/` 以下に整理
- **最適化**: 画像圧縮・WebP変換・コード最適化済み
- **静的ファイル**: そのままWebサーバーにアップロード可能


## 🛠️ コンポーネント編集ガイド

### 編集の起点となるファイル

#### 🎨 デザイン・スタイル編集
- **グローバル変数**: `src/scss/abstracts/_variables.scss`
  - カラー、フォント、サイズなどのデザイントークン
- **メインレイアウト**: `src/layouts/Layout.astro`
  - ページ全体の構造とメタデータ
- **ヘッダー**: `src/layouts/Header.astro`
- **フッター**: `src/layouts/Footer.astro`

#### 📄 ページコンテンツ編集
- **トップページ**: `src/pages/index.astro`
- **ページ固有パーツ**: `src/pages/_parts/` 配下のコンポーネント
- **新規ページ**: `src/pages/` に `.astro` ファイルを作成

#### 🧩 再利用コンポーネント編集
- **共通コンポーネント**: `src/components/` 配下
- **対応するスタイル**: `src/scss/components/` 配下

### 開発ワークフロー

#### 1. 🚀 開発開始
```bash
# セットアップ
npm install

# 開発サーバー起動
npm start
```

#### 2. ⚙️ 環境設定
```bash
# .env ファイル作成・編集
VITE_COMPRESS_OUTPUT=true      # コード圧縮
VITE_IMAGEMIN=true             # 画像最適化
VITE_CONVERT_TO_WEBP=true      # WebP変換
VITE_ASSETS_DIR=_assets        # アセットディレクトリ名
VITE_BASE_PATH=/               # ベースパス
VITE_USE_RELATIVE_PATHS=false  # 相対パス使用
```

#### 3. 🌐 サイト全体設定
```bash
# サイト基本情報・メニュー設定
src/layouts/Common.astro

# グローバル設定値
src/scss/abstracts/_config.scss
```

#### 4. 🎨 デザイン・レイアウト編集
```bash
# メインレイアウト編集
src/layouts/Layout.astro        # ページ構造
src/layouts/Header.astro        # ヘッダー
src/layouts/Footer.astro        # フッター

```

#### 5. 📄 ページ・コンテンツ編集
```bash
# 新規ページ作成
src/pages/new-page/index.astro

# ページ固有パーツ作成
src/pages/_parts/_new-page/_section.astro

# 対応スタイル作成
src/scss/pages/_new-page.scss
```

#### 6. 🧩 コンポーネント開発
```bash
# 再利用コンポーネント作成
src/components/NewComponent.astro

# コンポーネントスタイル
src/scss/components/_c_new.scss
```

#### 7. ✅ 品質チェック
```bash
# コード品質チェック
npm run lint:all

```

#### 8. 🚀 デプロイ準備
```bash
# 本番ビルド
npm run build

# プレビュー確認
npm run preview

# htdocs/ ディレクトリをサーバーにアップロード
```

### コンポーネント作成の流れ

1. **新しいコンポーネント作成**
   ```astro
   <!-- src/components/NewComponent.astro -->
   ---
   export interface Props {
     title: string;
     className?: string;
   }
   const { title, className = '' } = Astro.props;
   ---

   <div class={`new-component ${className}`}>
     <h2>{title}</h2>
   </div>
   ```

2. **専用スタイル作成**
   ```scss
   // src/scss/components/_c_new.scss
   .new-component {
     // コンポーネント専用スタイル
   }
   ```

3. **ページで使用**
   ```astro
   ---
   import NewComponent from '@/components/NewComponent.astro';
   ---
   <NewComponent title="タイトル" />
   ```

## 💡 よくある編集パターン

### トップページのセクション追加
```astro
<!-- src/pages/_parts/_top/_new-section.astro -->
---
export interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---

<section class="new-section">
  <div class="container">
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
</section>
```

### グローバル色の変更
```scss
// src/scss/abstracts/_variables.scss
--color-prime: #ff0;    // プライマリーカラー
--color-second: #f00;  // セカンダリーカラー
--color-txt: #333;     // アクセントカラー
```

### 新しいページの作成
1. `src/pages/new-page/index.astro` を作成
2. 必要に応じて `src/pages/_parts/_new-page/` ディレクトリを作成
3. 専用スタイルを `src/scss/pages/_new-page.scss` に作成

## ⚠️ 注意事項

### WebP変換について
- **除外ファイル**: ファイル名に `noWebp` を含む画像は自動でWebP変換から除外されます
- **OGP画像**: `/ogimg/`、`/favicon/`、`/apple-touch-icon/`、`/android-chrome/` パスの画像は除外対象
- **外部画像**: `https://` で始まる外部画像URLは変換されません

### スタイル設定
- **CSS Custom Properties**: `--color-*` 形式で定義されています（例: `--color-prime`）
- **Tailwind使用**: `text-prime`、`bg-prime`、`text-h1` 等のクラス名で使用可能
- **SCSS使用**: `color: $color-prime;`、`font-size: text-h1;` 等で使用可能
- **フォントサイズ**: PC/SP のレスポンシブ対応済み（`$h1: 64, 40` = PC:64px, SP:40px）
- **単位**: rem基準（1px = 0.1rem）の相対表記を使用

---
