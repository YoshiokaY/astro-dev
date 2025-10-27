import { c as createAstro, a as createComponent, m as maybeRenderHead, d as addAttribute, b as renderTemplate, u as unescapeHTML } from '../../../../../../../.astro-internal/astro/server.js';

const $$Astro$3 = createAstro("http://localhost:3000");
const $$Breadcrumbs = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Breadcrumbs;
  const { bread } = Astro2.props;
  const isLastItem = (index) => index === bread.length - 1;
  return renderTemplate`${maybeRenderHead()}<div class="my-20">
  <div class="contentInner">
    <nav id="breadcrumbs">
      <ol class="c_bread flex gap-30 md:gap-34" itemscope itemtype="https://schema.org/BreadcrumbList">
        ${bread.map((item, i) => renderTemplate`<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
              ${isLastItem(i) ? renderTemplate`<span itemprop="name">${item.text}</span>` : renderTemplate`<a${addAttribute(item.link, "href")} itemprop="item">
                  <span itemprop="name">${item.text}</span>
                </a>`}
              <meta itemprop="position"${addAttribute(String(i + 1), "content")}>
            </li>`)}
      </ol>
    </nav>
  </div>
</div>`;
}, "/Users/yoshioka.y/project/astro-dev/src/components/Breadcrumbs.astro", void 0);

const $$Astro$2 = createAstro("http://localhost:3000");
const $$Concept = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Concept;
  const { concept } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="about-section">
  <h2 class="section-title">${concept.ttl}</h2>
  <p class="section-description">${unescapeHTML(concept.desc)}</p>
</section>`;
}, "/Users/yoshioka.y/project/astro-dev/src/pages/_parts/_about/_concept.astro", void 0);

const $$Astro$1 = createAstro("http://localhost:3000");
const $$Features = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Features;
  const { features } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="about-section">
  <h2 class="section-title">${features.ttl}</h2>
  <ul class="feature-list">
    ${features.items.map((feature) => renderTemplate`<li class="feature-item">${unescapeHTML(feature)}</li>`)}
  </ul>
</section>`;
}, "/Users/yoshioka.y/project/astro-dev/src/pages/_parts/_about/_features.astro", void 0);

const $$Astro = createAstro("http://localhost:3000");
const $$Tech = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Tech;
  const { tech } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="about-section">
  <h2 class="section-title">${tech.ttl}</h2>
  <p class="section-description">${unescapeHTML(tech.desc)}</p>
  <div class="tech-grid">
    ${tech.items.map((techItem) => renderTemplate`<div class="tech-card">
        <h3 class="tech-name">${techItem.name}</h3>
        <p class="tech-desc">${unescapeHTML(techItem.desc)}</p>
      </div>`)}
  </div>
</section>`;
}, "/Users/yoshioka.y/project/astro-dev/src/pages/_parts/_about/_tech.astro", void 0);

export { $$Breadcrumbs as $, $$Concept as a, $$Features as b, $$Tech as c };
