import { createClient } from "https://esm.sh/@supabase/supabase-js?bundle";

const SUPABASE_URL = "https://gsznghkxwogqfqhyiyko.supabase.co";
const SUPABASE_KEY = "sb_publishable_QnV_Ls2YMQP_dvm9s12Bdw_HTp1cNDR";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* =====================
   STATUS
===================== */

function renderStatus(status = "") {
  const dot = document.querySelector("[data-status-dot]");
  const label = document.querySelector("[data-status-label]");
  if (!dot || !label) return;

  dot.className = "status-dot";
  if (status.includes("상담중")) dot.classList.add("progress");
  else if (status.includes("상담 종료")) dot.classList.add("close");
  else dot.classList.add("open");

  label.textContent = status || "상담 가능";
}

async function loadStatus() {
  const { data, error } = await supabase.from("status").select("*").limit(1).single();
  if (error || !data) return;
  renderStatus(data.status);
}

/* =====================
   NOTICE
===================== */

async function loadNotice() {
  const el = document.querySelector("[data-notice]");
  if (!el) return;

  const { data, error } = await supabase.from("notice").select("*").limit(1).single();
  if (error || !data) return;
  el.textContent = data.content || "";
}

/* =====================
   REVIEWS
===================== */

async function loadReviews() {
  const wrap = document.querySelector("[data-review-list]");
  if (!wrap) return;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    // 후기가 없으면 섹션째로 숨깁니다. 샘플 후기를 실제 후기처럼 보여주지 않습니다.
    const section = wrap.closest(".section");
    if (section) section.hidden = true;
    return;
  }

  wrap.innerHTML = data.map(review => `
    <div class="review-card">
      <p>${escapeHtml(review.content || "")}</p>
    </div>
  `).join("");
}

/* =====================
   FAQ
===================== */

async function loadFaq() {
  const wrap = document.querySelector(".faq-wrap");
  if (!wrap) return;

  const { data, error } = await supabase.from("faq").select("*").order("id");
  if (error || !data) return;

  wrap.innerHTML = data.map(item => `
    <article class="faq-item">
      <button class="faq-question" type="button">
        ${escapeHtml(item.question)}
        <span>+</span>
      </button>
      <div class="faq-answer">
        <p>${escapeHtml(item.answer)}</p>
      </div>
    </article>
  `).join("");

  setupFaq();
}

function setupFaq() {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      item.classList.toggle("is-open");
      const answer = item.querySelector(".faq-answer");
      answer.style.maxHeight = item.classList.contains("is-open")
        ? answer.scrollHeight + "px"
        : "0px";
    });
  });
}

/* =====================
   FADE UP
===================== */

function setupFadeUp() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".section").forEach(section => {
    section.classList.add("fade-up");
    observer.observe(section);
  });
}

/* =====================
   UTIL
===================== */

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* =====================
   INIT — 네 요청을 한 번에
===================== */

async function init() {
  setupFadeUp();
  await Promise.allSettled([loadStatus(), loadNotice(), loadReviews(), loadFaq()]);
}

init();
