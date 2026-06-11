import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Hero header reusable untuk semua halaman publik PENSNOVA.
 *
 * Pattern konsisten:
 *  - Solid navy background + dot grid pattern
 *  - "Kembali ke Beranda" link (default true)
 *  - Eyebrow (uppercase tracking-widest) opsional
 *  - H1 dengan title + accent color pada kata tertentu
 *  - Subtitle paragraph opsional
 *  - Children slot untuk CTA/stats inline
 *
 * Container: max-w-7xl mx-auto, py-12 sm:py-16 untuk hero kompak.
 */
export default function PageHero({
    eyebrow,
    title,
    accent,           // bagian dari title yang di-highlight amber
    titleAfter,       // text setelah accent
    subtitle,
    showBack = true,
    backTo = '/',
    backLabel = 'Kembali ke Beranda',
    children,
}) {
    return (
        <section className="relative overflow-hidden text-white" style={{ background: '#0d1830' }}>
            {/* Dot grid pattern overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                {showBack && (
                    <Link to={backTo} className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-400 text-sm font-semibold mb-5 transition">
                        <ArrowLeft className="w-4 h-4" /> {backLabel}
                    </Link>
                )}
                {eyebrow && (
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400 mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        {eyebrow}
                    </div>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.08]">
                    {title}
                    {accent && <span className="text-amber-400">{` ${accent}`}</span>}
                    {titleAfter}
                </h1>
                {subtitle && (
                    <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed">
                        {subtitle}
                    </p>
                )}
                {children && <div className="mt-6">{children}</div>}
            </div>
        </section>
    );
}
