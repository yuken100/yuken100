"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Item = { id: string; typeLabel: string; text: string; href: string | null; dismissible: boolean };

const BAR_CLASS =
  "block w-full truncate bg-tiffany-600 px-6 py-2 text-center text-xs font-medium text-white sm:text-sm";

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold tracking-wide">
      {children}
    </span>
  );
}

export default function AnnouncementBanner({ items }: { items: Item[] }) {
  const { data: session } = useSession();
  const [visibleItems, setVisibleItems] = useState(items);
  const [open, setOpen] = useState(false);

  // Only a logged-in visitor can be identified across visits, so only their
  // clicks get recorded server-side (see /api/announcements/dismiss). For
  // anyone not logged in this is a no-op — they always see the full list.
  function dismiss(item: Item) {
    if (!item.dismissible || !session) return;
    fetch("/api/announcements/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    }).catch(() => {
      // Best-effort — worst case the item reappears on the next visit.
    });
    setVisibleItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  if (visibleItems.length === 0) return null;

  if (visibleItems.length === 1) {
    const item = visibleItems[0];
    const content = (
      <span className="inline-flex items-center gap-2">
        <Badge>{item.typeLabel}</Badge>
        <span className="truncate">{item.text}</span>
      </span>
    );
    return item.href ? (
      <Link href={item.href} onClick={() => dismiss(item)} className={`${BAR_CLASS} hover:bg-tiffany-700`}>
        {content}
      </Link>
    ) : (
      <div className={BAR_CLASS}>{content}</div>
    );
  }

  return (
    <div className="w-full bg-tiffany-600 text-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-center gap-2 px-6 py-2 text-xs font-medium sm:text-sm"
      >
        <Badge>新着</Badge>
        <span>新着{visibleItems.length}件</span>
        <span className={`inline-block transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <ul className="divide-y divide-white/15 border-t border-white/15 bg-tiffany-700/60">
          {visibleItems.map((item) => {
            const row = (
              <span className="flex items-center justify-between gap-3 px-6 py-2 text-xs sm:text-sm">
                <span className="truncate">{item.text}</span>
                <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                  {item.typeLabel}
                </span>
              </span>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link href={item.href} onClick={() => dismiss(item)} className="block hover:bg-tiffany-700">
                    {row}
                  </Link>
                ) : (
                  <div
                    onClick={() => dismiss(item)}
                    className={item.dismissible ? "cursor-pointer hover:bg-tiffany-700" : ""}
                  >
                    {row}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
