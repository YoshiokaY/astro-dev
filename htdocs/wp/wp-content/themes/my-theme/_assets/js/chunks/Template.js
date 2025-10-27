import { a as createComponent, m as maybeRenderHead, f as renderSlot, b as renderTemplate } from '../../../../../../../.astro-internal/astro/server.js';

const $$Template = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<main id="main" aria-label="本文">
  ${renderSlot($$result, $$slots["default"])}
</main>`;
}, "/Users/yoshioka.y/project/astro-dev/src/layouts/Template.astro", void 0);

export { $$Template as $ };
