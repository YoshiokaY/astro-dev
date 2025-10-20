import { Hamburger } from "./class/Hamburger.ts";
import { HogeScript } from "./class/sample.ts";
import { SmoothScroll } from "./class/SmoothScroll.ts";

const img = "/wp/wp-content/themes/my-theme/_assets/top/sample.png";

window.addEventListener("load", () => {
  new HogeScript();
  new SmoothScroll();
  new Hamburger();
});
