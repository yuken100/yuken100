"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestimonialApprovalForm({
  testimonialId,
  studentName,
  comment,
  photoUrl,
  photoPosition,
  rating,
  videoId,
  lessonId,
  published: initialPublished,
}: {
  testimonialId: string;
  studentName: string;
  comment: string;
  photoUrl: string | null;
  photoPosition: string;
  rating: number | null;
  videoId: string | null;
  lessonId: string | null;
  published: boolean;
}) {
  const router = useRouter();
  const [published, setPublished] = useState(initialPublished);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/testimonials/${testimonialId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName,
        comment,
        photoUrl,
        photoPosition,
        rating,
        published,
        videoId,
        lessonId,
      }),
    });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "保存に失敗しました。");
      return;
    }

    router.push("/admin/testimonials");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <p className="text-xs text-tiffany-800/60">
        受講生からの投稿は、改ざん防止のため内容(お名前・コメント・評価)を編集できません。公開の可否のみ設定できます。不適切な内容の場合は一覧から削除してください。
      </p>

      <div className="rounded-xl2 border border-tiffany-100 bg-tiffany-50/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-tiffany-600">
          投稿内容(編集不可)
        </p>
        <p className="mt-3 text-sm font-semibold text-tiffany-900">{studentName}</p>
        {rating && (
          <p className="mt-1 text-xs text-tiffany-500" aria-label={`評価${rating}`}>
            {"★".repeat(rating)}
            {"☆".repeat(5 - rating)}
          </p>
        )}
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-tiffany-800/80">
          {comment}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-tiffany-800">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        公開する
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
