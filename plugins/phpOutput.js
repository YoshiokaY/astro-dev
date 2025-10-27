import fg from "fast-glob";
import fs from "fs";

/**
 * 改良版PHP出力プラグイン
 * astro:build:done フックでHTMLファイルをPHPに変換
 */
function phpOutputPlugin(options = {}) {
  const {
    // 変換条件の設定
    convertConditions = [
      { pattern: "**/wp-content/**/*.html", type: "wordpress" }, // wp-contentディレクトリ内
    ],
    // WordPress用の設定
    removeHtmlStructure = true, // DOCTYPE, html, head, body タグを削除
    addWordPressHeaders = false, // WordPressテンプレートヘッダーを追加
    adjustAssetPaths = true, // アセットパスをWordPress用に調整
  } = options;

  return {
    name: "improved-php-output",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        logger.info("🔌 PHP変換処理を開始...");

        try {
          const outputDir = dir.pathname;

          // 変換対象ファイルを検索・処理
          for (const condition of convertConditions) {
            await processFilesByCondition(outputDir, condition, {
              removeHtmlStructure,
              addWordPressHeaders,
              adjustAssetPaths,
              logger,
            });
          }

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
 * 条件に基づいてファイルを処理
 */
async function processFilesByCondition(outputDir, condition, options) {
  const { pattern, type } = condition;
  const { logger } = options;

  // パターンに一致するHTMLファイルを検索
  const files = await fg.glob(pattern, {
    cwd: outputDir,
    absolute: true,
  });

  if (files.length === 0) {
    logger.info(`ℹ️ パターン "${pattern}" に一致するファイルなし`);
    return;
  }

  // logger.info(`🔍 パターン "${pattern}": ${files.length}個のファイルを処理中...`);

  // 並列処理でファイルを変換
  await Promise.all(files.map((file) => processHtmlFile(file, type, options)));
}

/**
 * 個別のHTMLファイルを処理
 */
async function processHtmlFile(filePath, templateType, options) {
  const { removeHtmlStructure, addWordPressHeaders, adjustAssetPaths, logger } = options;

  try {
    // HTMLファイル読み込み
    let content = await fs.promises.readFile(filePath, "utf-8");

    // 実体参照を元に戻す
    content = content.replace(/&gt;/g, ">");

    // アセットパスの調整（全てのtypeで実行）
    if (adjustAssetPaths) {
      content = adjustAssetPathsForWordPress(content, filePath);
    }

    // typeに応じた処理分岐
    if (templateType === "wordpress" || templateType === "template") {
      // WordPress用変換：PHPファイルとして保存
      if (removeHtmlStructure) {
        content = removeHtmlDocumentStructure(content, filePath);
      }

      if (addWordPressHeaders) {
        content = addWordPressTemplateHeaders(content, templateType);
      }

      // PHPファイル名を決定
      const phpFilePath = determinePHPFilePath(filePath);

      // PHPファイルとして保存
      await fs.promises.writeFile(phpFilePath, content, "utf-8");

      // 元のHTMLファイルを削除
      await fs.promises.unlink(filePath);

      // logger.info(`🔄 変換: ${getRelativePath(filePath)} → ${getRelativePath(phpFilePath)}`);
    } else {
      // パス置換のみ：HTMLファイルとして上書き保存
      await fs.promises.writeFile(filePath, content, "utf-8");

      // logger.info(`🔄 パス置換: ${getRelativePath(filePath)}`);
    }
  } catch (error) {
    logger.error(`❌ ファイル処理エラー: ${filePath}`, error.message);
    throw error;
  }
}

/**
 * PHPファイルパスを決定
 */
function determinePHPFilePath(htmlFilePath) {
  // .php.html → .php
  if (htmlFilePath.endsWith(".php.html")) {
    return htmlFilePath.replace(".php.html", ".php");
  }

  // .html → .php
  return htmlFilePath.replace(".html", ".php");
}

/**
 * アセットパスをWordPress用に調整
 */
function adjustAssetPathsForWordPress(content, filePath = "") {
  const fileExtension = filePath.split(".").pop()?.toLowerCase();

  if (fileExtension === "css") {
    return adjustCSSAssetPaths(content);
  } else if (fileExtension === "js") {
    return adjustJSAssetPaths(content);
  } else {
    return adjustHTMLAssetPaths(content);
  }
}

/**
 * HTMLファイル内のアセットパスを調整
 */
function adjustHTMLAssetPaths(content) {
  // img要素のsrc属性
  content = content.replace(/(<img[^>]*\s)src=["']([^"']+)["']/gi, (match, beforeSrc, src) => {
    if (isExternalUrl(src) || isBase64Uri(src)) {
      return match; // 外部URLやbase64データはそのまま
    }
    // 既にPHP関数が使われている場合はそのまま
    if (src.includes("<?")) {
      return match;
    }
    // _assetsを含むパスはWordPress関数で動的に取得
    const cleanSrc = src.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\//, "");
    return `${beforeSrc}src="<?= get_template_directory_uri() ?>/${cleanSrc}"`;
  });

  // img要素とsource要素のsrcset属性
  content = content.replace(/(<(?:img|source)[^>]*\s)srcset=["']([^"']+)["']/gi, (match, beforeSrcset, srcset) => {
    // srcsetは複数のパスを含むため個別に処理
    const adjustedSrcset = srcset
      .split(",")
      .map((src) => {
        const trimmed = src.trim();
        const parts = trimmed.split(/\s+/);
        const path = parts[0];
        const descriptor = parts.slice(1).join(" ");

        if (isExternalUrl(path) || isBase64Uri(path)) {
          return trimmed; // 外部URLやbase64データはそのまま
        }

        // 既にPHP関数が使われている場合はそのまま
        if (path.includes("<?")) {
          return trimmed;
        }

        const cleanPath = path.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\//, "");
        const adjustedPath = `<?= get_template_directory_uri() ?>/${cleanPath}`;
        return descriptor ? `${adjustedPath} ${descriptor}` : adjustedPath;
      })
      .join(", ");

    return `${beforeSrcset}srcset="${adjustedSrcset}"`;
  });

  // link要素のhref属性（CSS）
  content = content.replace(/(<link[^>]*\s)href=["']([^"']+\.css)["']/gi, (match, beforeHref, href) => {
    if (isExternalUrl(href) || isBase64Uri(href)) {
      return match; // 外部URLやbase64データはそのまま
    }
    // 既にPHP関数が使われている場合はそのまま
    if (href.includes("<?")) {
      return match;
    }
    const cleanHref = href.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\//, "");
    return `${beforeHref}href="<?= get_template_directory_uri() ?>/${cleanHref}"`;
  });

  // script要素のsrc属性
  content = content.replace(/(<script[^>]*\s)src=["']([^"']+\.js)["']/gi, (match, beforeSrc, src) => {
    if (isExternalUrl(src) || isBase64Uri(src)) {
      return match; // 外部URLやbase64データはそのまま
    }
    // 既にPHP関数が使われている場合はそのまま
    if (src.includes("<?")) {
      return match;
    }
    const cleanSrc = src.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\//, "");
    return `${beforeSrc}src="<?= get_template_directory_uri() ?>/${cleanSrc}"`;
  });

  return content;
}

/**
 * CSSファイル内のアセットパスを調整
 * 注意: CSSファイル内ではPHP関数は使えないため、相対パスに変換
 */
function adjustCSSAssetPaths(content) {
  // data URI内のurl()を除外してパスを置換
  content = content.replace(/url\(['"]?([^'")\s]+)['"]?\)/gi, (match, url, offset) => {
    if (isExternalUrl(url) || isBase64Uri(url)) {
      return match; // 外部URLやbase64データはそのまま
    }

    // このurl()がdata URI内にあるかチェック
    if (isInsideDataUri(content, offset)) {
      return match; // data URI内のurl()はそのまま
    }

    // CSSは相対パスで処理（CSSファイルは _assets/css/ 配下にあるため）
    const cleanUrl = url.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\/_assets\//, "");
    // _assets/css/ から見た相対パス
    if (cleanUrl.startsWith("img/") || cleanUrl.startsWith("fonts/")) {
      return `url("../${cleanUrl}")`;
    }
    return match;
  });

  // @import のパスを置換
  content = content.replace(/@import\s+['"]([^'"]+\.css)['"];?/gi, (match, url) => {
    if (isExternalUrl(url) || isBase64Uri(url)) {
      return match; // 外部URLやbase64データはそのまま
    }
    // CSSの@importは相対パスで処理
    const cleanUrl = url.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\/_assets\/css\//, "");
    return `@import "${cleanUrl}";`;
  });

  return content;
}

/**
 * JSファイル内のアセットパスを調整
 * 注意: JSファイル内ではPHP関数は使えないため、相対パスに変換
 */
function adjustJSAssetPaths(content) {
  // 文字列内の画像パスを置換（クォート内）
  content = content.replace(/(['"`])([^'"`]*\.(jpg|jpeg|png|gif|svg|webp|json))(['"`])/gi, (match, quote1, path, ext, quote2) => {
    if (isExternalUrl(path) || isBase64Uri(path)) {
      return match; // 外部URLやbase64データはそのまま
    }
    if (path.startsWith("./") || path.startsWith("../") || !path.startsWith("/")) {
      return match; // 相対パスはそのまま
    }
    // JSは相対パスで処理（JSファイルは _assets/js/ 配下にあるため）
    const cleanPath = path.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\/_assets\//, "");
    if (cleanPath.startsWith("img/")) {
      return `${quote1}../${cleanPath}${quote2}`;
    }
    return match;
  });

  // 動的インポートのパスを置換
  content = content.replace(/import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gi, (match, path) => {
    if (isExternalUrl(path) || isBase64Uri(path)) {
      return match; // 外部URLやbase64データはそのまま
    }
    if (path.startsWith("./") || path.startsWith("../") || !path.startsWith("/")) {
      return match; // 相対パスはそのまま
    }
    // JSの動的インポートも相対パスで処理
    const cleanPath = path.replace(/^\//, "").replace(/^wp\/wp-content\/themes\/my-theme\/_assets\/js\//, "");
    if (cleanPath.includes("/")) {
      return `import("./${cleanPath}")`;
    }
    return match;
  });

  return content;
}

/**
 * 外部URLかどうかを判定
 */
function isExternalUrl(url) {
  return /^https?:\/\//.test(url) || url.startsWith("//");
}

/**
 * base64変換されたdata URIかどうかを判定
 */
function isBase64Uri(url) {
  return url.startsWith("data:");
}

/**
 * 指定された位置がdata URI内にあるかどうかを判定
 */
function isInsideDataUri(content, position) {
  // position より前の文字列を取得
  const beforeText = content.substring(0, position);

  // 最も近いdata:の位置を探す
  const lastDataIndex = beforeText.lastIndexOf('url("data:');
  if (lastDataIndex === -1) {
    return false;
  }

  // そのdata URIが閉じられているかチェック
  const afterDataUri = content.substring(lastDataIndex);
  const closingQuoteMatch = afterDataUri.match(/^url\("data:[^"]*"\)/);

  if (closingQuoteMatch) {
    const dataUriEnd = lastDataIndex + closingQuoteMatch[0].length;
    // 現在の位置がdata URI内にあるかチェック
    return position < dataUriEnd;
  }

  return false;
}

/**
 * HTML文書構造を削除（body内容のみ抽出）
 */
function removeHtmlDocumentStructure(content, filePath = "") {
  const fileName = filePath.split("/").pop();

  // footer.phpの場合: <footer>から</html>までを保持
  if (fileName === "footer.php.html" || fileName === "footer.html") {
    // <footer>タグ以降を抽出
    const footerMatch = content.match(/(<footer[\s\S]*?<\/footer>)/i);

    if (footerMatch) {
      const footerContent = footerMatch[1];

      // WordPress関数と閉じタグを追加
      return footerContent.trim() + "\n<?php wp_footer(); ?>\n</body>\n</html>";
    }

    // <footer>が見つからない場合はフォールバック（従来の処理）
    let footerContent = content;
    footerContent = footerContent.replace(/<!DOCTYPE html>\s*/gi, "");
    footerContent = footerContent.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, "");
    footerContent = footerContent.replace(/<head>[\s\S]*?<\/head>/gi, "");
    footerContent = footerContent.replace(/<header[\s\S]*?<\/header>/gi, "");
    footerContent = footerContent.replace(/<nav[\s\S]*?<\/nav>/gi, "");
    footerContent = footerContent.replace(/<main[\s\S]*?<\/main>/gi, "");
    footerContent = footerContent.replace(/<html[^>]*>/gi, "");
    footerContent = footerContent.replace(/<body[^>]*>/gi, "");
    footerContent = footerContent.replace(/<\/body>/gi, "");
    footerContent = footerContent.replace(/<\/html>/gi, "");

    // WordPress関数と閉じタグを追加
    footerContent = footerContent.trim() + "\n<?php wp_footer(); ?>\n</body>\n</html>";

    return footerContent;
  }

  // header.phpの場合: <!DOCTYPE html>から</header>までを保持
  if (fileName === "header.php.html" || fileName === "header.html") {
    // まず</body>と</html>を削除
    let headerContent = content;
    headerContent = headerContent.replace(/<\/body>[\s\S]*?<\/html>/gi, "");
    headerContent = headerContent.replace(/<main[\s\S]*?<\/main>/gi, "");
    headerContent = headerContent.replace(/<footer[\s\S]*?<\/footer>/gi, "");

    // style.cssへのlinkタグを削除（wp_head()で読み込むため）
    headerContent = headerContent.replace(/<link[^>]*href=["'][^"']*style\.css["'][^>]*>/gi, "");

    // WordPress関数を挿入: </head>の直前に<?php wp_head(); ?>を追加
    headerContent = headerContent.replace(/<\/head>/i, "<?php wp_head(); ?>\n</head>");

    return headerContent.trim();
  }

  // include/*.phpの場合: インクルードファイル（部品）
  if (filePath.includes("/include/")) {
    // 不要な要素を削除
    let includeContent = content;
    includeContent = includeContent.replace(/<!DOCTYPE html>\s*/gi, "");
    includeContent = includeContent.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, "");
    includeContent = includeContent.replace(/<html[^>]*>/gi, "");
    includeContent = includeContent.replace(/<\/html>/gi, "");
    includeContent = includeContent.replace(/<head>[\s\S]*?<\/head>/gi, "");
    includeContent = includeContent.replace(/<body[^>]*>/gi, "");
    includeContent = includeContent.replace(/<\/body>/gi, "");

    return includeContent.trim();
  }

  // front-page.php、page-*.phpなどのページテンプレート
  if (fileName.startsWith("front-page") || fileName.startsWith("page-")) {
    // 不要な要素を削除
    let pageContent = content;
    pageContent = pageContent.replace(/<!DOCTYPE html>\s*/gi, "");
    pageContent = pageContent.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, "");
    pageContent = pageContent.replace(/<html[^>]*>/gi, "");
    pageContent = pageContent.replace(/<\/html>/gi, "");
    pageContent = pageContent.replace(/<head>[\s\S]*?<\/head>/gi, "");
    pageContent = pageContent.replace(/<header[\s\S]*?<\/header>/gi, "");
    pageContent = pageContent.replace(/<nav[\s\S]*?<\/nav>/gi, "");
    pageContent = pageContent.replace(/<body[^>]*>/gi, "");
    pageContent = pageContent.replace(/<\/body>/gi, "");
    pageContent = pageContent.replace(/<footer[\s\S]*?<\/footer>/gi, "");

    // <main>タグのみを抽出
    const mainMatch = pageContent.match(/(<main[\s\S]*?<\/main>)/i);
    if (mainMatch) {
      const mainContent = mainMatch[1];

      // WordPressループで囲む
      const wpTemplate = `<?php get_header(); ?>

<?php
  if (have_posts()) :
    while(have_posts()): the_post();
?>

${mainContent}

<?php endwhile; endif; wp_reset_postdata(); ?>

<?php get_footer(); ?>`;

      return wpTemplate;
    }
  }

  // その他のテンプレート: body要素内のコンテンツのみを抽出
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }
  return content;
}

/**
 * WordPressテンプレートヘッダーを追加
 */
function addWordPressTemplateHeaders(content, templateType) {
  const headers = {
    wordpress: "<?php\n/**\n * WordPress Template\n */\n\n",
    template: "<?php\n/**\n * Custom Template\n */\n\n",
  };

  return (headers[templateType] || "") + content;
}

/**
 * 相対パスを取得
 */
function getRelativePath(filePath) {
  return filePath.replace(process.cwd() + "/", "");
}

export default phpOutputPlugin;
