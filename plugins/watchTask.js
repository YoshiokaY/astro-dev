import browserSync from "browser-sync";
import { execSync } from "child_process";
import chokidar from "chokidar";
import path from "path";

/**
 * ファイル監視と選択的ビルドシステム
 * AstroプロジェクトのWordPress開発環境用
 */
class WatchTask {
  constructor(options = {}) {
    this.isBuilding = false;
    this.buildQueue = new Set();
    this.debounceTimer = null;
    this.isReady = false; // 初期スキャン完了フラグ
    this.useBrowserSync = options.browserSync || false;
    this.bs = null;

    this.init();
  }

  init() {
    console.log("🔍 ファイル監視を開始...");

    // 監視対象パスの設定
    const watchPaths = "src";

    const watcher = chokidar.watch(watchPaths, {
      ignoreInitial: false,
      persistent: true,
      usePolling: false,
      depth: 99,
      ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/htdocs/**"],
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    watcher
      .on("change", (filePath) => this.handleFileChange(filePath))
      .on("add", (filePath) => this.handleFileChange(filePath))
      .on("ready", () => {
        this.isReady = true;
        console.log("✅ 監視準備完了");

        // Browser Syncの初期化
        if (this.useBrowserSync) {
          this.initBrowserSync();
        }
      })
      .on("error", (error) => console.error("❌ 監視エラー:", error));

    // デバッグ用ログ（必要時にコメントアウト解除）
    // console.log("📁 作業ディレクトリ:", process.cwd());
    // console.log("✅ 監視対象:", watchPaths);
    // watcher.on("unlink", (filePath) => console.log("🗑️ 削除検出:", filePath));

    // デバッグ用: 監視ファイル詳細表示（必要時にコメントアウト解除）
    // setTimeout(() => {
    //   const watchedPaths = watcher.getWatched();
    //   console.log("👀 監視中のファイル数:", Object.keys(watchedPaths).length);
    //   Object.entries(watchedPaths).forEach(([dir, files]) => {
    //     console.log(`  ${dir}: [${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}]`);
    //   });
    // }, 1000);
  }

  handleFileChange(filePath) {
    // 初期スキャン中は変更を無視
    if (!this.isReady) {
      return;
    }

    const ext = path.extname(filePath);

    // 対象外のファイル拡張子をフィルタリング
    const supportedExtensions = [".scss", ".css", ".js", ".ts", ".astro", ".json", ".php"];
    if (!supportedExtensions.includes(ext)) {
      return;
    }

    const changeType = this.getChangeType(ext);

    console.log(`📝 変更検出: ${filePath} (${changeType})`);

    this.buildQueue.add(changeType);
    this.debouncedBuild();

    // デバッグ用ログ（必要時にコメントアウト解除）
    // console.log(`🔍 初期スキャン中スキップ: ${filePath}`);
    // console.log(`🚫 対象外ファイル: ${filePath}`);
  }

  getChangeType(extension) {
    const typeMap = {
      ".scss": "css",
      ".css": "css",
      ".js": "js",
      ".ts": "js",
      ".astro": "full",
      ".json": "full",
      ".php": "public", // src/public配下のPHPファイル（functions.phpなど）
    };

    return typeMap[extension] || "full";
  }

  debouncedBuild() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.executeBuild();
    }, 500); // 500ms待機してバッチ処理
  }

  async executeBuild() {
    if (this.isBuilding) return;

    this.isBuilding = true;
    const buildTypes = Array.from(this.buildQueue);
    this.buildQueue.clear();

    try {
      const startTime = Date.now();

      // ファイルタイプに関係なく軽量ビルドを実行
      console.log(`🔄 ビルド実行中... (変更タイプ: ${buildTypes.join(", ")})`);
      execSync("VITE_IMAGEMIN=false VITE_CONVERT_TO_WEBP=false npm run build:wp", { stdio: "inherit" });

      const duration = Date.now() - startTime;
      console.log(`✅ ビルド完了 (${duration}ms)`);

      // Browser Syncでリロード
      if (this.bs && this.useBrowserSync) {
        this.bs.reload();
        console.log("🔄 ブラウザをリロードしました");
      }
    } catch (error) {
      console.error("❌ ビルドエラー:", error.message);
    } finally {
      this.isBuilding = false;
    }
  }

  initBrowserSync() {
    this.bs = browserSync.create();

    this.bs.init(
      {
        proxy: "localhost:8080", // DockerのWordPress theme-dev環境
        port: 3001, // Browser Syncのポート
        ui: {
          port: 3002, // Browser Sync UIのポート
        },
        files: ["htdocs/**/*.php", "htdocs/**/*.css", "htdocs/**/*.js"],
        watchEvents: ["change", "add"],
        injectChanges: true, // CSSの場合はページ全体をリロードせずに変更を注入
        notify: true,
        open: true, // 起動時にブラウザを開く
        logPrefix: "WordPress-BSync",
      },
      (err, bs) => {
        if (err) {
          console.error("❌ Browser Sync起動エラー:", err);
        } else {
          console.log("🌐 Browser Sync起動完了");
          console.log(`   プロキシ: http://localhost:3001`);
          console.log(`   管理画面: http://localhost:3002`);
        }
      }
    );
  }
}

// 引数でBrowser Syncの無効化を制御（デフォルトは有効）
const args = process.argv.slice(2);
const disableBrowserSync = args.includes("--no-browser-sync") || args.includes("--no-bs");

// 監視開始
new WatchTask({ browserSync: !disableBrowserSync });
