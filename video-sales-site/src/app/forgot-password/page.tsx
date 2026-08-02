"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">パスワードをお忘れの方</h1>
      <p className="mt-2 text-sm text-tiffany-800/70">
        登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
      </p>

      {sent ? (
        <p className="mt-8 rounded-lg bg-tiffany-50 p-4 text-sm text-tiffany-800">
          入力いただいたメールアドレス宛に、登録がある場合は再設定用のリンクをお送りしました。メールをご確認ください。
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-tiffany-800">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-tiffany-200 px-4 py-2.5 text-sm focus:border-tiffany-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
          >
            {loading ? "送信中..." : "再設定用リンクを送る"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-tiffany-800/70">
        <Link href="/login" className="font-semibold text-tiffany-600 hover:text-tiffany-800">
          ログイン画面に戻る
        </Link>
      </p>
    </div>
  );
}
