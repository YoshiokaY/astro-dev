import { c as createAstro, a as createComponent, m as maybeRenderHead, d as addAttribute, b as renderTemplate } from '../../../../../../../.astro-internal/astro/server.js';

const $$Astro = createAstro("http://localhost:3000");
const $$Picture = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Picture;
  const {
    src,
    alt,
    sizes,
    class: className,
    lazy = true,
    lcp = false,
    sp = false
  } = Astro2.props;
  const [imgName, imgType] = src.split(/(?=\.[^.]+$)/);
  const spSrc = imgName + "_sp" + imgType;
  return renderTemplate`${sp ? renderTemplate`${maybeRenderHead()}<picture>
      ${src && renderTemplate`<source media="(min-width: 768px)"${addAttribute(src, "srcset")}${addAttribute(sizes ? sizes[0] : null, "width")}${addAttribute(sizes ? sizes[1] : null, "height")}>`}
      ${spSrc && renderTemplate`<img${addAttribute(spSrc, "src")}${addAttribute(alt ? alt : "", "alt")}${addAttribute(sizes ? sizes[2] : null, "width")}${addAttribute(sizes ? sizes[3] : null, "height")}${addAttribute(className, "class")}${addAttribute(lazy ? "lazy" : "eager", "loading")} decoding="async">`}
    </picture>` : renderTemplate`<img${addAttribute(src, "src")}${addAttribute(alt ? alt : "", "alt")}${addAttribute(sizes ? sizes[0] : null, "width")}${addAttribute(sizes ? sizes[1] : null, "height")}${addAttribute(className, "class")}${addAttribute(lazy ? "lazy" : "eager", "loading")} decoding="async"${addAttribute(lcp ? "high" : "auto", "fetchpriority")}>`}`;
}, "/Users/yoshioka.y/project/astro-dev/src/components/Picture.astro", void 0);

export { $$Picture as $ };
