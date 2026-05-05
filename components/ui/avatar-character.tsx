'use client';

export type AvatarCharacterId = 'm1' | 'm2' | 'm3' | 'm4' | 'f1' | 'f2' | 'f3' | 'f4';
export type SkinTone = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark' | 'deep';
export type HatStyle = 'none' | 'cap' | 'beanie' | 'fedora' | 'beret' | 'crown' | 'headband' | 'snapback';
export type ShirtStyle = 'crew' | 'collar' | 'turtleneck' | 'vneck' | 'hoodie' | 'blazer' | 'tank' | 'stripes';
export type HairStyle = 'short' | 'medium' | 'long' | 'curly' | 'afro' | 'bun' | 'ponytail' | 'buzz';
export type GlassesStyle = 'none' | 'round' | 'square' | 'cat' | 'aviator' | 'rimless';
export type EarringStyle = 'none' | 'studs' | 'hoops' | 'drops' | 'bar';

export interface AvatarConfig {
  character: AvatarCharacterId;
  skinTone: SkinTone;
  hairColor: string;
  hat: HatStyle;
  shirt: ShirtStyle;
  glasses: GlassesStyle;
  earrings: EarringStyle;
  shirtColor: string;
  accentColor: string;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  character: 'm1',
  skinTone: 'medium-light',
  hairColor: '#3d2314',
  hat: 'none',
  shirt: 'crew',
  glasses: 'none',
  earrings: 'none',
  shirtColor: '#00c4a8',
  accentColor: '#00e5cc',
};

const SKIN_TONES: Record<SkinTone, { face: string; shadow: string; blush: string }> = {
  'light':        { face: '#FFDBB8', shadow: '#f0c49a', blush: '#f9b8b8' },
  'medium-light': { face: '#F0C894', shadow: '#d9a870', blush: '#e8967e' },
  'medium':       { face: '#D4A057', shadow: '#b8803a', blush: '#c47558' },
  'medium-dark':  { face: '#A0713A', shadow: '#865520', blush: '#944a2a' },
  'dark':         { face: '#614028', shadow: '#4a2c14', blush: '#7a3c22' },
  'deep':         { face: '#3D2314', shadow: '#2a1508', blush: '#4e2818' },
};

interface Props {
  config?: Partial<AvatarConfig>;
  size?: number;
  className?: string;
}

export function AvatarCharacter({ config = {}, size = 64, className = '' }: Props) {
  const c: AvatarConfig = { ...DEFAULT_AVATAR_CONFIG, ...config };
  const sk = SKIN_TONES[c.skinTone as SkinTone] ?? SKIN_TONES['medium-light'];
  const id = c.character;
  const isFemale = id.startsWith('f');

  // Unique SVG id prefix to avoid conflicts when multiple avatars on page
  const uid = `av-${id}-${c.skinTone.slice(0, 2)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.accentColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c.accentColor} stopOpacity="0.08" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="49" fill={`url(#${uid}-bg)`} stroke={c.accentColor} strokeWidth="0.8" strokeOpacity="0.4" />

      <g clipPath={`url(#${uid}-clip)`}>
        {/* Body / shirt */}
        <ShirtLayer style={c.shirt} color={c.shirtColor} accentColor={c.accentColor} isFemale={isFemale} />

        {/* Neck */}
        <rect x="43" y="66" width="14" height="10" rx="3" fill={sk.face} />

        {/* Ears */}
        <Ears skin={sk} isFemale={isFemale} earrings={c.earrings} accentColor={c.accentColor} />

        {/* Face */}
        <ellipse cx="50" cy="50" rx="20" ry="22" fill={sk.face} />
        {/* Jaw shadow */}
        <ellipse cx="50" cy="59" rx="15" ry="8" fill={sk.shadow} opacity="0.25" />

        {/* Blush */}
        <ellipse cx="36" cy="54" rx="5" ry="3" fill={sk.blush} opacity="0.35" />
        <ellipse cx="64" cy="54" rx="5" ry="3" fill={sk.blush} opacity="0.35" />

        {/* Eyes */}
        <FaceFeatures characterId={id} skinColor={sk.face} hairColor={c.hairColor} />

        {/* Hair */}
        {c.hat === 'none' && (
          <HairLayer style={c.hat === 'none' ? 'short' : 'buzz'} color={c.hairColor} isFemale={isFemale} characterId={id} />
        )}
        {c.hat !== 'none' && <HairPeekLayer color={c.hairColor} hat={c.hat} isFemale={isFemale} />}

        {/* Hat */}
        {c.hat !== 'none' && <HatLayer style={c.hat} color={c.accentColor} />}

        {/* Glasses */}
        {c.glasses !== 'none' && <GlassesLayer style={c.glasses} accentColor={c.accentColor} />}
      </g>
    </svg>
  );
}

