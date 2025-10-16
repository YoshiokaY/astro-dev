import { HogeScript } from "./class/sample.ts";
import { SmoothScroll } from "./class/SmoothScroll.ts";
import { Hamburger } from "./class/Hamburger.ts";

window.addEventListener("load", () => {
  new HogeScript();
  new SmoothScroll();
  new Hamburger();
});
