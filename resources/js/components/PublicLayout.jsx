import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, Settings, Compass, Handshake, Mail } from 'lucide-react';
import { useAuth } from '../lib/auth';
import Logo from './Logo';

// Primary nav (selalu visible di desktop)
const primaryNav = [
    { to: '/', label: 'Beranda', end: true },
    { to: '/dampak', label: 'Dampak' },
    { to: '/program', label: 'Program' },
    { to: '/startup', label: 'Startup' },
    { to: '/produk-inovasi', label: 'Produk Inovasi' },
    { to: '/alumni', label: 'Alumni' },
];

// Secondary nav (dropdown "Lainnya")
const secondaryNav = [
    { to: '/tentang', label: 'Tentang UPA' },
    { to: '/riset', label: 'Topik Riset' },
    { to: '/jasa-lab', label: 'Jasa Lab' },
    { to: '/mitra', label: 'Mitra Industri' },
    { to: '/sewa-ruang', label: 'Sewa Ruang' },
    { to: '/artikel', label: 'Artikel & Berita' },
    { to: '/panduan', label: 'Panduan & Template' },
    { to: '/leaderboard', label: 'Leaderboard XP' },
    { to: '/feedback', label: 'Survey Kepuasan' },
];

// Full mobile nav (semua)
const mobileNavSections = [
    { title: 'Utama', items: primaryNav },
    { title: 'Lainnya', items: secondaryNav },
];

