/**
 * Avatar with gamification frame tier.
 * 5 tier: bronze (Lv 1-2) → silver (3-4) → gold (5-7) → platinum (8-9) → diamond (10+)
 * Tanpa frame kalau Lv 0 atau frame_tier null.
 *
 * Props:
 *  - user        — { name, avatar, frame_tier? }
 *  - size        — 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *  - showLevel   — tampilkan level badge di pojok kanan-bawah
 *  - level       — angka level (untuk badge)
 */

const SIZES = {
    xs: { box: 'w-7 h-7', text: 'text-[10px]', glow: 'shadow-sm', pad: 'p-0.5', levelBox: 'w-3.5 h-3.5 text-[7px]' },
    sm: { box: 'w-9 h-9', text: 'text-xs', glow: 'shadow', pad: 'p-0.5', levelBox: 'w-4 h-4 text-[8px]' },
    md: { box: 'w-11 h-11', text: 'text-sm', glow: 'shadow-md', pad: 'p-0.5', levelBox: 'w-4.5 h-4.5 text-[9px]' },
    lg: { box: 'w-14 h-14', text: 'text-base', glow: 'shadow-lg', pad: 'p-1', levelBox: 'w-5 h-5 text-[10px]' },
    xl: { box: 'w-20 h-20', text: 'text-2xl', glow: 'shadow-xl', pad: 'p-1', levelBox: 'w-6 h-6 text-xs' },
};

const FRAMES = {
    bronze: { ring: 'ring-amber-700', from: 'from-amber-700', to: 'to-orange-800', glow: 'shadow-amber-700/40' },
    silver: { ring: 'ring-slate-400', from: 'from-slate-300', to: 'to-slate-500', glow: 'shadow-slate-400/50' },
    gold: { ring: 'ring-amber-400', from: 'from-amber-300', to: 'to-amber-600', glow: 'shadow-amber-400/60' },
    platinum: { ring: 'ring-cyan-300', from: 'from-cyan-200', to: 'to-cyan-500', glow: 'shadow-cyan-300/60' },
    diamond: { ring: 'ring-fuchsia-400', from: 'from-fuchsia-300 via-violet-400', to: 'to-cyan-300', glow: 'shadow-fuchsia-400/70' },
};

export default function Avatar({ user, size = 'md', showLevel = false, level = 0 }) {
    if (! user) return null;
    const s = SIZES[size] || SIZES.md;
    const frame = user.frame_tier ? FRAMES[user.frame_tier] : null;

    const inner = (
        <div className={`${s.box} rounded-full bg-gradient-to-br from-primary-600 to-amber-500 text-white grid place-items-center font-bold overflow-hidden shrink-0 ${s.text}`}>
            {user.avatar ? (
                <img src={`/storage/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
            ) : (
                user.name?.charAt(0)?.toUpperCase() || '?'
            )}
        </div>
    );

    if (! frame) {
        return showLevel && level > 0 ? (
            <div className="relative inline-block">
                {inner}
                <LevelBadge level={level} sizeClass={s.levelBox} />
            </div>
        ) : inner;
    }

    return (
        <div className="relative inline-block">
            <div className={`rounded-full bg-gradient-to-br ${frame.from} ${frame.to} ${s.pad} ${s.glow} ${frame.glow}`}>
                {inner}
            </div>
            {showLevel && level > 0 && <LevelBadge level={level} sizeClass={s.levelBox} tier={user.frame_tier} />}
        </div>
    );
}

function LevelBadge({ level, sizeClass, tier }) {
    const bg = {
        bronze: 'bg-amber-700',
        silver: 'bg-slate-500',
        gold: 'bg-amber-500',
        platinum: 'bg-cyan-500',
        diamond: 'bg-gradient-to-br from-fuchsia-500 to-violet-600',
    }[tier] || 'bg-slate-600';
    return (
        <span className={`absolute -bottom-0.5 -right-0.5 ${sizeClass} rounded-full ${bg} text-white font-extrabold grid place-items-center ring-2 ring-white shadow`}>
            {level}
        </span>
    );
}
