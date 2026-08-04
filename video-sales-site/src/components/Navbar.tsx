import Link from "next/link";
import AuthButtons from "@/components/AuthButtons";
import MobileNav from "@/components/MobileNav";
import { isProPlan } from "@/lib/plan";

export default async function Navbar() {
  const showLessons = await isProPlan();

  const links = [
    { href: "/courses", label: "講座一覧" },
    ...(showLessons
      ? [
          { href: "/lessons", label: "レッスン予約" },
          { href: "/lessons/calendar", label: "カレンダー" },
        ]
      : []),
    { href: "/pricing", label: "料金プラン" },
    { href: "/about", label: "スタジオについて" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-tiffany-100 bg-white/80 backdrop-blur relative">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-tiffany-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tiffany-300 text-white">
            楽
          </span>
          Sara Yoga
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-tiffany-800/80 hover:text-tiffany-700"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <AuthButtons />
          <MobileNav links={links} />
        </div>
      </nav>
    </header>
  );
}
