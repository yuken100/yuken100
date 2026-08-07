import Link from "next/link";
import VideoThumb from "@/components/VideoThumb";
import { isNewItem } from "@/lib/newBadge";

type VideoCardProps = {
  slug: string;
  title: string;
  category: string;
  level: string;
  durationMinutes: number;
  priceJpy: number;
  membersOnly: boolean;
  gradientFrom: string;
  gradientTo: string;
  thumbnailUrl?: string | null;
  thumbnailPosition?: string | null;
  createdAt: Date;
};

export default function VideoCard(video: VideoCardProps) {
  return (
    <Link
      href={`/courses/${video.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-xl2 border border-tiffany-100 bg-white shadow-sm hover:shadow-soft"
    >
      <VideoThumb
        from={video.gradientFrom}
        to={video.gradientTo}
        level={video.level}
        imageUrl={video.thumbnailUrl}
        imagePosition={video.thumbnailPosition}
        isNew={isNewItem(video.createdAt)}
        className="h-40 w-full"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between text-xs font-medium text-tiffany-600">
          <span>{video.category}</span>
          <span>{video.durationMinutes}分</span>
        </div>
        <h3 className="font-display text-base font-bold leading-snug text-tiffany-900 group-hover:text-tiffany-600">
          {video.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-tiffany-700">
            ¥{video.priceJpy.toLocaleString()}
          </span>
          {video.membersOnly && (
            <span className="rounded-full bg-blush-100 px-3 py-1 text-xs font-semibold text-blush-300">
              会員限定
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
