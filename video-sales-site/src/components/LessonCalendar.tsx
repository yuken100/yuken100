"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BookSlotButton from "@/components/BookSlotButton";
import PendingConfirmationNotice from "@/components/PendingConfirmationNotice";

export type CalendarSlot = {
  id: string;
  lessonTitle: string;
  lessonSlug: string;
  dateKey: string; // "YYYY-MM-DD" in JST
  timeLabel: string; // "HH:mm" in JST
  remaining: number;
  capacity: number;
  full: boolean;
  priceJpy: number;
  membersOnly: boolean;
  myStatus: "CONFIRMED" | "PENDING" | null;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Purely abstract calendar-day arithmetic (never converted to/from a real
// timezone instant), so this can safely use UTC-based Date math to lay out
// the grid without touching the JST/UTC display concerns handled server-side.
function buildMonthGrid(year: number, month: number) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: { dateKey: string; day: number }[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ dateKey: "", day: 0 });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ dateKey: `${year}-${pad(month + 1)}-${pad(day)}`, day });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ dateKey: "", day: 0 });
  }
  return cells;
}

export default function LessonCalendar({
  slots,
  todayKey,
  isLoggedIn,
  isMember,
}: {
  slots: CalendarSlot[];
  todayKey: string;
  isLoggedIn: boolean;
  isMember: boolean;
}) {
  const [todayYear, todayMonth] = todayKey.split("-").map(Number);
  const [cursor, setCursor] = useState({ year: todayYear, month: todayMonth - 1 });
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, CalendarSlot[]>();
    for (const slot of slots) {
      const existing = map.get(slot.dateKey);
      if (existing) {
        existing.push(slot);
      } else {
        map.set(slot.dateKey, [slot]);
      }
    }
    return map;
  }, [slots]);

  const cells = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const selectedSlots = slotsByDate.get(selectedDate) ?? [];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
      <div className="rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm md:col-span-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
            }
            className="rounded-full border border-tiffany-200 px-3 py-1 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50"
          >
            ← 前月
          </button>
          <p className="font-display text-lg font-bold text-tiffany-900">
            {cursor.year}年{cursor.month + 1}月
          </p>
          <button
            onClick={() =>
              setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))
            }
            className="rounded-full border border-tiffany-200 px-3 py-1 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50"
          >
            翌月 →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-tiffany-800/60">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell.dateKey) return <div key={i} />;
            const daySlots = slotsByDate.get(cell.dateKey) ?? [];
            const hasAvailable = daySlots.some((s) => !s.full);
            const isSelected = cell.dateKey === selectedDate;
            const isToday = cell.dateKey === todayKey;
            return (
              <button
                key={cell.dateKey}
                onClick={() => setSelectedDate(cell.dateKey)}
                className={`flex flex-col items-center gap-1 rounded-lg py-2 text-sm transition ${
                  isSelected
                    ? "bg-tiffany-500 text-white"
                    : isToday
                      ? "bg-tiffany-50 font-semibold text-tiffany-900"
                      : "text-tiffany-800 hover:bg-tiffany-50"
                }`}
              >
                <span>{cell.day}</span>
                {daySlots.length > 0 && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      hasAvailable ? (isSelected ? "bg-white" : "bg-tiffany-500") : "bg-tiffany-800/20"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-2">
        <h2 className="font-display text-base font-bold text-tiffany-900">{selectedDate} の予約可能なレッスン</h2>
        <div className="mt-4 space-y-3">
          {selectedSlots.length === 0 && (
            <p className="text-sm text-tiffany-800/60">この日に予約可能なレッスンはありません。</p>
          )}
          {selectedSlots.map((slot) => (
            <div key={slot.id} className="rounded-xl2 border border-tiffany-100 bg-white p-4 shadow-sm">
              <Link
                href={`/lessons/${slot.lessonSlug}`}
                className="text-sm font-semibold text-tiffany-900 hover:text-tiffany-600"
              >
                {slot.lessonTitle}
              </Link>
              <p className="mt-1 text-xs text-tiffany-800/60">
                {slot.timeLabel} ・ {slot.full ? "満席" : `残り${slot.remaining}枠`}
              </p>
              <div className="mt-3">
                {!isLoggedIn ? (
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent("/lessons/calendar")}`}
                    className="rounded-full border border-tiffany-300 px-5 py-2 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50"
                  >
                    ログインして予約
                  </Link>
                ) : slot.myStatus === "CONFIRMED" ? (
                  <span className="rounded-full bg-tiffany-50 px-5 py-2 text-sm font-semibold text-tiffany-700">
                    予約済み
                  </span>
                ) : slot.myStatus === "PENDING" ? (
                  <div className="space-y-2">
                    <PendingConfirmationNotice />
                    <p className="text-xs text-tiffany-800/70">
                      確認メールをお送りしています。メール内のリンクをクリックすると予約が完了します。
                    </p>
                  </div>
                ) : slot.membersOnly && !isMember ? (
                  <div className="text-xs text-tiffany-800/60">
                    <p className="font-semibold text-blush-300">会員限定のレッスンです</p>
                    <Link href="/pricing" className="font-semibold text-tiffany-600 hover:text-tiffany-800">
                      会員プランを見る →
                    </Link>
                  </div>
                ) : slot.full ? (
                  <span className="rounded-full bg-tiffany-50 px-5 py-2 text-sm font-semibold text-tiffany-800/50">
                    満席
                  </span>
                ) : (
                  <BookSlotButton slotId={slot.id} priceJpy={slot.priceJpy} isMember={isMember} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
