import { ScrollAnimation } from "@/ts/class/Animation";
import { Hamburger } from "@/ts/class/Hamburger";
import { SmoothScroll } from "@/ts/class/SmoothScroll";

window.addEventListener("DOMContentLoaded", () => {
  new Hamburger(); // ハンバーガー
  new ScrollAnimation(); // アニメーション
  new SmoothScroll(); // スムーススクロール
});
