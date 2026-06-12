import { wpFetch, hasEndpoint } from "@/data/client";
import type {
  TopPageData,
  AboutPageData,
  SamplePageData,
  ArticleItem,
  TechItem,
  QaItem,
  VideoItem,
} from "@/data/types";

/**
 * データソースのログ出力
 */
function logSource(page: string, source: "rest" | "static", error?: unknown) {
  if (error) {
    console.warn(
      `  [${page}] REST API failed, using static fallback:`,
      (error as Error).message,
    );
  } else {
    console.info(`  [${page}] ${source}`);
  }
}

// ==================================================================
// WP REST API レスポンス型
// ==================================================================

interface WpPageResponse {
  title: { rendered: string };
  slug: string;
  acf: Record<string, unknown>;
}

interface WpPostForList {
  slug: string;
  title: { rendered: string };
  date: string;
  acf: {
    section_1?: { content?: string };
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

// ==================================================================
// シリアルグループ → 配列 変換ヘルパー
// ==================================================================

/**
 * ACF のシリアルフィールド（xxx_1, xxx_2...）を配列に変換
 */
function collectSerialItems<T>(
  acf: Record<string, unknown>,
  prefix: string,
  count: number,
): T[] {
  const items: T[] = [];
  for (let i = 1; i <= count; i++) {
    const item = acf[`${prefix}${i}`] as T | undefined;
    if (item) items.push(item);
  }
  return items;
}

// ==================================================================
// ACF画像フィールド解決ヘルパー
// ==================================================================

interface AcfImageData {
  url: string;
  alt: string;
}

/**
 * ACF画像フィールドの値を解決する
 * - 配列（ACF Pro or return_format=array）: そのまま url/alt を取得
 * - 数値（ACF Free REST API）: メディアAPIから取得
 * - falsy: 空を返す
 */
async function resolveAcfImage(
  value: unknown,
): Promise<AcfImageData> {
  if (!value) return { url: "", alt: "" };

  // オブジェクト（配列フォーマット）
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    return {
      url: (obj.url as string) ?? "",
      alt: (obj.alt as string) ?? "",
    };
  }

  // 数値（ID）→ メディアAPIから取得
  if (typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value))) {
    try {
      const media = await wpFetch<{ source_url: string; alt_text: string }>(
        `/media/${value}`,
      );
      return { url: media.source_url, alt: media.alt_text };
    } catch {
      return { url: "", alt: "" };
    }
  }

  return { url: "", alt: "" };
}

// ==================================================================
// トップページ
// ==================================================================

export async function resolveTopPage(): Promise<TopPageData | null> {
  if (!hasEndpoint()) {
    logSource("top", "static");
    return null;
  }

  try {
    // フロントページをスラッグではなく投稿IDで取得する場合もあるが、
    // ここでは pages エンドポイントでフロントページを検索
    const pages = await wpFetch<WpPageResponse[]>("/pages", {
      slug: "top",
      per_page: 1,
    });

    if (pages.length === 0) {
      logSource("top", "static");
      return null;
    }

    logSource("top", "rest");
    const acf = pages[0].acf;

    const img = await resolveAcfImage(acf.sample_picture_demo_img);

    return {
      head: {
        slug: pages[0].slug,
        ttl: pages[0].title.rendered,
        description: "",
        url: "",
      },
      contents: {
        sample: {
          ttl: (acf.sample_ttl as string) ?? "",
          desc: ((acf.sample_desc as string) ?? "").split("\n").filter(Boolean),
          features: {
            ttl: (acf.sample_features_ttl as string) ?? "",
            items: ((acf.sample_features_items as string) ?? "")
              .split("\n")
              .filter(Boolean),
          },
          textSample: {
            ttl: (acf.sample_text_sample_ttl as string) ?? "",
            content: (acf.sample_text_sample_content as string) ?? "",
          },
          pictureDemo: {
            ttl: (acf.sample_picture_demo_ttl as string) ?? "",
            desc: (acf.sample_picture_demo_desc as string) ?? "",
            img: {
              src: img.url,
              alt: img.alt,
              sizes: [],
            },
          },
        },
      },
    };
  } catch (e) {
    logSource("top", "static", e);
    return null;
  }
}

// ==================================================================
// Aboutページ
// ==================================================================

