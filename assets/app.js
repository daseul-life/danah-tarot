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
      ">${escapeHtml(review.content || "")}</p>
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
   APPLY (상담 신청서)
===================== */

const KAKAO_CHAT_URL = "https://open.kakao.com/me/DanahsTarot";

function formatApplyDate(value = "") {
  if (!value) return "미정";
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return value;
  const names = ["일", "월", "화", "수", "목", "금", "토"];
  return `${value} (${names[date.getDay()]}요일)`;
}

function formatApplyTime(value = "") {
  if (!value) return "미정";
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
  const mark = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${mark} ${hour12}:${String(minute).padStart(2, "0")}`;
}

function buildApplyText(data) {
  return [
    "🔮 단아의 타로 상담 신청",
    "",
    `· 이름: ${data.name}`,
    `· 상담 종류: ${data.type}`,
    `· 희망 날짜: ${formatApplyDate(data.date)}`,
    `· 희망 시간: ${formatApplyTime(data.time)}`,
    "",
    "· 고민 내용:",
    data.concern
  ].join("\n");
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    // 아래 예비 방식으로 다시 시도합니다.
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const done = document.execCommand("copy");
    document.body.removeChild(area);
    return done;
  } catch (error) {
    return false;
  }
}

function setupApply() {
  const form = document.querySelector("[data-apply-form]");
  if (!form) return;

  const nameInput = form.querySelector("[data-apply-name]");
  const typeInput = form.querySelector("[data-apply-type]");
  const concernInput = form.querySelector("[data-apply-concern]");
  const dateInput = form.querySelector("[data-apply-date]");
  const timeInput = form.querySelector("[data-apply-time]");
  const countEl = form.querySelector("[data-apply-count]");
  const warnEl = form.querySelector("[data-apply-warn]");

  const resultEl = document.querySelector("[data-apply-result]");
  const previewEl = document.querySelector("[data-apply-preview]");
  const badgeEl = document.querySelector("[data-apply-badge]");
  const manualEl = document.querySelector("[data-apply-manual]");
  const copyBtn = document.querySelector("[data-apply-copy]");
  const openLink = document.querySelector(".apply-open");

  const maxLength = Number(concernInput.getAttribute("maxlength")) || 800;

  const updateCount = () => {
    if (!countEl) return;
    countEl.textContent = `${concernInput.value.length} / ${maxLength}`;
  };

  const showWarn = (message, target) => {
    if (warnEl) {
      warnEl.textContent = message;
      warnEl.hidden = false;
    }
    if (target) target.focus();
  };

  const hideWarn = () => {
    if (!warnEl) return;
    warnEl.textContent = "";
    warnEl.hidden = true;
  };

  const collect = () => {
    const data = {
      name: nameInput.value.trim(),
      type: typeInput.value,
      concern: concernInput.value.trim(),
      date: dateInput.value,
      time: timeInput.value
    };
    if (!data.concern) data.concern = "(오픈채팅에서 말씀드릴게요)";
    return data;
  };

  const paintResult = (text, copied) => {
    if (!resultEl || !previewEl) return;

    previewEl.textContent = text;
    resultEl.hidden = false;

    if (badgeEl) {
      badgeEl.textContent = copied
        ? "신청 내용이 복사되었어요 ✓"
        : "신청 내용을 확인해 주세요";
    }
    if (manualEl) manualEl.hidden = copied;

    resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  concernInput.addEventListener("input", updateCount);
  updateCount();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    hideWarn();

    const data = collect();

    if (!data.name) {
      showWarn("이름 또는 닉네임을 적어 주세요.", nameInput);
      return;
    }
    if (!data.type) {
      showWarn("상담 종류를 선택해 주세요.", typeInput);
      return;
    }

    const text = buildApplyText(data);
    const copied = await copyToClipboard(text);
    paintResult(text, copied);

    if (openLink) openLink.setAttribute("href", KAKAO_CHAT_URL);
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      if (!previewEl) return;
      const copied = await copyToClipboard(previewEl.textContent || "");
      if (badgeEl) {
        badgeEl.textContent = copied
          ? "신청 내용이 복사되었어요 ✓"
          : "신청 내용을 확인해 주세요";
      }
      if (manualEl) manualEl.hidden = copied;
    });
  }
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
  setupApply();
  setupFadeUp();
  await Promise.allSettled([loadStatus(), loadNotice(), loadReviews(), loadFaq()]);
}

init();
