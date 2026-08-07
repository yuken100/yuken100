"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SocialIcon, { getPlatformLabel } from "@/components/SocialIcon";

export default function FooterLinkForm({
  footerLinkId,
  initialUrl = "",
}: {
  footerLinkId?: string;
  initialUrl?: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = footerLinkId ? `/api/admin/footer-links/${footerLinkId}` : "/api/admin/footer-links";
    const method = footerLinkId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
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
        リンク先URL
        <input
          required
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input mt-1"
          placeholder="https://..."
        />
      </label>
      <p className="text-xs text-tiffany-800/60">
        Instagram・X・YouTube・TikTok・Facebook・LINEのURLは自動判定してアイコンを表示します。それ以外はリンクアイコンで表示されます。
      </p>

      {url && (
        <div className="flex items-center gap-2 text-sm text-tiffany-800">
          <SocialIcon url={url} className="h-6 w-6" />
          {getPlatformLabel(url)}として表示されます
        </div>
      )}

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
