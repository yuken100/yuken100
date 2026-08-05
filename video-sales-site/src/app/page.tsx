import Link from "next/link";
import { prisma } from "@/lib/prisma";
import VideoCard from "@/components/VideoCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [videos, settings, testimonials] = await Promise.all([
    prisma.video.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center">
          <span className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold tracking-wide text-tiffany-700">
            ヨガインストラクターのための学び場
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-tiffany-900 md:text-5xl">
            現場で活きる指導スキルを、
            <br className="hidden md:block" />
            自分のペースで学ぶ。
          </h1>
          <p className="max-w-2xl text-base text-tiffany-800/80 md:text-lg">
            解剖学の基礎から専門コース、指導ビジネスの視点まで。10本以上の講座を配信中、
            毎週新しい動画を追加しています。単品購入でも、見放題の会員プランでも。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="rounded-full bg-tiffany-500 px-8 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600"
            >
              講座を見る
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-tiffany-300 bg-white px-8 py-3 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50"
            >
              料金プランを見る
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-tiffany-900">
              新着講座
            </h2>
            <p className="mt-1 text-sm text-tiffany-800/70">
              毎週更新中。最新の講座をチェックしましょう。
            </p>
          </div>
          <Link href="/courses" className="text-sm font-semibold text-tiffany-600 hover:text-tiffany-800">
            すべての講座を見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </section>

      <section className="bg-tiffany-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-3">
          {[
            {
              title: "現場目線のカリキュラム",
              body: "指導経験豊富な講師陣が、実際のクラスで使えるテクニックを解説します。",
            },
            {
              title: "自分のペースで学習",
              body: "購入・入会した講座はいつでも視聴可能。スマホでもタブレットでも学べます。",
            },
            {
              title: "毎週更新される新作",
              body: "会員プランなら追加される新作講座もすぐに見放題で視聴できます。",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl2 bg-white p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-tiffany-800">{item.title}</h3>
              <p className="mt-2 text-sm text-tiffany-800/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {settings?.instructorName && (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {settings.instructorPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.instructorPhotoUrl}
                alt={settings.instructorName}
                className="h-32 w-32 shrink-0 rounded-full object-cover shadow-soft"
                style={{ objectPosition: settings.instructorPhotoPosition ?? "50% 50%" }}
              />
            ) : (
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-tiffany-200 text-3xl font-bold text-white shadow-soft">
                {settings.instructorName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-tiffany-600">
                講師紹介
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-tiffany-900">
                {settings.instructorName}
              </h2>
              {settings.instructorBio && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-tiffany-800/80">
                  {settings.instructorBio}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="bg-tiffany-50">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center font-display text-2xl font-bold text-tiffany-900">
              生徒さんの声
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="rounded-xl2 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    {testimonial.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={testimonial.photoUrl}
                        alt={testimonial.studentName}
                        className="h-10 w-10 rounded-full object-cover"
                        style={{ objectPosition: testimonial.photoPosition ?? "50% 50%" }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tiffany-200 text-sm font-bold text-white">
                        {testimonial.studentName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-tiffany-900">
                        {testimonial.studentName}
                      </p>
                      {testimonial.rating && (
                        <p className="text-xs text-tiffany-500" aria-label={`評価${testimonial.rating}`}>
                          {"★".repeat(testimonial.rating)}
                          {"☆".repeat(5 - testimonial.rating)}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-tiffany-800/80">
                    {testimonial.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-tiffany-900">
          今日から、指導スキルをアップデートしませんか？
        </h2>
        <p className="mt-3 text-sm text-tiffany-800/70">
          無料登録後、単品購入または会員プランですぐに講座を視聴いただけます。
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex rounded-full bg-tiffany-500 px-8 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600"
        >
          無料登録してはじめる
        </Link>
      </section>
    </div>
  );
}
