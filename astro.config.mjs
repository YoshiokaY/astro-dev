import tailwindcss from "@tailwindcss/vite";
import relativeLinks from "astro-relative-links";
import { defineConfig, fontProviders } from "astro/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sassGlobImports from "vite-plugin-sass-glob-import";
import simpleWebpIntegration from "./plugins/convertWebp";
import { sharpImageCompress, sharpWebpConverter } from "./plugins/imageOptimizer";

// .envファイルを読み込み、process.envにマージ
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=");
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}
const env = process.env;

const OUTPUT_FORMAT = env.VITE_OUTPUT_FORMAT || "html";
const COMPRESS_OUTPUT = env.VITE_COMPRESS_OUTPUT !== "false";
const CSS_SPLIT = env.VITE_CSS_SPLIT !== "false";
const IMAGEMIN = env.VITE_IMAGEMIN !== "false";
const CONVERT_TO_WEBP = env.VITE_CONVERT_TO_WEBP === "true";
const ASSETS_DIR = env.VITE_ASSETS_DIR || "_assets";
const BASE_PATH = env.VITE_BASE_PATH || "/";
const USE_RELATIVE_PATHS = env.VITE_USE_RELATIVE_PATHS === "true";
const SELF_HOSTED_FONTS = env.VITE_SELF_HOSTED_FONTS === "true";

console.log("🔧 Astro設定情報:");
console.log(`  出力形式: ${OUTPUT_FORMAT}`);
console.log(`  コード圧縮: ${COMPRESS_OUTPUT ? "ON" : "OFF"}`);
console.log(`  画像圧縮: ${IMAGEMIN ? "ON" : "OFF"}`);
console.log(`  WebP変換: ${CONVERT_TO_WEBP ? "ON" : "OFF"}`);
console.log(`  アセットディレクトリ: ${ASSETS_DIR}`);
console.log(`  ベースパス: ${BASE_PATH}`);
console.log(`  相対パス: ${USE_RELATIVE_PATHS ? "ON" : "OFF"}`);
console.log(`  フォント: ${SELF_HOSTED_FONTS ? "セルフホスティング" : "CDN"}`);

// 共通の除外パターン
const imageExcludePatterns = [
  /^https?:\/\//, // 外部画像
  /\/ogimg/, // OG画像
  /\/favicon/, // ファビコン
  /\/apple-touch-icon/, // アップルタッチアイコン
  /\/android-chrome/, // Androidアイコン
  /noWebp/, // noWebpを含むファイル名は除外
];

// アセットファイル名のカスタムロジック（SSR・クライアント両ビルドで共用）
const customAssetFileNames = (assetInfo) => {
  const fileName = assetInfo.names[0];

  // 画像ファイル
  if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(fileName)) {
    return `${ASSETS_DIR}/img/[name][extname]`;
  }

  // CSSファイル
  if (/css/i.test(fileName)) {
    return `${ASSETS_DIR}/css/[name][extname]`;
  }

  // フォントファイル
  if (/woff2?|eot|ttf|otf/i.test(fileName)) {
    return `${ASSETS_DIR}/fonts/[name][extname]`;
  }

  // その他のファイル
  return `${ASSETS_DIR}/[name][extname]`;
};

