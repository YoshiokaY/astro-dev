class Hamburger {
  /**
   * ナビゲーション要素のCSSセレクター
   * @param {string} target - ナビゲーション要素を指定するCSSセレクター
   */
  target;
  /**
   * メニュー展開時に付与するクラス名
   * @param {string} open - メニューが開いている状態を示すクラス名
   */
  open;
  /**
   * ハンバーガーメニューのインスタンスを生成し、イベントリスナーを設定します。
   * @param {string} [TARGET=".headerNavi"] - ナビゲーション要素を指定するCSSセレクター（デフォルト: ".headerNavi"）
   * @param {string} [OPEN="-open"] - メニュー展開時に付与するクラス名（デフォルト: "-open"）
   */
  constructor(TARGET = ".headerNavi", OPEN = "-open") {
    this.target = TARGET;
    this.open = OPEN;
    const nav = document.querySelector(TARGET);
    const btn = nav?.querySelector(".ac_menu");
    const btn_label = nav?.querySelector(".ac_menu span");
    const wrap = nav?.querySelector(".naviWrapper");
    const close_btn = nav?.querySelector(".closeBtn");
    btn?.addEventListener("click", () => {
      nav?.classList.toggle(OPEN);
      if (nav?.classList.contains(OPEN)) {
        btn.setAttribute("aria-expanded", "true");
        btn_label.textContent = "メニューを閉じる";
      } else {
        btn.setAttribute("aria-expanded", "false");
        btn_label.textContent = "メニューを開く";
      }
    });
    close_btn?.addEventListener("click", () => {
      this.menuClose(nav, btn, btn_label, OPEN);
    });
    wrap?.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest("#navi") === null) {
        this.menuClose(nav, btn, btn_label, OPEN);
      }
    });
    const subOpen = nav?.querySelectorAll(".spAccordion");
    let openFlg = false;
    subOpen?.forEach((btn2) => {
      btn2?.addEventListener("click", () => {
        const hasChild = btn2.closest(".has-child");
        if (!openFlg) {
          hasChild.classList.add(OPEN);
          openFlg = true;
        } else if (openFlg) {
          hasChild.classList.remove(OPEN);
          openFlg = false;
        }
      });
    });
  }
  /**
   * メニューを閉じる処理
   * @param {Element | null} nav - ナビゲーション要素
   * @param {HTMLElement | null} btn - ハンバーガーボタン要素
   * @param {HTMLElement | null} btn_label - ハンバーガーボタン内のテキスト要素
   * @param {string} openClass - メニュー展開時に付与するクラス名
   * @private
   */
  menuClose(nav, btn, btn_label, openClass) {
    nav?.classList.remove(openClass);
    btn?.setAttribute("aria-expanded", "false");
    btn_label.textContent = "メニューを開く";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new Hamburger();
});
