class Accordion {
  /**
   * アコーディオンの開閉アニメーション速度（ミリ秒）
   * @default 150
   */
  speed;
  /**
   * SP時のみアコーディオン動作させる際のブレイクポイント（ピクセル）
   * @default 768
   */
  mq;
  /**
   * アコーディオンを初期化します
   *
   * @param SPEED - アニメーション速度（ミリ秒）
   * @param MQ - ブレイクポイント（ピクセル）
   */
  constructor(SPEED = 150, MQ = 768) {
    this.speed = SPEED;
    this.mq = MQ;
    const OFFSET_TIME = 5;
    const HEIGHT_CLOSED = "--pullHeightClosed";
    const HEIGHT = "--pullHeightOpen";
    const accordions = document.querySelectorAll(".c_pull");
    accordions.forEach((accordion) => {
      const ttl = accordion.querySelector(".c_pull_ttl");
      const content = accordion.querySelector(".c_pull_content");
      const target = accordion;
      const hasOpenedClass = accordion.classList.contains("-open");
      const ttlHeight = ttl.offsetHeight;
      target.style.setProperty(HEIGHT_CLOSED, `${ttlHeight}px`);
      if (hasOpenedClass) {
        target.open = true;
        target.style.setProperty(HEIGHT, `${ttlHeight + content.offsetHeight}px`);
      }
      ttl?.addEventListener("click", (e) => {
        e.preventDefault();
        const ttlHeight2 = ttl.offsetHeight;
        target.style.setProperty(HEIGHT_CLOSED, `${ttlHeight2}px`);
        if (!target.open) {
          target.open = true;
          setTimeout(() => {
            setTimeout(() => {
              target.style.setProperty(HEIGHT, `${ttlHeight2 + content.offsetHeight}px`);
            }, 150);
            setTimeout(() => {
              accordion.classList.add("-open");
              if (document.activeElement !== content) {
                content?.setAttribute("tabindex", "-1");
                content?.focus({ preventScroll: true });
              }
            }, OFFSET_TIME + SPEED);
          }, 10);
        } else if (target.open) {
          setTimeout(() => {
            accordion.classList.remove("-open");
          }, OFFSET_TIME);
          setTimeout(() => {
            target.open = false;
          }, SPEED + OFFSET_TIME);
        }
      });
    });
  }
}

class Tab {
  /**
   * タブコンテナの基本クラス名
   * @default ".c_tab"
   */
  target;
  /**
   * アクティブなタブボタンに付与されるクラス名
   * @default "-open"
   */
  open;
  /**
   * タブを初期化します
   *
   * @param TARGET - タブコンテナのセレクタ
   * @param OPEN - アクティブ時に付与するクラス名
   */
  constructor(TARGET = ".c_tab", OPEN = "-open") {
    this.target = TARGET;
    this.open = OPEN;
    const btns = document.querySelectorAll(TARGET + "_list li button");
    function onTabClick(e) {
      const event = e.target;
      const parent = event.closest(TARGET);
      const tabContents = parent?.querySelectorAll(TARGET + "_content");
      const tabArr = Array.prototype.slice.call(tabContents);
      const item = parent?.querySelectorAll(TARGET + "_list li button");
      const itemArr = Array.prototype.slice.call(item);
      const index = itemArr.indexOf(e.target);
      itemArr.forEach((el) => {
        el.classList.remove(OPEN);
        el.setAttribute("aria-pressed", "false");
        el.setAttribute("tabindex", "0");
      });
      event.classList.add(OPEN);
      event.setAttribute("aria-pressed", "true");
      event.setAttribute("tabindex", "-1");
      tabArr.forEach((tab) => {
        tab.setAttribute("hidden", "");
        tab.setAttribute("tabindex", "-1");
      });
      tabArr[index].removeAttribute("hidden");
      tabArr[index].focus({ preventScroll: true });
    }
    btns.forEach((btn) => {
      btn.addEventListener("click", onTabClick);
    });
    if (btns.length > 0) {
      const url = new URL(window.location.href);
      const hash = url.hash;
      if (hash) {
        const number = Number(hash.slice(-1));
        if (!isNaN(number)) {
          btns[number - 1].click();
        }
      }
    }
  }
}