export default defineConfig({
  // ベースパスの設定
  base: BASE_PATH,

  // 出力ディレクトリ
  outDir: "./htdocs",

  // 公開ディレクトリ
  publicDir: "./src/public",

  // サイト設定
  site: env.SITE_URL || "http://localhost:3000",

  // Astro統合
  integrations: [
    ...(USE_RELATIVE_PATHS ? [relativeLinks()] : []),

    // WebP変換とパス書き換え
    ...(CONVERT_TO_WEBP
      ? [
          // 1. HTMLとCSS内の画像パスを書き換え
          simpleWebpIntegration({
            enableFallback: false, // 2025年推奨
            excludePatterns: [
              /^https?:\/\//, // 外部画像
              /\/ogimg/, // OG画像
              /\/favicon/, // ファビコン
              /\/apple-touch-icon/, // アップルタッチアイコン
              /\/android-chrome/, // Androidアイコン
              /noWebp/, // noWebpを含むファイル名は除外
            ],
            supportedExtensions: [".jpg", ".jpeg", ".png", ".gif"], // 変換対象
          }),
          // 2. 実際のWebPファイル生成（sharp）
          sharpWebpConverter({
            excludePatterns: imageExcludePatterns,
          }),
        ]
      : []),

    // 画像圧縮（WebP変換時は不要）
    ...(IMAGEMIN && !CONVERT_TO_WEBP
      ? [
          sharpImageCompress({
            jpeg: { quality: 85 },
            png: { quality: 80 },
            excludePatterns: imageExcludePatterns,
          }),
        ]
      : []),

    // Astro内部ファイルのクリーンアップ
    {
      name: "cleanup-astro-internal",
      hooks: {
        "astro:build:done": async ({ dir, logger }) => {
          const internalDir = path.join(dir.pathname, ".astro-internal");

          if (fs.existsSync(internalDir)) {
            fs.rmSync(internalDir, { recursive: true, force: true });
            // logger.info("🗑️ Astro internal files cleaned up");
          }
        },
      },
    },
  ],

  // ビルド設定
  build: {
    // アセットディレクトリ名
    assets: ASSETS_DIR,
    compressHTML: false,
  },

  // HTMLの圧縮設定
  compressHTML: COMPRESS_OUTPUT,

  // 開発サーバー設定
  server: {
    port: parseInt(env.DEV_PORT || "3000", 10),
    host: env.DEV_HOST === "false" ? false : true,
    open: env.DEV_OPEN === "true",
  },

  // Rustコンパイラの有効化
  experimental: {
    rustCompiler: true,
  },

  // フォント設定（Built-in Fonts API / セルフホスティング時のみ有効）
  ...(SELF_HOSTED_FONTS
    ? {
        fonts: [
          {
            provider: fontProviders.google(),
            name: "Noto Sans JP",
            cssVariable: "--font-noto-sans-jp",
          },
        ],
      }
    : {}),

  // Vite設定
  vite: {
    // 環境変数をクライアントサイドで使用可能に
    define: {
      __OUTPUT_FORMAT__: JSON.stringify(OUTPUT_FORMAT),
      __ASSETS_DIR__: JSON.stringify(ASSETS_DIR),
      __BASE_PATH__: JSON.stringify(BASE_PATH),
    },

    // ビルド設定（SSRビルド側にもassetFileNamesを適用）
    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: CSS_SPLIT,
      minify: COMPRESS_OUTPUT ? "esbuild" : false,
      rollupOptions: {
        output: {
          assetFileNames: customAssetFileNames,
        },
      },
    },

    // Astro 6 / Vite 7: クライアントビルドの出力設定は environments.client に配置
    environments: {
      client: {
        build: {
          rollupOptions: {
            output: {
              // JavaScriptファイル名
              entryFileNames: (chunkInfo) => {
                // Astroページからの<script>タグの処理
                if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.includes("?astro&type=script")) {
                  const moduleId = chunkInfo.facadeModuleId;

                  // pages配下のastroファイルからの生成の場合
                  if (moduleId.includes("/src/pages/") && moduleId.includes(".astro?astro&type=script")) {
                    const astroPath = moduleId.split("?astro&type=script")[0];
                    const relativePath = astroPath.split("/src/pages/")[1];
                    let pageName = relativePath
                      .replace(/\.astro$/, "")
                      .replace(/\/index$/, "")
                      .replace(/\//g, "-");

                    if (!pageName) pageName = "index";

                    return `${ASSETS_DIR}/js/page-${pageName}.astro.js`;
                  }

                  // layouts配下のastroファイルからの生成の場合
                  if (moduleId.includes("/src/layouts/") && moduleId.includes(".astro?astro&type=script")) {
                    const astroPath = moduleId.split("?astro&type=script")[0];
                    const relativePath = astroPath.split("/src/layouts/")[1];
                    const layoutName = relativePath.replace(/\.astro$/, "");

                    const fileName = layoutName === "Layout" ? "common" : layoutName;

                    return `${ASSETS_DIR}/js/${fileName}.astro.js`;
                  }
                }

                // .astroファイルから生成されるスクリプトの場合（フォールバック）
                if (chunkInfo.name.includes("astro_type_script")) {
                  const simpleName = chunkInfo.name.replace(/_astro_type_script_index_\d+_lang$/, "");
                  return `${ASSETS_DIR}/js/${simpleName}.js`;
                }

                // JSファイル自体からの命名処理（src/js配下のファイル）
                if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.includes("/src/js/")) {
                  const jsPath = chunkInfo.facadeModuleId.split("/src/js/")[1];
                  const jsName = jsPath.replace(/\.(js|ts)$/, "");

                  return `${ASSETS_DIR}/js/${jsName}.js`;
                }

                return `${ASSETS_DIR}/js/[name].js`;
              },

              // チャンクファイル名
              chunkFileNames: (chunkInfo) => {
                if (chunkInfo.name && (chunkInfo.name.includes("astro") || chunkInfo.name === "Layout")) {
                  return `.astro-internal/[name].js`;
                }

                return `${ASSETS_DIR}/js/chunks/[name].js`;
              },

              // アセットファイル名（共通関数を使用）
              assetFileNames: customAssetFileNames,
            },
          },
        },
      },
    },
    // CSS設定
    css: {
      preprocessorOptions: {
        scss: {
          // SCSSのグローバル変数
          additionalData: `
            $assets-dir: "${ASSETS_DIR}";
            $base-path: "${BASE_PATH}";
            @use "${path.resolve("src/scss/abstracts/_mixins.scss")}" as *;
            @use "${path.resolve("src/scss/abstracts/_variables.scss")}" as *;
            @use "${path.resolve("src/scss/abstracts/_functions.scss")}" as *;
            @use "${path.resolve("src/scss/abstracts/_svg.scss")}" as *;
          `,
        },
      },
    },

    // プラグイン設定
    plugins: [
      // Astro 6がクライアントビルドのminifyをハードコードするため、プラグインで上書き
      ...(!COMPRESS_OUTPUT
        ? [
            {
              name: "override-client-minify",
              config(config) {
                if (config.environments?.client?.build) {
                  config.environments.client.build.minify = false;
                }
              },
            },
          ]
        : []),

      // Tailwind CSS
      tailwindcss(),

      // SCSS Glob Import
      sassGlobImports(),

    ],
    // 依存関係の最適化
    optimizeDeps: {
      include: ["jquery"],
    },
  },
});
