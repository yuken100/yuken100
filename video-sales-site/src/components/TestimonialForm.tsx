"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "./ImageUploadField";

type TestimonialFormValues = {
  studentName: string;
  comment: string;
  photoUrl: string;
  photoPosition: string;
  rating: string;
  published: boolean;
  target: string; // "" | `video:${id}` | `lesson:${id}`
};

const defaultValues: TestimonialFormValues = {
  studentName: "",
  comment: "",
  photoUrl: "",
  photoPosition: "50% 50%",
  rating: "",
  published: true,
  target: "",
};

export default function TestimonialForm({
  testimonialId,
  initialValues,
  videos = [],
  lessons = [],
}: {
  testimonialId?: string;
  initialValues?: Partial<TestimonialFormValues>;
  videos?: { id: string; title: string }[];
  lessons?: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<TestimonialFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof TestimonialFormValues>(key: K, value: TestimonialFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = testimonialId ? `/api/admin/testimonials/${testimonialId}` : "/api/admin/testimonials";
    const method = testimonialId ? "PUT" : "POST";

    const [targetType, targetId] = values.target.split(":");

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: values.studentName,
        comment: values.comment,
        photoUrl: values.photoUrl,
        photoPosition: values.photoPosition,
        rating: values.rating ? Number(values.rating) : null,
        published: values.published,
        videoId: targetType === "video" ? targetId : null,
        lessonId: targetType === "lesson" ? targetId : null,
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
      <Field label="生徒さんのお名前">
        <input
          required
          value={values.studentName}
          onChange={(e) => update("studentName", e.target.value)}
          className="input"
          placeholder="例: A.Tさん"
        />
      </Field>

      <Field label="コメント">
        <textarea
          required
          rows={4}
          value={values.comment}
          onChange={(e) => update("comment", e.target.value)}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="写真(任意)">
          <ImageUploadField
            folder="yoga-studio/testimonials"
            imageUrl={values.photoUrl}
            position={values.photoPosition}
            onImageChange={(url) => update("photoUrl", url)}
            onPositionChange={(position) => update("photoPosition", position)}
            previewClassName="h-16 w-16 rounded-full"
            buttonLabel="写真をアップロード"
          />
        </Field>
        <Field label="評価(任意・1〜5)">
          <input
            type="number"
            min={1}
            max={5}
            value={values.rating}
            onChange={(e) => update("rating", e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <Field label="表示先(任意・未選択の場合はトップページに表示)">
        <select
          value={values.target}
          onChange={(e) => update("target", e.target.value)}
          className="input"
        >
          <option value="">指定なし(トップページ)</option>
          {videos.length > 0 && (
            <optgroup label="講座">
              {videos.map((video) => (
                <option key={video.id} value={`video:${video.id}`}>
                  {video.title}
                </option>
              ))}
            </optgroup>
          )}
          {lessons.length > 0 && (
            <optgroup label="レッスン">
              {lessons.map((lesson) => (
                <option key={lesson.id} value={`lesson:${lesson.id}`}>
                  {lesson.title}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </Field>

      <label className="flex items-center gap-2 text-sm text-tiffany-800">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => update("published", e.target.checked)}
        />
        公開する
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "保存中..." : testimonialId ? "更新する" : "追加する"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-tiffany-800">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
