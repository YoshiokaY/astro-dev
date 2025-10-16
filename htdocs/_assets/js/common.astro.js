class HogeScript {
  constructor() {
    const element = document.querySelector("body");
    if (element) {
      console.log("読み込み完了しました");
    }
  }
}

class SmoothScroll {
  /**
   * 固定ヘッダーの有無
   * @default false
   */
  header_fix;
  /**
   * スムーススクロールを初期化します
   *
   * @param HEADER_FIX - 固定ヘッダーがある場合は true
   */
  constructor(HEADER_FIX = false) {
    this.header_fix = HEADER_FIX;
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const href = anchor.getAttribute("href");
        let target;
        if (!href) {
          return;
        }
        if (href === "#") {
          target = document.body;
          smoothScroll(target);
        } else if (href) {
          target = document.getElementById(href.replace("#", ""));
          if (target && this.header_fix) {
            const header = document.querySelector("header");
            const headerHeight = header?.clientHeight;
            target.style.scrollMarginBlockStart = String(headerHeight) + "px";
          }
          smoothScroll(target);
        }
      });
    });
    function smoothScroll(target) {
      const isPrefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scrollBehavior = isPrefersReduced ? "instant" : "smooth";
      setTimeout(() => {
        target?.focus({ preventScroll: true });
        if (document.activeElement !== target) {
          target?.setAttribute("tabindex", "-1");
          target?.focus({ preventScroll: true });
        }
        target?.scrollIntoView({ behavior: scrollBehavior, inline: "end" });
      }, 0);
    }
    const urlHash = location.hash;
    if (urlHash) {
      const urlTarget = document.querySelector(urlHash);
      if (urlTarget) {
        if (this.header_fix) {
          const header = document.querySelector("header");
          const headerHeight = header?.clientHeight;
          urlTarget.style.scrollMarginBlockStart = String(headerHeight) + "px";
        }
        urlTarget.scrollIntoView({ behavior: "instant", inline: "end" });
      }
    }
  }
}

class Hamburger {
  /**
   * ナビゲーション要素のセレクタ
   */
  target;
  /**
   * 展開時に付与されるクラス名
   */
  open;
  /**
   * @param TARGET - ナビゲーション要素のセレクタ（デフォルト: ".c_nav"）
   * @param OPEN - 展開時のクラス名（デフォルト: "-open"）
   */
  constructor(TARGET = ".c_nav", OPEN = "-open") {
    this.target = TARGET;
    this.open = OPEN;
    const nav = document.querySelector(TARGET);
    const btn = nav?.querySelector(".c_nav_btn");
    const btn_label = nav?.querySelector(".c_nav_btn span");
    const wrap = nav?.querySelector(".c_nav_wrapper");
    const close_btn = nav?.querySelector(".c_nav_close");
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
      menuClose();
    });
    wrap?.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest("#navi") === null) {
        menuClose();
      }
    });
    const menuClose = () => {
      nav?.classList.remove(OPEN);
      btn.setAttribute("aria-expanded", "false");
      btn_label.textContent = "メニューを開く";
    };
    function subMenu() {
      const ac = document.querySelectorAll(".spAccordion");
      const HEIGHT = "--subHeightOpen";
      const OFFSET_TIME = 5;
      let openFlg = false;
      const SPEED = 250;
      ac.forEach((btn2) => {
        btn2?.addEventListener("click", () => {
          const subMenu2 = btn2.closest("div")?.nextElementSibling;
          if (!openFlg) {
            subMenu2.classList.add("-open");
            btn2.classList.add("-open");
            const height = subMenu2.offsetHeight;
            subMenu2.style.setProperty(HEIGHT, "0");
            setTimeout(() => {
              subMenu2.style.setProperty(HEIGHT, `${height}px`);
              openFlg = true;
            }, OFFSET_TIME);
          } else if (openFlg) {
            subMenu2.style.setProperty(HEIGHT, "0");
            btn2.classList.remove("-open");
            setTimeout(() => {
              subMenu2.classList.remove("-open");
              openFlg = false;
              subMenu2.style.setProperty(HEIGHT, "auto");
            }, SPEED + OFFSET_TIME);
          }
        });
      });
    }
    subMenu();
  }
}

window.addEventListener("load", () => {
  new HogeScript();
  new SmoothScroll();
  new Hamburger();
});
