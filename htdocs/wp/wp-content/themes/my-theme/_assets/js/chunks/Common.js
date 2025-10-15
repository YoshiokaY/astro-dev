import { c as createAstro, a as createComponent, b as renderTemplate } from '../../../../../../../.astro-internal/astro/server.js';

const $$Astro = createAstro("http://localhost:3000");
const common = {
  head: {
    siteName: "Astro\u30B5\u30F3\u30D7\u30EB\u30B5\u30A4\u30C8",
    domain: "https://www.example.com/",
    favicon: "/favicon.ico",
    ogImg: "https://www.example.com/_assets/img/ogimg.jpg",
    logo: "https://www.example.com/_assets/img/logo.svg",
    // JSON LD用企業ロゴ
    copyright: "Sample Site",
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
      txt: "\u30DB\u30FC\u30E0"
    },
    {
      link: "/about/",
      txt: "\u6982\u8981"
    },
    {
      link: "/contact/",
      txt: "\u304A\u554F\u3044\u5408\u308F\u305B"
    }
  ],
  footer: {
    companyInfo: {
      name: "Astro\u30B5\u30F3\u30D7\u30EB\u30B5\u30A4\u30C8",
      desc: "\u30E2\u30C0\u30F3\u306AWeb\u30B5\u30A4\u30C8\u69CB\u7BC9\u306E\u305F\u3081\u306E\u30C7\u30E2\u30F3\u30B9\u30C8\u30EC\u30FC\u30B7\u30E7\u30F3\u30B5\u30A4\u30C8\u3067\u3059\u3002Astro\u30D5\u30EC\u30FC\u30E0\u30EF\u30FC\u30AF\u3092\u4F7F\u7528\u3057\u3066\u4F5C\u6210\u3055\u308C\u3066\u3044\u307E\u3059\u3002"
    },
    tech: {
      ttl: "\u4F7F\u7528\u6280\u8853",
      items: [
        "Astro",
        "TypeScript",
        "SCSS",
        "Tailwind CSS"
      ]
    }
  }
};
const $$Common = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Common;
  return renderTemplate``;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Common.astro", void 0);

export { common as c };
