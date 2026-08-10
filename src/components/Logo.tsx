export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="gradient-brand rounded-xl flex items-center justify-center text-white shadow-md"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          width={size * 0.62}
          height={size * 0.62}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          <path d="M3 13h4l2-4 3 8 2-5h7" />
        </svg>
      </div>
      <span className="font-bold tracking-tight text-foreground" style={{ fontSize: size * 0.55 }}>
        HealthTrack
      </span>
    </div>
  );
}
