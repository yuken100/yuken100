"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FooterLinkFormValues = {
  label: string;
  url: string;
};

export default function FooterLinkForm({
  footerLinkId,
  initialValues,
}: {
  footerLinkId?: string;
  initialValues?: Partial<FooterLinkFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<FooterLinkFormValues>({
    label: initialValues?.label ?? "",
    url: initialValues?.url ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FooterLinkFormValues>(key: K, value: FooterLinkFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = footerLinkId ? `/api/admin/footer-links/${footerLinkId}` : "/api/admin/footer-links";
    const method = footerLinkId ? "PUT" : "POST";

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

    router.push("/admin/footer-links");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block text-sm font-medium text-tiffany-800">
        表示名
        <input
          required
          value={values.label}
          onChange={(e) => update("label", e.target.value)}
          className="input mt-1"
          placeholder="例: 公式ブログ、Instagram"
        />
      </label>

      <label className="block text-sm font-medium text-tiffany-800">
        リンク先URL
        <input
          required
          type="url"
          value={values.url}
          onChange={(e) => update("url", e.target.value)}
          className="input mt-1"
          placeholder="https://..."
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "保存中..." : footerLinkId ? "更新する" : "追加する"}
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
