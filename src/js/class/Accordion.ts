/**
 * アコーディオンコンポーネント
 *
 * @remarks
 * `.c_pull` クラスを持つ `<details>` 要素に対してアコーディオン機能を提供します。
 * 高さアニメーションとフォーカス管理を含みます。
 *
 * @example
 * ```ts
 * // デフォルト設定で初期化
 * new Accordion();
 *
 * // カスタム設定で初期化
 * new Accordion(300, 768);
 * ```
 */
export class Accordion {
  /**
   * アコーディオンの開閉アニメーション速度（ミリ秒）
   * @default 150
   */
  speed: number;

  /**
   * SP時のみアコーディオン動作させる際のブレイクポイント（ピクセル）
   * @default 768
   */
  mq: number;

  /**
   * アコーディオンを初期化します
   *
   * @param SPEED - アニメーション速度（ミリ秒）
   * @param MQ - ブレイクポイント（ピクセル）
   */
  constructor(SPEED: number = 150, MQ: number = 768) {
    this.speed = SPEED;
    this.mq = MQ;

    /** アニメーション開始までの遅延時間 */
    const OFFSET_TIME = 5;
    /** CSS変数: 閉じた時の高さ */
    const HEIGHT_CLOSED = "--pullHeightClosed";
    /** CSS変数: 開いた時の高さ */
    const HEIGHT = "--pullHeightOpen";

    const accordions = document.querySelectorAll(".c_pull");
    accordions.forEach((accordion) => {
      const ttl = accordion.querySelector(".c_pull_ttl") as HTMLElement;
      const content = accordion.querySelector(".c_pull_content") as HTMLElement;
      const target = accordion as HTMLDetailsElement;
      const hasOpenedClass = accordion.classList.contains("-open");
      const ttlHeight = ttl.offsetHeight;

      // 初期表示時の閉じた高さを設定
      target.style.setProperty(HEIGHT_CLOSED, `${ttlHeight}px`);

      // 初期表示時に開いているアコーディオンに対して高さを設定
      if (hasOpenedClass) {
        target.open = true;
        target.style.setProperty(HEIGHT, `${ttlHeight + content.offsetHeight}px`);
      }

      // クリックイベント: アコーディオンの開閉を制御
      ttl?.addEventListener("click", (e) => {
        e.preventDefault();

        // レスポンシブ対応のため、クリック時に高さを再取得
        const ttlHeight = ttl.offsetHeight;
        target.style.setProperty(HEIGHT_CLOSED, `${ttlHeight}px`);

        if (!target.open) {
          // アコーディオンを開く処理
          target.open = true;

          // Chrome/Safari対策: 高さ設定とアニメーション開始のタイミングを調整
          setTimeout(() => {
            // iOS対策: open属性付与後にコンテンツの高さを取得
            setTimeout(() => {
              target.style.setProperty(HEIGHT, `${ttlHeight + content.offsetHeight}px`);
            }, 150);

            // アニメーション開始とフォーカス管理
            setTimeout(() => {
              accordion.classList.add("-open");

              // アクセシビリティ対応: コンテンツにフォーカスを移動
              if (document.activeElement !== content) {
                content?.setAttribute("tabindex", "-1");
                content?.focus({ preventScroll: true });
              }
            }, OFFSET_TIME + SPEED);
          }, 10);
        } else if (target.open) {
          // アコーディオンを閉じる処理
          setTimeout(() => {
            accordion.classList.remove("-open");
          }, OFFSET_TIME);

          // アニメーション完了後にopen属性を削除
          setTimeout(() => {
            target.open = false;
          }, SPEED + OFFSET_TIME);
        }
      });
    });
  }
}
