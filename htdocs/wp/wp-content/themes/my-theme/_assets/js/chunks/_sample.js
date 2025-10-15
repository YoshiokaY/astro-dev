import { c as createAstro, a as createComponent, m as maybeRenderHead, d as addAttribute, b as renderTemplate, u as unescapeHTML, r as renderComponent } from '../../../../../../../.astro-internal/astro/server.js';

const $$Astro$1 = createAstro("http://localhost:3000");
const $$Picture = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Picture;
  const {
    src,
    alt,
    sizes,
    class: className,
    lazy = true,
    sp = false
  } = Astro2.props;
  const [imgName, imgType] = src.split(/(?=\.[^.]+$)/);
  const spSrc = imgName + "_sp" + imgType;
  return renderTemplate`${sp ? renderTemplate`${maybeRenderHead()}<picture>
      ${src && renderTemplate`<source media="(min-width: 768px)"${addAttribute(src, "srcset")}${addAttribute(sizes ? sizes[0] : null, "width")}${addAttribute(sizes ? sizes[1] : null, "height")}>`}
      ${spSrc && renderTemplate`<img${addAttribute(spSrc, "src")}${addAttribute(alt ? alt : "", "alt")}${addAttribute(sizes ? sizes[2] : null, "width")}${addAttribute(sizes ? sizes[3] : null, "height")}${addAttribute(className, "class")}${addAttribute(lazy ? "lazy" : "eager", "loading")} decoding="async">`}
    </picture>` : renderTemplate`<img${addAttribute(src, "src")}${addAttribute(alt ? alt : "", "alt")}${addAttribute(sizes ? sizes[0] : null, "width")}${addAttribute(sizes ? sizes[1] : null, "height")}${addAttribute(className, "class")}${addAttribute(lazy ? "lazy" : "eager", "loading")} decoding="async">`}`;
}, "/Users/yoshioka.y/project/astro-dev/src/components/Picture.astro", void 0);

const $$Astro = createAstro("http://localhost:3000");
const $$Sample = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Sample;
  const { contents, imgPath } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="p_sample_hero">
  <div class="contentInner">
    <div class="py-60">
      <h2 class="c_ttl">${contents.ttl}</h2>
      <div class="mt-20">
        ${contents.desc.map((paragraph) => renderTemplate`<p>${unescapeHTML(paragraph)}</p>`)}
      </div>

      <div class="mt-40">
        <h2 class="text-h1 mb-16">${contents.features.ttl}</h2>
        <ul class="grid gap-12">
          ${contents.features.items.map((item) => renderTemplate`<li>${item}</li>`)}
        </ul>
      </div>

      <div class="mt-40">
        <h2 class="text-h1 mb-16">${contents.textSample.ttl}</h2>
        <p class="text-base">
          ${contents.textSample.content}
        </p>
      </div>

      <div class="mt-40">
        <h2 class="text-h1 mb-16">${contents.pictureDemo.ttl}</h2>
        <p class="text-prime mb-24 text-base">${unescapeHTML(contents.pictureDemo.desc)}</p>
        <div class="picture-demo-container">
          ${renderComponent($$result, "Picture", $$Picture, { "src": imgPath + contents.pictureDemo.img.src, "alt": contents.pictureDemo.img.alt, "sizes": contents.pictureDemo.img.sizes, "class": "picture-demo-image" })}
        </div>
      </div>
    </div>
  </div>
</section>`;
}, "/Users/yoshioka.y/project/astro-dev/src/pages/_parts/_top/_sample.astro", void 0);

export { $$Sample as $ };