export async function resolveAboutPage(
  fallback: AboutPageData,
): Promise<AboutPageData> {
  if (!hasEndpoint()) {
    logSource("about", "static");
    return fallback;
  }

  try {
    const pages = await wpFetch<WpPageResponse[]>("/pages", {
      slug: "about",
      per_page: 1,
    });

    if (pages.length === 0) return fallback;

    logSource("about", "rest");
    const acf = pages[0].acf;

    const techCount = (acf.tech_items_count as number) ?? 0;
    const techItems = collectSerialItems<TechItem>(acf, "tech_item_", techCount);

    return {
      head: {
        slug: pages[0].slug,
        ttl: pages[0].title.rendered,
        description: "",
        url: "/about/",
      },
      breadcrumbs: fallback.breadcrumbs,
      contents: {
        concept: {
          ttl: (acf.concept_ttl as string) ?? "",
          desc: (acf.concept_desc as string) ?? "",
        },
        features: {
          ttl: (acf.features_ttl as string) ?? "",
          items: ((acf.features_items as string) ?? "")
            .split("\n")
            .filter(Boolean),
        },
        tech: {
          ttl: (acf.tech_ttl as string) ?? "",
          desc: (acf.tech_desc as string) ?? "",
          items: techItems,
        },
      },
    };
  } catch (e) {
    logSource("about", "static", e);
    return fallback;
  }
}

// ==================================================================
// サンプル（オウンドメディア）ページ
// ==================================================================

export async function resolveSamplePage(
  fallback: SamplePageData,
): Promise<SamplePageData> {
  if (!hasEndpoint()) {
    logSource("sample", "static");
    return fallback;
  }

  try {
    const [pages, posts] = await Promise.all([
      wpFetch<WpPageResponse[]>("/pages", { slug: "sample", per_page: 1 }),
      wpFetch<WpPostForList[]>("/posts", {
        per_page: 4,
        status: "publish",
        orderby: "date",
        order: "desc",
      }),
    ]);

    if (pages.length === 0) return fallback;

    logSource("sample", "rest");
    const acf = pages[0].acf;

    // 投稿一覧 → ArticleItem（desc は section_1.content の先頭テキスト）
    const articles: ArticleItem[] = posts.map((post) => {
      const rawContent =
        (post.acf?.section_1?.content as string) ?? "";
      const desc = rawContent.replace(/<[^>]+>/g, "").slice(0, 100);
      const categories = post._embedded?.["wp:term"]?.[0] ?? [];
      const media = post._embedded?.["wp:featuredmedia"]?.[0];

      return {
        href: `/news/${post.slug}/`,
        ttl: post.title.rendered,
        desc,
        date: post.date.split("T")[0],
        category: categories[0]?.name ?? "",
        img: media?.source_url ?? "",
        imgAlt: media?.alt_text ?? "",
      };
    });

    // QA シリアルグループ → 配列
    const qaCount = (acf.qa_items_count as number) ?? 0;
    const qaItems = collectSerialItems<QaItem>(acf, "qa_item_", qaCount);

    // Videos シリアルグループ → 配列
    const videosCount = (acf.videos_items_count as number) ?? 0;
    const videoItemsRaw = collectSerialItems<{
      ttl?: string;
      desc?: string;
      thumbnail?: { url?: string };
      video_url?: string;
    }>(acf, "videos_item_", videosCount);

    const videoItems: VideoItem[] = videoItemsRaw.map((v) => ({
      ttl: v.ttl ?? "",
      desc: v.desc ?? "",
      thumbnail: v.thumbnail?.url ?? "",
      videoUrl: v.video_url ?? "",
    }));

    return {
      head: {
        slug: pages[0].slug,
        ttl: pages[0].title.rendered,
        description: "",
        url: "/sample/",
      },
      breadcrumbs: fallback.breadcrumbs,
      contents: {
        hero: {
          ttl: pages[0].title.rendered,
          subTtl: (acf.hero_sub_ttl as string) ?? "",
          desc: (acf.hero_desc as string) ?? "",
        },
        articles: {
          ttl: (acf.articles_ttl as string) ?? fallback.contents.articles.ttl,
          items: articles,
        },
        categories: fallback.contents.categories,
        qa: {
          ttl: (acf.qa_ttl as string) ?? "",
          items: qaItems,
        },
        videos: {
          ttl: (acf.videos_ttl as string) ?? "",
          items: videoItems,
        },
      },
    };
  } catch (e) {
    logSource("sample", "static", e);
    return fallback;
  }
}
