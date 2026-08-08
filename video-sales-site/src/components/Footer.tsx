import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SocialIcon, { getPlatformLabel } from "@/components/SocialIcon";

export default async function Footer() {
  const [footerLinks, settings] = await Promise.all([
    prisma.footerLink.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);
  const footerIntro =
    settings?.footerIntro?.trim() ||
    "ヨガインストラクターのための学びのプラットフォーム。解剖学から指導スキル、専門コースまで、現場で使える講座を毎週お届けしています。";

  return (
    <footer className="border-t border-tiffany-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-tiffany-800/70">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-tiffany-700">Sara Yoga</p>
            <p className="mt-2 max-w-sm whitespace-pre-line">{footerIntro}</p>
          </div>
          <div className="flex gap-10">
            <div>
              <p className="font-semibold text-tiffany-800">サイトマップ</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/courses" className="hover:text-tiffany-700">講座一覧</Link></li>
                <li><Link href="/pricing" className="hover:text-tiffany-700">料金プラン</Link></li>
                <li><Link href="/about" className="hover:text-tiffany-700">スタジオについて</Link></li>
                <li><Link href="/contact" className="hover:text-tiffany-700">お問い合わせ</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-tiffany-800">アカウント</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/login" className="hover:text-tiffany-700">ログイン</Link></li>
                <li><Link href="/signup" className="hover:text-tiffany-700">新規登録</Link></li>
                <li><Link href="/dashboard" className="hover:text-tiffany-700">マイページ</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8">
          {footerLinks.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-3">
              {footerLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={getPlatformLabel(link.url)}
                  className="opacity-70 transition-opacity hover:opacity-100"
                >
                  <SocialIcon url={link.url} className="h-6 w-6" />
                </a>
              ))}
            </div>
          )}
          <p className="text-xs text-tiffany-800/50">
            &copy; {new Date().getFullYear()} Sara Yoga. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
