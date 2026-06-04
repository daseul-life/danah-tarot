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
   REVIEWS
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

  if (error || !data) return;

  wrap.innerHTML = data.map(review => `
  <article class="review-card">
    <p>${review.content || ""}</p>
  </article>
`).join("");
}

/* =====================
   FAQ
===================== */

async function loadFaq() {

  const wrap =
    document.querySelector(".faq-wrap");

  console.log("FAQ WRAP", wrap);

  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .order("id");

  console.log("FAQ DATA", data);
  console.log("FAQ ERROR", error);

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

