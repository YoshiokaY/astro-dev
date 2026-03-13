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

class GlobalNav {
  nav = null;
  btn = null;
  btnLabel = null;
  wrapper = null;
  closeBtn = null;
  triggers = null;
  openClass = "-open";
  breakpoint = 768;
  isOpen = false;
  focusableElements = [];
  firstFocusable = null;
  lastFocusable = null;
  constructor(options = {}) {
    const { navSelector = ".c_nav", openClass = "-open", breakpoint = 768 } = options;
    this.openClass = openClass;
    this.breakpoint = breakpoint;
    this.nav = document.querySelector(navSelector);
    if (!this.nav) return;
    this.btn = this.nav.querySelector(`${navSelector}_btn`);
    this.btnLabel = this.nav.querySelector(`${navSelector}_btn_label`);
    this.wrapper = this.nav.querySelector(`${navSelector}_wrapper`);
    this.closeBtn = this.nav.querySelector(`${navSelector}_close`);
    this.triggers = this.nav.querySelectorAll(`${navSelector}_trigger`);
    this.init();
  }
  /**
   * 初期化
   */
  init() {
    this.bindEvents();
    this.setupChildMenus();
    this.handleResize();
    window.addEventListener("resize", () => this.handleResize());
  }
  /**
   * イベントバインド
   */
  bindEvents() {
    this.btn?.addEventListener("click", () => this.toggle());
    this.closeBtn?.addEventListener("click", () => this.close());
    this.wrapper?.addEventListener("click", (e) => {
      if (e.target === this.wrapper) {
        this.close();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
        this.btn?.focus();
      }
    });
    this.wrapper?.addEventListener("keydown", (e) => this.handleFocusTrap(e));
    this.setupAnchorLinks();
  }
  /**
   * アンカーリンクのクリックイベントを設定
   * SP時にアンカーリンクをクリックした際、スクロール後にメニューを閉じる
   */
  setupAnchorLinks() {
    const anchorLinks = this.nav?.querySelectorAll('a[href^="#"]');
    anchorLinks?.forEach((link) => {
      link.addEventListener("click", () => {
        if (this.isSP() && this.isOpen) {
          setTimeout(() => {
            this.close();
          }, 100);
        }
      });
    });
  }
  /**
   * 子メニューのセットアップ
   */
  setupChildMenus() {
    this.triggers?.forEach((trigger) => {
      const parent = trigger.closest(".c_nav_item");
      const child = parent?.querySelector(".c_nav_child");
      if (!child) return;
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleChildMenu(trigger, child);
      });
      trigger.addEventListener("keydown", (e) => {
        if (!this.isSP() && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          this.toggleChildMenu(trigger, child);
        }
      });
    });
  }
  /**
   * メニューの開閉トグル
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  /**
   * メニューを開く
   */
  open() {
    this.isOpen = true;
    this.nav?.classList.add(this.openClass);
    this.btn?.setAttribute("aria-expanded", "true");
    this.btn?.setAttribute("aria-label", "メニューを閉じる");
    if (this.btnLabel) {
      this.btnLabel.textContent = "CLOSE";
    }
    this.updateFocusableElements();
    setTimeout(() => {
      this.firstFocusable?.focus();
    }, 100);
    document.body.style.overflow = "hidden";
  }
  /**
   * メニューを閉じる
   */
  close() {
    this.isOpen = false;
    this.nav?.classList.remove(this.openClass);
    this.btn?.setAttribute("aria-expanded", "false");
    this.btn?.setAttribute("aria-label", "メニューを開く");
    if (this.btnLabel) {
      this.btnLabel.textContent = "メニュー";
    }
    this.triggers?.forEach((trigger) => {
      const parent = trigger.closest(".c_nav_item");
      const child = parent?.querySelector(".c_nav_child");
      if (child) {
        this.closeChildMenu(trigger, child);
      }
    });
    document.body.style.overflow = "";
  }
  /**
   * 子メニューのトグル
   */
  toggleChildMenu(trigger, child) {
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      this.closeChildMenu(trigger, child);
    } else {
      this.openChildMenu(trigger, child);
    }
  }
  /**
   * 子メニューを開く
   */
  openChildMenu(trigger, child) {
    trigger.setAttribute("aria-expanded", "true");
    trigger.closest(".c_nav_item")?.classList.add(this.openClass);
    if (this.isSP()) {
      child.style.setProperty("--childHeight", "0px");
      child.removeAttribute("hidden");
      requestAnimationFrame(() => {
        const height = child.scrollHeight;
        child.style.setProperty("--childHeight", `${height}px`);
      });
    }
  }
  /**
   * 子メニューを閉じる
   */
  closeChildMenu(trigger, child) {
    trigger.setAttribute("aria-expanded", "false");
    trigger.closest(".c_nav_item")?.classList.remove(this.openClass);
    if (this.isSP()) {
      child.style.setProperty("--childHeight", "0px");
      setTimeout(() => {
        if (trigger.getAttribute("aria-expanded") === "false") {
          child.setAttribute("hidden", "");
        }
      }, 300);
    }
  }
  /**
   * フォーカストラップ
   */
  handleFocusTrap(e) {
    if (e.key !== "Tab" || !this.isSP()) return;
    this.updateFocusableElements();
    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  }
  /**
   * フォーカス可能な要素を更新
   */
  updateFocusableElements() {
    if (!this.wrapper) return;
    const focusableSelectors = ["a[href]", "button:not([disabled])", "input:not([disabled])", "select:not([disabled])", "textarea:not([disabled])", '[tabindex]:not([tabindex="-1"])'].join(", ");
    this.focusableElements = Array.from(this.wrapper.querySelectorAll(focusableSelectors)).filter((el) => {
      return !el.closest("[hidden]");
    });
    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }
  /**
   * リサイズ時の処理
   */
  handleResize() {
    if (!this.isSP() && this.isOpen) {
      this.close();
    }
    this.triggers?.forEach((trigger) => {
      const parent = trigger.closest(".c_nav_item");
      const child = parent?.querySelector(".c_nav_child");
      if (child) {
        trigger.setAttribute("aria-expanded", "false");
        parent?.classList.remove(this.openClass);
        if (this.isSP()) {
          child.setAttribute("hidden", "");
          child.style.setProperty("--childHeight", "0px");
        } else {
          child.removeAttribute("hidden");
        }
      }
    });
  }
  /**
   * SP判定
   */
  isSP() {
    return window.innerWidth < this.breakpoint;
  }
}

window.addEventListener("load", () => {
  new HogeScript();
  new SmoothScroll();
  new GlobalNav();
});