/* ─── Sub-components ─── */

function ShirtLayer({ style, color, accentColor, isFemale }: { style: ShirtStyle; color: string; accentColor: string; isFemale: boolean }) {
  switch (style) {
    case 'collar':
      return (
        <g>
          <path d="M15 100 Q25 74 50 72 Q75 74 85 100Z" fill={color} />
          <path d="M50 72 L44 82 L50 86 L56 82Z" fill={accentColor} opacity="0.7" />
        </g>
      );
    case 'turtleneck':
      return (
        <g>
          <path d="M15 100 Q25 74 50 72 Q75 74 85 100Z" fill={color} />
          <rect x="40" y="66" width="20" height="10" rx="4" fill={color} />
        </g>
      );
    case 'vneck':
      return (
        <g>
          <path d="M15 100 Q25 74 50 72 Q75 74 85 100Z" fill={color} />
          <path d="M44 72 L50 82 L56 72" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>
      );
    case 'hoodie':
      return (
        <g>
          <path d="M12 100 Q22 72 50 70 Q78 72 88 100Z" fill={color} />
          <path d="M36 70 Q50 76 64 70" stroke={accentColor} strokeWidth="2" fill="none" opacity="0.5" />
          <circle cx="50" cy="80" r="1.5" fill={accentColor} opacity="0.7" />
          <circle cx="50" cy="86" r="1.5" fill={accentColor} opacity="0.7" />
        </g>
      );
    case 'blazer':
      return (
        <g>
          <path d="M15 100 Q25 74 50 72 Q75 74 85 100Z" fill={color} />
          <path d="M50 72 L44 80 L38 74" fill={accentColor} opacity="0.5" />
          <path d="M50 72 L56 80 L62 74" fill={accentColor} opacity="0.5" />
        </g>
      );
    case 'tank':
      return (
        <g>
          <path d="M22 100 Q28 76 50 74 Q72 76 78 100Z" fill={color} />
        </g>
      );
    case 'stripes':
      return (
        <g>
          <path d="M15 100 Q25 74 50 72 Q75 74 85 100Z" fill={color} />
          <path d="M26 83 Q50 80 74 83" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
          <path d="M20 91 Q50 88 80 91" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
        </g>
      );
    default: // crew
      return <path d="M15 100 Q25 74 50 72 Q75 74 85 100Z" fill={color} />;
  }
}

function Ears({ skin, isFemale, earrings, accentColor }: { skin: { face: string; shadow: string }; isFemale: boolean; earrings: EarringStyle; accentColor: string }) {
  return (
    <>
      <ellipse cx="30" cy="50" rx="3.5" ry="5" fill={skin.face} />
      <ellipse cx="70" cy="50" rx="3.5" ry="5" fill={skin.face} />
      <ellipse cx="30" cy="50" rx="1.5" ry="3" fill={skin.shadow} opacity="0.3" />
      <ellipse cx="70" cy="50" rx="1.5" ry="3" fill={skin.shadow} opacity="0.3" />
      {isFemale && earrings !== 'none' && <EarringLayer style={earrings} accentColor={accentColor} />}
    </>
  );
}

