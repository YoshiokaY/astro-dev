import tailwindcss from "@tailwindcss/vite";
import viteImagemin from "@vheemstra/vite-plugin-imagemin";
import relativeLinks from "astro-relative-links";
import { defineConfig } from "astro/config";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import imageminWebp from "imagemin-webp";
import sassGlobImports from "vite-plugin-sass-glob-import";
import simpleWebpIntegration from "./plugins/convertWebp";

// Node.js環境変数から直接読み込み（astro.config.mjsはNode.js環境で実行される）
const OUTPUT_FORMAT = import.meta.env.VITE_OUTPUT_FORMAT || "html"; // デフォルトhtml
const COMPRESS_OUTPUT = import.meta.env.VITE_COMPRESS_OUTPUT !== "false"; // デフォルトtrue
const CSS_SPLIT = import.meta.env.VITE_CSS_SPLIT !== "false"; // デフォルトtrue
const IMAGEMIN = import.meta.env.VITE_IMAGEMIN !== "false"; // デフォルトtrue
const CONVERT_TO_WEBP = import.meta.env.VITE_CONVERT_TO_WEBP === "true"; // デフォルトfalse
const ASSETS_DIR = import.meta.env.VITE_ASSETS_DIR || "_assets"; // デフォルト_assets
const BASE_PATH = import.meta.env.VITE_BASE_PATH || "/"; // デフォルトルート相対
const USE_RELATIVE_PATHS = import.meta.env.VITE_USE_RELATIVE_PATHS === "true"; // デフォルトfalse

console.log("🔧 Astro設定情報:");
console.log(`  出力形式: ${OUTPUT_FORMAT}`);
console.log(`  コード圧縮: ${COMPRESS_OUTPUT ? "ON" : "OFF"}`);
console.log(`  画像圧縮: ${IMAGEMIN ? "ON" : "OFF"}`);
console.log(`  WebP変換: ${CONVERT_TO_WEBP ? "ON" : "OFF"}`);
console.log(`  アセットディレクトリ: ${ASSETS_DIR}`);
console.log(`  ベースパス: ${BASE_PATH}`);
console.log(`  相対パス: ${USE_RELATIVE_PATHS ? "ON" : "OFF"}`);

export default defineConfig({
  // ベースパスの設定
  base: BASE_PATH,

  // 出力ディレクトリ
  outDir: "./htdocs",

  // 公開ディレクトリ
  publicDir: "./src/public",

  // サイト設定
  site: import.meta.env.SITE_URL || "http://localhost:3000",

  // Astro統合
  integrations: [
    ...(CONVERT_TO_WEBP
      ? [
          simpleWebpIntegration({
            enableFallback: false, // 2025年推奨
            excludePatterns: [
              /^https?:\/\//, // 外部画像
              /\/og-/, // OG画像
              /\/favicon/, // ファビコン
              /\/apple-touch-icon/, // アップルタッチアイコン
              /\/android-chrome/, // Androidアイコン
              /noWebp/, // noWebpを含むファイル名は除外
            ],
            supportedExtensions: [".jpg", ".jpeg", ".png", ".gif"], // 変換対象
          }),
        ]
      : []),
    ...(USE_RELATIVE_PATHS ? [relativeLinks()] : []),
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
    port: parseInt(import.meta.env.DEV_PORT || "3000", 10),
    host: import.meta.env.DEV_HOST === "false" ? false : true,
    open: import.meta.env.DEV_OPEN === "true",
  },

  // Vite設定
  vite: {
    // 環境変数をクライアントサイドで使用可能に
    define: {
      __OUTPUT_FORMAT__: JSON.stringify(OUTPUT_FORMAT),
      __ASSETS_DIR__: JSON.stringify(ASSETS_DIR),
      __BASE_PATH__: JSON.stringify(BASE_PATH),
    },

    // ビルド設定でインライン化を制御
    build: {
      // インライン化閾値を0に設定（常に外部ファイル化）
      assetsInlineLimit: 0,
      cssCodeSplit: CSS_SPLIT,
      // 圧縮設定
      minify: COMPRESS_OUTPUT ? "esbuild" : false,
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

                // 空文字の場合はindex（トップページ）
                if (!pageName) pageName = "index";

                return `${ASSETS_DIR}/js/page-${pageName}.astro.js`;
              }

              // layouts配下のastroファイルからの生成の場合
              if (moduleId.includes("/src/layouts/") && moduleId.includes(".astro?astro&type=script")) {
                const astroPath = moduleId.split("?astro&type=script")[0];
                const relativePath = astroPath.split("/src/layouts/")[1];
                const layoutName = relativePath.replace(/\.astro$/, "");

                // Footer.astroの場合はcommon.astro.jsにする
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
            // .astroファイルから生成されるスクリプトの場合
            if (chunkInfo.name.includes("astro_type_script")) {
              const simpleName = chunkInfo.name.replace(/_astro_type_script_index_\d+_lang$/, "");
              return `${ASSETS_DIR}/js/${simpleName}.js`;
            }

            return `${ASSETS_DIR}/js/chunks/[name].js`;
          },

          // アセットファイル名
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.names[0];

            // 画像ファイル
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
              return `${ASSETS_DIR}/img/[name][extname]`;
            }

            // CSSファイル
            if (/css/i.test(ext)) {
              return `${ASSETS_DIR}/css/[name][extname]`;
            }

            // フォントファイル
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `${ASSETS_DIR}/fonts/[name][extname]`;
            }

            // その他のファイル
            return `${ASSETS_DIR}/[name][extname]`;
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
            @use "./src/scss/abstracts/_mixins.scss" as *;
            @use "./src/scss/abstracts/_variables.scss" as *;
            @use "./src/scss/abstracts/_config.scss" as *;
            @use "./src/scss/abstracts/_functions.scss" as *;
            @use "./src/scss/abstracts/_svg.scss" as *;
          `,
        },
      },
    },

    // プラグイン設定
    plugins: [
      // Tailwind CSS
      tailwindcss(),

      // SCSS Glob Import
      sassGlobImports(),

      // 画像最適化
      ...(IMAGEMIN
        ? [
            viteImagemin({
              plugins: {
                jpg: imageminMozjpeg({ quality: 85 }),
                png: imageminPngquant({ quality: [0.8, 0.9], speed: 4 }),
                svgo: imageminSvgo({
                  plugins: [
                    {
                      name: "removeViewBox",
                    },
                    {
                      name: "removeEmptyAttrs",
                      active: false,
                    },
                  ],
                }),
              },
              // Webp変換
              ...(CONVERT_TO_WEBP
                ? {
                    makeWebp: {
                      plugins: {
                        jpg: imageminWebp(),
                        png: imageminWebp(),
                      },
                    },
                  }
                : {}),
            }),
          ]
        : []),
    ],
    // 依存関係の最適化
    optimizeDeps: {
      include: ["jquery"],
    },
  },
});
