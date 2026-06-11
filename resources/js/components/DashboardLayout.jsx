import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ArrowLeft, ChevronDown, Settings, LogOut, MoreHorizontal, LayoutDashboard, BarChart3, Target, FlaskConical, MessageSquare, ClipboardList, FileText, Building2, Calendar, Rocket, GraduationCap, FolderArchive, Globe, Users, Search } from 'lucide-react';
import { useAuth } from '../lib/auth';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

function NavIcon({ iconKey, className = 'text-base' }) {
    if (!iconKey) return <span className={className}>•</span>;
    const iconMap = {
        dashboard: LayoutDashboard,
        laporan: BarChart3,
        milestone: Target,
        riset: FlaskConical,
        mentoring: MessageSquare,
        monev: ClipboardList,
        kebutuhan: FileText,
        sewa: Building2,
        pinjam: Calendar,
        produk: Rocket,
        sertifikat: GraduationCap,
        documents: FolderArchive,
        alumni: Globe,
        binaan: Users,
        sesi: Calendar,
        browse: Search,
        meeting: Calendar,
    };
    const Icon = iconMap[iconKey];
    return Icon ? <Icon className={className} /> : <span className={className}>•</span>;
}

const colorClasses = {
    emerald: {
        ring: 'ring-emerald-200',
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        accent: 'bg-emerald-500',
        gradFrom: 'from-emerald-500',
        gradTo: 'to-teal-500',
        bgSubtle: 'bg-emerald-50/50',
        ringSubtle: 'ring-emerald-100',
    },
    sky: {
        ring: 'ring-sky-200',
        text: 'text-sky-700',
        bg: 'bg-sky-50',
        accent: 'bg-sky-500',
        gradFrom: 'from-sky-500',
        gradTo: 'to-blue-500',
        bgSubtle: 'bg-sky-50/50',
        ringSubtle: 'ring-sky-100',
    },
    violet: {
        ring: 'ring-violet-200',
        text: 'text-violet-700',
        bg: 'bg-violet-50',
        accent: 'bg-violet-500',
        gradFrom: 'from-violet-500',
        gradTo: 'to-purple-500',
        bgSubtle: 'bg-violet-50/50',
        ringSubtle: 'ring-violet-100',
    },
};

export default function DashboardLayout({ navItems, brandColor = 'emerald', label = 'Dashboard' }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const c = colorClasses[brandColor] || colorClasses.emerald;

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    return (
        <div className="min-h-screen bg-slate-100 lg:flex">
            {/* Mobile top bar */}
            <header className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between sticky top-0 z-30 h-14 shadow-sm">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -ml-1 rounded-lg hover:bg-slate-100"
                    aria-label="Buka menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <Link to="/" className="flex items-center gap-2">
                    <Logo variant="mark" size="sm" />
                    <span className="font-bold text-slate-900 text-sm">PENSNOVA</span>
                </Link>
                <div className="flex items-center gap-1">
                    <NotificationBell variant="light" />
                    <MobileUserMenu user={user} onLogout={logout} brandColor={brandColor} label={label} />
                </div>
            </header>

            {/* Sidebar (desktop) + drawer (mobile) */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-out lg:transform-none lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:z-10 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 flex flex-col`}
            >
                {/* Sidebar header */}
                <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
                    <Link to="/" className="flex items-center gap-2.5 min-w-0">
                        <Logo variant="mark" size="sm" />
                        <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm leading-tight">PENSNOVA</div>
                            <div className={`text-[10px] uppercase tracking-wider font-bold ${c.text}`}>
                                {label}
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
                        aria-label="Tutup menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Sidebar nav */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {navItems.map((n) => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.end}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                                    isActive
                                        ? `${c.bg} ${c.text} font-semibold before:absolute before:inset-y-1.5 before:left-0 before:w-1 ${c.accent} before:rounded-r`
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`
                            }
                        >
                            <NavIcon iconKey={n.icon} className="text-base shrink-0" />
                            <span className="truncate">{n.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar footer — user info */}
                <div className="border-t border-slate-200 p-3 shrink-0 bg-slate-50/50">
                    <Link to="/settings" className="flex items-center gap-2.5 group">
                        <Avatar user={user} brandColor={brandColor} size="md" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate text-slate-900 group-hover:text-primary-700 transition">
                                {user?.name || '—'}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-semibold">
                                {label}
                            </div>
                        </div>
                    </Link>
                    <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-[11px] font-semibold text-slate-700"
                        >
                            <ArrowLeft className="h-3 w-3" /> Beranda
                        </Link>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-rose-600/90 hover:bg-rose-600 text-white text-[11px] font-semibold"
                        >
                            <LogOut className="h-3 w-3" /> Keluar
                        </button>
                    </div>
                </div>
            </aside>

            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
                />
            )}

            <main className="flex-1 min-w-0 flex flex-col pb-16 lg:pb-0">
                {/* Desktop top bar */}
                <header className="hidden lg:flex sticky top-0 z-20 bg-white border-b border-slate-200 px-6 h-14 items-center gap-3 shadow-sm">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary-700 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Beranda Publik</span>
                    </Link>
                    <div className="flex-1" />
                    <NotificationBell variant="light" />
                    <DesktopUserMenu user={user} label={label} brandColor={brandColor} onLogout={logout} />
                </header>

                <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
                    <Outlet />
                </div>
            </main>

            {/* Mobile bottom nav — pakai overflow scroll horizontal kalau > 4 items */}
            <MobileBottomNav navItems={navItems} brandColor={brandColor} />
        </div>
    );
}

