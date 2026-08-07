"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Values = {
  announcementEnabled: boolean;
  announcementText: string;
  announcementUrl: string;
};

export default function AnnouncementForm({ initialValues }: { initialValues: Values }) {
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

    await fetch("/api/admin/settings/announcement", {
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
      <label className="flex items-center gap-2 text-sm text-tiffany-800">
        <input
          type="checkbox"
          checked={values.announcementEnabled}
          onChange={(e) => update("announcementEnabled", e.target.checked)}
        />
        このお知らせを表示する
      </label>
      <label className="block text-sm font-medium text-tiffany-800">
        お知らせ文
        <input
          value={values.announcementText}
          onChange={(e) => update("announcementText", e.target.value)}
          className="input mt-1"
          placeholder="例: 8月のワークショップ、参加者募集中です"
        />
      </label>
      <label className="block text-sm font-medium text-tiffany-800">
        リンク先URL(任意)
        <input
          value={values.announcementUrl}
          onChange={(e) => update("announcementUrl", e.target.value)}
          className="input mt-1"
          placeholder="https://..."
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
        直近に追加された新着の講座・レッスンは自動でお知らせに表示されます。オンにすると、それに加えてこのお知らせも一緒に表示されます。
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
