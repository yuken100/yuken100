import Link from "next/link";
import { prisma } from "@/lib/prisma";
import VideoCard from "@/components/VideoCard";
import { pickNewIds } from "@/lib/newBadge";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const videos = await prisma.video.findMany({
    where: {
      published: true,
      ...(searchParams.category ? { category: searchParams.category } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  const newVideoIds = pickNewIds(videos);

  const allVideos = await prisma.video.findMany({ select: { category: true } });
  const categories = Array.from(new Set(allVideos.map((v) => v.category)));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-tiffany-900">講座一覧</h1>
        <p className="mt-2 text-sm text-tiffany-800/70">
          全{videos.length}講座。単品購入、または会員プランで見放題です。
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/courses"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            !searchParams.category
              ? "border-tiffany-500 bg-tiffany-500 text-white"
              : "border-tiffany-200 text-tiffany-700 hover:bg-tiffany-50"
          }`}
        >
          すべて
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            href={`/courses?category=${encodeURIComponent(category)}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              searchParams.category === category
                ? "border-tiffany-500 bg-tiffany-500 text-white"
                : "border-tiffany-200 text-tiffany-700 hover:bg-tiffany-50"
            }`}
          >
            {category}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} {...video} isNew={newVideoIds.has(video.id)} />
        ))}
      </div>
    </div>
  );
}
