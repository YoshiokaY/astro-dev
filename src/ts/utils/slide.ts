import Splide from "@splidejs/splide";
import { Intersection } from "@splidejs/splide-extension-intersection";

function setSlide(element: string, delay: number = 10000, auto: boolean = true) {
  const slideElement = document.querySelectorAll(element);
  const elementArr = Array.prototype.slice.call(slideElement);
  if (slideElement.length > 0) {
    elementArr.forEach((element) => {
      const bar = element.querySelector(".c_slide_bar");
      const counter = element.querySelector(".c_slide_counter");
      const slide = new Splide(element, {
        arrows: true,
        type: "fade",
        speed: 2400,
        autoplay: auto,
        pagination: true,
        intersection: {
          inView: {
            autoplay: true,
          },
        },
        rewind: true,
        interval: delay,
        resetProgress: false,
        pauseOnFocus: false,
        pauseOnHover: false,
      });
      if (bar) {
        slide.on("autoplay:playing", function (rate) {
          bar.style.width = String(100 * rate) + "%";
        });
      }
      if (counter) {
        // 次のスライドが表示されるタイミングで発生
        slide.on("active", function () {
          slideIndex(counter);
        });
        function slideIndex(counter: HTMLElement) {
          const slideCurrent = counter.querySelector(".c_slide_counter_current");
          const slideLength = counter.querySelector(".c_slide_counter_length");
          // 現在のスライドが何枚目かを取得
          if (slideCurrent) {
            slideCurrent.textContent = "0" + String(slide.index + 1);
          }
          // スライドの総数を取得
          if (slideLength) {
            slideLength.textContent = "0" + String(slide.length);
          }
        }
      }
      // 最後から最初へ移動した時に、
      // 最後の要素（1つ前）の子要素にclassを追加する
      slide.on("move", function () {
        const lastElement = slide.root.querySelector(".splide__slide:last-child span");
        if (slide.index === 0) {
          lastElement?.classList.add("is-prev");
          return;
        }
        if (lastElement?.classList.contains("is-prev")) {
          lastElement.classList.remove("is-prev");
        }
      });
      slide.mount({ Intersection });
    });
  }
}

setSlide(".mvSlide");
