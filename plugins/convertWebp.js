import fs from "fs";
import path from "path";

/**
 * シンプルWebP統合 - パス書き換え版
 * ファイル検索不要、HTMLとCSS内の画像パスに.webpを追加するだけ
 */
function simpleWebpIntegration(options = {}) {
  const {
    enableFallback = false,
    excludePatterns = [
      /^https?:\/\//, // 絶対URL（OG画像など）
      /\/ogImg/, // OG画像
      /\/favicon/, // ファビコン
      /\/apple-touch-icon/, // アップルタッチアイコン
      /\/android-chrome/, // Androidアイコン
      /noWebp/, // noWebpを含むファイル名は除外
    ],
    supportedExtensions = [".jpg", ".jpeg", ".png", ".gif"], // WebP変換対象の拡張子
  } = options;

  return {
    name: "simple-webp-integration",
    hooks: {
      // Astroビルド完全完了後のフック
      "astro:build:done": async ({ dir, pages, routes, logger }) => {
        // logger.info("🖼️ シンプルWebP統合処理を開始...");

        try {
          const outputDir = dir.pathname;
          // logger.info(`📁 出力ディレクトリ: ${outputDir}`);

          // HTMLファイルを処理
          await processAllFiles(outputDir, enableFallback, excludePatterns, supportedExtensions, logger);

          // logger.info("✅ シンプルWebP統合処理が完了しました");
        } catch (error) {
          logger.error("❌ シンプルWebP統合処理でエラーが発生:");
          logger.error(error.message);
          logger.warn("⚠️ WebP変換をスキップして続行します");
        }
      },
    },
  };
}

/**
 * ファイルを再帰的に取得（改良版）
 */
async function getAllFiles(dir, baseDir = null, files = []) {
  // ベースディレクトリが指定されていない場合は現在のディレクトリを使用
  if (baseDir === null) {
    baseDir = dir;
  }

  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // サブディレクトリを再帰的に処理
        await getAllFiles(fullPath, baseDir, files);
      } else {
        // ベースディレクトリからの相対パスで保存
        const relativePath = path.relative(baseDir, fullPath);
        files.push(relativePath.replace(/\\/g, "/"));
      }
    }
  } catch (error) {
    console.error(`ディレクトリ読み取りエラー: ${dir}`, error.message);
  }

  return files;
}

/**
 * 全ファイルを処理（HTML + CSS）
 */
async function processAllFiles(outputDir, enableFallback, excludePatterns, supportedExtensions, logger) {
  try {
    // logger.info(`🔍 ファイル検索開始: ${outputDir}`);
    const files = await getAllFiles(outputDir);

    // logger.info(`📁 発見したファイル総数: ${files.length}`);

    // ファイル一覧をログ出力（最初の10件）
    // if (files.length > 0) {
    //   logger.info('📄 ファイル一覧（抜粋）:');
    //   files.slice(0, 10).forEach(file => logger.info(`  - ${file}`));
    //   if (files.length > 10) {
    //     logger.info(`  ... 他${files.length - 10}ファイル`);
    //   }
    // }

    const htmlFiles = files.filter((f) => f.endsWith(".html") || f.endsWith(".php"));
    const cssFiles = files.filter((f) => f.endsWith(".css"));

    // logger.info(`📝 HTMLファイル: ${htmlFiles.length}個を処理中...`);
    // if (htmlFiles.length > 0) {
    //   htmlFiles.forEach(file => logger.info(`  📄 ${file}`));
    // }

    // logger.info(`🎨 CSSファイル: ${cssFiles.length}個を処理中...`);
    // if (cssFiles.length > 0) {
    //   cssFiles.forEach(file => logger.info(`  🎨 ${file}`));
    // }

    // HTMLファイル処理
    for (const htmlFile of htmlFiles) {
      await processHtmlFile(path.join(outputDir, htmlFile), enableFallback, excludePatterns, supportedExtensions, logger);
    }

    // CSSファイル処理
    for (const cssFile of cssFiles) {
      await processCssFile(path.join(outputDir, cssFile), excludePatterns, supportedExtensions, logger);
    }

    // logger.info('✅ 全ファイル処理完了');
  } catch (error) {
    logger.error("ファイル処理エラー:", error);
  }
}

/**
 * 個別のHTMLファイルを処理
 */
