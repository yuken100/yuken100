"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CloudinaryUpload from "./CloudinaryUpload";

type VideoFormValues = {
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  durationMinutes: number;
  priceJpy: number;
  videoUrl: string;
  gradientFrom: string;
  gradientTo: string;
  thumbnailUrl: string;
  membersOnly: boolean;
  published: boolean;
};

const defaultValues: VideoFormValues = {
  title: "",
  slug: "",
  description: "",
  category: "",
  level: "初級",
  durationMinutes: 30,
  priceJpy: 3300,
  videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  gradientFrom: "#81D8D0",
  gradientTo: "#FFD2D9",
  thumbnailUrl: "",
  membersOnly: false,
  published: true,
};

export default function VideoForm({
  videoId,
  initialValues,
}: {
  videoId?: string;
  initialValues?: Partial<VideoFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<VideoFormValues>({ ...defaultValues, ...initialValues });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof VideoFormValues>(key: K, value: VideoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = videoId ? `/api/admin/videos/${videoId}` : "/api/admin/videos";
    const method = videoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "保存に失敗しました。");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="タイトル">
          <input
            required
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="スラッグ(URL用・半角英数)">
          <input
            required
            value={values.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="input"
            pattern="[a-z0-9\-]+"
          />
        </Field>
      </div>

      <Field label="説明文">
        <textarea
          required
          rows={4}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="カテゴリ">
          <input
            required
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="レベル">
          <input
            required
            value={values.level}
            onChange={(e) => update("level", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="長さ(分)">
          <input
            required
            type="number"
            min={1}
            value={values.durationMinutes}
            onChange={(e) => update("durationMinutes", Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="価格 (円)">
          <input
            required
            type="number"
            min={0}
            value={values.priceJpy}
            onChange={(e) => update("priceJpy", Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="動画URL (Vimeo・YouTubeのリンク、または直接のmp4ファイルURL)">
          <input
            required
            value={values.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
            className="input"
            placeholder="例: https://vimeo.com/123456789"
          />
        </Field>
      </div>

      <Field label="サムネイル画像(任意・空欄の場合は下のグラデーションを表示)">
        {values.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.thumbnailUrl}
            alt="Thumbnail Preview"
            className="mb-3 h-24 w-full rounded-lg object-cover"
          />
        )}
        <CloudinaryUpload
          folder="yoga-studio/videos"
          onUpload={(url) => update("thumbnailUrl", url)}
        >
          サムネイルをアップロード
        </CloudinaryUpload>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="サムネイル グラデーション色1(画像未設定時に使用)">
          <input
            type="color"
            value={values.gradientFrom}
            onChange={(e) => update("gradientFrom", e.target.value)}
            className="h-10 w-full"
          />
        </Field>
        <Field label="サムネイル グラデーション色2(画像未設定時に使用)">
          <input
            type="color"
            value={values.gradientTo}
            onChange={(e) => update("gradientTo", e.target.value)}
            className="h-10 w-full"
          />
        </Field>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-tiffany-800">
          <input
            type="checkbox"
            checked={values.membersOnly}
            onChange={(e) => update("membersOnly", e.target.checked)}
          />
          会員限定(単品購入不可)
        </label>
        <label className="flex items-center gap-2 text-sm text-tiffany-800">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          公開する
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "保存中..." : videoId ? "更新する" : "追加する"}
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
