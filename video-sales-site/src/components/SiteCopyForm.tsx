"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Values = {
  heroHeadline: string;
  heroCatchcopy: string;
  footerIntro: string;
};

export default function SiteCopyForm({ initialValues }: { initialValues: Values }) {
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

    await fetch("/api/admin/settings/copy", {
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
        <div className="flex items-center justify-between gap-2">
          トップページの見出し
          <button
            type="button"
            onClick={() => update("heroHeadline", "")}
            className="text-xs font-normal text-tiffany-600 hover:text-tiffany-800"
          >
            元の文言に戻す
          </button>
        </div>
        <textarea
          value={values.heroHeadline}
          onChange={(e) => update("heroHeadline", e.target.value)}
          className="input mt-1"
          rows={2}
          placeholder="現場で活きる指導スキルを、\n自分のペースで学ぶ。"
        />
        <span className="mt-1 block text-xs text-tiffany-800/50">
          空欄のままにすると、現在の見出しがそのまま使われます。
        </span>
      </label>
      <label className="block text-sm font-medium text-tiffany-800">
        <div className="flex items-center justify-between gap-2">
          トップページのキャッチコピー
          <button
            type="button"
            onClick={() => update("heroCatchcopy", "")}
            className="text-xs font-normal text-tiffany-600 hover:text-tiffany-800"
          >
            元の文言に戻す
          </button>
        </div>
        <textarea
          value={values.heroCatchcopy}
          onChange={(e) => update("heroCatchcopy", e.target.value)}
          className="input mt-1"
          rows={3}
          placeholder="見出しの下に表示される説明文です"
        />
      </label>
      <label className="block text-sm font-medium text-tiffany-800">
        <div className="flex items-center justify-between gap-2">
          フッターの紹介文
          <button
            type="button"
            onClick={() => update("footerIntro", "")}
            className="text-xs font-normal text-tiffany-600 hover:text-tiffany-800"
          >
            元の文言に戻す
          </button>
        </div>
        <textarea
          value={values.footerIntro}
          onChange={(e) => update("footerIntro", e.target.value)}
          className="input mt-1"
          rows={3}
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
        「元の文言に戻す」は欄を空にするだけです。反映するには「保存する」を押してください。
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
