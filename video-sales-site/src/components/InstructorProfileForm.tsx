"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CloudinaryUpload from "./CloudinaryUpload";

type Values = {
  instructorName: string;
  instructorBio: string;
  instructorPhotoUrl: string;
};

export default function InstructorProfileForm({ initialValues }: { initialValues: Values }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initialValues);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/admin/settings/instructor", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <label className="block text-sm font-medium text-tiffany-800">
        お名前
        <input
          value={values.instructorName}
          onChange={(e) => update("instructorName", e.target.value)}
          className="input mt-1"
          placeholder="例: サラ"
        />
      </label>
      <div className="block text-sm font-medium text-tiffany-800">
        <p className="mb-2">プロフィール写真</p>
        {values.instructorPhotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.instructorPhotoUrl}
            alt="Preview"
            className="mb-3 h-20 w-20 rounded-full object-cover"
          />
        )}
        <CloudinaryUpload
          folder="yoga-studio/instructor"
          onUpload={(url) => update("instructorPhotoUrl", url)}
        >
          写真をアップロード
        </CloudinaryUpload>
      </div>
      <label className="block text-sm font-medium text-tiffany-800">
        自己紹介文
        <textarea
          rows={4}
          value={values.instructorBio}
          onChange={(e) => update("instructorBio", e.target.value)}
          className="input mt-1"
          placeholder="例: ヨガインストラクター歴10年。全米ヨガアライアンス200時間資格取得。"
        />
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
        >
          {loading ? "保存中..." : "保存する"}
        </button>
        {saved && <span className="text-sm text-tiffany-600">保存しました</span>}
      </div>

      <p className="text-xs text-tiffany-800/60">
        お名前を入力すると、トップページに講師紹介セクションが表示されます。空欄のままにすると非表示のままです。
      </p>

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
