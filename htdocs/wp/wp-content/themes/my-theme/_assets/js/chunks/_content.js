import { c as createAstro, a as createComponent, m as maybeRenderHead, u as unescapeHTML, r as renderComponent, b as renderTemplate } from '../../../../../../../.astro-internal/astro/server.js';
import { $ as $$Picture } from './Picture.js';

const $$Astro = createAstro("http://localhost:3000");
const $$Content = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Content;
  const { contents, imgPath } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="p_sample_hero">
  <div class="contentInner">
    <div class="grid gap-40 py-60">
      <div>
        <h2 class="text-h2">${contents.ttl}</h2>
        <div class="mt-20">
          ${contents.desc.map((paragraph) => renderTemplate`<p>${unescapeHTML(paragraph)}</p>`)}
        </div>
      </div>

      <div>
        <h2 class="text-h2 mb-16">${contents.features.ttl}</h2>
        <ul class="grid gap-12">
          ${contents.features.items.map((item) => renderTemplate`<li>${item}</li>`)}
        </ul>
      </div>

      <div>
        <h2 class="text-h2 mb-16">${unescapeHTML(contents.textSample.ttl)}</h2>
        <p class="text-base">${unescapeHTML(contents.textSample.content)}</p>
      </div>

      <div>
        <h2 class="text-h2 mb-16">${unescapeHTML(contents.pictureDemo.ttl)}</h2>
        <p class="text-prime mb-24 text-base">${unescapeHTML(contents.pictureDemo.desc)}</p>
        <div class="picture-demo-container">
          ${renderComponent($$result, "Picture", $$Picture, { "src": imgPath + contents.pictureDemo.img.src, "alt": contents.pictureDemo.img.alt, "sizes": contents.pictureDemo.img.sizes, "class": "picture-demo-image" })}
        </div>
      </div>
    </div>
  </div>
</section>`;
}, "/Users/yoshioka.y/project/astro-dev/src/pages/_parts/_top/_content.astro", void 0);

export { $$Content as $ };
