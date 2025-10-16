/**
 * モーダルコンポーネント
 *
 * @remarks
 * `<dialog>` 要素を使用したモーダルウィンドウを実装します。
 * 画像・動画（YouTube）の表示に対応し、動的にモーダルを生成します。
 * アクセシビリティ対応（フォーカス管理、ESCキー対応）を含みます。
 *
 * @example
 * ```ts
 * // デフォルト設定で初期化
 * new Modal();
 *
 * // カスタム設定で初期化
 * new Modal(".js-modal");
 * ```
 *
 * @example
 * ```html
 * <!-- 画像用 -->
 * <button class="c_modal_btn" data-src="/path/to/image.jpg" data-alt="説明">
 *   画像を開く
 * </button>
 *
 * <!-- YouTube動画用 -->
 * <button class="c_modal_btn" data-src="https://www.youtube.com/watch?v=VIDEO_ID">
 *   動画を開く
 * </button>
 * ```
 */
import { sanitize } from "../utils/util.ts";

export class Modal {
  /**
   * モーダルコンテナの基本クラス名
   * @default ".c_modal"
   */
  target: string;

  /**
   * モーダルを初期化します
   *
   * @param TARGET - モーダルコンテナのセレクタ
   */
  constructor(TARGET: string = ".c_modal") {
    this.target = TARGET;
    const modalBtn = document.querySelectorAll(TARGET + "_btn");
    let closes = document.querySelectorAll(TARGET + "_close");

    modalBtn.forEach((a) => {
      a.addEventListener("click", (e) => {
        const event = e.currentTarget as HTMLElement;
        // aria-controls属性からモーダルIDを取得
        let modalID: string | null = sanitize(event?.getAttribute("aria-controls") || "");
        let modal = document.getElementById(modalID) as HTMLDialogElement;
        const targetNext = event.nextElementSibling;

        if (modalID) {
          modal = document.getElementById(modalID) as HTMLDialogElement;
        } else {
          // 画像・動画用モーダルを動的生成
          const modalSrc = sanitize(event.getAttribute("data-src"));
          const modalAlt = sanitize(event.getAttribute("data-alt"));

          if (!targetNext) {
            const YOUTUBE = /(youtube(-nocookie)?\.com|youtu\.be)\/(watch\?v=|v\/|u\/|embed\/?)?([\w-]{11})(.*)?/i;
            const youtube_uri = YOUTUBE.exec(modalSrc);
            let dialog = "";
            dialog += '<dialog class="c_modal"><div class="c_modal_content" tabindex="-1">';

            if (youtube_uri) {
              // YouTube iframe を挿入
              dialog += '<button class="c_modal_close"><span class="txtHidden">モーダルウィンドウを閉じる</span></button>';
              dialog += setFrame(
                appendQueryParams(
                  "https://www.youtube" + (youtube_uri[2] || "") + ".com/embed/" + youtube_uri[4],
                  Object.assign(
                    {
                      autoplay: 1,
                      rel: 0,
                    },
                    parseQueryParams(youtube_uri[5] || "")
                  )
                )
              );
            } else {
              // 画像用モーダル
              dialog += `<figure><img src=${modalSrc} decoding="async" alt=${modalAlt}></figure>`;
            }

            dialog += '<button class="c_modal_close"><span class="txtHidden">モーダルウィンドウを閉じる</span></button>';
            dialog += "</div></div></dialog>";
            event.insertAdjacentHTML("afterend", dialog);
          }

          modal = event.nextElementSibling as HTMLDialogElement;
          closes = document.querySelectorAll(".c_modal_close");
        }

        // モーダルを表示
        modal?.showModal();
        const content = modal.querySelector(TARGET + "_content") as HTMLElement;

        // アクセシビリティ対応: コンテンツにフォーカスを移動
        setTimeout(() => {
          content?.focus({ preventScroll: true });
          if (document.activeElement !== content) {
            content?.setAttribute("tabindex", "-1");
            content?.focus({ preventScroll: true });
          }
        }, 0);

        // メモリ解放
        modalID = null;

        // 閉じるボタンのイベントリスナー
        closes.forEach((close) => {
          close.addEventListener("click", () => {
            closeModal(modal);
          });
        });

        // ESCキーでのキャンセル対応
        modal?.addEventListener("cancel", () => {
          closeModal(modal);
        });

        // 背景クリックで閉じる
        modal?.addEventListener("click", (e) => {
          const event = e.target as HTMLElement;
          if (event === modal) {
            closeModal(modal);
          }
        });
      });
    });

    /**
     * モーダルを閉じる
     *
     * @param modal - 閉じる対象のモーダル要素
     */
    function closeModal(modal: HTMLDialogElement) {
      modal.close("cancelled");
      // iframe含むモーダルはDOMから削除
      if (modal.querySelector(".frameWrapper")) {
        modal.remove();
      }
    }

    /**
     * YouTube iframe のHTMLを生成
     *
     * @param target - iframe の src URL
     * @returns iframe を含むHTML文字列
     */
    function setFrame(target: string) {
      return '<div class="frameWrapper"><iframe frameborder="0" allow="autoplay; fullscreen" src="' + target + '"/></div>';
    }

    /**
     * URLクエリパラメータをパース
     *
     * @param params - クエリパラメータ文字列
     * @returns パースされたパラメータのMap
     */
    function parseQueryParams(params: string) {
      const pairs = decodeURI(params.split("#")[0]).split("&");
      const obj = new Map();
      let p;

      for (let i = 0, n = pairs.length; i < n; i++) {
        if (!pairs[i]) {
          continue;
        }

        p = pairs[i].split("=");
        obj.set(p[0], p[1]);
      }

      return obj;
    }

    /**
     * URLにクエリパラメータを追加
     *
     * @param url - ベースURL
     * @param params - 追加するパラメータ
     * @returns パラメータが追加されたURL
     */
    function appendQueryParams(url: string, params: { autoplay: number; rel: number }) {
      const keys = Object.keys(params) as (keyof typeof params)[];
      const query = keys.map((key) => `${key}=${params[key]}`).join("&");
      return `${url}${url.includes("?") ? "&" : "?"}${query}`;
    }
  }
}
