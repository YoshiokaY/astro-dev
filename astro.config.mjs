import tailwindcss from "@tailwindcss/vite";
import viteImagemin from "@vheemstra/vite-plugin-imagemin";
import relativeLinks from "astro-relative-links";
import { defineConfig } from "astro/config";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import imageminWebp from "imagemin-webp";
import simpleWebpIntegration from "./plugins/convertWebp";

const COMPRESS_OUTPUT = import.meta.env.VITE_COMPRESS_OUTPUT !== "false"; // デフォルトtrue
const CSS_SPLIT = import.meta.env.VITE_CSS_SPLIT !== "false"; // デフォルトtrue
const IMAGEMIN = import.meta.env.VITE_IMAGEMIN !== "false"; // デフォルトtrue
const CONVERT_TO_WEBP = import.meta.env.VITE_CONVERT_TO_WEBP !== "false"; // デフォルトtrue
const ASSETS_DIR = import.meta.env.VITE_ASSETS_DIR || "assets";
const BASE_PATH = import.meta.env.VITE_BASE_PATH || "/";
const USE_RELATIVE_PATHS = import.meta.env.VITE_USE_RELATIVE_PATHS === "true"; // デフォルトfalse

console.log("🔧 Astro設定情報:");
console.log(`  コード圧縮: ${COMPRESS_OUTPUT ? "ON" : "OFF"}`);
console.log(`  CSS分離: ${CSS_SPLIT ? "ON" : "OFF"}`);
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
            return `${ASSETS_DIR}/js/[name].js`;
          },

          // チャンクファイル名
          // chunkFileNames: (chunkInfo) => {
          //   return `${ASSETS_DIR}/js/chunks/[name].js`;
          // },

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
            @use "./src/scss/abstracts/_mixins.scss" as *;
            @use "./src/scss/abstracts/_variables.scss" as *;
            @use "./src/scss/abstracts/_functions.scss" as *;
          `,
        },
      },
    },

    // プラグイン設定
    plugins: [
      // Tailwind CSS
      tailwindcss(),

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
