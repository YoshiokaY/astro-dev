// ハンバーガーメニュー
export class Hamburger {
  /**
   * ナビゲーション要素のCSSセレクター
   * @param {string} target - ナビゲーション要素を指定するCSSセレクター
   */
  target: string;

  /**
   * メニュー展開時に付与するクラス名
   * @param {string} open - メニューが開いている状態を示すクラス名
   */
  open: string;

  /**
   * ハンバーガーメニューのインスタンスを生成し、イベントリスナーを設定します。
   * @param {string} [TARGET=".headerNavi"] - ナビゲーション要素を指定するCSSセレクター（デフォルト: ".headerNavi"）
   * @param {string} [OPEN="-open"] - メニュー展開時に付与するクラス名（デフォルト: "-open"）
   */
  constructor(TARGET: string = ".headerNavi", OPEN: string = "-open") {
    this.target = TARGET;
    this.open = OPEN;
    const nav = document.querySelector(TARGET);
    const btn = nav?.querySelector(".ac_menu") as HTMLElement;
    const btn_label = nav?.querySelector(".ac_menu span") as HTMLElement;
    const wrap = nav?.querySelector(".naviWrapper");
    const close_btn = nav?.querySelector(".closeBtn");

    /**
     * メニューの開閉を切り替えるクリックイベントリスナー
     */
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

    /**
     * メニューを閉じるクリックイベントリスナー（閉じるボタン用）
     */
    close_btn?.addEventListener("click", () => {
      this.menuClose(nav, btn, btn_label, OPEN);
    });

    /**
     * メニュー領域外をクリックした際にメニューを閉じるイベントリスナー
     */
    wrap?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest("#navi") === null) {
        this.menuClose(nav, btn, btn_label, OPEN);
      }
    });

    // サブメニュー
    const subOpen = nav?.querySelectorAll(".spAccordion");
    let openFlg = false;

    /**
     * サブメニューの開閉を切り替えるイベントリスナー
     */
    subOpen?.forEach((btn) => {
      btn?.addEventListener("click", () => {
        const hasChild = btn.closest(".has-child") as HTMLElement;
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
  private menuClose(nav: Element | null, btn: HTMLElement | null, btn_label: HTMLElement | null, openClass: string): void {
    nav?.classList.remove(openClass);
    btn?.setAttribute("aria-expanded", "false");
    btn_label!.textContent = "メニューを開く";
  }
}
