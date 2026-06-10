import { useState } from 'react';

/**
 * Logo PENSNOVA — image dari /images/pensnova-logo.png.
 * Kalau gambar gagal load, fallback ke text "PN" dengan gradient.
 *
 * Variants:
 *   - 'mark'      — hanya icon (untuk sidebar/footer kecil)
 *   - 'full'      — icon + text PENSNOVA + tagline (default header)
 *   - 'stacked'   — icon di atas text (untuk login/centered)
 */
export default function Logo({
    variant = 'full',
    size = 'md',
    invert = false, // dark bg
    showTagline = true,
    className = '',
    linkTo = null, // optional path
}) {
    const [imgError, setImgError] = useState(false);

    const sizes = {
        sm: { img: 'w-7 h-7', text: 'text-sm', tagline: 'text-[9px]' },
        md: { img: 'w-9 h-9', text: 'text-[15px]', tagline: 'text-[10px]' },
        lg: { img: 'w-12 h-12', text: 'text-lg', tagline: 'text-xs' },
        xl: { img: 'w-20 h-20', text: 'text-2xl', tagline: 'text-xs' },
    }[size];

    const iconNode = imgError ? (
        // Fallback gradient "PN"
        <span
            className={`inline-flex items-center justify-center ${sizes.img} rounded-lg bg-gradient-to-br from-primary-700 to-amber-500 text-white text-xs font-extrabold shadow-sm ring-1 ring-primary-800/20`}
        >
            PN
        </span>
    ) : (
        <img
            src="/images/pensnova-logo.png"
            alt="PENSNOVA"
            className={`${sizes.img} object-contain`}
            onError={() => setImgError(true)}
        />
    );

    if (variant === 'mark') {
        return <span className={className}>{iconNode}</span>;
    }

    const textColor = invert ? 'text-white' : 'text-primary-900';
    const taglineColor = invert ? 'text-slate-300' : 'text-slate-500';

    if (variant === 'stacked') {
        return (
            <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
                {iconNode}
                <div className="flex flex-col leading-tight items-center">
                    <span className={`${textColor} ${sizes.text} font-extrabold tracking-tight`}>PENSNOVA</span>
                    {showTagline && (
                        <span className={`${taglineColor} ${sizes.tagline} font-medium uppercase tracking-wider`}>
                            Innovation Hub
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // full
    const content = (
        <div className={`inline-flex items-center gap-2.5 ${className}`}>
            {iconNode}
            <div className="flex flex-col leading-tight">
                <span className={`${textColor} ${sizes.text} font-extrabold tracking-tight`}>PENSNOVA</span>
                {showTagline && (
                    <span className={`${taglineColor} ${sizes.tagline} font-medium uppercase tracking-wider hidden sm:block`}>
                        UPA Pengembangan Teknologi
                    </span>
                )}
            </div>
        </div>
    );

    return content;
}
