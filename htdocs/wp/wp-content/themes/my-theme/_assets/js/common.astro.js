class HogeScript {
  constructor() {
    const element = document.querySelector("body");
    if (element) {
      console.log("読み込み完了しました");
    }
  }
}

const img = "/wp/wp-content/themes/my-theme/_assets/top/sample.png";

window.addEventListener("load", () => {
  new HogeScript();
  console.log(img);
});
