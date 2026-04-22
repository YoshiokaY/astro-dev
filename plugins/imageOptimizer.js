import fs from "fs";
import path from "path";
import sharp from "sharp";

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

        const files = findFiles(outputDir, [".jpg", ".jpeg", ".png"]);
        let compressedFiles = 0;
        let savedBytes = 0;

        for (const filePath of files) {
          const relativePath = path.relative(outputDir, filePath);
          if (shouldExclude(relativePath, options.excludePatterns)) {
            continue;
          }

          try {
            const originalBuffer = await fs.promises.readFile(filePath);
            const ext = path.extname(filePath).toLowerCase();
            let compressedBuffer;

            if (ext === ".jpg" || ext === ".jpeg") {
              compressedBuffer = await sharp(originalBuffer)
                .jpeg({ quality: options.jpeg.quality, mozjpeg: true })
                .toBuffer();
            } else if (ext === ".png") {
              compressedBuffer = await sharp(originalBuffer)
                .png({ quality: options.png.quality })
                .toBuffer();
            }

            if (compressedBuffer && compressedBuffer.length < originalBuffer.length) {
              await fs.promises.writeFile(filePath, compressedBuffer);
              savedBytes += originalBuffer.length - compressedBuffer.length;
              compressedFiles++;
            }
          } catch (error) {
            logger.warn(`圧縮失敗: ${relativePath} - ${error.message}`);
          }
        }

        const savedKB = (savedBytes / 1024).toFixed(1);
        logger.info(`画像圧縮完了: ${compressedFiles}/${files.length} ファイル処理済み (${savedKB}KB削減)`);
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
        let convertedFiles = 0;
        let excludedFiles = 0;

        for (const filePath of files) {
          const relativePath = path.relative(outputDir, filePath);

          if (shouldExclude(relativePath, options.excludePatterns)) {
            excludedFiles++;
            logger.info(`除外対象: ${relativePath}`);
            continue;
          }

          const webpPath = filePath + ".webp";

          // 既にWebPファイルが存在する場合はスキップ
          if (fs.existsSync(webpPath)) {
            continue;
          }

          try {
            await sharp(filePath)
              .webp({
                quality: options.webp.quality,
                effort: options.webp.effort,
              })
              .toFile(webpPath);

            convertedFiles++;

            // WebP変換成功後、オリジナルファイルを削除
            try {
              fs.unlinkSync(filePath);
            } catch (deleteError) {
              logger.warn(`オリジナルファイル削除失敗: ${relativePath} - ${deleteError.message}`);
            }
          } catch (error) {
            logger.warn(`WebP変換失敗: ${relativePath} - ${error.message}`);
          }
        }

        logger.info(
          `WebP変換完了: ${convertedFiles}/${files.length - excludedFiles} ファイル処理済み (${excludedFiles}ファイル除外)`,
        );
      },
    },
  };
}
