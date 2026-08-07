"use client";

import { useState } from "react";
import Link from "next/link";

type Item = { typeLabel: string; text: string; href: string | null };

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
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  if (items.length === 1) {
    const item = items[0];
    const content = (
      <span className="inline-flex items-center gap-2">
        <Badge>{item.typeLabel}</Badge>
        <span className="truncate">{item.text}</span>
      </span>
    );
    return item.href ? (
      <Link href={item.href} className={`${BAR_CLASS} hover:bg-tiffany-700`}>
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
        <Badge>お知らせ</Badge>
        <span>お知らせ{items.length}件あります</span>
        <span className={`inline-block transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <ul className="divide-y divide-white/15 border-t border-white/15 bg-tiffany-700/60">
          {items.map((item) => {
            const row = (
              <span className="flex items-center justify-between gap-3 px-6 py-2 text-xs sm:text-sm">
                <span className="truncate">{item.text}</span>
                <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                  {item.typeLabel}
                </span>
              </span>
            );
            return (
              <li key={`${item.typeLabel}-${item.text}`}>
                {item.href ? (
                  <Link href={item.href} className="block hover:bg-tiffany-700">
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
