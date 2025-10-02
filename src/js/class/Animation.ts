/**
 * スクロールアニメーションコンポーネント
 *
 * @remarks
 * Intersection Observer API を使用して、要素が画面内に入った際にアニメーションを実行します。
 * 要素が表示領域に入ると、指定されたクラスが付与されます。
 *
 * @example
 * ```ts
 * // デフォルト設定で初期化
 * new ScrollAnimation();
 *
 * // カスタム設定で初期化
 * new ScrollAnimation(".js-fade", "is-show");
 * ```
 */
export class ScrollAnimation {
  /**
   * アニメーション対象の要素を指定するセレクタ
   * @default ".scrollIn,.scroll"
   */
  target: string;

  /**
   * アニメーション実行時に付与されるクラス名
   * @default "-active"
   */
  active: string;

  /**
   * スクロールアニメーションを初期化します
   *
   * @param TARGET - 対象要素のセレクタ
   * @param ACTIVE - 付与するクラス名
   */
  constructor(TARGET: string = ".scrollIn,.scroll", ACTIVE: string = "-active") {
    this.target = TARGET;
    this.active = ACTIVE;
    const elements = document.querySelectorAll(TARGET);
    const elementArr = Array.prototype.slice.call(elements);

    // Intersection Observer のオプション設定
    const options: IntersectionObserverInit = {
      root: null, // ビューポートをルート要素とする
      rootMargin: "0px 0px", // ビューポートの中心を判定基準にする
      threshold: 0, // 閾値は0
    };

    const observer = new IntersectionObserver(callback, options);
    elementArr.forEach((box: HTMLDivElement) => {
      observer.observe(box);
    });

    /**
     * Intersection Observer のコールバック関数
     * 要素が表示領域に入った際にアクティブクラスを付与
     *
     * @param entries - 監視対象の要素情報
     */
    function callback(entries: IntersectionObserverEntry[]) {
      entries.forEach((entry: IntersectionObserverEntry) => {
        const target = entry.target;
        if (entry.isIntersecting && !target.classList.contains(ACTIVE)) {
          setTimeout(() => {
            target.classList.add(ACTIVE);
          }, 5);
        }
      });
    }

    /**
     * テキストを1文字ずつアニメーションさせるために、
     * 各文字を font タグで囲む（非推奨: 必要に応じて使用）
     *
     * @param className - 対象要素のクラス名
     * @default ".typTxt"
     */
    // const typTxt = (className: string = ".typTxt") => {
    //   const typTxts = document.querySelectorAll(className) || [];
    //   typTxts.forEach((typTxt) => {
    //     const text = typTxt.innerHTML;
    //     // br タグを一時的に特殊文字に置換
    //     const textWithoutBr = text.replace(/<br>/g, "Γ");
    //     let textbox = "";

    //     textWithoutBr?.split("").forEach((t: string, i: number) => {
    //       if (t !== " ") {
    //         if (t == "Γ") {
    //           textbox += "<font class='br'>" + t + "</font>";
    //         } else {
    //           textbox += "<font><font>" + t + "</font></font>";
    //         }
    //       } else {
    //         textbox += t;
    //       }
    //     });

    //     // 特殊文字を br タグに戻す
    //     textbox = textbox.replace("Γ", "<br>");
    //     typTxt.innerHTML = textbox;
    //   });
    // };
  }
}
