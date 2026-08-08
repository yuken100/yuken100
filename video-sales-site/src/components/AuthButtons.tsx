"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-tiffany-700 hover:text-tiffany-900"
        >
          ログイン
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-tiffany-500 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600"
        >
          無料登録
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-tiffany-700 hover:text-tiffany-900"
      >
        マイページ
      </Link>
      {session.user.role === "ADMIN" && (
        <Link
          href="/admin"
          className="text-sm font-medium text-tiffany-700 hover:text-tiffany-900"
        >
          管理画面
        </Link>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-tiffany-300 px-4 py-2 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50"
      >
        ログアウト
      </button>
    </div>
  );
}
