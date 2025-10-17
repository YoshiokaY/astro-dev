/**
 * ハンバーガーメニュークラス
 *
 * モバイル用のハンバーガーメニューの開閉を制御します。
 * - メニューボタンクリックで開閉切り替え
 * - オーバーレイクリックで閉じる
 * - 閉じるボタンで閉じる
 * - ARIA属性の自動管理
 *
 * @example
 * // 基本的な使用方法
 * new Hamburger();
 *
 * @example
 * // カスタムセレクタを指定
 * new Hamburger(".my-nav", "-active");
 */
export class Hamburger {
  /**
   * ナビゲーション要素のセレクタ
   */
  target: string;

  /**
   * 展開時に付与されるクラス名
   */
  open: string;

  /**
   * @param TARGET - ナビゲーション要素のセレクタ（デフォルト: ".c_nav"）
   * @param OPEN - 展開時のクラス名（デフォルト: "-open"）
   */
  constructor(TARGET: string = ".c_nav", OPEN: string = "-open") {
    this.target = TARGET;
    this.open = OPEN;

    const nav = document.querySelector(TARGET);
    const btn = nav?.querySelector(".c_nav_btn") as HTMLElement;
    const btn_label = nav?.querySelector(".c_nav_btn span") as HTMLElement;
    const wrap = nav?.querySelector(".c_nav_wrapper");
    const close_btn = nav?.querySelector(".c_nav_close");

    // メニュー開閉ボタンのクリックイベント
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

    // 閉じるボタンのクリックイベント
    close_btn?.addEventListener("click", () => {
      menuClose();
    });

    // オーバーレイクリックで閉じる
    wrap?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      // ナビゲーション外をクリックした場合のみ閉じる
      if (target.closest("#navi") === null) {
        menuClose();
      }
    });

    /**
     * メニューを閉じる処理
     */
    const menuClose = () => {
      nav?.classList.remove(OPEN);
      btn.setAttribute("aria-expanded", "false");
      btn_label.textContent = "メニューを開く";
    };

    // 子メニュー機能（必要に応じてコメント解除）
    function subMenu() {
      const ac = document.querySelectorAll(".spAccordion");
      const HEIGHT = "--subHeightOpen"; // 開いた時の高さ
      const OFFSET_TIME = 5; // ディレイ
      let openFlg = false;
      const SPEED: number = 250;

      ac.forEach((btn) => {
        btn?.addEventListener("click", () => {
          const subMenu = btn.closest("div")?.nextElementSibling as HTMLElement;
          if (!openFlg) {
            subMenu.classList.add("-open"); // クラスの追加
            btn.classList.add("-open");

            const height = subMenu.offsetHeight; // 高さ取得
            subMenu.style.setProperty(HEIGHT, "0"); // アニメーション開始用の0

            // open付与から少しだけ遅らせた方が動作が安定する
            setTimeout(() => {
              // ※ コンテンツの高さはopenを付けたあとで取得しないと iOSで０になる
              subMenu.style.setProperty(HEIGHT, `${height}px`);
              openFlg = true;
            }, OFFSET_TIME);
          } else if (openFlg) {
            // アニメーション
            subMenu.style.setProperty(HEIGHT, "0");
            btn.classList.remove("-open");

            // アニメーション完了後にopenクラスを削除。（CSS側のアニメーション時間+少しだけ余裕をもたせている）
            setTimeout(() => {
              subMenu.classList.remove("-open"); // クラスを削除
              openFlg = false;
              subMenu.style.setProperty(HEIGHT, "auto"); // アニメーションの後始末
            }, SPEED + OFFSET_TIME);
          }
        });
      });
    }
    subMenu();
  }
}