function EarringLayer({ style, accentColor }: { style: EarringStyle; accentColor: string }) {
  switch (style) {
    case 'studs':
      return (
        <>
          <circle cx="30" cy="55" r="2" fill={accentColor} />
          <circle cx="70" cy="55" r="2" fill={accentColor} />
        </>
      );
    case 'hoops':
      return (
        <>
          <circle cx="30" cy="56" r="4" stroke={accentColor} strokeWidth="1.5" fill="none" />
          <circle cx="70" cy="56" r="4" stroke={accentColor} strokeWidth="1.5" fill="none" />
        </>
      );
    case 'drops':
      return (
        <>
          <line x1="30" y1="55" x2="30" y2="61" stroke={accentColor} strokeWidth="1.2" />
          <circle cx="30" cy="62" r="2" fill={accentColor} />
          <line x1="70" y1="55" x2="70" y2="61" stroke={accentColor} strokeWidth="1.2" />
          <circle cx="70" cy="62" r="2" fill={accentColor} />
        </>
      );
    case 'bar':
      return (
        <>
          <line x1="28" y1="54" x2="32" y2="54" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="68" y1="54" x2="72" y2="54" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    default:
      return null;
  }
}

function FaceFeatures({ characterId, skinColor, hairColor }: { characterId: AvatarCharacterId; skinColor: string; hairColor: string }) {
  // Each character has slightly different facial features
  const configs: Record<AvatarCharacterId, { eyeRx: number; eyeRy: number; eyeY: number; eyeSpread: number; browThick: number; noseY: number; mouthW: number; mouthY: number; mouthStyle: 'smile' | 'grin' | 'smirk' | 'neutral' }> = {
    m1: { eyeRx: 3.2, eyeRy: 3.5, eyeY: 47, eyeSpread: 10, browThick: 2, noseY: 54, mouthW: 8, mouthY: 60, mouthStyle: 'smile' },
    m2: { eyeRx: 2.8, eyeRy: 3.8, eyeY: 46, eyeSpread: 11, browThick: 2.2, noseY: 54, mouthW: 9, mouthY: 61, mouthStyle: 'grin' },
    m3: { eyeRx: 3.5, eyeRy: 3.2, eyeY: 47, eyeSpread: 10, browThick: 2.5, noseY: 54, mouthW: 7, mouthY: 60, mouthStyle: 'smirk' },
    m4: { eyeRx: 3, eyeRy: 3.6, eyeY: 46, eyeSpread: 10.5, browThick: 1.8, noseY: 53, mouthW: 8.5, mouthY: 61, mouthStyle: 'neutral' },
    f1: { eyeRx: 3, eyeRy: 3.8, eyeY: 47, eyeSpread: 10, browThick: 1.5, noseY: 54, mouthW: 7, mouthY: 60, mouthStyle: 'smile' },
    f2: { eyeRx: 3.2, eyeRy: 4, eyeY: 46, eyeSpread: 10, browThick: 1.4, noseY: 53, mouthW: 7.5, mouthY: 60, mouthStyle: 'grin' },
    f3: { eyeRx: 2.8, eyeRy: 3.6, eyeY: 47, eyeSpread: 9.5, browThick: 1.5, noseY: 54, mouthW: 6.5, mouthY: 61, mouthStyle: 'smile' },
    f4: { eyeRx: 3.2, eyeRy: 3.8, eyeY: 46, eyeSpread: 10.5, browThick: 1.6, noseY: 54, mouthW: 8, mouthY: 60, mouthStyle: 'neutral' },
  };
  const fc = configs[characterId];
  const eyeColor = '#1a1a2e';
  const isFemale = characterId.startsWith('f');

  return (
    <>
      {/* Eyebrows */}
      <path d={`M${50 - fc.eyeSpread - 3} ${fc.eyeY - 7} Q${50 - fc.eyeSpread} ${fc.eyeY - 10} ${50 - fc.eyeSpread + 3} ${fc.eyeY - 7}`} stroke={hairColor} strokeWidth={fc.browThick} fill="none" strokeLinecap="round" opacity="0.9" />
      <path d={`M${50 + fc.eyeSpread - 3} ${fc.eyeY - 7} Q${50 + fc.eyeSpread} ${fc.eyeY - 10} ${50 + fc.eyeSpread + 3} ${fc.eyeY - 7}`} stroke={hairColor} strokeWidth={fc.browThick} fill="none" strokeLinecap="round" opacity="0.9" />

      {/* Eye whites */}
      <ellipse cx={50 - fc.eyeSpread} cy={fc.eyeY} rx={fc.eyeRx} ry={fc.eyeRy} fill="white" />
      <ellipse cx={50 + fc.eyeSpread} cy={fc.eyeY} rx={fc.eyeRx} ry={fc.eyeRy} fill="white" />
      {/* Irises */}
      <circle cx={50 - fc.eyeSpread} cy={fc.eyeY} r={fc.eyeRy * 0.7} fill={eyeColor} />
      <circle cx={50 + fc.eyeSpread} cy={fc.eyeY} r={fc.eyeRy * 0.7} fill={eyeColor} />
      {/* Highlights */}
      <circle cx={50 - fc.eyeSpread + 1} cy={fc.eyeY - 1} r="0.8" fill="white" opacity="0.9" />
      <circle cx={50 + fc.eyeSpread + 1} cy={fc.eyeY - 1} r="0.8" fill="white" opacity="0.9" />
      {/* Lashes (female only) */}
      {isFemale && (
        <>
          <path d={`M${50 - fc.eyeSpread - fc.eyeRx} ${fc.eyeY - 1} L${50 - fc.eyeSpread - fc.eyeRx - 1.5} ${fc.eyeY - 3.5}`} stroke={hairColor} strokeWidth="1" strokeLinecap="round" />
          <path d={`M${50 + fc.eyeSpread + fc.eyeRx} ${fc.eyeY - 1} L${50 + fc.eyeSpread + fc.eyeRx + 1.5} ${fc.eyeY - 3.5}`} stroke={hairColor} strokeWidth="1" strokeLinecap="round" />
        </>
      )}

      {/* Nose */}
      <path d={`M50 ${fc.noseY - 4} Q52 ${fc.noseY} 50 ${fc.noseY}`} stroke={skinColor} strokeWidth="0" fill="none" />
      <ellipse cx="50" cy={fc.noseY} rx="2" ry="1.2" fill={skinColor} opacity="0" />
      <path d={`M47.5 ${fc.noseY} Q50 ${fc.noseY + 2} 52.5 ${fc.noseY}`} stroke="#00000020" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      {fc.mouthStyle === 'smile' && (
        <path d={`M${50 - fc.mouthW} ${fc.mouthY} Q50 ${fc.mouthY + 5} ${50 + fc.mouthW} ${fc.mouthY}`} stroke="#00000055" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {fc.mouthStyle === 'grin' && (
        <>
          <path d={`M${50 - fc.mouthW} ${fc.mouthY} Q50 ${fc.mouthY + 6} ${50 + fc.mouthW} ${fc.mouthY}`} stroke="#00000055" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d={`M${50 - fc.mouthW + 1} ${fc.mouthY} Q50 ${fc.mouthY + 5} ${50 + fc.mouthW - 1} ${fc.mouthY}`} fill="white" opacity="0.5" />
        </>
      )}
      {fc.mouthStyle === 'smirk' && (
        <path d={`M${50 - fc.mouthW + 2} ${fc.mouthY + 1} Q50 ${fc.mouthY + 3} ${50 + fc.mouthW} ${fc.mouthY - 1}`} stroke="#00000055" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {fc.mouthStyle === 'neutral' && (
        <path d={`M${50 - fc.mouthW} ${fc.mouthY} L${50 + fc.mouthW} ${fc.mouthY}`} stroke="#00000040" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
    </>
  );
}

function HairLayer({ color, isFemale, characterId }: { style: string; color: string; isFemale: boolean; characterId: AvatarCharacterId }) {
  // Each character gets a distinct hairstyle
  const styles: Record<AvatarCharacterId, 'short' | 'medium' | 'long' | 'curly' | 'afro' | 'bun' | 'ponytail' | 'buzz'> = {
    m1: 'short',
    m2: 'medium',
    m3: 'buzz',
    m4: 'curly',
    f1: 'long',
    f2: 'bun',
    f3: 'curly',
    f4: 'ponytail',
  };
  const style = styles[characterId];

  switch (style) {
    case 'short':
      return <path d="M30 48 Q30 26 50 24 Q70 26 70 48 Q65 35 50 33 Q35 35 30 48Z" fill={color} />;
    case 'medium':
      return (
        <>
          <path d="M30 48 Q30 26 50 24 Q70 26 70 48 Q65 35 50 33 Q35 35 30 48Z" fill={color} />
          <path d="M30 48 Q28 58 30 65" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M70 48 Q72 58 70 65" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
        </>
      );
    case 'buzz':
      return <path d="M31 46 Q32 28 50 26 Q68 28 69 46 Q64 36 50 35 Q36 36 31 46Z" fill={color} />;
    case 'curly':
      return (
        <>
          <path d="M30 48 Q28 26 50 22 Q72 26 70 48 Q65 33 50 31 Q35 33 30 48Z" fill={color} />
          <circle cx="32" cy="40" r="5" fill={color} />
          <circle cx="68" cy="40" r="5" fill={color} />
          <circle cx="38" cy="29" r="5" fill={color} />
          <circle cx="62" cy="29" r="5" fill={color} />
        </>
      );
    case 'long':
      return (
        <>
          <path d="M30 48 Q30 26 50 24 Q70 26 70 48 Q65 35 50 33 Q35 35 30 48Z" fill={color} />
          <path d="M30 48 Q26 65 28 80" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M70 48 Q74 65 72 80" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
        </>
      );
    case 'bun':
      return (
        <>
          <path d="M30 48 Q30 26 50 24 Q70 26 70 48 Q65 35 50 33 Q35 35 30 48Z" fill={color} />
          <circle cx="50" cy="22" r="8" fill={color} />
        </>
      );
    case 'ponytail':
      return (
        <>
          <path d="M30 48 Q30 26 50 24 Q70 26 70 48 Q65 35 50 33 Q35 35 30 48Z" fill={color} />
          <path d="M66 36 Q78 42 74 62" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
        </>
      );
    case 'afro':
      return (
        <>
          <ellipse cx="50" cy="34" rx="24" ry="18" fill={color} />
          <ellipse cx="32" cy="44" rx="8" ry="10" fill={color} />
          <ellipse cx="68" cy="44" rx="8" ry="10" fill={color} />
        </>
      );
    default:
      return <path d="M30 48 Q30 26 50 24 Q70 26 70 48 Q65 35 50 33 Q35 35 30 48Z" fill={color} />;
  }
}

function HairPeekLayer({ color, hat, isFemale }: { color: string; hat: HatStyle; isFemale: boolean }) {
  // Show a small hair peek when wearing a hat
  if (hat === 'beanie' || hat === 'snapback') {
    return (
      <>
        <path d="M30 52 Q30 46 34 44" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M70 52 Q70 46 66 44" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      </>
    );
  }
  return (
    <>
      <path d="M30 50 Q30 44 34 42" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M70 50 Q70 44 66 42" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  );
}

function HatLayer({ style, color }: { style: HatStyle; color: string }) {
  const dark = '#00000030';
  switch (style) {
    case 'cap':
      return (
        <>
          <path d="M28 44 Q30 26 50 24 Q70 26 72 44Z" fill={color} />
          <rect x="22" y="42" width="50" height="5" rx="2.5" fill={color} />
          <rect x="22" y="42" width="32" height="5" rx="2.5" fill={dark} />
        </>
      );
    case 'beanie':
      return (
        <>
          <path d="M30 46 Q30 26 50 24 Q70 26 70 46Z" fill={color} />
          <rect x="29" y="43" width="42" height="5" rx="2" fill={color} opacity="0.7" />
          <circle cx="50" cy="24" r="4" fill={color} />
        </>
      );
    case 'fedora':
      return (
        <>
          <path d="M34 42 Q34 26 50 24 Q66 26 66 42Z" fill={color} />
          <rect x="22" y="40" width="56" height="5" rx="2.5" fill={color} />
          <path d="M22 40 Q30 36 50 36 Q70 36 78 40" stroke={dark} strokeWidth="1" fill="none" />
        </>
      );
    case 'beret':
      return (
        <>
          <ellipse cx="50" cy="32" rx="22" ry="12" fill={color} />
          <ellipse cx="60" cy="29" rx="5" ry="3" fill={color} opacity="0.5" />
          <rect x="30" y="42" width="40" height="4" rx="2" fill={color} opacity="0.7" />
        </>
      );
    case 'crown':
      return (
        <>
          <rect x="32" y="38" width="36" height="10" rx="2" fill={color} />
          <polygon points="32,38 32,28 38,34 44,24 50,32 56,24 62,34 68,28 68,38" fill={color} />
          <circle cx="44" cy="30" r="2" fill="#ffffffaa" />
          <circle cx="50" cy="28" r="2.5" fill="#ffffffaa" />
          <circle cx="56" cy="30" r="2" fill="#ffffffaa" />
        </>
      );
    case 'headband':
      return (
        <>
          <rect x="27" y="40" width="46" height="6" rx="3" fill={color} />
        </>
      );
    case 'snapback':
      return (
        <>
          <path d="M28 44 Q30 28 50 26 Q70 28 72 44Z" fill={color} />
          <rect x="22" y="42" width="50" height="4" rx="2" fill={color} />
          <rect x="56" y="42" width="16" height="4" rx="2" fill={dark} />
          <rect x="38" y="26" width="24" height="3" rx="1.5" fill={dark} opacity="0.3" />
        </>
      );
    default:
      return null;
  }
}

function GlassesLayer({ style, accentColor }: { style: GlassesStyle; accentColor: string }) {
  const frameColor = accentColor;
  const lensColor = accentColor + '22';
  switch (style) {
    case 'round':
      return (
        <>
          <circle cx="40" cy="47" r="7" stroke={frameColor} strokeWidth="1.8" fill={lensColor} />
          <circle cx="60" cy="47" r="7" stroke={frameColor} strokeWidth="1.8" fill={lensColor} />
          <line x1="47" y1="47" x2="53" y2="47" stroke={frameColor} strokeWidth="1.5" />
          <line x1="33" y1="47" x2="28" y2="46" stroke={frameColor} strokeWidth="1.5" />
          <line x1="67" y1="47" x2="72" y2="46" stroke={frameColor} strokeWidth="1.5" />
        </>
      );
    case 'square':
      return (
        <>
          <rect x="33" y="43" width="14" height="9" rx="2" stroke={frameColor} strokeWidth="1.8" fill={lensColor} />
          <rect x="53" y="43" width="14" height="9" rx="2" stroke={frameColor} strokeWidth="1.8" fill={lensColor} />
          <line x1="47" y1="47" x2="53" y2="47" stroke={frameColor} strokeWidth="1.5" />
          <line x1="33" y1="47" x2="28" y2="46" stroke={frameColor} strokeWidth="1.5" />
          <line x1="67" y1="47" x2="72" y2="46" stroke={frameColor} strokeWidth="1.5" />
        </>
      );
    case 'cat':
      return (
        <>
          <path d="M33 49 Q36 42 47 43 Q47 49 33 49Z" stroke={frameColor} strokeWidth="1.8" fill={lensColor} />
          <path d="M53 49 Q53 43 64 42 Q67 49 53 49Z" stroke={frameColor} strokeWidth="1.8" fill={lensColor} />
          <line x1="47" y1="47" x2="53" y2="47" stroke={frameColor} strokeWidth="1.5" />
          <line x1="33" y1="47" x2="28" y2="46" stroke={frameColor} strokeWidth="1.5" />
          <line x1="67" y1="47" x2="72" y2="46" stroke={frameColor} strokeWidth="1.5" />
        </>
      );
    case 'aviator':
      return (
        <>
          <ellipse cx="40" cy="48" rx="8" ry="6" stroke={frameColor} strokeWidth="1.8" fill={lensColor} />
          <ellipse cx="60" cy="48" rx="8" ry="6" stroke={frameColor} strokeWidth="1.8" fill={lensColor} />
          <line x1="48" y1="47" x2="52" y2="47" stroke={frameColor} strokeWidth="1.5" />
          <line x1="32" y1="47" x2="27" y2="46" stroke={frameColor} strokeWidth="1.5" />
          <line x1="68" y1="47" x2="73" y2="46" stroke={frameColor} strokeWidth="1.5" />
        </>
      );
    case 'rimless':
      return (
        <>
          <ellipse cx="40" cy="47" rx="7" ry="5" stroke={frameColor} strokeWidth="0.8" fill={lensColor} />
          <ellipse cx="60" cy="47" rx="7" ry="5" stroke={frameColor} strokeWidth="0.8" fill={lensColor} />
          <line x1="47" y1="47" x2="53" y2="47" stroke={frameColor} strokeWidth="0.8" />
          <line x1="33" y1="47" x2="28" y2="46" stroke={frameColor} strokeWidth="0.8" />
          <line x1="67" y1="47" x2="72" y2="46" stroke={frameColor} strokeWidth="0.8" />
        </>
      );
    default:
      return null;
  }
}
