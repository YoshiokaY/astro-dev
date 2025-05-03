class ScrollAnimation {
  /**
   * アニメーションを付与する要素
   * @parm {string}
   */
  target;
  /**
   * アニメーションを付与するためのクラス名
   * @parm {string}
   */
  active;
  constructor(TARGET = ".scrollIn,.scroll", ACTIVE = "-active") {
    this.target = TARGET;
    this.active = ACTIVE;
    const elements = document.querySelectorAll(TARGET);
    const elementArr = Array.prototype.slice.call(elements);
    const options = {
      root: null,
      // ビューポートをルート要素とする
      rootMargin: "0px 0px",
      // ビューポートの中心を判定基準にする
      threshold: 0
      // 閾値は0
    };
    const observer = new IntersectionObserver(callback, options);
    elementArr.forEach((box) => {
      observer.observe(box);
    });
    function callback(entries) {
      entries.forEach((entry) => {
        const target = entry.target;
        if (entry.isIntersecting && !target.classList.contains(ACTIVE)) {
          setTimeout(() => {
            target.classList.add(ACTIVE);
          }, 5);
        }
      });
    }
  }
}

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

class SmoothScroll {
  /**
   * 固定ヘッダーかどうか
   * @parm {string}
   */
  header_fix;
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
        if (urlTarget && this.header_fix) {
          const header = document.querySelector("header");
          const headerHeight = header?.clientHeight;
          urlTarget.style.scrollMarginBlockStart = String(headerHeight) + "px";
        }
        urlTarget.scrollIntoView({ behavior: "instant", inline: "end" });
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new Hamburger(); // ハンバーガー
  new ScrollAnimation(); // アニメーション
  new SmoothScroll(); // スムーススクロール
});
