function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "パスワード再設定のご案内",
      html: `
        <p>パスワード再設定のリクエストを受け付けました。</p>
        <p>以下のリンクから新しいパスワードを設定してください(有効期限: 1時間)。</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>このリクエストに心当たりがない場合は、このメールを無視してください。</p>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to send password reset email: ${res.status} ${text}`);
  }
}

export async function sendLessonBookingConfirmationEmail(
  to: string,
  confirmUrl: string,
  lessonTitle: string,
  dateTimeLabel: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "【要確認】レッスン予約の確認メール",
      html: `
        <p>以下のレッスンのご予約を受け付けました。</p>
        <p><strong>${lessonTitle}</strong><br>${dateTimeLabel}</p>
        <p>下のリンクをクリックすると予約が確定します(有効期限: 10分)。</p>
        <p><a href="${confirmUrl}">${confirmUrl}</a></p>
        <p>このリクエストに心当たりがない場合は、このメールを無視してください。予約は確定しません。</p>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to send lesson booking confirmation email: ${res.status} ${text}`);
  }
}

export async function sendInquiryNotificationEmail(
  to: string,
  name: string,
  fromEmail: string,
  message: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "【新着】お問い合わせが届きました",
      html: `
        <p>サイトから新しいお問い合わせが届きました。</p>
        <p><strong>お名前:</strong> ${escapeHtml(name)}<br><strong>メールアドレス:</strong> ${escapeHtml(fromEmail)}</p>
        <p><strong>内容:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to send inquiry notification email: ${res.status} ${text}`);
  }
}

export async function sendInquiryAutoReplyEmail(to: string, name: string, message: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "お問い合わせを受け付けました",
      html: `
        <p>${escapeHtml(name)} 様</p>
        <p>お問い合わせを受け付けました。内容を確認のうえ、担当者よりご連絡いたします。</p>
        <p><strong>お送りいただいた内容:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to send inquiry auto-reply email: ${res.status} ${text}`);
  }
}
