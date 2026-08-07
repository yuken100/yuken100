"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteFooterLinkButton({ footerLinkId }: { footerLinkId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("このリンクを削除しますか?この操作は取り消せません。")) return;

    setLoading(true);
    await fetch(`/api/admin/footer-links/${footerLinkId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="font-semibold text-red-500 hover:text-red-700 disabled:opacity-60"
    >
      削除
    </button>
  );
}
