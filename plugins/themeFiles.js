import fs from "fs";
import path from "path";

/**
 * src/public/wp 配下のテーマテンプレートファイルの配置を制御するプラグイン
 * - 静的ビルド時: outDirへコピーされた wp/ を削除（静的HTMLにテーマファイルは不要）
 * - WPビルド時: wp/wp-content/themes/{テーマ名}/ の中身をテーマルート（outDir直下）へ移動
 *
 * phpOutputプラグインより先に登録すること。
 * 先に手作りテンプレートを配置することで、phpOutput側の
 * 「既存のPHPテンプレートを優先」スキップ判定が有効になる。
 */
export default function themeFilesPlugin({ isWpOutput = false, themeName = "my-theme" } = {}) {
  return {
    name: "theme-files",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outputDir = dir.pathname;
        const wpDir = path.join(outputDir, "wp");

        if (!fs.existsSync(wpDir)) return;

        if (isWpOutput) {
          const themeSrc = path.join(wpDir, "wp-content/themes", themeName);

          if (fs.existsSync(themeSrc)) {
            await fs.promises.cp(themeSrc, outputDir, { recursive: true, force: true });
            logger.info(`📦 テーマテンプレート（src/public/wp）をテーマルートへ配置しました`);
          } else {
            logger.warn(`⚠️ src/public/wp 内にテーマ「${themeName}」が見つかりません`);
          }
        }

        // 移動済み・不要なwp/ディレクトリを削除
        await fs.promises.rm(wpDir, { recursive: true, force: true });
      },
    },
  };
}
