import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { formatJstDateTime } from "@/lib/datetime";
import LessonsVisibilityForm from "@/components/LessonsVisibilityForm";
import InstructorProfileForm from "@/components/InstructorProfileForm";
import AnnouncementForm from "@/components/AnnouncementForm";
import SiteCopyForm from "@/components/SiteCopyForm";
import RestoreCopyHistoryButton from "@/components/RestoreCopyHistoryButton";
import DeleteCopyHistoryButton from "@/components/DeleteCopyHistoryButton";
import ClearCopyHistoryButton from "@/components/ClearCopyHistoryButton";

function summarizeCopyHistory(entry: {
  heroHeadline: string | null;
  heroCatchcopy: string | null;
  footerIntro: string | null;
}): string {
  const parts = [
    entry.heroHeadline && `見出し: ${entry.heroHeadline}`,
    entry.heroCatchcopy && `キャッチコピー: ${entry.heroCatchcopy}`,
    entry.footerIntro && `フッター紹介文: ${entry.footerIntro}`,
  ].filter(Boolean) as string[];
  if (parts.length === 0) return "(すべて初期のデフォルト文言)";
  const joined = parts.join(" / ");
  return joined.length > 60 ? `${joined.slice(0, 60)}…` : joined;
}

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/settings");

  const [settings, copyHistory] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.siteCopyHistory.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">サイト設定</h1>

      <section className="mt-8 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">レッスン予約機能</h2>
        <p className="mt-2 text-sm text-tiffany-800/70">
          オンにすると、レッスン予約・カレンダーのページとメニューが表示されます。オフにすると、動画講座の販売のみのサイトになります。
        </p>
        <LessonsVisibilityForm initialEnabled={settings?.lessonsEnabled ?? true} />
      </section>

      <section className="mt-8 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">サイトの文言</h2>
        <p className="mt-2 text-sm text-tiffany-800/70">
          トップページの見出し・キャッチコピーや、「マイページ」の表示名、フッターの紹介文を編集できます。
        </p>
        <SiteCopyForm
          initialValues={{
            heroHeadline: settings?.heroHeadline ?? "",
            heroCatchcopy: settings?.heroCatchcopy ?? "",
            footerIntro: settings?.footerIntro ?? "",
          }}
        />

        {copyHistory.length > 0 && (
          <div className="mt-6 border-t border-tiffany-100 pt-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-tiffany-800">変更履歴</h3>
              <ClearCopyHistoryButton />
            </div>
            <p className="mt-1 text-xs text-tiffany-800/60">
              保存するたびに、その直前の内容がここに記録されます。
            </p>
            <ul className="mt-3 space-y-2">
              {copyHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-tiffany-100 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-tiffany-800/60">{formatJstDateTime(entry.createdAt)}</p>
                    <p className="mt-0.5 truncate text-xs text-tiffany-800/80">
                      {summarizeCopyHistory(entry)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RestoreCopyHistoryButton historyId={entry.id} />
                    <DeleteCopyHistoryButton historyId={entry.id} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">トップページのお知らせ</h2>
        <p className="mt-2 text-sm text-tiffany-800/70">
          トップページ上部に表示するお知らせです。新着の講座・レッスンの案内に加えて表示されるので、それ以外に伝えたいことがあるときにお使いください。
        </p>
        <AnnouncementForm
          initialValues={{
            announcementEnabled: settings?.announcementEnabled ?? false,
            announcementText: settings?.announcementText ?? "",
            announcementUrl: settings?.announcementUrl ?? "",
          }}
        />
      </section>

      <section className="mt-8 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">講師プロフィール</h2>
        <p className="mt-2 text-sm text-tiffany-800/70">
          トップページに表示する講師紹介セクションの内容です。
        </p>
        <InstructorProfileForm
          initialValues={{
            instructorName: settings?.instructorName ?? "",
            instructorBio: settings?.instructorBio ?? "",
            instructorPhotoUrl: settings?.instructorPhotoUrl ?? "",
            instructorPhotoPosition: settings?.instructorPhotoPosition ?? "50% 50%",
          }}
        />
      </section>
    </div>
  );
}
