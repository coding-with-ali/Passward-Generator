'use client';

export default function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill = Math.max(0, Math.min(1, value - (i - 1)));
    stars.push(
      <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" style={{ width: size, height: size }} className="absolute inset-0 text-sand" fill="currentColor">
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6L12 2z" />
        </svg>
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
          <svg viewBox="0 0 24 24" style={{ width: size, height: size }} className="text-bronze" fill="currentColor">
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6L12 2z" />
          </svg>
        </span>
      </span>
    );
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}
