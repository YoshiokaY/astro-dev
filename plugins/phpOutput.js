import fg from "fast-glob";
import fs from "fs";
import path from "path";

/**
 * 改良版PHP出力プラグイン
 * astro:build:done フックでHTMLファイルをPHPに変換
 * header.php / footer.php を自動抽出し、ページテンプレートに分割
 */
function phpOutputPlugin(options = {}) {
  const {
    // 変換条件の設定
    convertConditions = [{ pattern: "**/wp-content/**/*.html", type: "wordpress" }],
    // WordPress用の設定
    adjustAssetPaths = true,
    // header/footer分割
    splitHeaderFooter = true,
  } = options;

  return {
    name: "improved-php-output",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        logger.info("🔌 PHP変換処理を開始...");

        try {
          const outputDir = dir.pathname;

          // 変換対象ファイルを検索
          for (const condition of convertConditions) {
            const { pattern } = condition;
            const files = await fg.glob(pattern, {
              cwd: outputDir,
              absolute: true,
            });

            if (files.length === 0) {
              logger.info(`ℹ️ パターン "${pattern}" に一致するファイルなし`);
              continue;
            }

            // header.php / footer.php をまだ生成していない場合、最初のファイルから抽出
            let headerFooterGenerated = false;
            // wp-templateコメントで生成済みのテンプレートを追跡（重複スキップ用）
            const generatedTemplates = new Set();

            for (const file of files) {
              let content = await fs.promises.readFile(file, "utf-8");

              // header.php / footer.php を最初の完全なHTMLから生成（スキップ判定より先に実行）
              if (splitHeaderFooter && !headerFooterGenerated && isFullHtmlDocument(content)) {
                let processed = content.replace(/&gt;/g, ">");
                if (adjustAssetPaths) {
                  processed = adjustAssetPathsForWordPress(processed, file);
                }
                await generateHeaderPhp(processed, outputDir, logger);
                await generateFooterPhp(processed, outputDir, logger);
                headerFooterGenerated = true;
              }

              // wp-template metaタグを検出（例: <meta name="wp-template" content="single-news">）
              const wpTemplate = extractWpTemplate(content);

              // 同一wp-templateが既に生成済みならスキップ（動的ルートの2つ目以降）
              if (wpTemplate && generatedTemplates.has(wpTemplate)) {
                logger.info(`⏭️ スキップ: ${path.relative(outputDir, file)}（${wpTemplate}.php は生成済み）`);
                await fs.promises.unlink(file);
                await cleanupEmptyDir(file, getPhpFilePath(file));
                continue;
              }

              // サブディレクトリのindex.html → page-{slug}.php（テーマルート直下）
              // wp-templateがある場合はそちらを優先
              const phpFilePath = wpTemplate
                ? getWpTemplatePhpPath(file, wpTemplate)
                : getPhpFilePath(file);

              // 既にPHPファイルが存在する場合はスキップ（publicDir からコピーされた手作りテンプレートを優先）
              try {
                await fs.promises.access(phpFilePath);
                logger.info(`⏭️ スキップ: ${path.relative(outputDir, phpFilePath)}（既存のPHPテンプレートを優先）`);
                await fs.promises.unlink(file);
                await cleanupEmptyDir(file, phpFilePath);
                if (wpTemplate) generatedTemplates.add(wpTemplate);
                continue;
              } catch {
                // PHPファイルが存在しない → 変換処理を実行
              }

              // 実体参照を元に戻す
              content = content.replace(/&gt;/g, ">");

              // wp-template metaタグを出力から除去
              content = content.replace(/<meta\s+name=["']wp-template["']\s+content=["'][^"']+["'][^>]*>\s*/gi, "");

              // アセットパスの調整
              if (adjustAssetPaths) {
                content = adjustAssetPathsForWordPress(content, file);
              }

              // ページテンプレートに変換
              const templateName = getTemplateName(phpFilePath);
              const pageContent = splitHeaderFooter ? extractPageContent(content, templateName) : extractBodyContent(content);

              await fs.promises.writeFile(phpFilePath, pageContent, "utf-8");
              await fs.promises.unlink(file);

              await cleanupEmptyDir(file, phpFilePath);

              if (wpTemplate) {
                generatedTemplates.add(wpTemplate);
                logger.info(`📄 ${path.basename(phpFilePath)} を生成しました（wp-template: ${wpTemplate}）`);
              }
            }
          }

          // CSS/JSファイルのパス調整
          await adjustAssetFiles(dir.pathname);

          logger.info("✅ PHP変換処理が完了しました");
        } catch (error) {
          logger.error("❌ PHP変換処理でエラーが発生:", error);
          throw error;
        }
      },
    },
  };
}

