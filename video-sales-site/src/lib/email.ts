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
