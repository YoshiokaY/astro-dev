/**
 * タブコンポーネント
 *
 * @remarks
 * タブUIを実装します。タブボタンのクリックでコンテンツを切り替え、
 * アクセシビリティ対応（ARIA属性、キーボード操作）を含みます。
 * URLハッシュによる特定タブの初期表示にも対応しています。
 *
 * @example
 * ```ts
 * // デフォルト設定で初期化
 * new Tab();
 *
 * // カスタム設定で初期化
 * new Tab(".js-tab", "is-active");
 * ```
 */
export class Tab {
  /**
   * タブコンテナの基本クラス名
   * @default ".c_tab"
   */
  target: string;

  /**
   * アクティブなタブボタンに付与されるクラス名
   * @default "-open"
   */
  open: string;

  /**
   * タブを初期化します
   *
   * @param TARGET - タブコンテナのセレクタ
   * @param OPEN - アクティブ時に付与するクラス名
   */
  constructor(TARGET: string = ".c_tab", OPEN: string = "-open") {
    this.target = TARGET;
    this.open = OPEN;
    const btns = document.querySelectorAll(TARGET + "_list li button");

    /**
     * タブクリック時のイベントハンドラ
     *
     * @param e - クリックイベント
     */
    function onTabClick(e: Event) {
      const event = e.target as HTMLElement;
      const parent = event.closest(TARGET);
      const tabContents = parent?.querySelectorAll(TARGET + "_content");
      const tabArr = Array.prototype.slice.call(tabContents);
      const item = parent?.querySelectorAll(TARGET + "_list li button");
      const itemArr = Array.prototype.slice.call(item);

      // クリックされたボタンのインデックスを取得
      const index = itemArr.indexOf(e.target);

      // すべてのタブボタンを非アクティブ化
      itemArr.forEach((el) => {
        el.classList.remove(OPEN);
        el.setAttribute("aria-pressed", "false");
        el.setAttribute("tabindex", "0");
      });

      // クリックされたタブボタンをアクティブ化
      event.classList.add(OPEN);
      event.setAttribute("aria-pressed", "true");
      event.setAttribute("tabindex", "-1");

      // すべてのタブパネルを非表示化
      tabArr.forEach((tab) => {
        tab.setAttribute("hidden", "");
        tab.setAttribute("tabindex", "-1");
      });

      // 対応するタブパネルを表示
      tabArr[index].removeAttribute("hidden");
      // アクセシビリティ対応: フォーカス移動（スクロールなし）
      tabArr[index].focus({ preventScroll: true });
    }

    btns.forEach((btn) => {
      btn.addEventListener("click", onTabClick);
    });

    // URLハッシュによる初期タブ表示
    if (btns.length > 0) {
      const url = new URL(window.location.href);
      const hash = url.hash;
      if (hash) {
        // ハッシュの末尾が数字の場合、そのタブを開く（例: #tab1 → 1番目のタブ）
        const number = Number(hash.slice(-1));
        if (!isNaN(number)) {
          (<HTMLElement>btns[number - 1]).click();
        }
      }
    }
  }
}