function MobileBottomNav({ navItems, brandColor }) {
    const c = colorClasses[brandColor] || colorClasses.emerald;
    const primaryItems = navItems.slice(0, 4);
    const extraItems = navItems.slice(4);
    const [moreOpen, setMoreOpen] = useState(false);
    const location = useLocation();
    const ref = useRef(null);

    useEffect(() => { setMoreOpen(false); }, [location.pathname]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && ! ref.current.contains(e.target)) setMoreOpen(false);
        };
        if (moreOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [moreOpen]);

    return (
        <>
            <nav className="fixed bottom-0 inset-x-0 lg:hidden bg-white border-t border-slate-200 grid grid-cols-5 z-30 shadow-[0_-1px_4px_rgba(0,0,0,0.04)]">
                {primaryItems.map((n) => (
                    <NavLink
                        key={n.to}
                        to={n.to}
                        end={n.end}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition ${
                                isActive ? c.text : 'text-slate-500'
                            }`
                        }
                    >
                        <NavIcon iconKey={n.icon} className="text-lg" />
                        <span className="truncate max-w-full px-1">{n.label}</span>
                    </NavLink>
                ))}
                {extraItems.length > 0 ? (
                    <button
                        onClick={() => setMoreOpen((v) => !v)}
                        className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition ${
                            moreOpen ? c.text : 'text-slate-500'
                        }`}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                        <span>Lainnya</span>
                    </button>
                ) : (
                    navItems[4] && (
                        <NavLink
                            to={navItems[4].to}
                            end={navItems[4].end}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition ${
                                    isActive ? c.text : 'text-slate-500'
                                }`
                            }
                        >
                            <span className="text-lg">{navItems[4].icon || '•'}</span>
                            <span className="truncate max-w-full px-1">{navItems[4].label}</span>
                        </NavLink>
                    )
                )}
            </nav>

            {moreOpen && (
                <>
                    <div onClick={() => setMoreOpen(false)} className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden" />
                    <div
                        ref={ref}
                        className="fixed bottom-14 inset-x-3 z-50 lg:hidden bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-2 grid grid-cols-3 gap-1.5 max-h-[60vh] overflow-y-auto"
                    >
                        {extraItems.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                end={n.end}
                                className={({ isActive }) =>
                                    `flex flex-col items-center text-center gap-1 p-2.5 rounded-lg text-[11px] font-semibold ${
                                        isActive ? `${c.bg} ${c.text}` : 'text-slate-700 hover:bg-slate-50'
                                    }`
                                }
                            >
                                <NavIcon iconKey={n.icon} className="text-xl" />
                                <span className="leading-tight">{n.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}

function Avatar({ user, brandColor = 'emerald', size = 'md' }) {
    const c = colorClasses[brandColor] || colorClasses.emerald;
    const sizes = {
        sm: 'w-7 h-7 text-[11px]',
        md: 'w-9 h-9 text-sm',
        lg: 'w-11 h-11 text-base',
    };
    return (
        <div className={`rounded-full bg-gradient-to-br ${c.gradFrom} ${c.gradTo} flex items-center justify-center text-white font-bold overflow-hidden shrink-0 ${sizes[size] || sizes.md}`}>
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

function DesktopUserMenu({ user, label, brandColor, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const c = colorClasses[brandColor] || colorClasses.emerald;

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && ! ref.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg transition ${open ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
            >
                <Avatar user={user} brandColor={brandColor} size="sm" />
                <div className="hidden md:block text-left">
                    <div className="text-xs font-bold leading-tight text-slate-900 max-w-[180px] truncate">
                        {user?.name}
                    </div>
                    <div className={`text-[10px] font-semibold leading-tight max-w-[180px] truncate ${c.text}`}>
                        {label}
                    </div>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 z-50 overflow-hidden">
                    <div className={`px-4 py-3 ${c.bgSubtle} border-b border-slate-100 flex items-center gap-2.5`}>
                        <Avatar user={user} brandColor={brandColor} size="md" />
                        <div className="min-w-0">
                            <div className="text-sm font-bold truncate">{user?.name}</div>
                            <div className="text-[11px] text-slate-600 truncate">{user?.email}</div>
                            <div className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${c.text}`}>
                                {label}
                            </div>
                        </div>
                    </div>
                    <div className="py-1">
                        <Link
                            to="/settings"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                        >
                            <Settings className="h-4 w-4 text-slate-400" /> Pengaturan Akun
                        </Link>
                    </div>
                    <div className="border-t border-slate-100">
                        <button
                            onClick={() => { setOpen(false); onLogout(); }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-semibold"
                        >
                            <LogOut className="h-4 w-4" /> Keluar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function MobileUserMenu({ user, onLogout, brandColor, label }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const c = colorClasses[brandColor] || colorClasses.emerald;

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && ! ref.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen((v) => !v)} className="p-0.5 rounded-full" aria-label="User menu">
                <Avatar user={user} brandColor={brandColor} size="sm" />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 z-50 overflow-hidden">
                    <div className={`px-3 py-2.5 ${c.bgSubtle} border-b border-slate-100`}>
                        <div className="text-sm font-bold truncate">{user?.name}</div>
                        <div className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>{label}</div>
                    </div>
                    <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50">
                        <Settings className="h-3.5 w-3.5" /> Pengaturan
                    </Link>
                    <button
                        onClick={() => { setOpen(false); onLogout(); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Keluar
                    </button>
                </div>
            )}
        </div>
    );
}
