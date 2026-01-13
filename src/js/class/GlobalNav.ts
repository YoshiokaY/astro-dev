/**
 * グローバルナビゲーションコンポーネント
 *
 * @remarks
 * SP時のハンバーガーメニュー、PC時のメガメニュー/プルダウンに対応した
 * 汎用的なグローバルナビゲーションを実装します。
 * アクセシビリティ対応（ARIA属性、キーボード操作、フォーカストラップ）を含みます。
 *
 * @example
 * ```ts
 * // デフォルト設定で初期化
 * new GlobalNav();
 *
 * // カスタム設定で初期化
 * new GlobalNav({
 *   navSelector: ".js-nav",
 *   breakpoint: 1024,
 * });
 * ```
 */

interface GlobalNavOptions {
  /** ナビゲーションコンテナのセレクタ @default ".c_nav" */
  navSelector?: string;
  /** 展開時に付与するクラス名 @default "-open" */
  openClass?: string;
  /** PC/SPの切り替えブレイクポイント @default 768 */
  breakpoint?: number;
}

export class GlobalNav {
  private nav: HTMLElement | null;
  private btn: HTMLElement | null;
  private wrapper: HTMLElement | null;
  private closeBtn: HTMLElement | null;
  private triggers: NodeListOf<HTMLElement>;
  private openClass: string;
  private breakpoint: number;
  private isOpen: boolean = false;
  private focusableElements: HTMLElement[] = [];
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;

  constructor(options: GlobalNavOptions = {}) {
    const { navSelector = ".c_nav", openClass = "-open", breakpoint = 768 } = options;

    this.openClass = openClass;
    this.breakpoint = breakpoint;

    // 要素の取得
    this.nav = document.querySelector(navSelector);
    if (!this.nav) return;

    this.btn = this.nav.querySelector(`${navSelector}_btn`);
    this.wrapper = this.nav.querySelector(`${navSelector}_wrapper`);
    this.closeBtn = this.nav.querySelector(`${navSelector}_close`);
    this.triggers = this.nav.querySelectorAll(`${navSelector}_trigger`);

    this.init();
  }

  /**
   * 初期化
   */
  private init(): void {
    this.bindEvents();
    this.setupChildMenus();
    this.handleResize();

    // リサイズ時の処理
    window.addEventListener("resize", () => this.handleResize());
  }

