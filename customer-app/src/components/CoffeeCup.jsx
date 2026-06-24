// Premium takeaway coffee-cup illustration used as a loyalty stamp.
// filled = a full branded 9ONE cup; empty = a faint outline placeholder.
export default function CoffeeCup({ filled = false, size = 46, delay = 0 }) {
  const id = Math.random().toString(36).slice(2, 8);

  if (!filled) {
    return (
      <svg
        width={size}
        height={size * 1.32}
        viewBox="0 0 44 58"
        fill="none"
        style={{ display: 'block' }}
      >
        <g stroke="rgba(255,255,255,0.32)" strokeWidth="1.6" fill="none" strokeLinejoin="round">
          {/* lid */}
          <path d="M9 13 H35 L34 9 Q34 7.5 32.5 7.5 H11.5 Q10 7.5 10 9 Z" />
          <path d="M16 7.5 L17 4.5 Q17.2 3.5 18.2 3.5 H25.8 Q26.8 3.5 27 4.5 L28 7.5" />
          {/* body */}
          <path d="M11 15 L33 15 L30.5 52 Q30.4 53.5 28.9 53.5 L15.1 53.5 Q13.6 53.5 13.5 52 Z" />
          {/* sleeve */}
          <path d="M12.4 29 H31.6 L31 40 H13 Z" />
        </g>
        <circle cx="22" cy="34.5" r="2" fill="rgba(255,255,255,0.28)" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size * 1.32}
      viewBox="0 0 44 58"
      fill="none"
      style={{ display: 'block', animation: `cupPop 0.45s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both` }}
    >
      <defs>
        <linearGradient id={`body${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7d9c63" />
          <stop offset="1" stopColor="#5f7d49" />
        </linearGradient>
        <linearGradient id={`lid${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9b878" />
          <stop offset="1" stopColor="#c2a05f" />
        </linearGradient>
      </defs>

      {/* steam */}
      <path d="M19 2 q-2 2 0 4" stroke="rgba(255,255,255,0.45)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M25 2 q-2 2 0 4" stroke="rgba(255,255,255,0.45)" strokeWidth="1.3" strokeLinecap="round" fill="none" />

      {/* lid */}
      <path d="M9 13 H35 L34 9 Q34 7.2 32.2 7.2 H11.8 Q10 7.2 10 9 Z" fill={`url(#lid${id})`} />
      <path d="M16 7.2 L17 4.3 Q17.2 3.2 18.3 3.2 H25.7 Q26.8 3.2 27 4.3 L28 7.2 Z" fill={`url(#lid${id})`} />
      <rect x="9" y="12" width="26" height="2.4" rx="1.2" fill="#b18f4f" />

      {/* body */}
      <path d="M11 15 L33 15 L30.5 52 Q30.4 53.5 28.9 53.5 L15.1 53.5 Q13.6 53.5 13.5 52 Z" fill={`url(#body${id})`} />

      {/* cream sleeve with wavy top */}
      <path d="M12.4 30 Q17 27.5 22 30 T31.6 30 L31 41 H13 Z" fill="#f3ead0" />
      {/* brand mark on sleeve */}
      <text x="22" y="38.2" textAnchor="middle" fontSize="6.2" fontWeight="700" fill="#5f7d49" fontFamily="Georgia, serif">9</text>

      {/* highlight */}
      <path d="M14 16 L15.5 16 L13.7 51 L12.7 51 Z" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}