export default function PublicLayout() {
    const { user, defaultDashboardPath, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [secondaryOpen, setSecondaryOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const secondaryRef = useRef(null);
    const userMenuRef = useRef(null);

    // Tutup menu saat route berubah
    useEffect(() => {
        setMobileOpen(false);
        setSecondaryOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    // Click outside untuk dropdown
    useEffect(() => {
        const handler = (e) => {
            if (secondaryRef.current && ! secondaryRef.current.contains(e.target)) setSecondaryOpen(false);
            if (userMenuRef.current && ! userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
        };
        if (secondaryOpen || userMenuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [secondaryOpen, userMenuOpen]);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#f8f9fc', color: '#1e293b' }}>
            {/* * ------------------------------------------------------------ */}
            <header
                className="sticky top-0 z-30 backdrop-blur-md"
                style={{
                    background: 'rgba(20, 33, 67, 0.97)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-3">
                    <Link to="/" className="font-bold shrink-0">
                        <Logo variant="full" size="md" invert />
                    </Link>

                    {/* * ------------------------------------------------------------ */}
                    <nav className="hidden lg:flex items-center gap-1 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {primaryNav.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                end={n.end}
                                className={({ isActive }) =>
                                    `px-3 py-1.5 rounded-md transition text-sm font-medium ${isActive
                                        ? 'font-semibold'
                                        : 'hover:text-white'
                                    }`
                                }
                                style={({ isActive }) => ({
                                    color: isActive ? '#ffaf00' : undefined,
                                    background: isActive ? 'rgba(255,175,0,0.12)' : undefined,
                                })}
                            >
                                {n.label}
                            </NavLink>
                        ))}

                        {/* Lainnya dropdown */}
                        <div className="relative" ref={secondaryRef}>
                            <button
                                onClick={() => setSecondaryOpen((v) => !v)}
                                className="px-3 py-1.5 rounded-md transition inline-flex items-center gap-1 text-sm hover:text-white"
                                style={{ color: secondaryOpen ? '#ffaf00' : undefined, background: secondaryOpen ? 'rgba(255,175,0,0.12)' : undefined }}
                            >
                                Lainnya
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${secondaryOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {secondaryOpen && (
                                <div
                                    className="absolute right-0 top-full mt-1.5 w-56 rounded-xl overflow-hidden py-1.5"
                                    style={{ background: '#142143', border: '1px solid rgba(255,255,255,0.12)' }}
                                >
                                    {secondaryNav.map((n) => (
                                        <NavLink
                                            key={n.to}
                                            to={n.to}
                                            className="block px-4 py-2 text-sm transition"
                                            style={({ isActive }) => ({
                                                color: isActive ? '#ffaf00' : 'rgba(255,255,255,0.75)',
                                                background: isActive ? 'rgba(255,175,0,0.1)' : undefined,
                                            })}
                                        >
                                            {n.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            to="/daftar"
                            className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-bold transition"
                            style={{ background: '#ffaf00', color: '#142143' }}
                        >
                            Daftar Tenant
                        </Link>

                        {user ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen((v) => !v)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition hover:bg-white/10"
                                >
                                    <Avatar user={user} />
                                    <div className="hidden md:block text-left">
                                        <div className="text-xs font-bold leading-tight max-w-[120px] truncate text-white">
                                            {user.name}
                                        </div>
                                    </div>
                                    <ChevronDown className={`h-3.5 w-3.5 text-white/50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {userMenuOpen && (
                                    <div
                                        className="absolute right-0 top-full mt-1.5 w-60 rounded-xl overflow-hidden"
                                        style={{ background: '#142143', border: '1px solid rgba(255,255,255,0.12)' }}
                                    >
                                        <div className="px-4 py-3 border-b flex items-center gap-2.5" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                            <Avatar user={user} size="lg" />
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold truncate text-white">{user.name}</div>
                                                <div className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                to={defaultDashboardPath()}
                                                className="flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-white/10"
                                                style={{ color: 'rgba(255,255,255,0.75)' }}
                                            >
                                                <LayoutDashboard className="h-4 w-4" style={{ color: '#ffaf00' }} /> Dashboard Saya
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-white/10"
                                                style={{ color: 'rgba(255,255,255,0.75)' }}
                                            >
                                                <Settings className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.4)' }} /> Pengaturan
                                            </Link>
                                        </div>
                                        <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                            <button
                                                onClick={logout}
                                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-rose-900/30"
                                                style={{ color: '#fca5a5' }}
                                            >
                                                <LogOut className="h-4 w-4" /> Keluar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition"
                                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                            >
                                Login
                            </Link>
                        )}
                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            className="lg:hidden p-2 -mr-1 rounded-lg hover:bg-white/10 transition text-white"
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* * ------------------------------------------------------------ */}
            {/* Mobile drawer */}
            {mobileOpen && (
                <>
                    <div
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 z-40 lg:hidden animate-fade-in-backdrop"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                    />
                    <nav
                        className="fixed inset-y-0 right-0 z-50 w-72 overflow-y-auto lg:hidden animate-slide-in-drawer"
                        style={{ background: '#142143' }}
                    >
                        <div
                            className="px-4 py-3 flex items-center justify-between sticky top-0 z-10"
                            style={{ background: '#142143', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <span className="font-bold text-white">Menu</span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-1.5 rounded hover:bg-white/10 text-white"
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="px-3 py-4 space-y-4">
                            <Link
                                to="/daftar"
                                className="block text-center px-4 py-3 rounded-xl font-bold text-sm animate-mobile-nav-item"
                                style={{ background: '#ffaf00', color: '#142143' }}
                            >
                                Daftar Tenant
                            </Link>
                            {mobileNavSections.map((section, sIdx) => (
                                <div key={section.title}>
                                    <div
                                        className="px-2 mb-1 text-[11px] font-bold uppercase tracking-wider animate-mobile-nav-item"
                                        style={{ color: 'rgba(255,175,0,0.7)', animationDelay: `${(sIdx + 1) * 50}ms` }}
                                    >
                                        {section.title}
                                    </div>
                                    <div className="space-y-0.5">
                                        {section.items.map((n, idx) => (
                                            <NavLink
                                                key={n.to}
                                                to={n.to}
                                                end={n.end}
                                                className="block px-3 py-2.5 rounded-lg text-sm font-medium transition animate-mobile-nav-item"
                                                style={({ isActive }) => ({
                                                    color: isActive ? '#ffaf00' : 'rgba(255,255,255,0.75)',
                                                    background: isActive ? 'rgba(255,175,0,0.12)' : undefined,
                                                    animationDelay: `${((sIdx + 1) * 50) + ((idx + 1) * 30)}ms`
                                                })}
                                            >
                                                {n.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </nav>
                </>
            )}

            {/* * ------------------------------------------------------------ */}
            <main className="flex-1 overflow-x-hidden">
                <Outlet />
            </main>

            {/* * ------------------------------------------------------------ */}
            <footer className="relative overflow-hidden" style={{ background: '#0d1830', color: 'rgba(255,255,255,0.6)' }}>
                {/* Dot grid pattern overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
                {/* Accent stripe */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">
                    {/* Brand column */}
                    <div className="md:col-span-4">
                        <div className="mb-4">
                            <Logo variant="full" size="md" invert showTagline={false} />
                            <div
                                className="text-[10px] mt-1.5 uppercase tracking-widest font-bold"
                                style={{ color: '#ffaf00' }}
                            >
                                Innovation Hub · PENS
                            </div>
                        </div>
                        <p className="leading-relaxed text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            UPA Pengembangan Teknologi &amp; Produk Unggulan — Politeknik Elektronika Negeri Surabaya.
                            Menghubungkan inovasi kampus dengan industri &amp; masyarakat.
                        </p>
                        <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <div
                                className="text-[10px] uppercase tracking-widest font-bold mb-3"
                                style={{ color: '#ffaf00' }}
                            >
                                Sistem PENS Terkait
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                                <a href="https://hki.pens.ac.id" target="_blank" rel="noopener" className="hover:text-white transition" style={{ color: 'rgba(255,255,255,0.5)' }}>Sentra HKI ↗</a>
                                <a href="https://wira.pensnova.org" target="_blank" rel="noopener" className="hover:text-white transition" style={{ color: 'rgba(255,255,255,0.5)' }}>Wira (Kewirausahaan) ↗</a>
                                <a href="https://www.pens.ac.id" target="_blank" rel="noopener" className="hover:text-white transition" style={{ color: 'rgba(255,255,255,0.5)' }}>PENS ↗</a>
                            </div>
                        </div>
                    </div>

                    {/* Nav columns */}
                    <div className="md:col-span-2">
                        <h4 className="font-bold mb-3 uppercase text-[11px] tracking-wider text-white inline-flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-amber-400" /> Eksplor</h4>
                        <ul className="space-y-2 text-xs">
                            {[['Tentang UPA','/tentang'],['Dampak UPA','/dampak'],['Program','/program'],['Startup','/startup'],['Alumni','/alumni']].map(([l,t]) => (
                                <li key={t}><Link to={t} className="hover:text-white transition" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="font-bold mb-3 uppercase text-[11px] tracking-wider text-white inline-flex items-center gap-1.5"><Handshake className="w-3.5 h-3.5 text-amber-400" /> Kolaborasi</h4>
                        <ul className="space-y-2 text-xs">
                            {[['Topik Riset','/riset'],['Produk Inovasi','/produk-inovasi'],['Mitra Industri','/mitra'],['Artikel','/artikel'],['Panduan','/panduan']].map(([l,t]) => (
                                <li key={t}><Link to={t} className="hover:text-white transition" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact column */}
                    <div className="md:col-span-4">
                        <h4 className="font-bold mb-3 uppercase text-[11px] tracking-wider text-white inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> Kontak</h4>
                        <div className="text-xs space-y-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            <div>
                                <div className="text-white font-bold text-sm">Aji Sapta Pramulen</div>
                                <div className="text-[11px] mt-0.5">Kepala UPA Pengembangan Teknologi &amp; Produk Unggulan</div>
                            </div>
                            <div>Gedung EIC Lt. 3, Politeknik Elektronika Negeri Surabaya, Jl. Raya ITS Sukolilo, Surabaya</div>
                            <div>
                                <a href="mailto:penssky.inkubator@div.pens.ac.id" className="hover:text-white transition block truncate">penssky.inkubator@div.pens.ac.id</a>
                                <a href="tel:+6285732570257" className="hover:text-white transition">0857-3257-0257</a>
                            </div>
                            <div className="flex flex-wrap gap-3 pt-3" style={{ borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
                                <a href="https://instagram.com/pensskyventure" target="_blank" rel="noopener" className="hover:text-white transition" style={{ color: 'rgba(255,255,255,0.5)' }}>@pensskyventure</a>
                                <a href="https://youtube.com/@PENSSKYVenture" target="_blank" rel="noopener" className="hover:text-white transition" style={{ color: 'rgba(255,255,255,0.5)' }}>YouTube</a>
                                <Link to="/feedback" className="hover:text-white transition" style={{ color: 'rgba(255,255,255,0.5)' }}>Survey Kepuasan</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="py-4 text-center text-xs"
                    style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
                >
                    © {new Date().getFullYear()} PENSNOVA — UPA Pengembangan Teknologi &amp; Produk Unggulan PENS
                </div>
            </footer>
        </div>
    );
}

function Avatar({ user, size = 'sm' }) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
    };
    return (
        <div className={`rounded-full bg-primary-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0 ${sizes[size]}`}>
            {user?.avatar ? (
                <img
                    src={`/storage/${user.avatar}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                user?.name?.charAt(0)?.toUpperCase() || '?'
            )}
        </div>
    );
}

/*
## PENJELASAN CODE:

### PublicLayout()
- Fungsi: Komponen layout utama area publik yang menangani header navigasi desktop/mobile, state dropdown profil, mobile sidebar drawer, dan footer website PENSNOVA.
- Parameter: Tidak ada.
- Return: Elemen visual JSX Layout area publik.
- Cara pakai: Router wrapper utama untuk halaman publik.
- Catatan: Menambahkan transisi dan delay stagger untuk elemen menu drawer mobile agar animasi pembukaan sidebar tidak kaku.

### Avatar(props)
- Fungsi: Menampilkan foto profil user atau inisial huruf pertama jika avatar belum diunggah.
- Parameter: props (object) - Data user dan opsi ukuran avatar (sm/lg).
- Return: Elemen JSX avatar bulat.
- Cara pakai: <Avatar user={user} size="lg" />
- Catatan: Menggunakan rounded-full dengan background gradient gradasi oranye-navy yang premium.
*/
