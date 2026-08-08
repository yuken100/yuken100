"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RestoreCopyHistoryButton({ historyId }: { historyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function restore() {
    if (!confirm("この時点の内容に戻しますか？現在の内容は履歴として残ります。")) return;
    setLoading(true);
    await fetch(`/api/admin/settings/copy/history/${historyId}/restore`, { method: "PATCH" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={restore}
      disabled={loading}
      className="rounded-full border border-tiffany-300 px-4 py-2 text-xs font-semibold text-tiffany-700 hover:bg-tiffany-50 disabled:opacity-60"
    >
      {loading ? "復元中..." : "この内容に復元"}
    </button>
  );
}
