"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkInquiryRepliedButton({
  inquiryId,
  replied,
}: {
  inquiryId: string;
  replied: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/inquiries/${inquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repliedAt: !replied }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={
        replied
          ? "rounded-full border border-tiffany-300 px-5 py-2.5 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50 disabled:opacity-60"
          : "rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-tiffany-600 disabled:opacity-60"
      }
    >
      {loading ? "更新中..." : replied ? "未対応に戻す" : "対応済みにする"}
    </button>
  );
}
