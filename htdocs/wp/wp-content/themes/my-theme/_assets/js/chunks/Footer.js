import { c as createAstro, a as createComponent, m as maybeRenderHead, d as addAttribute, b as renderTemplate } from '../../../../../../../.astro-internal/astro/server.js';
import { c as common } from './Common.js';

const $$Astro = createAstro("http://localhost:3000");
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Footer;
  const {
    copyright,
    footerData = common.footer,
    menu = common.menu
  } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<footer class="l_footer">
  <!-- メインフッターエリア -->
  <div class="footer-main">
    <div class="contentInner">
      <div class="footer-content">
        <!-- 会社情報 -->
        <div class="footer-section footer-company">
          <h2 class="footer-title">${footerData.companyInfo.name}</h2>
          <p class="footer-description">
            ${footerData.companyInfo.desc}
          </p>
        </div>

        <!-- サイトリンク（ヘッダーと共有データ） -->
        <div class="footer-section footer-links">
          <h2 class="footer-title">サイトリンク</h2>
          <ul class="footer-list">
            ${menu.map((link) => renderTemplate`<li class="footer-list-item">
                  <a${addAttribute(link.link, "href")} class="footer-link"${addAttribute(link.blank ? "_blank" : void 0, "target")}${addAttribute(link.blank ? "noopener noreferrer" : void 0, "rel")}>
                    ${link.txt}
                  </a>
                </li>`)}
            <!-- 追加のフッター専用リンク -->
            <li class="footer-list-item">
              <a href="/privacy/" class="footer-link">プライバシーポリシー</a>
            </li>
          </ul>
        </div>

        <!-- 使用技術 -->
        <div class="footer-section footer-tech">
          <h2 class="footer-title">${footerData.tech.ttl}</h2>
          <ul class="footer-list">
            ${footerData.tech.items.map((tech) => renderTemplate`<li class="footer-list-item">
                  <span class="footer-tech-item">${tech}</span>
                </li>`)}
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- コピーライトエリア -->
  <div class="footer-copyright">
    <div class="contentInner">
      <p class="copyright-text">
        &copy; ${(/* @__PURE__ */ new Date()).getFullYear()}
        ${copyright}. All rights reserved.
      </p>
    </div>
  </div>

  <!-- ページトップへ戻るボタン -->
  <a href="#" class="page_top" aria-label="ページトップへ戻る">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L4 12L5.41 13.41L11 7.83V20H13V7.83L18.59 13.41L20 12L12 4Z" fill="currentColor"></path>
    </svg>
  </a>
</footer>`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Footer.astro", void 0);

export { $$Footer as $ };
