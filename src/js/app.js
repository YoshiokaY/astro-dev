import { HogeScript } from "./class/sample.ts";
import { SmoothScroll } from "./class/SmoothScroll.ts";
import { GlobalNav } from "./class/GlobalNav.ts";

window.addEventListener("load", () => {
  new HogeScript();
  new SmoothScroll();
  new GlobalNav();
});