const sanitize = (str) => {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

class Modal {
  /**
   * モーダルコンテナの基本クラス名
   * @default ".c_modal"
   */
  target;
  /**
   * モーダルを初期化します
   *
   * @param TARGET - モーダルコンテナのセレクタ
   */
  constructor(TARGET = ".c_modal") {
    this.target = TARGET;
    const modalBtn = document.querySelectorAll(TARGET + "_btn");
    let closes = document.querySelectorAll(TARGET + "_close");
    modalBtn.forEach((a) => {
      a.addEventListener("click", (e) => {
        const event = e.currentTarget;
        let modalID = sanitize(event?.getAttribute("aria-controls") || "");
        let modal = document.getElementById(modalID);
        const targetNext = event.nextElementSibling;
        if (modalID) {
          modal = document.getElementById(modalID);
        } else {
          const modalSrc = sanitize(event.getAttribute("data-src"));
          const modalAlt = sanitize(event.getAttribute("data-alt"));
          if (!targetNext) {
            const YOUTUBE = /(youtube(-nocookie)?\.com|youtu\.be)\/(watch\?v=|v\/|u\/|embed\/?)?([\w-]{11})(.*)?/i;
            const youtube_uri = YOUTUBE.exec(modalSrc);
            let dialog = "";
            dialog += '<dialog class="c_modal"><div class="c_modal_content" tabindex="-1">';
            if (youtube_uri) {
              dialog += '<button class="c_modal_close"><span class="txtHidden">モーダルウィンドウを閉じる</span></button>';
              dialog += setFrame(
                appendQueryParams(
                  "https://www.youtube" + (youtube_uri[2] || "") + ".com/embed/" + youtube_uri[4],
                  Object.assign(
                    {
                      autoplay: 1,
                      rel: 0
                    },
                    parseQueryParams(youtube_uri[5] || "")
                  )
                )
              );
            } else {
              dialog += `<figure><img src=${modalSrc} decoding="async" alt=${modalAlt}></figure>`;
            }
            dialog += '<button class="c_modal_close"><span class="txtHidden">モーダルウィンドウを閉じる</span></button>';
            dialog += "</div></div></dialog>";
            event.insertAdjacentHTML("afterend", dialog);
          }
          modal = event.nextElementSibling;
          closes = document.querySelectorAll(".c_modal_close");
        }
        modal?.showModal();
        const content = modal.querySelector(TARGET + "_content");
        setTimeout(() => {
          content?.focus({ preventScroll: true });
          if (document.activeElement !== content) {
            content?.setAttribute("tabindex", "-1");
            content?.focus({ preventScroll: true });
          }
        }, 0);
        modalID = null;
        closes.forEach((close) => {
          close.addEventListener("click", () => {
            closeModal(modal);
          });
        });
        modal?.addEventListener("cancel", () => {
          closeModal(modal);
        });
        modal?.addEventListener("click", (e2) => {
          const event2 = e2.target;
          if (event2 === modal) {
            closeModal(modal);
          }
        });
      });
    });
    function closeModal(modal) {
      modal.close("cancelled");
      if (modal.querySelector(".frameWrapper")) {
        modal.remove();
      }
    }
    function setFrame(target) {
      return '<div class="frameWrapper"><iframe frameborder="0" allow="autoplay; fullscreen" src="' + target + '"/></div>';
    }
    function parseQueryParams(params) {
      const pairs = decodeURI(params.split("#")[0]).split("&");
      const obj = /* @__PURE__ */ new Map();
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
    function appendQueryParams(url, params) {
      const keys = Object.keys(params);
      const query = keys.map((key) => `${key}=${params[key]}`).join("&");
      return `${url}${url.includes("?") ? "&" : "?"}${query}`;
    }
  }
}

new Accordion();
new Tab();
new Modal();
