"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ContactForm() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName((prev) => prev || session.user.name || "");
      setEmail((prev) => prev || session.user.email || "");
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "送信に失敗しました。");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl2 border border-tiffany-100 bg-white p-6 text-sm text-tiffany-800/80 shadow-sm">
        お問い合わせいただきありがとうございます。ご入力いただいたメールアドレス宛に確認メールをお送りしました。担当者より改めてご連絡いたします。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-tiffany-800">
          お名前
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm font-medium text-tiffany-800">
          メールアドレス
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm font-medium text-tiffany-800">
          お問い合わせ内容
          <textarea
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input mt-1"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-full bg-tiffany-500 px-6 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "送信中..." : "送信する"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #d9f4f1;
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #5cc9be;
        }
      `}</style>
    </form>
  );
}
