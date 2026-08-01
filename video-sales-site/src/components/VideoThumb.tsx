export default function VideoThumb({
  from,
  to,
  level,
  className = "",
}: {
  from: string;
  to: string;
  level: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl2 ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-tiffany-800">
        {level}
      </span>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70 shadow-soft">
        <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-tiffany-700">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </div>
  );
}
