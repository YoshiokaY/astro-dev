import fs from "fs";
import path from "path";
import sharp from "sharp";
import { cacheKey, defaultConcurrency, mapWithConcurrency, readCache, toWebpPath, writeCache } from "./imageCache.js";

/**
 * 画像最適化設定のデフォルト値
 */
const defaultOptions = {
  jpeg: { quality: 85 },
  png: { quality: 80 },
  webp: { quality: 85, effort: 4 },
  excludePatterns: [
    /^https?:\/\//,
    /\/ogimg/,
    /\/favicon/,
    /\/apple-touch-icon/,
    /\/android-chrome/,
    /noWebp/,
  ],
};

/**
 * 指定ディレクトリから対象拡張子のファイルを再帰的に取得
 */
function findFiles(dir, extensions) {
  const results = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (extensions.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * 除外パターンに一致するかチェック
 */
function shouldExclude(filePath, excludePatterns) {
  return excludePatterns.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

/**
 * sharp を使った画像圧縮 Astro Integration
 * imagemin + vite-plugin-imagemin の代替
 */
export function sharpImageCompress(userOptions = {}) {
  const options = { ...defaultOptions, ...userOptions };

  return {
    name: "sharp-image-compress",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outputDir = dir.pathname;
        logger.info("画像圧縮処理を開始...");

        // 除外を先に弾いて処理対象だけにする
        const targets = findFiles(outputDir, [".jpg", ".jpeg", ".png"]).filter(
          (filePath) => !shouldExclude(path.relative(outputDir, filePath), options.excludePatterns),
        );

        let compressedFiles = 0;
        let cachedFiles = 0;
        let savedBytes = 0;

        await mapWithConcurrency(targets, defaultConcurrency(), async (filePath) => {
          const relativePath = path.relative(outputDir, filePath);
          try {
            const originalBuffer = await fs.promises.readFile(filePath);
            const ext = path.extname(filePath).toLowerCase();
            const params =
              ext === ".png"
                ? { format: "png", quality: options.png.quality }
                : { format: "jpeg", quality: options.jpeg.quality, mozjpeg: true };

            const key = cacheKey(originalBuffer, params);
            let outBuffer = await readCache(key);

            if (outBuffer) {
              cachedFiles++;
            } else {
              const compressedBuffer =
                params.format === "png"
                  ? await sharp(originalBuffer).png({ quality: options.png.quality }).toBuffer()
                  : await sharp(originalBuffer).jpeg({ quality: options.jpeg.quality, mozjpeg: true }).toBuffer();

              // 圧縮で小さくならなければ元バッファを採用（= キャッシュには「採用すべき最終バイト列」を保存）
              outBuffer =
                compressedBuffer.length < originalBuffer.length ? compressedBuffer : originalBuffer;
              await writeCache(key, outBuffer);
            }

            // 元より小さいときだけ書き込み（同サイズ＝改善なしなら no-op）
            if (outBuffer.length < originalBuffer.length) {
              await fs.promises.writeFile(filePath, outBuffer);
              savedBytes += originalBuffer.length - outBuffer.length;
              compressedFiles++;
            }
          } catch (error) {
            logger.warn(`圧縮失敗: ${relativePath} - ${error.message}`);
          }
        });

        const savedKB = (savedBytes / 1024).toFixed(1);
        logger.info(
          `画像圧縮完了: ${compressedFiles}/${targets.length} ファイル圧縮 (キャッシュ${cachedFiles}件, ${savedKB}KB削減)`,
        );
      },
    },
  };
}

/**
 * sharp を使った WebP 変換 Astro Integration
 * imagemin + imagemin-webp の代替
 */
export function sharpWebpConverter(userOptions = {}) {
  const options = { ...defaultOptions, ...userOptions };

  return {
    name: "sharp-webp-converter",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outputDir = dir.pathname;
        logger.info("WebP変換処理を開始...");

        const files = findFiles(outputDir, [".jpg", ".jpeg", ".png", ".gif"]);
        const webpDestinations = new Map(); // webpPath -> 変換元の相対パス（衝突検知用）

        // 除外を弾きつつ、変換先パスの衝突（例: logo.png と logo.jpg が同じ logo.webp）を検知
        const targets = [];
        let excludedFiles = 0;
        for (const filePath of files) {
          const relativePath = path.relative(outputDir, filePath);
          if (shouldExclude(relativePath, options.excludePatterns)) {
            excludedFiles++;
            logger.info(`除外対象: ${relativePath}`);
            continue;
          }

          const webpPath = toWebpPath(filePath);
          const conflict = webpDestinations.get(webpPath);
          if (conflict) {
            logger.warn(
              `WebP名衝突: ${relativePath} と ${conflict} が同じ ${path.relative(outputDir, webpPath)} に変換されます（後勝ちで上書き）`,
            );
          }
          webpDestinations.set(webpPath, relativePath);
          targets.push({ filePath, webpPath, relativePath });
        }

        const params = { format: "webp", quality: options.webp.quality, effort: options.webp.effort };
        let convertedFiles = 0;
        let cachedFiles = 0;

        await mapWithConcurrency(targets, defaultConcurrency(), async ({ filePath, webpPath, relativePath }) => {
          try {
            const originalBuffer = await fs.promises.readFile(filePath);
            const key = cacheKey(originalBuffer, params);
            let webpBuffer = await readCache(key);

            if (webpBuffer) {
              cachedFiles++;
            } else {
              webpBuffer = await sharp(originalBuffer)
                .webp({ quality: options.webp.quality, effort: options.webp.effort })
                .toBuffer();
              await writeCache(key, webpBuffer);
              convertedFiles++;
            }

            await fs.promises.writeFile(webpPath, webpBuffer);

            // WebP変換成功後、オリジナルファイルを削除（新命名では webpPath は必ず別名）
            if (webpPath !== filePath) {
              try {
                await fs.promises.unlink(filePath);
              } catch (deleteError) {
                logger.warn(`オリジナルファイル削除失敗: ${relativePath} - ${deleteError.message}`);
              }
            }
          } catch (error) {
            logger.warn(`WebP変換失敗: ${relativePath} - ${error.message}`);
          }
        });

        logger.info(
          `WebP変換完了: 新規${convertedFiles} / キャッシュ${cachedFiles} / 除外${excludedFiles} (対象${targets.length}件)`,
        );
      },
    },
  };
}
