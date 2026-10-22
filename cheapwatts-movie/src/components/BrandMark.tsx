// The money bag and purple lightbulb from the share image.
export const BrandMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * (440 / 420)} viewBox="0 0 420 440" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0,120)">
      <path d="M95 60 C80 40 70 18 88 10 C110 2 120 26 135 22 C150 18 160 0 182 10 C200 18 188 42 175 60 Z" fill="#c9922e" />
      <path d="M90 70 C40 110 10 170 22 230 C34 290 90 312 135 312 C180 312 236 290 248 230 C260 170 230 110 180 70 Z" fill="#e0a83e" />
      <path d="M90 70 C40 110 10 170 22 230 C28 260 46 282 70 295 C40 260 38 200 70 140 C86 110 100 92 112 70 Z" fill="#c9922e" opacity=".55" />
      <rect x="84" y="56" width="102" height="22" rx="11" fill="#8a5a14" />
      <text x="135" y="245" textAnchor="middle" fontFamily="Fraunces" fontWeight={700} fontSize="140" fill="#7a4d0f">£</text>
    </g>
    <g transform="translate(190,0)">
      <circle cx="105" cy="122" r="112" fill="#a78bfa" opacity=".18" />
      <path d="M105 22 C52 22 18 62 18 108 C18 140 34 162 52 182 C64 196 70 212 70 228 L140 228 C140 212 146 196 158 182 C176 162 192 140 192 108 C192 62 158 22 105 22 Z" fill="#8b5cf6" />
      <path d="M70 60 C52 76 44 96 46 118" stroke="#ede9fe" strokeWidth="12" strokeLinecap="round" fill="none" opacity=".85" />
      <path d="M84 228 L84 170 C84 156 96 150 105 160 C114 150 126 156 126 170 L126 228" stroke="#ede9fe" strokeWidth="7" fill="none" strokeLinecap="round" />
      <rect x="66" y="236" width="78" height="20" rx="6" fill="#cbd5e1" />
      <rect x="66" y="262" width="78" height="20" rx="6" fill="#94a3b8" />
      <path d="M78 288 L132 288 L118 308 L92 308 Z" fill="#64748b" />
    </g>
  </svg>
);
