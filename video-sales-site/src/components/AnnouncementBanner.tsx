"use client";

import { useState } from "react";
import Link from "next/link";

type Item = { typeLabel: string; text: string; href: string };

type Props =
  | { mode: "manual"; text: string; href?: string | null }
  | { mode: "auto"; items: Item[] };

const BAR_CLASS =
  "block w-full truncate bg-tiffany-600 px-6 py-2 text-center text-xs font-medium text-white sm:text-sm";

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold tracking-wide">
      {children}
    </span>
  );
}

export default function AnnouncementBanner(props: Props) {
  const [open, setOpen] = useState(false);

  if (props.mode === "manual") {
    const content = (
      <span className="inline-flex items-center gap-2">
        <Badge>お知らせ</Badge>
        <span className="truncate">{props.text}</span>
      </span>
    );
    return props.href ? (
      <Link href={props.href} className={`${BAR_CLASS} hover:bg-tiffany-700`}>
        {content}
      </Link>
    ) : (
      <div className={BAR_CLASS}>{content}</div>
    );
  }

  const { items } = props;
  if (items.length === 0) return null;

  if (items.length === 1) {
    const item = items[0];
    return (
      <Link href={item.href} className={`${BAR_CLASS} hover:bg-tiffany-700`}>
        <span className="inline-flex items-center gap-2">
          <Badge>新着</Badge>
          <span className="truncate">{item.text}</span>
        </span>
      </Link>
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
        <span>新着{items.length}件あります</span>
        <span className={`inline-block transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <ul className="divide-y divide-white/15 border-t border-white/15 bg-tiffany-700/60">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 px-6 py-2 text-xs hover:bg-tiffany-700 sm:text-sm"
              >
                <span className="truncate">{item.text}</span>
                <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                  {item.typeLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
