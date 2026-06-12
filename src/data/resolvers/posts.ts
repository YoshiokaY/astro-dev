import { wpFetch, hasEndpoint } from "@/data/client";
import type { PostData, PostSection } from "@/data/types";

/**
 * Phase 1 用サンプル投稿データ（デザイン確認用）
 * エンドポイント未設定時にこの1件で静的ページを生成する
 */
const samplePost: PostData = {
  slug: "001",
  ttl: "Astroで始める高速サイト構築",
  date: "2025-09-28",
  sections: [
    {
      ttl: null,
      content:
        "<p>Astroは、高速な静的サイトを構築するための最新のWebフレームワークです。</p>",
    },
    {
      ttl: "Astroの特徴",
      content:
        "<p>デフォルトでJavaScriptを最小限に抑え、必要な部分にのみJavaScriptを使用することで、優れたパフォーマンスを実現します。</p>",
    },
    {
      ttl: "開発体験",
      content:
        "<p>コンポーネントベースの開発をサポートし、React、Vue、Svelteなど様々なフレームワークのコンポーネントを混在させることができます。</p>",
    },
  ],
  category: "お知らせ",
  categorySlug: "news",
  img: "/_assets/img/sample/sample_001.png",
  imgAlt: "Astroのロゴとコード画面",
};

// ------------------------------------------------------------------
// WP REST API レスポンス型
// ------------------------------------------------------------------

interface WpPostResponse {
  slug: string;
  title: { rendered: string };
  date: string;
  acf: {
    sections_count?: number;
    [key: string]: unknown;
  };
  _embedded?: {
    "wp:featuredmedia"?: {
      source_url: string;
      alt_text: string;
    }[];
    "wp:term"?: { name: string; slug: string }[][];
  };
}

/**
 * ACF シリアルグループ → セクション配列に変換
 */
function extractSections(acf: WpPostResponse["acf"]): PostSection[] {
  const count = acf.sections_count ?? 0;
  const sections: PostSection[] = [];

  for (let i = 1; i <= count; i++) {
    const section = acf[`section_${i}`] as
      | { ttl?: string; content?: string }
      | undefined;
    if (section) {
      sections.push({
        ttl: section.ttl || null,
        content: section.content || null,
      });
    }
  }

  return sections;
}

function toPostData(post: WpPostResponse): PostData {
  const categories = post._embedded?.["wp:term"]?.[0] ?? [];
  const media = post._embedded?.["wp:featuredmedia"]?.[0];

  return {
    slug: post.slug,
    ttl: post.title.rendered,
    date: post.date.split("T")[0],
    sections: extractSections(post.acf),
    category: categories[0]?.name ?? "",
    categorySlug: categories[0]?.slug ?? "",
    img: media?.source_url ?? "",
    imgAlt: media?.alt_text ?? "",
  };
}

// ------------------------------------------------------------------
// Resolver
// ------------------------------------------------------------------

/**
 * 全投稿を取得する
 * - エンドポイントあり: WPの全投稿を返す
 * - エンドポイントなし: サンプル1件を返す
 */
export async function resolveAllPosts(): Promise<PostData[]> {
  if (!hasEndpoint()) {
    console.info("  [posts] static (sample 1 post)");
    return [samplePost];
  }

  try {
    const posts = await wpFetch<WpPostResponse[]>("/posts", {
      per_page: 100,
      status: "publish",
      orderby: "date",
      order: "desc",
    });
    console.info(`  [posts] REST API (${posts.length} posts)`);
    return posts.map(toPostData);
  } catch (e) {
    console.warn(
      "  [posts] REST API failed, using static fallback:",
      (e as Error).message,
    );
    return [samplePost];
  }
}