  /**
   * イベントバインド
   */
  private bindEvents(): void {
    // ハンバーガーボタン
    this.btn?.addEventListener("click", () => this.toggle());

    // 閉じるボタン
    this.closeBtn?.addEventListener("click", () => this.close());

    // ラッパー背景クリックで閉じる
    this.wrapper?.addEventListener("click", (e) => {
      if (e.target === this.wrapper) {
        this.close();
      }
    });

    // ESCキーで閉じる
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
        this.btn?.focus();
      }
    });

    // フォーカストラップ
    this.wrapper?.addEventListener("keydown", (e) => this.handleFocusTrap(e));
  }

  /**
   * 子メニューのセットアップ
   */
  private setupChildMenus(): void {
    this.triggers.forEach((trigger) => {
      const parent = trigger.closest(".c_nav_item");
      const child = parent?.querySelector(".c_nav_child") as HTMLElement;

      if (!child) return;

      // SP: クリックでアコーディオン開閉
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.isSP()) {
          this.toggleChildMenu(trigger, child);
        }
      });

      // PC: ホバーで開閉
      parent?.addEventListener("mouseenter", () => {
        if (!this.isSP()) {
          this.openChildMenu(trigger, child);
        }
      });

      parent?.addEventListener("mouseleave", () => {
        if (!this.isSP()) {
          this.closeChildMenu(trigger, child);
        }
      });

      // PC: キーボード操作
      trigger.addEventListener("keydown", (e) => {
        if (!this.isSP() && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          const isExpanded = trigger.getAttribute("aria-expanded") === "true";
          if (isExpanded) {
            this.closeChildMenu(trigger, child);
          } else {
            this.openChildMenu(trigger, child);
          }
        }
      });

      // PC: フォーカスアウトで閉じる
      parent?.addEventListener("focusout", (e) => {
        if (!this.isSP()) {
          const relatedTarget = (e as FocusEvent).relatedTarget as HTMLElement;
          if (!parent.contains(relatedTarget)) {
            this.closeChildMenu(trigger, child);
          }
        }
      });
    });
  }

  /**
   * メニューの開閉トグル
   */
  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * メニューを開く
   */
  private open(): void {
    this.isOpen = true;
    this.nav?.classList.add(this.openClass);
    this.btn?.setAttribute("aria-expanded", "true");

    // フォーカス可能な要素を取得
    this.updateFocusableElements();

    // 最初のフォーカス可能要素にフォーカス
    setTimeout(() => {
      this.firstFocusable?.focus();
    }, 100);

    // body スクロール禁止
    document.body.style.overflow = "hidden";
  }

  /**
   * メニューを閉じる
   */
  private close(): void {
    this.isOpen = false;
    this.nav?.classList.remove(this.openClass);
    this.btn?.setAttribute("aria-expanded", "false");

    // 全ての子メニューを閉じる
    this.triggers.forEach((trigger) => {
      const parent = trigger.closest(".c_nav_item");
      const child = parent?.querySelector(".c_nav_child") as HTMLElement;
      if (child) {
        this.closeChildMenu(trigger, child);
      }
    });

    // body スクロール復帰
    document.body.style.overflow = "";
  }

  /**
   * 子メニューのトグル（SP用）
   */
  private toggleChildMenu(trigger: HTMLElement, child: HTMLElement): void {
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
  private openChildMenu(trigger: HTMLElement, child: HTMLElement): void {
    trigger.setAttribute("aria-expanded", "true");
    trigger.closest(".c_nav_item")?.classList.add(this.openClass);

    // SP時: 高さアニメーション
    if (this.isSP()) {
      // 初回は高さ0から開始することを保証
      child.style.setProperty("--childHeight", "0px");
      child.removeAttribute("hidden");
      // リフロー強制後、次フレームでアニメーション開始
      requestAnimationFrame(() => {
        const height = child.scrollHeight;
        child.style.setProperty("--childHeight", `${height}px`);
      });
    } else {
      child.removeAttribute("hidden");
    }
  }

  /**
   * 子メニューを閉じる
   */
  private closeChildMenu(trigger: HTMLElement, child: HTMLElement): void {
    trigger.setAttribute("aria-expanded", "false");
    trigger.closest(".c_nav_item")?.classList.remove(this.openClass);

    if (this.isSP()) {
      child.style.setProperty("--childHeight", "0px");
    }

    // PC時は即座に非表示、SP時はアニメーション後
    if (!this.isSP()) {
      child.setAttribute("hidden", "");
    } else {
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
  private handleFocusTrap(e: KeyboardEvent): void {
    if (e.key !== "Tab" || !this.isSP()) return;

    this.updateFocusableElements();

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  }

  /**
   * フォーカス可能な要素を更新
   */
  private updateFocusableElements(): void {
    if (!this.wrapper) return;

    const focusableSelectors = ["a[href]", "button:not([disabled])", "input:not([disabled])", "select:not([disabled])", "textarea:not([disabled])", '[tabindex]:not([tabindex="-1"])'].join(", ");

    this.focusableElements = Array.from(this.wrapper.querySelectorAll<HTMLElement>(focusableSelectors)).filter((el) => {
      // hidden属性を持つ要素内のものは除外
      return !el.closest("[hidden]");
    });

    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  /**
   * リサイズ時の処理
   */
  private handleResize(): void {
    // PCサイズになったらメニューを閉じる
    if (!this.isSP() && this.isOpen) {
      this.close();
    }

    // PC時は子メニューをhiddenに
    if (!this.isSP()) {
      this.triggers.forEach((trigger) => {
        const parent = trigger.closest(".c_nav_item");
        const child = parent?.querySelector(".c_nav_child") as HTMLElement;
        if (child && trigger.getAttribute("aria-expanded") !== "true") {
          child.setAttribute("hidden", "");
        }
      });
    }
  }

  /**
   * SP判定
   */
  private isSP(): boolean {
    return window.innerWidth < this.breakpoint;
  }
}
