"use client";

import { useState } from "react";

const QUESTIONS = [
  {
    key: "concern",
    label: "参加する前に不安だったこと・躊躇した点はありますか？(任意)",
    required: false,
  },
  {
    key: "motivation",
    label: "受講のきっかけ・目的を教えてください",
    required: true,
  },
  {
    key: "change",
    label: "受講してみて感じた変化・成果を教えてください",
    required: true,
  },
  {
    key: "recommend",
    label: "どんな方におすすめしたいですか？(任意)",
    required: false,
  },
] as const;

type AnswerKey = (typeof QUESTIONS)[number]["key"];

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
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>({
    concern: "",
    motivation: "",
    change: "",
    recommend: "",
  });
  const [rating, setRating] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function updateAnswer(key: AnswerKey, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError("サイトへの掲載に同意のうえ、チェックを入れてください。");
      return;
    }

    const comment = QUESTIONS.map((q) => answers[q.key].trim())
      .map((answer, i) => (answer ? `Q. ${QUESTIONS[i].label.replace(/(\(任意\))$/, "")}\n${answer}` : null))
      .filter(Boolean)
      .join("\n\n");

    setLoading(true);
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
      setError(data.error ?? "送信に失敗しました。");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl2 border border-tiffany-100 bg-white p-6 text-sm text-tiffany-800/80 shadow-sm">
        ご感想をありがとうございます。確認後にサイトへ掲載されます。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
      <h3 className="font-display text-base font-bold text-tiffany-900">ご意見・ご感想をお聞かせください</h3>
      <p className="mt-1 text-xs text-tiffany-800/60">
        サービス向上のため、以下の質問にご回答いただけますと幸いです。いただいた内容は、確認のうえサイトに掲載させていただく場合があります。
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
        {QUESTIONS.map((q) => (
          <label key={q.key} className="block text-sm font-medium text-tiffany-800">
            {q.label}
            <textarea
              required={q.required}
              rows={2}
              value={answers[q.key]}
              onChange={(e) => updateAnswer(q.key, e.target.value)}
              className="input mt-1"
            />
          </label>
        ))}
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

      <label className="mt-4 flex items-start gap-2 text-xs text-tiffany-800/80">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5"
        />
        回答内容とお名前をサイトに掲載することに同意します
      </label>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || !agreed}
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
