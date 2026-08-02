export type VideoEmbed =
  | { type: "vimeo"; embedUrl: string }
  | { type: "youtube"; embedUrl: string }
  | { type: "direct"; url: string };

export function resolveVideoEmbed(videoUrl: string): VideoEmbed {
  const vimeo = videoUrl.match(
    /vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/
  );
  if (vimeo) {
    const [, id, hash] = vimeo;
    return {
      type: "vimeo",
      embedUrl: hash ? `https://player.vimeo.com/video/${id}?h=${hash}` : `https://player.vimeo.com/video/${id}`,
    };
  }

  const youtube = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/
  );
  if (youtube) {
    return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${youtube[1]}` };
  }

  return { type: "direct", url: videoUrl };
}
