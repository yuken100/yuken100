"use client";

import { useState } from "react";

export default function TestimonialSubmitForm({
  videoId,
  lessonId,
  defaultName,
}: {
  videoId?: string;
  lessonId?: string;
  defaultName?: string;
}) {
  const [studentName, setStudentName] = useState(defaultName ?? "");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId,
        lessonId,
        studentName,
        comment,
        rating: rating ? Number(rating) : null,
      }),
    });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "投稿に失敗しました。");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl2 border border-tiffany-100 bg-white p-6 text-sm text-tiffany-800/80 shadow-sm">
        投稿ありがとうございます。確認後にサイトへ掲載されます。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
      <h3 className="font-display text-base font-bold text-tiffany-900">口コミを投稿する</h3>
      <p className="mt-1 text-xs text-tiffany-800/60">
        投稿内容は運営の確認後にサイトへ掲載されます。
      </p>
      <div className="mt-4 space-y-3">
        <label className="block text-sm font-medium text-tiffany-800">
          お名前(匿名可・例: A.Tさん)
          <input
            required
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="input mt-1"
            placeholder="例: A.Tさん"
          />
        </label>
        <label className="block text-sm font-medium text-tiffany-800">
          コメント
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm font-medium text-tiffany-800">
          評価(任意・1〜5)
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="input mt-1 w-24"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-full bg-tiffany-500 px-6 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "送信中..." : "投稿する"}
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
