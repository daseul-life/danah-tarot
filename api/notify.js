export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const origin = req.headers.origin;
  if (origin) {
    try {
      const host = new URL(origin).hostname;
      const allowed = host === "danah-tarot.vercel.app" || host.endsWith(".vercel.app");
      if (!allowed) return res.status(403).json({ error: "Forbidden origin" });
    } catch {
      return res.status(403).json({ error: "Invalid origin" });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) {
    return res.status(503).json({ error: "Email service is not configured" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  const name = String(body.name || "").trim().slice(0, 80);
  const type = String(body.type || "").trim().slice(0, 100);
  const duration = String(body.duration || "미정").trim().slice(0, 100);
  const concern = String(body.concern || "").trim().slice(0, 2000);
  const date = String(body.date || "미정").trim().slice(0, 40);
  const time = String(body.time || "미정").trim().slice(0, 40);

  if (!name || !type) {
    return res.status(400).json({ error: "Name and consultation type are required" });
  }

  const text = [
    "단아의 타로에 새 상담 신청이 접수되었습니다.",
    "",
    "이름: " + name,
    "상담 종류: " + type,
    "상담 시간: " + duration,
    "희망 날짜: " + date,
    "희망 시간: " + time,
    "",
    "고민 내용:",
    concern || "(작성하지 않음)"
  ].join("\n");

  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Danah's Tarot <onboarding@resend.dev>",
        to: [to],
        subject: "[단아의 타로] 새 상담 신청이 접수됐어요",
        text
      })
    });

    const payload = await result.json().catch(() => ({}));
    if (!result.ok) {
      console.error("[email] Resend error:", payload);
      return res.status(502).json({ error: "Email provider rejected the request" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[email] Sending failed:", error);
    return res.status(500).json({ error: "Email sending failed" });
  }
}
