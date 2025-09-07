/* empty css             */
import { a as createComponent, r as renderTemplate, c as createAstro, b as addAttribute, d as renderComponent, e as renderHead, m as maybeRenderHead, f as renderSlot, g as renderScript } from './astro/server.js';

const $$BeginHead = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- GTAG -->`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/BeginHead.astro", void 0);

const $$Astro$3 = createAstro("http://localhost:3000");
const $$Head = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Head;
  const {
    site,
    page
  } = Astro2.props;
  return renderTemplate`<head${addAttribute(page.slug == "top" ? "og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# website: http://ogp.me/ns/website#" : "og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# http://ogp.me/ns/fb# article: http://ogp.me/ns/article#", "prefix")}><meta charset="utf-8">${renderComponent($$result, "BeginHead", $$BeginHead, {})}<meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1.0,shrink-to-fit=no"><meta name="format-detection" content="telephone=no"><title>${page.title}</title><meta name="description"${addAttribute(page.description, "content")}><meta property="og:type"${addAttribute(page.slug == "top" ? "website" : "article", "content")}><meta property="og:local" content="ja_JP"><meta property="og:site_name"${addAttribute(site.siteName, "content")}><meta property="og:title"${addAttribute(page.title, "content")}><meta property="og:description"${addAttribute(page.description, "content")}><meta property="og:url"${addAttribute(site.domain + page.url, "content")}><meta property="og:image"${addAttribute(site.ogImg, "content")}>${site.facebookID && renderTemplate`<meta property="fb:app_id" ,${addAttribute(site.facebookID, "content")}>`}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(page.title, "content")}><meta name="twitter:description"${addAttribute(page.description, "content")}><meta name="twitter:image"${addAttribute(site.ogImg, "content")}>${site.twitterName && renderTemplate`<meta name="twitter:site" ,${addAttribute("@" + site.twitterName, "content")}>`}<link rel="icon"${addAttribute(site.favicon, "href")} sizes="32x32">${site.svgIcon && renderTemplate`<link rel="icon"${addAttribute(site.svgIcon, "href")} type="image/svg+xml">`}${site.touchIcon && renderTemplate`<link rel="apple-touch-icon"${addAttribute(site.touchIcon, "href")}>`}<link rel="canonical"${addAttribute(site.domain + page.url, "href")}>${site.webfont && renderTemplate`<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload"${addAttribute(site.webfont, "href")} as="style" onload="this.onload=null;this.rel='stylesheet'">
    ${maybeRenderHead()}<noscript><link rel="stylesheet"${addAttribute(site.webfont, "href")}></noscript>`}${renderHead()}</head>`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Head.astro", void 0);

const $$Astro$2 = createAstro("http://localhost:3000");
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Header;
  const { slug, siteName, menu, domain } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<header class="l_header"> <div class="contentInner">ヘッダー</div> </header>`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Header.astro", void 0);

const $$BeginBody = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<noscript><p>
このページは JavaScript を使用しています。<br>お使いのブラウザーは
    JavaScript が無効になっているか、JavaScript に対応していません。<br>適切にこのページ表示する場合は JavaScriptを有効にするか、JavaScript
    に対応しているブラウザーでアクセスしてください。
</p></noscript><a href="#main" class="txtHidden skipLink">本文へ移動</a><!-- GTAG -->`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/BeginBody.astro", void 0);

const $$Astro$1 = createAstro("http://localhost:3000");
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Footer;
  const { copyright } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<footer class="l_footer"> <div class="bg-highlight"> <div class="contentInner h-300">フッター</div> </div> <div class="bg-prime text-reversal"> <p class="py-20 text-center text-sm">
&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${copyright} </p> </div> </footer>`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Footer.astro", void 0);

const common = {
  head: {
    siteName: "\u25EF\u25EF\u25EF\u25EF\u25EF\u25EF",
    domain: "https://www.XXXXX.XX.XX/",
    favicon: "/favicon.ico",
    ogImg: "https://www.XXXXX.XX.XX/_assets/img/ogimg.jpg",
    logo: "https://www.XXXXX.XX.XX/_assets/img/logo.svg",
    // JSON LD用企業ロゴ
    copyright: "XXXX",
    webfont: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap",
    // 不要の場合は空
    twitterName: "",
    // Twitterアカウントある場合記述
    facebookID: ""
    // Facebookアカウントある場合記述
  },
  menu: [
    {
      link: "/",
      txt: "\u30C8\u30C3\u30D7"
    },
    {
      link: "/news/",
      txt: "\u304A\u77E5\u3089\u305B"
    },
    {
      link: "/about/",
      txt: "\u6982\u8981"
    },
    {
      link: "/sample/",
      txt: "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8",
      child: [
        {
          link: "#tab",
          txt: "\u30BF\u30D6",
          anchor: true
        },
        {
          link: "#accordion",
          txt: "\u30A2\u30B3\u30FC\u30C7\u30A3\u30AA\u30F3",
          blank: true,
          anchor: true
        },
        {
          link: "/sample/filter/",
          txt: "\u30D5\u30A3\u30EB\u30BF\u30FC"
        }
      ]
    }
  ]
};
createComponent(($$result, $$props, $$slots) => {
  return renderTemplate``;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Common.astro", void 0);

const $$Astro = createAstro("http://localhost:3000");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { page } = Astro2.props;
  return renderTemplate`<html dir="ltr" lang="ja"> ${renderComponent($$result, "Head", $$Head, { "site": common.head, "page": page })}${maybeRenderHead()}<body${addAttribute("page-" + page.slug, "class")}> ${renderComponent($$result, "BeginBody", $$BeginBody, {})} ${renderComponent($$result, "Header", $$Header, { "siteName": common.head.siteName, "domain": common.head.domain, "menu": common.menu, "slug": page.slug })} <main id="main"> ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "Footer", $$Footer, { "copyright": common.head.copyright })} ${renderScript($$result, "/Users/yoshioka.y/project/astro-dev/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
