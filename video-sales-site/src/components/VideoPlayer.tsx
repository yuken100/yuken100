import { resolveVideoEmbed } from "@/lib/videoEmbed";

export default function VideoPlayer({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string;
  posterUrl?: string | null;
}) {
  const embed = resolveVideoEmbed(videoUrl);

  if (embed.type === "vimeo" || embed.type === "youtube") {
    return (
      <div className="aspect-video w-full">
        <iframe
          src={embed.embedUrl}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          title="動画プレイヤー"
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video controls className="aspect-video w-full" preload="metadata" poster={posterUrl ?? undefined}>
      <source src={embed.url} type="video/mp4" />
    </video>
  );
}