async function processHtmlFile(filePath, enableFallback, excludePatterns, supportedExtensions, logger) {
  try {
    let content = await fs.promises.readFile(filePath, "utf-8");
    let modified = false;

    // img要素のsrc属性を処理
    content = content.replace(/<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi, (match, before, src, after) => {
      const result = processImageTag(match, before, src, after, enableFallback, excludePatterns, supportedExtensions);
      if (result !== match) modified = true;
      return result;
    });

    // source要素のsrcset属性を処理
    content = content.replace(/<source([^>]*)\ssrcset=["']([^"']+)["']([^>]*)>/gi, (match, before, srcset, after) => {
      const result = processSourceTag(match, before, srcset, after, excludePatterns, supportedExtensions);
      if (result !== match) modified = true;
      return result;
    });

    // CSS内のurl()を処理
    const originalContent = content;
    content = processCssUrls(content, excludePatterns, supportedExtensions);
    if (content !== originalContent) modified = true;

    // ファイルが変更された場合のみ書き込み
    if (modified) {
      await fs.promises.writeFile(filePath, content, "utf-8");
      // logger.info(`📝 更新: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    logger.error(`HTMLファイル処理エラー (${filePath}):`, error.message);
  }
}

/**
 * 個別のCSSファイルを処理
 */
async function processCssFile(filePath, excludePatterns, supportedExtensions, logger) {
  try {
    let content = await fs.promises.readFile(filePath, "utf-8");
    let modified = false;

    // CSS内のurl()を処理
    const originalContent = content;
    content = processCssUrls(content, excludePatterns, supportedExtensions);
    if (content !== originalContent) modified = true;

    // ファイルが変更された場合のみ書き込み
    if (modified) {
      await fs.promises.writeFile(filePath, content, "utf-8");
      // logger.info(`🎨 CSS更新: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    logger.error(`CSSファイル処理エラー (${filePath}):`, error.message);
  }
}

/**
 * 画像タグを処理
 */
function processImageTag(match, before, src, after, enableFallback, excludePatterns, supportedExtensions) {
  // 除外パターンをチェック
  if (shouldExclude(src, excludePatterns)) {
    return match;
  }

  // 対象拡張子かチェック
  const webpSrc = convertToWebpPath(src, supportedExtensions);
  if (!webpSrc) {
    return match; // 対象外の画像
  }

  // フォールバック設定に応じて処理
  if (enableFallback) {
    return createPictureElement(webpSrc, src, before + after);
  } else {
    // 直接WebPに置換
    return `<img${before} src="${webpSrc}"${after}>`;
  }
}

/**
 * source要素のsrcset属性を処理
 */
function processSourceTag(match, before, srcset, after, excludePatterns, supportedExtensions) {
  // srcsetは複数のソースを含む可能性があるため、分割して処理
  const sources = srcset.split(",").map((source) => source.trim());
  let modified = false;

  const processedSources = sources.map((source) => {
    // "画像パス サイズ記述子" の形式を分析
    const parts = source.split(/\s+/);
    const imagePath = parts[0];
    const descriptor = parts.slice(1).join(" ");

    // 除外パターンをチェック
    if (shouldExclude(imagePath, excludePatterns)) {
      return source;
    }

    // 対象拡張子かチェック
    const webpPath = convertToWebpPath(imagePath, supportedExtensions);
    if (!webpPath) {
      return source; // 対象外の画像
    }

    modified = true;
    return descriptor ? `${webpPath} ${descriptor}` : webpPath;
  });

  if (!modified) {
    return match;
  }

  const newSrcset = processedSources.join(", ");
  return `<source${before} srcset="${newSrcset}"${after}>`;
}

/**
 * CSS内のurl()を処理
 */
function processCssUrls(content, excludePatterns, supportedExtensions) {
  return content.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, url) => {
    if (shouldExclude(url, excludePatterns)) {
      return match;
    }

    const webpUrl = convertToWebpPath(url, supportedExtensions);
    if (webpUrl) {
      // 元のurl()の引用符スタイルを保持
      if (match.includes('"')) {
        return `url("${webpUrl}")`;
      } else if (match.includes("'")) {
        return `url('${webpUrl}')`;
      } else {
        return `url(${webpUrl})`;
      }
    }

    return match;
  });
}

/**
 * 画像パスをWebPパスに変換
 */
function convertToWebpPath(imagePath, supportedExtensions) {
  // 対象拡張子かチェック
  const hasTargetExtension = supportedExtensions.some((ext) => imagePath.toLowerCase().endsWith(ext.toLowerCase()));

  if (!hasTargetExtension) {
    return null; // 対象外
  }

  // パスの末尾に.webpを追加
  return imagePath + ".webp";
}

/**
 * 除外すべきパスかチェック
 */
function shouldExclude(src, excludePatterns) {
  return excludePatterns.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(src);
    }
    return src.includes(pattern);
  });
}

/**
 * picture要素を作成
 */
function createPictureElement(webpSrc, originalSrc, imgAttributes) {
  return `<picture>
  <source srcset="${webpSrc}" type="image/webp">
  <img${imgAttributes} src="${originalSrc}">
</picture>`;
}

export default simpleWebpIntegration;
