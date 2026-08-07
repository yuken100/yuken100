import Link from "next/link";

export default function AnnouncementBanner({
  text,
  href,
}: {
  text: string;
  href?: string | null;
}) {
  const content = (
    <span className="inline-flex items-center gap-2">
      <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold tracking-wide">
        お知らせ
      </span>
      <span className="truncate">{text}</span>
    </span>
  );

  const className =
    "block w-full truncate bg-tiffany-600 px-6 py-2 text-center text-xs font-medium text-white sm:text-sm";

  if (href) {
    return (
      <Link href={href} className={`${className} hover:bg-tiffany-700`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
