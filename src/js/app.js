import { HogeScript } from "./class/sample.ts";

const img = "/wp/wp-content/themes/my-theme/_assets/top/sample.png";

window.addEventListener("load", () => {
  new HogeScript();
  console.log(img);
});
