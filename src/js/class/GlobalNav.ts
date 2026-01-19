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
  private nav: HTMLElement | null = null;
  private btn: HTMLElement | null = null;
  private btnLabel: HTMLElement | null = null;
  private wrapper: HTMLElement | null = null;
  private closeBtn: HTMLElement | null = null;
  private triggers: NodeListOf<HTMLElement> | null = null;
  private openClass: string = "-open";
  private breakpoint: number = 768;
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
    this.btnLabel = this.nav.querySelector(`${navSelector}_btn_label`);
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

    // アンカーリンククリック時にメニューを閉じる
    this.setupAnchorLinks();
  }

  /**
   * アンカーリンクのクリックイベントを設定
   * SP時にアンカーリンクをクリックした際、スクロール後にメニューを閉じる
   */
  private setupAnchorLinks(): void {
    const anchorLinks = this.nav?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

    anchorLinks?.forEach((link) => {
      link.addEventListener("click", () => {
        if (this.isSP() && this.isOpen) {
          // スクロール後にメニューを閉じる
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
  private setupChildMenus(): void {
    this.triggers?.forEach((trigger) => {
      const parent = trigger.closest(".c_nav_item");
      const child = parent?.querySelector(".c_nav_child") as HTMLElement;

      if (!child) return;

      // SP: クリックでアコーディオン開閉
      // PC: クリックでメガメニュー展開（ホバー表示はCSSで処理）
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleChildMenu(trigger, child);
      });

      // PC: キーボード操作（Enter/Spaceで開閉）
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
    this.btn?.setAttribute("aria-label", "メニューを閉じる");
    if (this.btnLabel) {
      this.btnLabel.textContent = "CLOSE";
    }

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
    this.btn?.setAttribute("aria-label", "メニューを開く");
    if (this.btnLabel) {
      this.btnLabel.textContent = "メニュー";
    }

    // 全ての子メニューを閉じる
    this.triggers?.forEach((trigger) => {
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
   * 子メニューのトグル
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
  private closeChildMenu(trigger: HTMLElement, child: HTMLElement): void {
    trigger.setAttribute("aria-expanded", "false");
    trigger.closest(".c_nav_item")?.classList.remove(this.openClass);

    // SP時: 高さアニメーション後にhidden
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
    // PCサイズになったらSPメニューを閉じる
    if (!this.isSP() && this.isOpen) {
      this.close();
    }

    // PC⇔SP切り替え時に子メニューの状態をリセット
    this.triggers?.forEach((trigger) => {
      const parent = trigger.closest(".c_nav_item");
      const child = parent?.querySelector(".c_nav_child") as HTMLElement;
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
  private isSP(): boolean {
    return window.innerWidth < this.breakpoint;
  }
}
