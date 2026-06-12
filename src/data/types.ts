// ============================================================
// 共通型定義
// ============================================================

/** ページメタ情報（head, OGP用） */
export interface PageHead {
  slug: string;
  ttl: string;
  description: string;
  url: string;
}

/** パンくずリスト */
export interface BreadcrumbItem {
  txt: string;
  link: string;
}

// ============================================================
// トップページ
// ============================================================

export interface TopContents {
  sample: {
    ttl: string;
    desc: string[];
    features: {
      ttl: string;
      items: string[];
    };
    textSample: {
      ttl: string;
      content: string;
    };
    pictureDemo: {
      ttl: string;
      desc: string;
      img: {
        src: string;
        alt: string;
        sizes: number[];
      };
    };
  };
}

export interface TopPageData {
  head: PageHead;
  contents: TopContents;
}

// ============================================================
// Aboutページ
// ============================================================

export interface TechItem {
  name: string;
  desc: string;
}

export interface AboutContents {
  concept: {
    ttl: string;
    desc: string;
  };
  features: {
    ttl: string;
    items: string[];
  };
  tech: {
    ttl: string;
    desc: string;
    items: TechItem[];
  };
}

export interface AboutPageData {
  head: PageHead;
  breadcrumbs: BreadcrumbItem[];
  contents: AboutContents;
}

// ============================================================
// サンプル（オウンドメディア）ページ
// ============================================================

export interface ArticleItem {
  href: string;
  ttl: string;
  desc: string;
  date: string;
  category: string;
  img: string;
  imgAlt: string;
}

export interface CategoryItem {
  name: string;
  children: string[];
}

export interface QaItem {
  q: string;
  a: string;
}

export interface VideoItem {
  ttl: string;
  desc: string;
  thumbnail: string;
  videoUrl: string;
}

export interface SampleContents {
  hero: {
    ttl: string;
    subTtl: string;
    desc: string;
  };
  articles: {
    ttl: string;
    items: ArticleItem[];
  };
  categories: {
    ttl: string;
    items: CategoryItem[];
  };
  qa: {
    ttl: string;
    items: QaItem[];
  };
  videos: {
    ttl: string;
    items: VideoItem[];
  };
}

export interface SamplePageData {
  head: PageHead;
  breadcrumbs: BreadcrumbItem[];
  contents: SampleContents;
}

// ============================================================
// 投稿（動的ページ）
// ============================================================

/** 投稿のセクション（ACF シリアルグループ） */
export interface PostSection {
  ttl: string | null;
  content: string | null;
}

export interface PostData {
  slug: string;
  ttl: string;
  date: string;
  sections: PostSection[];
  category: string;
  categorySlug: string;
  img: string;
  imgAlt: string;
}
