// @ts-ignore - Viteが実行時に置き換える
const WP_API_URL = import.meta.env.WP_API_URL || "";
// @ts-ignore - Viteが実行時に置き換える
const AUTH_TOKEN = import.meta.env.WP_AUTH_TOKEN || "";

/** WP REST API エンドポイントが設定されているか */
export function hasEndpoint(): boolean {
  return WP_API_URL.length > 0;
}

/** REST API のベース URL を返す */
function apiBase(): string {
  return `${WP_API_URL.replace(/\/$/, "")}/wp-json/wp/v2`;
}

/**
 * WordPress REST API を呼び出す
 * _embed パラメータでアイキャッチ画像・カテゴリ等を一括取得
 */
export async function wpFetch<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  if (!WP_API_URL) {
    throw new Error("WP_API_URL is not configured");
  }

  const url = new URL(`${apiBase()}${path}`);
  url.searchParams.set("_embed", "");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Connection: "close",
  };

  if (AUTH_TOKEN) {
    headers["Authorization"] = `Basic ${AUTH_TOKEN}`;
  }

  let res;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30秒
    res = await fetch(url.toString(), { headers, signal: controller.signal });
    clearTimeout(timeout);
  } catch (fetchError) {
    const err = fetchError as Error & { cause?: unknown };
    // undici は実際の原因（DNS失敗/接続タイムアウト/TLSエラー等）を cause に格納する
    let cause = err.cause as (Error & { code?: string; cause?: unknown }) | undefined;
    let causeMsg = "";
    let depth = 0;
    while (cause && depth < 5) {
      causeMsg += ` <- ${cause.name}${cause.code ? ` (${cause.code})` : ""}: ${cause.message}`;
      cause = cause.cause as typeof cause;
      depth++;
    }
    throw new Error(`WP fetch error: ${err.message}${causeMsg}`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP API ${res.status}: ${text.substring(0, 200)}`);
  }

  return (await res.json()) as T;
}
