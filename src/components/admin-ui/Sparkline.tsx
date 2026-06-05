'use client';

// Tiny deterministic SVG sparkline. Pure inline SVG, no dependency, no
// timestamp lookups. 12 points derived from a seeded xorshift over the seed
// string, so the same seed always renders the same shape.

export type SparklineTone = 'good' | 'warn' | 'risk' | 'neutral';

function hashSeed(seed: string): number {
  // Deterministic 32-bit hash, no pseudo-random call, no timestamp.
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 1; // never zero (xorshift would lock)
}

function xorshift(seed: number): () => number {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 0xffffffff;
  };
}

function strokeFor(tone: SparklineTone): string {
  switch (tone) {
    case 'good':
      return 'rgb(52 211 153 / 0.85)'; // emerald-400/85
    case 'warn':
      return 'rgb(251 191 36 / 0.85)'; // amber-400/85
    case 'risk':
      return 'rgb(251 113 133 / 0.85)'; // rose-400/85
    case 'neutral':
    default:
      return 'rgb(113 113 122 / 0.85)'; // zinc-500/85
  }
}

function fillFor(tone: SparklineTone): string {
  switch (tone) {
    case 'good':
      return 'rgb(52 211 153 / 0.10)';
    case 'warn':
      return 'rgb(251 191 36 / 0.10)';
    case 'risk':
      return 'rgb(251 113 133 / 0.10)';
    case 'neutral':
    default:
      return 'rgb(113 113 122 / 0.10)';
  }
}

const POINTS = 12;
const WIDTH = 60;
const HEIGHT = 18;
const PAD_Y = 2;

export function Sparkline({
  seed,
  tone = 'good',
  className = 'h-[18px] w-[60px] shrink-0',
}: {
  seed: string;
  tone?: SparklineTone;
  className?: string;
}) {
  const rng = xorshift(hashSeed(seed));
  const values: number[] = [];
  let v = 0.5;
  for (let i = 0; i < POINTS; i++) {
    v += (rng() - 0.5) * 0.35;
    if (v < 0.08) v = 0.08;
    if (v > 0.92) v = 0.92;
    values.push(v);
  }

  const usableH = HEIGHT - PAD_Y * 2;
  const stepX = WIDTH / (POINTS - 1);
  const pts = values.map((p, i) => {
    const x = i * stepX;
    const y = HEIGHT - PAD_Y - p * usableH;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const polyline = pts.join(' ');
  const polygon = `0,${HEIGHT} ${polyline} ${WIDTH},${HEIGHT}`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <polygon points={polygon} fill={fillFor(tone)} />
      <polyline
        points={polyline}
        fill="none"
        stroke={strokeFor(tone)}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
