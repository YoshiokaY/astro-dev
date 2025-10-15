import { a as createComponent, b as renderTemplate, c as createAstro, u as unescapeHTML, d as addAttribute, r as renderComponent, g as renderHead, m as maybeRenderHead } from '../../../../../../../.astro-internal/astro/server.js';

const $$BeginHead = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- GTAG -->`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/BeginHead.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a, _b;
const $$Astro$2 = createAstro("http://localhost:3000");
const $$JsonLd = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$JsonLd;
  const { site, page, event } = Astro2.props;
  return renderTemplate`${page.slug === "top" ? renderTemplate(_a || (_a = __template(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      url: site.domain,
      logo: site.logo
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: page.ttl
        }
      ]
    },
    ...event ? [
      {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: event.location.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.location.address.streetAddress,
            addressLocality: event.location.address.addressLocality,
            postalCode: event.location.address.postalCode,
            addressRegion: event.location.address.addressRegion,
            addressCountry: "JP"
          }
        },
        image: event.image,
        description: event.description
      }
    ] : []
  ]))) : renderTemplate(_b || (_b = __template(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      url: site.domain,
      logo: site.logo
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: site.siteName,
          item: site.domain
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.ttl
        }
      ]
    },
    ...event ? [
      {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: event.location.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.location.address.streetAddress,
            addressLocality: event.location.address.addressLocality,
            postalCode: event.location.address.postalCode,
            addressRegion: event.location.address.addressRegion,
            addressCountry: "JP"
          }
        },
        image: event.image,
        description: event.description
      }
    ] : []
  ])))}`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/JsonLd.astro", void 0);

const $$Astro$1 = createAstro("http://localhost:3000");
const $$Head = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Head;
  const {
    site,
    page,
    event
  } = Astro2.props;
  return renderTemplate`<head${addAttribute(page.slug == "top" ? "og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# website: http://ogp.me/ns/website#" : "og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# http://ogp.me/ns/fb# article: http://ogp.me/ns/article#", "prefix")}>
	<meta charset="utf-8">
  ${renderComponent($$result, "BeginHead", $$BeginHead, {})}
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width,initial-scale=1.0,shrink-to-fit=no">
	<meta name="format-detection" content="telephone=no">
	<title>${page.ttl}</title>
	<meta name="description"${addAttribute(page.description, "content")}>
	<meta property="og:type"${addAttribute(page.slug == "top" ? "website" : "article", "content")}>
	<meta property="og:local" content="ja_JP">
	<meta property="og:site_name"${addAttribute(site.siteName, "content")}>
	<meta property="og:title"${addAttribute(page.ttl, "content")}>
	<meta property="og:description"${addAttribute(page.description, "content")}>
	<meta property="og:url"${addAttribute(site.domain + page.url, "content")}>
	<meta property="og:image"${addAttribute(site.ogImg, "content")}>
  ${site.facebookID && renderTemplate`<meta property="fb:app_id" ,${addAttribute(site.facebookID, "content")}>`}
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title"${addAttribute(page.ttl, "content")}>
	<meta name="twitter:description"${addAttribute(page.description, "content")}>
	<meta name="twitter:image"${addAttribute(site.ogImg, "content")}>
  ${site.twitterName && renderTemplate`<meta name="twitter:site" ,${addAttribute("@" + site.twitterName, "content")}>`}
	<link rel="icon"${addAttribute(site.favicon, "href")} sizes="32x32">
  ${site.svgIcon && renderTemplate`<link rel="icon"${addAttribute(site.svgIcon, "href")} type="image/svg+xml">`}
  ${site.touchIcon && renderTemplate`<link rel="apple-touch-icon"${addAttribute(site.touchIcon, "href")}>`}
	<link rel="canonical"${addAttribute(site.domain + page.url, "href")}>
  ${site.webfont && renderTemplate`<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload"${addAttribute(site.webfont, "href")} as="style" onload="this.onload=null;this.rel='stylesheet'">
    ${maybeRenderHead()}<noscript>
      <link rel="stylesheet"${addAttribute(site.webfont, "href")}>
    </noscript>`}
    ${renderComponent($$result, "JsonLd", $$JsonLd, { "site": site, "page": page, "event": event })}
${renderHead()}</head>`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Head.astro", void 0);

const $$Astro = createAstro("http://localhost:3000");
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Header;
  const { slug, siteName, menu, domain } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<header class="l_header">
  <div class="contentInner">
    <div class="header-inner">
      <!-- サイトロゴ -->
      ${slug === "top" ? renderTemplate`<h1 class="header-logo">
            <a href="/" class="logo-link">
              <span class="logo-text">${siteName}</span>
            </a>
          </h1>` : renderTemplate`<div class="header-logo">
            <a href="/" class="logo-link">
              <span class="logo-text">${siteName}</span>
            </a>
          </div>`}

      <!-- グローバルナビゲーション -->
      <nav class="header-nav">
        <h2 class="txtHidden">グローバルメニュー</h2>
        <ul class="nav-list">
          ${menu.map((item) => renderTemplate`<li class="nav-item">
                <a${addAttribute(item.link, "href")}${addAttribute(`nav-link ${slug === "sample" && item.link === "/" ? "is-current" : ""}`, "class")}${addAttribute(item.blank ? "_blank" : void 0, "target")}${addAttribute(item.blank ? "noopener noreferrer" : void 0, "rel")}>
                  ${item.txt}
                </a>
              </li>`)}
        </ul>
      </nav>

      <!-- モバイルメニューボタン -->
      <button class="header-menu-btn" type="button" aria-label="メニューを開く">
        <span class="menu-btn-line"></span>
        <span class="menu-btn-line"></span>
        <span class="menu-btn-line"></span>
      </button>
    </div>
  </div>
</header>`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Header.astro", void 0);

const $$BeginBody = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<noscript>
  <p>
    このページは JavaScript を使用しています。<br>お使いのブラウザーは
    JavaScript が無効になっているか、JavaScript に対応していません。<br>適切にこのページ表示する場合は JavaScriptを有効にするか、JavaScript
    に対応しているブラウザーでアクセスしてください。
  </p>
</noscript>
<a href="#main" class="txtHidden skipLink">本文へ移動</a>

<!-- GTAG -->`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/BeginBody.astro", void 0);

export { $$Head as $, $$BeginBody as a, $$Header as b };
