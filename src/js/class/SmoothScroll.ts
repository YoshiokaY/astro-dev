/**
 * スムーススクロールコンポーネント
 *
 * @remarks
 * アンカーリンク（`#`で始まるhref）のクリック時にスムーススクロールを実行します。
 * CSSの `scroll-behavior: smooth` で代用可能ですが、別ページからのアンカーリンクで
 * 不要なスクロールを防ぐため、JavaScript実装が有効です。
 *
 * @example
 * ```ts
 * // 固定ヘッダーなしの場合
 * new SmoothScroll();
 *
 * // 固定ヘッダーありの場合
 * new SmoothScroll(true);
 * ```
 */
export class SmoothScroll {
  /**
   * 固定ヘッダーの有無
   * @default false
   */
  header_fix: boolean;

  /**
   * スムーススクロールを初期化します
   *
   * @param HEADER_FIX - 固定ヘッダーがある場合は true
   */
  constructor(HEADER_FIX: boolean = false) {
    this.header_fix = HEADER_FIX;
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const href = anchor.getAttribute("href");
        let target: HTMLElement | null;

        if (!href) {
          return;
        }

        if (href === "#") {
          // ページトップへスクロール
          target = document.body;
          smoothScroll(target);
        } else if (href) {
          // 指定されたIDの要素へスクロール
          target = document.getElementById(href.replace("#", ""));

          // 固定ヘッダー対応: ヘッダー高さ分のマージンを設定
          if (target && this.header_fix) {
            const header = document.querySelector("header");
            const headerHeight = header?.clientHeight;
            target.style.scrollMarginBlockStart = String(headerHeight) + "px";
          }
          smoothScroll(target);
        }
      });
    });

    /**
     * スムーススクロールを実行
     *
     * @param target - スクロール先の要素
     */
    function smoothScroll(target: HTMLElement | null) {
      // アクセシビリティ対応: prefers-reduced-motion を考慮
      const isPrefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scrollBehavior = isPrefersReduced ? "instant" : "smooth";

      setTimeout(() => {
        // アクセシビリティ対応: ターゲット要素にフォーカスを移動
        target?.focus({ preventScroll: true });

        // フォーカス失敗時の対応
        if (document.activeElement !== target) {
          target?.setAttribute("tabindex", "-1");
          target?.focus({ preventScroll: true });
        }

        // スクロール実行
        target?.scrollIntoView({ behavior: scrollBehavior, inline: "end" });
      }, 0);
    }

    // 別ページからのアンカーリンク対応
    const urlHash = location.hash;
    if (urlHash) {
      const urlTarget = document.querySelector(urlHash) as HTMLElement;
      if (urlTarget) {
        // 固定ヘッダー対応: ヘッダー高さ分のマージンを設定
        if (this.header_fix) {
          const header = document.querySelector("header");
          const headerHeight = header?.clientHeight;
          urlTarget.style.scrollMarginBlockStart = String(headerHeight) + "px";
        }

        // 即座にスクロール（アニメーションなし）
        urlTarget.scrollIntoView({ behavior: "instant", inline: "end" });
      }
    }
  }
}
