import { auth, db, firebaseConfig } from "./firebase-config.js";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const statusRef = doc(db, "site", "status");
const statusDot = document.querySelector("[data-status-dot]");
const statusText = document.querySelector("[data-status-text]");
const detailText = document.querySelector("[data-status-detail]");
const authText = document.querySelector("[data-auth-status]");
const projectText = document.querySelector("[data-project-id]");
const adminButtons = document.querySelectorAll("[data-admin-state]");

const hasFirebaseValues = ![
  firebaseConfig.apiKey,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].some((value) => !value || value.startsWith("YOUR_"));

function setStatus(state, message, detail = "") {
  document.documentElement.dataset.firebaseStatus = state;

  if (statusDot) {
    statusDot.dataset.state = state;
  }

  if (statusText) {
    statusText.textContent = message;
  }

  if (detailText) {
    detailText.textContent = detail;
  }
}

function getConsultationStatus(data) {
  const status = String(data.state || "").toLowerCase();

  if (["open", "progress", "close"].includes(status)) {
    return status;
  }

  return "open";
}

function getStatusLabel(status) {
  switch (status) {
    case "open":
      return "상담 가능";
    case "progress":
      return "상담 진행 중";
    case "close":
      return "상담 마감";
    default:
      return "상담 상태 확인됨";
  }
}

if (projectText) {
  projectText.textContent = firebaseConfig.projectId;
}

if (!hasFirebaseValues) {
  setStatus(
    "warning",
    "Firebase config 확인 필요",
    "firebase-config.js의 apiKey, messagingSenderId, appId 값을 실제 Firebase 값으로 교체해주세요."
  );
} else {
  setStatus("connecting", "Firestore 연결 중", "site/status 문서를 실시간으로 구독하고 있습니다.");

  onSnapshot(
    statusRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        setStatus(
          "connected",
          "Firestore 실시간 연결됨",
          "site/status 문서는 아직 없지만 실시간 구독은 정상적으로 열렸습니다."
        );
        return;
      }

      const data = snapshot.data();
      const consultationStatus = getConsultationStatus(data);
      const label = data.label || data.message || getStatusLabel(consultationStatus);
      const updatedAt = data.updatedAt?.toDate?.();
      const detail = updatedAt
        ? `상태: ${consultationStatus} / 마지막 업데이트: ${updatedAt.toLocaleString("ko-KR")}`
        : `상태: ${consultationStatus} / site/status 문서 변경을 실시간으로 감지하고 있습니다.`;

      setStatus(consultationStatus, label, detail);
    },
    (error) => {
      setStatus("error", "Firestore 연결 오류", `${error.code || "error"}: ${error.message}`);
    }
  );
}

adminButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const state = button.dataset.adminState;

    if (!["open", "progress", "close"].includes(state)) {
      return;
    }

    button.disabled = true;

    try {
      await setDoc(
        statusRef,
        {
          state,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      setStatus("error", "상태 변경 실패", `${error.code || "error"}: ${error.message}`);
    } finally {
      button.disabled = false;
    }
  });
});

onAuthStateChanged(auth, (user) => {
  if (!authText) {
    return;
  }

  authText.textContent = user ? `Auth 유지됨: ${user.uid}` : "Auth 준비됨: 로그인 대기";
});
