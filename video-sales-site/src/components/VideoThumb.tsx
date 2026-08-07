export default function VideoThumb({
  from,
  to,
  level,
  className = "",
  imageUrl,
  imagePosition,
  isNew = false,
}: {
  from: string;
  to: string;
  level: string;
  className?: string;
  imageUrl?: string | null;
  imagePosition?: string | null;
  isNew?: boolean;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl2 ${className}`}
      style={imageUrl ? undefined : { background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: imagePosition ?? "50% 50%" }}
        />
      )}
      <span className="absolute left-3 top-3 z-10 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-tiffany-800">
        {level}
      </span>
      {isNew && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-blush-300 px-3 py-1 text-xs font-bold text-white shadow-soft">
          NEW
        </span>
      )}
      <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/70 shadow-soft">
        <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-tiffany-700">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </div>
  );
}
