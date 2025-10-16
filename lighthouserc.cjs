/**
 * Lighthouse CI設定 (CommonJS)
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 *
 * 注意: Lighthouse CIはCommonJSを要求するため、このファイルは.cjs拡張子を使用
 * test-config.jsからの読み込みは同期的に行えないため、URLは直接定義
 * 新しいページを追加する場合は、test-config.jsとこのファイル両方を更新してください
 */

// test-config.jsと同期してください
const TEST_PAGES = [{ path: "/" }, { path: "/about/" }, { path: "/sample/" }];

const STATIC_DIST_DIR = "./htdocs";

module.exports = {
  ci: {
    collect: {
      staticDistDir: STATIC_DIST_DIR,
      url: TEST_PAGES.map((page) => `http://localhost${page.path}index.html`),
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
    },
    assert: {
      preset: "lighthouse:recommended",
      assertMatrix: [
        {
          matchingUrlPattern: ".*",
          assertions: {
            "categories:performance": ["error", { minScore: 0.9 }],
            "categories:accessibility": ["error", { minScore: 0.9 }],
            "categories:best-practices": ["error", { minScore: 0.9 }],
            "categories:seo": ["error", { minScore: 0.9 }],
            "color-contrast": "off",
            "unused-javascript": "off",
            "uses-responsive-images": "off",
            "network-dependency-tree-insight": "off",
            "unminified-css": "off",
            "unused-css-rules": "off",
            "render-blocking-insight": "off",
            "image-delivery-insight": "off",
          },
        },
      ],
      level: "error", // warningレベルは無視、errorのみで失敗させる
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