/**
 * HTMLコンテンツから wp-template 目印を検出
 * <meta name="wp-template" content="single-news"> 形式
 * @return {string|null} テンプレート名（例: "single-news", "archive-news"）
 */
function extractWpTemplate(content) {
  const match = content.match(/<meta\s+name=["']wp-template["']\s+content=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

/**
 * wp-templateコメントからPHPファイルパスを決定
 * テーマルート直下に {template}.php を配置
 * 例: "single-news" → /themes/my-theme/single-news.php
 */
function getWpTemplatePhpPath(file, wpTemplate) {
  // テーマルートを特定（wp-content/themes/xxx/）
  const themeRootMatch = file.match(/(.*\/wp-content\/themes\/[^/]+)\//);
  if (themeRootMatch) {
    return path.join(themeRootMatch[1], `${wpTemplate}.php`);
  }
  // フォールバック: ファイルと同階層
  return path.join(path.dirname(file), `${wpTemplate}.php`);
}

/**
 * HTMLファイルパスから出力先PHPファイルパスを決定
 * サブディレクトリのindex.html → page-{slug}.php（テーマルート直下）
 * ルート直下のindex.html → index.php
 */
function getPhpFilePath(file) {
  const dir = path.dirname(file);
  const basename = path.basename(file, ".html");

  if (basename === "index") {
    // テーマルート直下のindex.html → front-page.php
    if (/wp-content\/themes\/[^/]+$/.test(dir)) {
      return path.join(dir, "front-page.php");
    }
    // サブディレクトリのindex.html → page-{slug}.php（親ディレクトリに配置）
    const slug = path.basename(dir);
    return path.join(path.dirname(dir), `page-${slug}.php`);
  }

  // それ以外はそのまま .html → .php
  return file.replace(/\.html$/, ".php");
}

/**
 * 変換で空になったサブディレクトリをテーマルートまで再帰的に削除
 */
async function cleanupEmptyDir(originalFile, phpFilePath) {
  const themeRoot = path.dirname(phpFilePath).match(/(.*\/wp-content\/themes\/[^/]+)/)?.[1] || path.dirname(phpFilePath);
  let dir = path.dirname(originalFile);

  while (dir !== themeRoot && dir.startsWith(themeRoot + "/")) {
    try {
      const remaining = await fs.promises.readdir(dir);
      if (remaining.length === 0) {
        await fs.promises.rmdir(dir);
        dir = path.dirname(dir);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
}

/**
 * PHPファイルパスからTemplate Nameを生成
 * page-{slug}.php → "Slug"（先頭大文字）
 * front-page.php / index.php → null（Template Name不要）
 */
function getTemplateName(phpFilePath) {
  const filename = path.basename(phpFilePath, ".php");
  const match = filename.match(/^page-(.+)$/);
  if (!match) return null;
  const slug = match[1];
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

/**
 * 完全なHTML文書かどうかを判定
 */
function isFullHtmlDocument(content) {
  return content.includes("<!DOCTYPE html") || content.includes("<html");
}

/**
 * header.php を生成
 * DOCTYPE 〜 </header> まで
 */
async function generateHeaderPhp(content, outputDir, logger) {
  const bodyMatch = content.match(/<body[^>]*>/i);
  const bodyTag = bodyMatch ? bodyMatch[0] : "<body>";

  // headセクションを抽出
  const headMatch = content.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headContent = headMatch ? headMatch[1] : "";

  // </header>の位置を見つける
  const headerEndIndex = content.indexOf("</header>");
  if (headerEndIndex === -1) {
    logger.warn("⚠️ <header>タグが見つかりません。header.phpの生成をスキップします。");
    return;
  }

  // body開始からheader終了まで
  const bodyStartIndex = content.indexOf(bodyTag);
  const afterBody = content.substring(bodyStartIndex + bodyTag.length, headerEndIndex + "</header>".length);

  const headerPhp = `<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${cleanHeadContent(headContent)}
<?php wp_head(); ?>
</head>
${bodyTag}
${afterBody}
`;

  const headerPath = path.join(outputDir, "header.php");

  // 既にheader.phpが存在する場合はスキップ
  try {
    await fs.promises.access(headerPath);
    logger.info("⏭️ header.php は既存のテンプレートを優先");
    return;
  } catch {
    // 存在しない → 生成
  }

  await fs.promises.writeFile(headerPath, headerPhp, "utf-8");
  logger.info("📄 header.php を生成しました");
}

/**
 * headコンテンツをクリーンアップ
 */
function cleanHeadContent(headContent) {
  let cleaned = headContent;

  // charset/viewport metaタグを削除（PHP側で出力）
  cleaned = cleaned.replace(/<meta\s+charset=[^>]*>/gi, "");
  cleaned = cleaned.replace(/<meta\s+name=["']viewport["'][^>]*>/gi, "");

  // style.cssへのlinkタグを削除（wp_head()で読み込む）
  cleaned = cleaned.replace(/<link[^>]*href=["'][^"']*style\.css["'][^>]*>/gi, "");

  // titleタグを削除（wp_head()で出力）
  cleaned = cleaned.replace(/<title>[\s\S]*?<\/title>/gi, "");

  // 空行を整理
  cleaned = cleaned.replace(/^\s*\n/gm, "");

  return cleaned.trim();
}

/**
 * footer.php を生成
 * <footer> 〜 </html> + wp_footer()
 */
async function generateFooterPhp(content, outputDir, logger) {
  const footerMatch = content.match(/(<footer[\s\S]*)$/i);
  if (!footerMatch) {
    logger.warn("⚠️ <footer>タグが見つかりません。footer.phpの生成をスキップします。");
    return;
  }

  let footerContent = footerMatch[1];

  // </body>と</html>を削除
  footerContent = footerContent.replace(/<\/body>/i, "");
  footerContent = footerContent.replace(/<\/html>/i, "");

  const footerPhp = `${footerContent.trim()}
<?php wp_footer(); ?>
</body>
</html>
`;

  const footerPath = path.join(outputDir, "footer.php");

  // 既にfooter.phpが存在する場合はスキップ
  try {
    await fs.promises.access(footerPath);
    logger.info("⏭️ footer.php は既存のテンプレートを優先");
    return;
  } catch {
    // 存在しない → 生成
  }

  await fs.promises.writeFile(footerPath, footerPhp, "utf-8");
  logger.info("📄 footer.php を生成しました");
}

/**
 * ページコンテンツを抽出（header/footer分割時）
 * </header> 〜 <footer> の間を取り出し、get_header()/get_footer()で囲む
 */
function extractPageContent(content, templateName = null) {
  const headerEndIndex = content.indexOf("</header>");
  const footerStartIndex = content.search(/<footer[\s\b]/i);

  if (headerEndIndex === -1 || footerStartIndex === -1) {
    return extractBodyContent(content);
  }

  const mainContent = content.substring(headerEndIndex + "</header>".length, footerStartIndex).trim();

  // Template Nameヘッダー（page-{slug}.phpの場合のみ）
  const templateHeader = templateName
    ? `<?php
/**
 * Template Name: ${templateName}
 *
 * @package MyTheme
 */
get_header(); ?>`
    : `<?php get_header(); ?>`;

  return `${templateHeader}

${mainContent}

<?php get_footer(); ?>
`;
}

/**
 * body要素内のコンテンツのみを抽出（フォールバック）
 */
function extractBodyContent(content) {
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }
  return content;
}

/**
 * CSS/JSファイル内のアセットパスを一括調整
 */
async function adjustAssetFiles(outputDir) {
  const cssFiles = await fg.glob("**/*.css", { cwd: outputDir, absolute: true });
  for (const file of cssFiles) {
    if (path.basename(file) === "style.css") continue;
    let content = await fs.promises.readFile(file, "utf-8");
    const adjusted = adjustCSSAssetPaths(content);
    if (adjusted !== content) {
      await fs.promises.writeFile(file, adjusted, "utf-8");
    }
  }

  const jsFiles = await fg.glob("**/*.js", { cwd: outputDir, absolute: true });
  for (const file of jsFiles) {
    let content = await fs.promises.readFile(file, "utf-8");
    const adjusted = adjustJSAssetPaths(content);
    if (adjusted !== content) {
      await fs.promises.writeFile(file, adjusted, "utf-8");
    }
  }
}

/**
 * HTMLファイル内のアセットパスを調整
 */
function adjustAssetPathsForWordPress(content) {
  // img要素のsrc属性
  content = content.replace(/(<img[^>]*\s)src=["']([^"']+)["']/gi, (match, before, src) => {
    if (isExternalUrl(src) || isBase64Uri(src) || src.includes("<?")) return match;
    const clean = src.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\//, "");
    return `${before}src="<?= get_template_directory_uri() ?>/${clean}"`;
  });

  // srcset属性
  content = content.replace(/(<(?:img|source)[^>]*\s)srcset=["']([^"']+)["']/gi, (match, before, srcset) => {
    const adjusted = srcset
      .split(",")
      .map((src) => {
        const trimmed = src.trim();
        const parts = trimmed.split(/\s+/);
        const srcPath = parts[0];
        const descriptor = parts.slice(1).join(" ");
        if (isExternalUrl(srcPath) || isBase64Uri(srcPath) || srcPath.includes("<?")) return trimmed;
        const clean = srcPath.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\//, "");
        const adjustedPath = `<?= get_template_directory_uri() ?>/${clean}`;
        return descriptor ? `${adjustedPath} ${descriptor}` : adjustedPath;
      })
      .join(", ");
    return `${before}srcset="${adjusted}"`;
  });

  // link要素のhref属性（CSS）
  content = content.replace(/(<link[^>]*\s)href=["']([^"']+\.css)["']/gi, (match, before, href) => {
    if (isExternalUrl(href) || isBase64Uri(href) || href.includes("<?")) return match;
    const clean = href.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\//, "");
    return `${before}href="<?= get_template_directory_uri() ?>/${clean}"`;
  });

  // script要素のsrc属性
  content = content.replace(/(<script[^>]*\s)src=["']([^"']+\.js)["']/gi, (match, before, src) => {
    if (isExternalUrl(src) || isBase64Uri(src) || src.includes("<?")) return match;
    const clean = src.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\//, "");
    return `${before}src="<?= get_template_directory_uri() ?>/${clean}"`;
  });

  return content;
}

/**
 * CSSファイル内のアセットパスを調整
 */
function adjustCSSAssetPaths(content) {
  content = content.replace(/url\(['"]?([^'")\s]+)['"]?\)/gi, (match, url, offset) => {
    if (isExternalUrl(url) || isBase64Uri(url)) return match;
    if (isInsideDataUri(content, offset)) return match;
    const clean = url.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\/_assets\//, "");
    if (clean.startsWith("img/") || clean.startsWith("fonts/")) {
      return `url("../${clean}")`;
    }
    return match;
  });

  content = content.replace(/@import\s+['"]([^'"]+\.css)['"];?/gi, (match, url) => {
    if (isExternalUrl(url) || isBase64Uri(url)) return match;
    const clean = url.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\/_assets\/css\//, "");
    return `@import "${clean}";`;
  });

  return content;
}

/**
 * JSファイル内のアセットパスを調整
 */
function adjustJSAssetPaths(content) {
  content = content.replace(/(['"`])([^'"`]*\.(jpg|jpeg|png|gif|svg|webp|json))(['"`])/gi, (match, q1, filePath, ext, q2) => {
    if (isExternalUrl(filePath) || isBase64Uri(filePath)) return match;
    if (filePath.startsWith("./") || filePath.startsWith("../") || !filePath.startsWith("/")) return match;
    const clean = filePath.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\/_assets\//, "");
    if (clean.startsWith("img/")) {
      return `${q1}../${clean}${q2}`;
    }
    return match;
  });

  content = content.replace(/import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gi, (match, filePath) => {
    if (isExternalUrl(filePath) || isBase64Uri(filePath)) return match;
    if (filePath.startsWith("./") || filePath.startsWith("../") || !filePath.startsWith("/")) return match;
    const clean = filePath.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\/_assets\/js\//, "");
    if (clean.includes("/")) {
      return `import("./${clean}")`;
    }
    return match;
  });

  return content;
}

function isExternalUrl(url) {
  return /^https?:\/\//.test(url) || url.startsWith("//");
}

function isBase64Uri(url) {
  return url.startsWith("data:");
}

function isInsideDataUri(content, position) {
  const beforeText = content.substring(0, position);
  const lastDataIndex = beforeText.lastIndexOf('url("data:');
  if (lastDataIndex === -1) return false;
  const afterDataUri = content.substring(lastDataIndex);
  const closingQuoteMatch = afterDataUri.match(/^url\("data:[^"]*"\)/);
  if (closingQuoteMatch) {
    return position < lastDataIndex + closingQuoteMatch[0].length;
  }
  return false;
}

export default phpOutputPlugin;
