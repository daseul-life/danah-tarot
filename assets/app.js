/* =====================
    REVIEWS (카카오톡 말풍선 스타일)
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
    <div class="review-bubble-item" style="
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
