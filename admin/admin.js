import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL =
  "https://gsznghkxwogqfqhyiyko.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_QnV_Ls2YMQP_dvm9s12Bdw_HTp1cNDR";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const loginPanel = document.getElementById("login-panel");
const adminPanel = document.getElementById("admin-panel");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

const statusSelect = document.getElementById("statusSelect");
const saveStatusBtn = document.getElementById("saveStatusBtn");

const noticeInput = document.getElementById("noticeInput");
const saveNoticeBtn = document.getElementById("saveNoticeBtn");

const reviewInput = document.getElementById("reviewInput");
const addReviewBtn = document.getElementById("addReviewBtn");

const reviewList = document.getElementById("reviewList");

const applicationList = document.getElementById("applicationList");
const applicationsNotice = document.getElementById("applicationsNotice");
const applicationCount = document.getElementById("applicationCount");
const refreshApplicationsBtn = document.getElementById("refreshApplicationsBtn");

const logoutBtn = document.getElementById("logoutBtn");

function showAdmin() {
  loginPanel.classList.add("hidden");
  adminPanel.classList.remove("hidden");
}

function showLogin() {
  loginPanel.classList.remove("hidden");
  adminPanel.classList.add("hidden");
}

async function loadStatus() {
  const { data } = await supabase
    .from("status")
    .select("*")
    .eq("id", 1)
    .single();

  if (data) {
    statusSelect.value = data.status;
  }
}

async function loadNotice() {
  const { data } = await supabase
    .from("notice")
    .select("*")
    .eq("id", 1)
    .single();

  if (data) {
    noticeInput.value = data.content || "";
  }
}

async function loadReviews() {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .order("id", { ascending: false });

  reviewList.innerHTML = "";

  if (!data) return;

  data.forEach((review) => {
    const item = document.createElement("div");

    item.className = "review-item";

    item.innerHTML = `
  <p>${review.content}</p>

  <button class="edit-btn">
    수정
  </button>

  <button class="delete-btn">
    삭제
  </button>
`;

const editBtn = item.querySelector(".edit-btn");
const deleteBtn = item.querySelector(".delete-btn");
editBtn.addEventListener("click", async () => {
  const newContent = prompt("후기를 수정하세요.", review.content);

  if (newContent === null) return;

  if (!newContent.trim()) {
    alert("후기를 입력해주세요.");
    return;
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      content: newContent.trim()
    })
    .eq("id", review.id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("수정 완료");
  loadReviews();
});


    deleteBtn.addEventListener(
      "click",
      async () => {
        await supabase
          .from("reviews")
          .delete()
          .eq("id", review.id);

        loadReviews();
      }
    );

    reviewList.appendChild(item);
  });
}

/* =====================
   상담 신청 내역
===================== */

const APPLICATION_STATUSES = ["대기", "확인됨", "완료"];

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statusClass(status) {
  if (status === "완료") return "done";
  if (status === "확인됨") return "checked";
  return "waiting";
}

function statusBadge(status) {
  const value = status || "대기";
  return `<span class="status-badge ${statusClass(value)}">${escapeHtml(value)}</span>`;
}

function formatReceived(value) {
  if (!value) return "시간 미상";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  try {
    const parts = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(date);

    const get = (type) => (parts.find((part) => part.type === type) || {}).value || "";
    return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
  } catch (error) {
    return date.toLocaleString("ko-KR");
  }
}

function formatPreferredDate(value) {
  if (!value) return "미정";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  const names = ["일", "월", "화", "수", "목", "금", "토"];
  return `${value} (${names[date.getDay()]}요일)`;
}

