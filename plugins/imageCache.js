import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * 画像最適化の共通ヘルパー
 * - コンテンツハッシュによる永続キャッシュ（sharp のエンコードをスキップ）
 * - 並列実行（CPU コア数ぶん）
 * - WebP 命名規則（元拡張子を残さず .webp に置換）
 *
 * 生成側（imageOptimizer.js）と書き換え側（convertWebp.js）で
 * 同じ命名関数を共有し、パスのズレによる表示崩れを防ぐ。
 */

// キャッシュの仕様が変わったら上げる（既存キャッシュを一括で無効化できる）
const CACHE_VERSION = "v1";

const cacheDir = path.join(process.cwd(), "node_modules", ".cache", "image-optimizer");

function ensureCacheDir() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

/**
 * 画像パスを WebP パスへ変換（末尾の対応拡張子だけを .webp に置換）
 * 例: /img/sample.png -> /img/sample.webp
 */
export function toWebpPath(filePath) {
  return filePath.replace(/\.(jpe?g|png|gif)$/i, ".webp");
}

/**
 * キャッシュキーを生成
 * 元画像のバイト列 + 出力パラメータ（形式・品質など）+ バージョン から算出。
 * 画像を差し替えれば自動でキー変化 → 再最適化。品質を変えても同様に再生成される。
 */
export function cacheKey(buffer, params) {
  const hash = crypto.createHash("sha256");
  hash.update(buffer);
  hash.update(JSON.stringify(params));
  hash.update(CACHE_VERSION);
  return hash.digest("hex");
}

/**
 * キャッシュから読み込み（無ければ null）
 */
export async function readCache(key) {
  try {
    return await fs.promises.readFile(path.join(cacheDir, key));
  } catch {
    return null;
  }
}

/**
 * キャッシュへ保存
 */
export async function writeCache(key, buffer) {
  ensureCacheDir();
  await fs.promises.writeFile(path.join(cacheDir, key), buffer);
}

/**
 * 同時実行数を制限しながら配列を非同期処理する簡易プール
 * sharp は libuv のスレッドで動くため、並列化でビルド時間を大きく短縮できる。
 */
export async function mapWithConcurrency(items, limit, fn) {
  const concurrency = Math.max(1, Math.min(limit, items.length));
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      await fn(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

/**
 * 既定の並列数（CPU コア数）
 */
export function defaultConcurrency() {
  return os.cpus().length || 4;
}

/**
 * キャッシュディレクトリのパス
 */
export function getCacheDir() {
  return cacheDir;
}

/**
 * キャッシュを丸ごと削除（緊急時の全再最適化用）
 * 削除したエントリ数を返す。
 */
export function clearCache() {
  if (!fs.existsSync(cacheDir)) {
    return 0;
  }
  const count = fs.readdirSync(cacheDir).length;
  fs.rmSync(cacheDir, { recursive: true, force: true });
  return count;
}
