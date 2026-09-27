import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold leading-none tracking-tight text-faro ${className}`}>FAREJA</span>
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

export function CaixaFareja({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 380 380" fill="none" className={className} role="img" aria-label="Caixa FAREJA com a tampa amarela">
      <ellipse cx="180" cy="338" rx="128" ry="22" fill="#2A1E17" opacity="0.22" />
      <polygon points="85,155 180,210 180,332 85,277" fill="#E2551F" />
      <polygon points="275,155 180,210 180,332 275,277" fill="#BE3F16" />
      <g transform="matrix(0.866,0.5,0,1,85,155)">
        <text
          x="55"
          y="76"
          textAnchor="middle"
          fontFamily="var(--font-baloo), 'Arial Rounded MT Bold', Arial, sans-serif"
          fontWeight="800"
          fontSize="27"
          fill="#FFF4E4"
        >
          FAREJA
        </text>
        <text
          x="55"
          y="98"
          textAnchor="middle"
          fontFamily="var(--font-archivo), Arial, sans-serif"
          fontWeight="700"
          fontSize="8.5"
          letterSpacing="2.2"
          fill="#FFD9C6"
        >
          BOX FUNCIONAL
        </text>
      </g>
      <g transform="matrix(0.866,-0.5,0,1,180,210)">
        <path
          d="M14 82 C 34 82, 30 58, 50 58 C 68 58, 64 76, 82 72"
          stroke="#FFC93C"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray="1 11"
        />
        <g transform="translate(78 34)" fill="#FFC93C">
          <circle cx="5" cy="11" r="3.6" />
          <circle cx="13" cy="6" r="3.6" />
          <circle cx="21" cy="6" r="3.6" />
          <circle cx="29" cy="11" r="3.6" />
          <ellipse cx="17" cy="18" rx="8" ry="6" />
        </g>
      </g>
      <polygon points="287,130 180,192 180,212 287,150" fill="#EAB62A" />
      <polygon points="73,130 180,192 180,212 73,150" fill="#F2BF2E" />
      <polygon points="180,68 287,130 180,192 73,130" fill="#FFC93C" />
      <g transform="matrix(0.866,0.5,-0.866,0.5,180,68)">
        <g transform="translate(28 28)" fill="#B8860B" opacity="0.55">
          <circle cx="6" cy="13" r="4.4" />
          <circle cx="16" cy="6" r="4.4" />
          <circle cx="26" cy="6" r="4.4" />
          <circle cx="36" cy="13" r="4.4" />
          <ellipse cx="21" cy="21" rx="10" ry="7" />
        </g>
      </g>
      <path d="M120 46 L 128 30 M150 34 L 152 16 M96 70 L 80 60" stroke="#FFC93C" strokeWidth="5" strokeLinecap="round" />
      <g transform="rotate(8 312 86)">
        <circle cx="312" cy="86" r="37" fill="#FFF4E4" />
        <text
          x="312"
          y="82"
          textAnchor="middle"
          fontFamily="var(--font-baloo), 'Arial Rounded MT Bold', Arial, sans-serif"
          fontWeight="800"
          fontSize="13.5"
          fill="#D9480F"
        >
          tem
        </text>
        <text
          x="312"
          y="98"
          textAnchor="middle"
          fontFamily="var(--font-baloo), 'Arial Rounded MT Bold', Arial, sans-serif"
          fontWeight="800"
          fontSize="13.5"
          fill="#D9480F"
        >
          surpresa!
        </text>
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