function formatPreferredTime(value) {
  if (!value) return "미정";

  const [rawHour, rawMinute] = String(value).split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return String(value);

  const mark = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${mark} ${hour12}:${String(minute).padStart(2, "0")}`;
}

function showApplicationsNotice(text) {
  if (!applicationsNotice) return;
  applicationsNotice.textContent = text;
  applicationsNotice.hidden = false;
}

function hideApplicationsNotice() {
  if (!applicationsNotice) return;
  applicationsNotice.textContent = "";
  applicationsNotice.hidden = true;
}

function isMissingTableError(error) {
  const code = (error && error.code) || "";
  const text = `${(error && error.message) || ""} ${(error && error.details) || ""}`;

  return (
    code === "PGRST205" ||
    code === "42P01" ||
    /could not find the table/i.test(text) ||
    /relation .* does not exist/i.test(text) ||
    /table .* does not exist/i.test(text)
  );
}

function describeApplicationsError(error) {
  if (isMissingTableError(error)) {
    return "상담 신청 테이블이 아직 생성되지 않았습니다. Supabase에 applications 테이블을 만들면 이곳에 신청 내역이 표시됩니다.";
  }

  const text = (error && error.message) || "";

  if (/row-level security|permission denied|jwt/i.test(text)) {
    return "신청 내역을 불러올 권한이 없습니다. Supabase의 RLS 정책을 확인해 주세요.";
  }

  return `신청 내역을 불러오지 못했습니다.${text ? ` (${text})` : ""}`;
}

function buildApplicationItem(application) {
  const item = document.createElement("div");
  item.className = "application-item";

  const status = application.status || "대기";
  const statuses = APPLICATION_STATUSES.includes(status)
    ? APPLICATION_STATUSES
    : [...APPLICATION_STATUSES, status];

  const when = `${formatPreferredDate(application.preferred_date)} · ${formatPreferredTime(
    application.preferred_time
  )}`;

  item.innerHTML = `
    <div class="application-head">
      <strong class="application-name">${escapeHtml(application.name || "이름 없음")}</strong>
      ${statusBadge(status)}
    </div>

    <p class="application-meta">
      ${escapeHtml(application.category || "상담 종류 미정")} · ${escapeHtml(
        application.duration || "미정"
      )}
    </p>

    <p class="application-meta">
      접수 ${escapeHtml(formatReceived(application.created_at))}
    </p>

    <p class="application-when">
      희망 일정 · ${escapeHtml(when)}
    </p>

    <p class="application-concern">${escapeHtml(
      application.concern || "고민 내용이 작성되지 않았습니다."
    )}</p>

    <div class="application-actions">
      <select class="application-status" aria-label="상담 신청 상태 변경">
        ${statuses
          .map(
            (value) =>
              `<option value="${escapeHtml(value)}"${
                value === status ? " selected" : ""
              }>${escapeHtml(value)}</option>`
          )
          .join("")}
      </select>

      <button class="delete-btn" type="button">삭제</button>
    </div>
  `;

  const statusSelectEl = item.querySelector(".application-status");
  const badgeEl = item.querySelector(".status-badge");
  const deleteBtn = item.querySelector(".delete-btn");

  statusSelectEl.addEventListener("change", async () => {
    const next = statusSelectEl.value;
    statusSelectEl.disabled = true;

    const { error } = await supabase
      .from("applications")
      .update({ status: next })
      .eq("id", application.id);

    statusSelectEl.disabled = false;

    if (error) {
      alert(`상태를 변경하지 못했습니다.\n${error.message}`);
      statusSelectEl.value = application.status || "대기";
      return;
    }

    application.status = next;
    badgeEl.className = `status-badge ${statusClass(next)}`;
    badgeEl.textContent = next;
  });

  deleteBtn.addEventListener("click", async () => {
    const label = application.name || "이";

    if (
      !confirm(`"${label}"님의 상담 신청 내역을 삭제할까요?\n삭제한 내역은 되돌릴 수 없습니다.`)
    ) {
      return;
    }

    deleteBtn.disabled = true;

    const { error } = await supabase.from("applications").delete().eq("id", application.id);

    deleteBtn.disabled = false;

    if (error) {
      alert(`삭제하지 못했습니다.\n${error.message}`);
      return;
    }

    loadApplications();
  });

  return item;
}

function renderApplications(applications) {
  if (!applicationList) return;

  applicationList.innerHTML = "";

  if (applicationCount) {
    applicationCount.textContent = String(applications.length);
    applicationCount.classList.toggle("hidden", applications.length === 0);
  }

  if (applications.length === 0) {
    const empty = document.createElement("p");
    empty.className = "application-empty";
    empty.textContent = "아직 접수된 상담 신청이 없습니다.";
    applicationList.appendChild(empty);
    return;
  }

  applications.forEach((application) => {
    applicationList.appendChild(buildApplicationItem(application));
  });
}

async function loadApplications() {
  if (!applicationList) return;

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    applicationList.innerHTML = "";
    if (applicationCount) applicationCount.classList.add("hidden");
    // 신청 내역 영역에만 안내를 띄우고, 다른 관리자 기능은 그대로 둡니다.
    showApplicationsNotice(describeApplicationsError(error));
    return;
  }

  hideApplicationsNotice();
  renderApplications(Array.isArray(data) ? data : []);
}

if (refreshApplicationsBtn) {
  refreshApplicationsBtn.addEventListener("click", async () => {
    refreshApplicationsBtn.disabled = true;
    await loadApplications();
    refreshApplicationsBtn.disabled = false;
  });
}

async function loadAll() {
  await loadApplications();
  await loadStatus();
  await loadNotice();
  await loadReviews();
}

loginBtn.addEventListener(
  "click",
  async () => {
    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value.trim();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

   if (error) {
  message.textContent = error.message;
  return;
}

   const ADMIN_EMAIL = "aa95925551@gmail.com";

const {
  data: { user }
} = await supabase.auth.getUser();

if (user.email !== ADMIN_EMAIL) {
  await supabase.auth.signOut();
  alert("관리자만 접근 가능합니다.");
  return;
}

message.textContent = "";

showAdmin();

loadAll();
    
  }
);

saveStatusBtn.addEventListener(
  "click",
  async () => {
    await supabase
      .from("status")
      .update({
        status: statusSelect.value,
      })
      .eq("id", 1);

    alert("상태 저장 완료");
  }
);

saveNoticeBtn.addEventListener(
  "click",
  async () => {
    await supabase
      .from("notice")
      .update({
        content:
          noticeInput.value,
      })
      .eq("id", 1);

    alert("공지 저장 완료");
  }
);

addReviewBtn.addEventListener(
  "click",
  async () => {

    const content =
      reviewInput.value.trim();

    if (!content) return;

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          content,
        },
      ]);

    console.log("DATA", data);
    console.log("ERROR", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("후기 저장 완료");

    reviewInput.value = "";

    loadReviews();
  }
);

logoutBtn.addEventListener(
  "click",
  async () => {
    await supabase.auth.signOut();

    showLogin();
  }
);

async function init() {
  const {
    data: { session },
  } =
    await supabase.auth.getSession();

  if (session) {
    showAdmin();

    loadAll();
  }
}

init();
