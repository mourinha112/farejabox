import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="217 1229 2566 655"
      width="3.2em"
      height="1em"
      role="img"
      aria-label="FAREJA"
      focusable="false"
      className={`inline-block shrink-0 align-middle leading-none ${className}`}
    >
      {/* Enquadra a marca sem modificar o arquivo original ou suas cores. */}
      <image href="/fareja-logo.png" width="3000" height="3000" />
    </svg>
  );
}

export function LogoLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="FAREJA, página inicial" className="inline-flex rounded-md">
      <Logo className={className} />
    </Link>
  );
}

// A patinha é a recompensa no fim da trilha do faro.
export function Pata({ size = 52, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={(size * 38) / 52}
      viewBox="0 0 52 38"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="7" cy="16" r="6" />
      <circle cx="20" cy="8" r="6" />
      <circle cx="33" cy="8" r="6" />
      <circle cx="46" cy="16" r="6" />
      <ellipse cx="26" cy="28" rx="13" ry="9" />
    </svg>
  );
}

export function Trilha({ className = "", cor = "#FFC93C" }: { className?: string; cor?: string }) {
  return (
    <svg viewBox="0 0 380 52" fill="none" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path
        d="M8 40 C 60 40, 56 12, 108 12 C 158 12, 150 38, 200 34 C 244 30, 246 14, 288 16"
        stroke={cor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1 12"
      />
      <g transform="translate(318 10)" fill={cor}>
        <circle cx="8" cy="18" r="5" />
        <circle cx="20" cy="10" r="5" />
        <circle cx="32" cy="10" r="5" />
        <circle cx="44" cy="18" r="5" />
        <ellipse cx="26" cy="27" rx="12" ry="9" />
      </g>
    </svg>
  );
}

export function IconeWhatsApp({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className} aria-hidden="true">
      <path
        d="M11 2 C 6 2, 2 6, 2 11 C 2 12.8, 2.5 14.4, 3.4 15.8 L 2.4 19.6 L 6.3 18.6 C 7.7 19.5, 9.3 20, 11 20 C 16 20, 20 16, 20 11 C 20 6, 16 2, 11 2 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 8.5 C 7.5 13, 9 14.5, 13.5 14.5 L 14.5 12.5 L 12.5 11.5 L 11.5 12 C 10.5 11.5, 10.5 11.5, 10 10.5 L 10.5 9.5 L 9.5 7.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function GatoFareja({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 340" fill="none" className={className} aria-hidden="true">
      <path d="M226 306 C 296 306, 306 226, 262 204" stroke="#0A5958" strokeWidth="24" strokeLinecap="round" />
      <path d="M90 340 C 78 250, 108 186, 160 186 C 212 186, 242 250, 230 340 Z" fill="#0E7C7B" />
      <ellipse cx="160" cy="268" rx="34" ry="52" fill="#9FD9CF" opacity="0.55" />
      <polygon points="88,104 96,22 156,78" fill="#0E7C7B" />
      <polygon points="232,104 224,22 164,78" fill="#0E7C7B" />
      <polygon points="104,84 108,48 136,76" fill="#FFD9C6" />
      <polygon points="216,84 212,48 184,76" fill="#FFD9C6" />
      <ellipse cx="160" cy="130" rx="80" ry="68" fill="#0E7C7B" />
      <ellipse cx="128" cy="124" rx="15" ry="17" fill="#FFC93C" />
      <ellipse cx="192" cy="124" rx="15" ry="17" fill="#FFC93C" />
      <ellipse cx="128" cy="124" rx="4.5" ry="13" fill="#2A1E17" />
      <ellipse cx="192" cy="124" rx="4.5" ry="13" fill="#2A1E17" />
      <path d="M151 150 L 169 150 L 160 161 Z" fill="#F4622F" />
      <path
        d="M160 161 L 160 168 M160 168 Q 150 178 141 170 M160 168 Q 170 178 179 170"
        stroke="#FFF4E4"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M112 156 L 62 148 M112 166 L 64 174 M208 156 L 258 148 M208 166 L 256 174"
        stroke="#FFF4E4"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="132" cy="332" rx="24" ry="13" fill="#0A5958" />
      <ellipse cx="188" cy="332" rx="24" ry="13" fill="#0A5958" />
    </svg>
  );
}
