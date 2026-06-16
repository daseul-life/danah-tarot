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
      <button data-id="${review.id}">
        삭제
      </button>
    `;

    const deleteBtn =
      item.querySelector("button");

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

async function loadAll() {
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