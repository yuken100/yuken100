export default function PendingConfirmationNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-red-300 bg-red-50 px-3 py-2 ${className}`}>
      <p className="text-sm font-bold leading-snug text-red-600">
        ⚠ 10分以内にメール内のリンクをクリックしないと、この予約は自動的に無効になります
      </p>
    </div>
  );
}
