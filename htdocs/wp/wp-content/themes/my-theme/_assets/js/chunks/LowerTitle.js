import { c as createAstro, a as createComponent, m as maybeRenderHead, b as renderTemplate } from '../../../../../../../.astro-internal/astro/server.js';

const $$Astro = createAstro("http://localhost:3000");
const $$LowerTitle = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$LowerTitle;
  const { title } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="bg-highlight">
  <div class="contentInner">
    <h1 class="c_ttl_lower">${title}</h1>
  </div>
</div>`;
}, "/Users/yoshioka.y/project/astro-dev/src/components/LowerTitle.astro", void 0);

export { $$LowerTitle as $ };
