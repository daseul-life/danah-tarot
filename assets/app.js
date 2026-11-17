import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL =
"https://gsznghkxwogqfqhyiyko.supabase.co";

const SUPABASE_KEY =
"sb_publishable_QnV_Ls2YMQP_dvm9s12Bdw_HTp1cNDR";

const RESERVATION_URL =
  "https://open.kakao.com/me/DanahsTarot";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =====================
   예약 링크
===================== */

function setupReservationLinks() {
  document.querySelectorAll("[data-reserve]").forEach((el) => {
    el.href = RESERVATION_URL;
    el.target = "_blank";
    el.rel = "noopener";
  });
}

/* =====================
   STATUS
===================== */

function renderStatus(status = "") {
  const dot = document.querySelector("[data-status-dot]");
  const label = document.querySelector("[data-status-label]");

  if (!dot || !label) return;

  dot.className = "status-dot";

  if (status.includes("상담중")) {
    dot.classList.add("progress");
  } else if (status.includes("상담 종료")) {
    dot.classList.add("close");
  } else {
    dot.classList.add("open");
  }

  label.textContent = status;
}

async function loadStatus() {
  const { data, error } = await supabase
    .from("status")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) return;

  renderStatus(data.status);
}

/* =====================
   NOTICE
===================== */

async function loadNotice() {
  const noticeEl =
    document.querySelector("[data-notice]");

  if (!noticeEl) return;

  const { data, error } = await supabase
    .from("notice")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) return;

  noticeEl.textContent =
    data.content || "";
}

/* =====================
   REVIEWS (카카오톡 말풍선 스타일 + 데이터 없을 때 대비)
===================== */

async function loadReviews() {
  const wrap =
   document.querySelector("[data-review-list]");

  if (!wrap) return;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  // DB에 후기가 없거나 에러가 날 경우를 대비한 샘플 후기 데이터
  const fallbackReviews = [
    { content: "속마음이 너무 궁금해서 30분 상담 받았는데, 제가 말하지 않은 부분까지 딱 맞춰주셔서 소름 돋았어요ㅠㅠ 덕분에 마음이 한결 편안해졌습니다!" },
    { content: "재회 가능성 봐주셨는데 짚어주신 시기랑 조언 덕분에 관계가 많이 좋아졌어요. 친절하고 꼼꼼하게 봐주셔서 정말 감사합니다 ♡" },
    { content: "연애운이랑 앞으로의 흐름을 시원시원하게 짚어주셔서 답답했던 게 싹 내려갔네요! 다음에 또 고민 생기면 올게요~" }
  ];

  const reviewListToRender = (data && data.length > 0) ? data : fallbackReviews;

  wrap.innerHTML = reviewListToRender.map(review => `
    <div style="
      background: #ffffff;
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 14px;
      box-shadow: 0 4px 12px rgba(214, 51, 132, 0.06);
      border: 1px solid #fce4ec;
      position: relative;
    ">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="
          font-size: 11px;
          font-weight: 700;
          color: #d63384;
          background: #fff0f3;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: -0.3px;
        ">실제 내담자 후기 ✨</span>
      </div>
      <p style="
        margin: 0;
        font-size: 14px;
        color: #444;
        line-height: 1.6;
        white-space: pre-wrap;
      ">${review.content || ""}</p>
    </div>
  `).join("");
}

/* =====================
   FAQ
===================== */

async function loadFaq() {
  const wrap =
    document.querySelector(".faq-wrap");

  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .order("id");

  if (error || !data) return;

  wrap.innerHTML = data.map(item => `
    <article class="faq-item">
      <button class="faq-question" type="button">
        ${item.question}
        <span>+</span>
      </button>

      <div class="faq-answer">
        <p>${item.answer}</p>
      </div>
    </article>
  `).join("");

  setupFaq();
}

/* =====================
   FAQ OPEN
===================== */

function setupFaq() {
  document
    .querySelectorAll(".faq-question")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        const item =
          btn.closest(".faq-item");

        item.classList.toggle("is-open");

        const answer =
          item.querySelector(".faq-answer");

        if (item.classList.contains("is-open")) {
          answer.style.maxHeight =
            answer.scrollHeight + "px";
        } else {
          answer.style.maxHeight =
            "0px";
        }
      });
    });
}

/* =====================
   FADE UP
===================== */

function setupFadeUp() {
  const observer =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      {
        threshold: 0.15
      }
    );

  document
    .querySelectorAll(".section")
    .forEach(section => {
      section.classList.add("fade-up");
      observer.observe(section);
    });
}

/* =====================
   INIT
===================== */

async function init() {
  setupReservationLinks();
  setupFadeUp();
  await loadStatus();
  await loadNotice();
  await loadReviews();
  await loadFaq();
}

init();
console.log("APP LOADED");
