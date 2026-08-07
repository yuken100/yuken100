import Link from "next/link";
import VideoThumb from "@/components/VideoThumb";
import { isNewItem } from "@/lib/newBadge";

const formatLabel: Record<string, string> = {
  ONLINE: "オンライン",
  OFFLINE: "対面",
  HYBRID: "オンライン+対面",
};

type LessonCardProps = {
  slug: string;
  title: string;
  format: string;
  durationMinutes: number;
  priceJpy: number;
  capacity: number;
  gradientFrom: string;
  gradientTo: string;
  thumbnailUrl?: string | null;
  thumbnailPosition?: string | null;
  membersOnly?: boolean;
  createdAt: Date;
};

export default function LessonCard(lesson: LessonCardProps) {
  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-xl2 border border-tiffany-100 bg-white shadow-sm hover:shadow-soft"
    >
      <VideoThumb
        from={lesson.gradientFrom}
        to={lesson.gradientTo}
        level={formatLabel[lesson.format] ?? lesson.format}
        imageUrl={lesson.thumbnailUrl}
        imagePosition={lesson.thumbnailPosition}
        isNew={isNewItem(lesson.createdAt)}
        className="h-40 w-full"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between text-xs font-medium text-tiffany-600">
          <span>{lesson.durationMinutes}分</span>
          <span>定員{lesson.capacity}人</span>
        </div>
        <h3 className="font-display text-base font-bold leading-snug text-tiffany-900 group-hover:text-tiffany-600">
          {lesson.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-tiffany-700">
            ¥{lesson.priceJpy.toLocaleString()}
          </span>
          {lesson.membersOnly && (
            <span className="rounded-full bg-blush-100 px-3 py-1 text-xs font-semibold text-blush-300">
              会員限定
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
