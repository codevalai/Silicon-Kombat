import React from 'react';
import { FighterConfig } from '../data/roster';

interface FounderPortraitProps {
  fighter: FighterConfig;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function hexToCss(num: number): string {
  return '#' + num.toString(16).padStart(6, '0');
}

export const FounderPortrait: React.FC<FounderPortraitProps> = ({
  fighter,
  size = 'md',
  className = '',
}) => {
  const { likeness, suitColor, armorColor, neonColor, skinColor } = fighter;
  const skin = hexToCss(skinColor);
  const hair = hexToCss(likeness.hairColor);
  const suit = hexToCss(suitColor);
  const armor = hexToCss(armorColor);
  const neon = hexToCss(neonColor);
  const shirt = hexToCss(likeness.shirtColor);

  const dims =
    size === 'sm'
      ? 'w-10 h-10'
      : size === 'lg'
      ? 'w-20 h-20'
      : 'w-14 h-14';

  return (
    <div
      className={`relative overflow-hidden bg-[#060a14] border border-slate-700/80 shrink-0 ${dims} ${className}`}
      style={{
        boxShadow: `inset 0 0 16px ${neon}33`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full block"
        aria-label={fighter.name}
      >
        <defs>
          <radialGradient id={`glow-${fighter.id}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={neon} stopOpacity="0.35" />
            <stop offset="100%" stopColor="#050811" stopOpacity="0.95" />
          </radialGradient>
        </defs>

        {/* Background Aura */}
        <rect width="100" height="100" fill={`url(#glow-${fighter.id})`} />

        {/* Subtle Tech Ring Behind Head */}
        <circle
          cx="50"
          cy="45"
          r="34"
          fill="none"
          stroke={neon}
          strokeWidth="1.2"
          strokeDasharray="6 4"
          opacity="0.45"
        />

        {/* Shoulders & Iconic Outfit */}
        <path
          d="M14 100 C14 74, 30 68, 50 68 C70 68, 86 74, 86 100 Z"
          fill={suit}
          stroke={armor}
          strokeWidth="2"
        />

        {/* Inner Shirt / Sweater V-Neck or Crewneck */}
        <path d="M36 69 L50 92 L64 69 Z" fill={shirt} />

        {/* Outfit Specific Accents */}
        {likeness.outfitStyle === 'biker_leather' && (
          <>
            {/* Jensen Leather Jacket Lapels & Silver Zipper */}
            <path d="M32 68 L45 94 L38 98 L24 76 Z" fill="#18181b" stroke="#52525b" strokeWidth="1" />
            <path d="M68 68 L55 94 L62 98 L76 76 Z" fill="#18181b" stroke="#52525b" strokeWidth="1" />
            <line x1="53" y1="74" x2="46" y2="98" stroke="#e4e4e7" strokeWidth="1.8" />
          </>
        )}

        {likeness.outfitStyle === 'yc_puffer' && (
          <>
            {/* Garry Tan Orange Puffer Ribs & [Y] Badge */}
            <line x1="20" y1="80" x2="80" y2="80" stroke="#9a3412" strokeWidth="1.5" />
            <line x1="18" y1="90" x2="82" y2="90" stroke="#9a3412" strokeWidth="1.5" />
            <rect x="60" y="75" width="12" height="12" fill="#f97316" stroke="#ffffff" strokeWidth="1.2" />
            <text x="66" y="84" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
              Y
            </text>
          </>
        )}

        {likeness.hasGoldChain && (
          /* Mark Zuckerberg Gold Chain */
          <path
            d="M35 71 Q50 86 65 71"
            fill="none"
            stroke="#facc15"
            strokeWidth="2.8"
          />
        )}

        {likeness.outfitStyle === 'formal_suit' && (
          /* Morris Chang Gold Tie */
          <polygon points="48,72 52,72 54,96 50,100 46,96" fill="#eab308" />
        )}

        {/* Neck */}
        <rect x="42" y="56" width="16" height="16" rx="4" fill={skin} />

        {/* Ears */}
        <ellipse cx="27" cy="46" rx="3.5" ry="6" fill={skin} />
        <ellipse cx="73" cy="46" rx="3.5" ry="6" fill={skin} />

        {/* Sculpted Head & Jawline */}
        <path
          d="M28 36 C28 20, 72 20, 72 36 C72 52, 64 64, 50 65 C36 64, 28 52, 28 36 Z"
          fill={skin}
        />

        {/* Facial Hair (Beard / Goatee / Stubble / Chin Beard) */}
        {likeness.facialHair === 'full_beard' && (
          <path
            d="M28 45 C28 58, 38 66, 50 66 C62 66, 72 58, 72 45 C68 52, 60 54, 50 54 C40 54, 32 52, 28 45 Z"
            fill={hair}
            opacity="0.92"
          />
        )}
        {likeness.facialHair === 'goatee' && (
          <path
            d="M41 53 C41 62, 59 62, 59 53 L56 51 L44 51 Z"
            fill={hair}
            opacity="0.9"
          />
        )}
        {likeness.facialHair === 'nordic_chin' && (
          <ellipse cx="50" cy="61" rx="8" ry="4.5" fill="#d97706" opacity="0.65" />
        )}
        {likeness.facialHair === 'stubble' && (
          <path
            d="M30 47 C30 58, 39 64, 50 64 C61 64, 70 58, 70 47 C66 54, 58 56, 50 56 C42 56, 34 54, 30 47 Z"
            fill={hair}
            opacity="0.28"
          />
        )}

        {/* Chiseled Jawline & Cheekbone Contour Lines */}
        <path
          d="M32 46 Q35 55 42 61 M68 46 Q65 55 58 61"
          fill="none"
          stroke="rgba(40, 18, 12, 0.35)"
          strokeWidth="1.6"
        />
        {/* Forehead Expression Lines */}
        <path
          d="M39 29 Q50 27 61 29 M42 32 Q50 31 58 32"
          fill="none"
          stroke="rgba(45, 20, 14, 0.3)"
          strokeWidth="1.2"
        />
        {/* Nasolabial Folds */}
        <path
          d="M44 48 Q40 53 41 58 M56 48 Q60 53 59 58"
          fill="none"
          stroke="rgba(45, 20, 14, 0.38)"
          strokeWidth="1.4"
        />

        {/* Mature Eyes & Low-Set Executive Eyebrows */}
        <path d="M34 37 Q40 34 46 37" fill="none" stroke={hair} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M54 37 Q60 34 66 37" fill="none" stroke={hair} strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="40" cy="41.5" rx="4.2" ry="2.1" fill="#f8fafc" />
        <ellipse cx="60" cy="41.5" rx="4.2" ry="2.1" fill="#f8fafc" />
        <circle cx="40" cy="41.5" r="1.9" fill="#0f172a" />
        <circle cx="60" cy="41.5" r="1.9" fill="#0f172a" />
        <circle cx="40.6" cy="41" r="0.6" fill="#ffffff" />
        <circle cx="60.6" cy="41" r="0.6" fill="#ffffff" />

        {/* Sculpted Nose Bridge & Determined Mouth */}
        <path d="M50 38 L48 49 L52.5 49" fill="none" stroke="rgba(60, 28, 18, 0.65)" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M43 55 Q50 54 57 55" fill="none" stroke="#5c2418" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M46 58 Q50 57 54 58" fill="none" stroke="rgba(45, 20, 14, 0.4)" strokeWidth="1.4" />

        {/* Founder Specific Hairstyles */}
        {likeness.hairStyle === 'elon_swept' && (
          <path
            d="M27 38 C25 22, 40 16, 54 17 C68 18, 75 25, 73 38 C70 28, 58 24, 42 26 C34 27, 30 32, 27 38 Z"
            fill={hair}
          />
        )}
        {likeness.hairStyle === 'jensen_silver' && (
          <path
            d="M25 40 C23 22, 38 15, 52 16 C68 16, 77 25, 75 41 C72 29, 60 24, 46 25 C34 26, 29 31, 25 40 Z"
            fill="#e4e4e7"
          />
        )}
        {likeness.hairStyle === 'zuck_curly' && (
          <g fill={hair}>
            <circle cx="33" cy="27" r="6" />
            <circle cx="41" cy="24" r="6.5" />
            <circle cx="50" cy="23" r="6.5" />
            <circle cx="59" cy="24" r="6.5" />
            <circle cx="67" cy="27" r="6" />
            <circle cx="29" cy="33" r="4.5" />
            <circle cx="71" cy="33" r="4.5" />
          </g>
        )}
        {likeness.hairStyle === 'curly_bushy' && (
          <g fill={hair}>
            <circle cx="30" cy="28" r="8" />
            <circle cx="40" cy="22" r="9" />
            <circle cx="52" cy="21" r="9.5" />
            <circle cx="63" cy="23" r="8.5" />
            <circle cx="71" cy="30" r="7.5" />
            <circle cx="26" cy="36" r="6" />
          </g>
        )}
        {(likeness.hairStyle === 'gates_part' ||
          likeness.hairStyle === 'pichai_part' ||
          likeness.hairStyle === 'wavy_part' ||
          likeness.hairStyle === 'morris_white') && (
          <path
            d="M27 38 C26 21, 38 16, 52 16 C66 16, 74 23, 73 38 C68 27, 56 25, 38 24 C34 28, 30 33, 27 38 Z"
            fill={hair}
          />
        )}
        {(likeness.hairStyle === 'ellison_mane' || likeness.hairStyle === 'benioff_mane') && (
          <path
            d="M24 44 C22 22, 36 14, 50 14 C65 14, 78 22, 76 44 C73 30, 62 24, 50 24 C38 24, 27 30, 24 44 Z"
            fill={hair}
          />
        )}
        {likeness.hairStyle === 'satya_trim' && (
          <>
            <path d="M26 36 C26 42, 29 45, 29 36 Z" fill={hair} />
            <path d="M74 36 C74 42, 71 45, 71 36 Z" fill={hair} />
          </>
        )}
        {likeness.hairStyle === 'demis_receding' && (
          <path
            d="M27 36 C27 24, 38 20, 50 21 C62 20, 73 24, 73 36 C69 27, 60 25, 50 26 C40 25, 31 27, 27 36 Z"
            fill={hair}
          />
        )}
        {likeness.hairStyle === 'wang_fluffy' && (
          <path
            d="M25 39 C24 20, 38 14, 50 15 C62 14, 76 20, 75 39 C67 26, 54 24, 50 31 C46 24, 33 26, 25 39 Z"
            fill={hair}
          />
        )}
        {likeness.hairStyle === 'tan_fade' && (
          <path
            d="M31 29 C34 18, 66 18, 69 29 C60 24, 40 24, 31 29 Z"
            fill={hair}
          />
        )}

        {/* Founder Specific Eyewear */}
        {(likeness.eyewear === 'jensen_rim' ||
          likeness.eyewear === 'thick_black' ||
          likeness.eyewear === 'round_rect') && (
          <g stroke="#09090b" strokeWidth="2.2" fill="rgba(56, 189, 248, 0.14)">
            <rect x="32" y="38" width="15" height="9" rx="2" />
            <rect x="53" y="38" width="15" height="9" rx="2" />
            <line x1="47" y1="42" x2="53" y2="42" />
          </g>
        )}
        {likeness.eyewear === 'wire_rect' && (
          <g stroke="#cbd5e1" strokeWidth="1.5" fill="rgba(224, 242, 254, 0.15)">
            <rect x="32" y="38" width="15" height="9" rx="2" />
            <rect x="53" y="38" width="15" height="9" rx="2" />
            <line x1="47" y1="42" x2="53" y2="42" />
          </g>
        )}
        {likeness.eyewear === 'aviators' && (
          <g stroke="#eab308" strokeWidth="1.6" fill="rgba(15, 23, 42, 0.78)">
            <path d="M31 38 L47 38 L45 48 Q38 50 32 45 Z" />
            <path d="M53 38 L69 38 L68 45 Q62 50 55 48 Z" />
            <line x1="47" y1="39" x2="53" y2="39" />
          </g>
        )}
        {likeness.eyewear === 'google_glass' && (
          <g>
            <line x1="28" y1="38" x2="72" y2="38" stroke="#94a3b8" strokeWidth="1.8" />
            <rect x="54" y="36" width="14" height="7" fill="#00f3ff" opacity="0.75" stroke="#ffffff" strokeWidth="1" />
          </g>
        )}
        {likeness.eyewear === 'ar_spectacles' && (
          <g stroke="#facc15" strokeWidth="2.4" fill="rgba(0, 243, 255, 0.35)">
            <rect x="30" y="37" width="17" height="10" rx="3" />
            <rect x="53" y="37" width="17" height="10" rx="3" />
            <line x1="47" y1="41" x2="53" y2="41" />
            <circle cx="33" cy="39" r="1.2" fill="#ffffff" />
            <circle cx="67" cy="39" r="1.2" fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
};
