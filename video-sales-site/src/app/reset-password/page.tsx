"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "パスワードの再設定に失敗しました。");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <p className="mt-8 text-sm text-red-500">
        リンクが正しくありません。もう一度パスワード再設定をお試しください。
      </p>
    );
  }

  if (done) {
    return (
      <p className="mt-8 rounded-lg bg-tiffany-50 p-4 text-sm text-tiffany-800">
        パスワードを再設定しました。ログイン画面に移動します。
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="text-sm font-medium text-tiffany-800">新しいパスワード</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-tiffany-200 px-4 py-2.5 text-sm focus:border-tiffany-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-tiffany-800">新しいパスワード(確認)</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-tiffany-200 px-4 py-2.5 text-sm focus:border-tiffany-400 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "設定中..." : "パスワードを再設定する"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">パスワードの再設定</h1>
      <p className="mt-2 text-sm text-tiffany-800/70">新しいパスワードを入力してください。</p>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-tiffany-800/70">
        <Link href="/login" className="font-semibold text-tiffany-600 hover:text-tiffany-800">
          ログイン画面に戻る
        </Link>
      </p>
    </div>
  );
}
