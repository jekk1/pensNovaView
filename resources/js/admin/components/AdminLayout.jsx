import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutGrid, Palette, ClipboardList, Rocket, Calendar, Users, FileText,
    Target, BarChart3, GraduationCap, MessageSquare, Handshake, Link2, FilePlus,
    Briefcase, Activity, UserCog, Menu, X, Home, ArrowLeft, ChevronDown, ChevronRight,
    LogOut, Settings, ClipboardCheck, FileBadge, FileSignature, Lightbulb, FlaskConical,
    Cog, DollarSign, TrendingUp, Sparkles, Building2, Award, ShieldCheck, Key, Trophy,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import Logo from '../../components/Logo';
import NotificationBell from '../../components/NotificationBell';
import GlobalSearch from './GlobalSearch';
import Breadcrumb from '../../components/Breadcrumb';

const FULL_ACCESS_ROLES = ['super-admin', 'stp-admin', 'kepala-upa', 'sekretaris'];

const navGroups = [
    {
        key: 'overview',
        title: 'Overview',
        items: [
            { to: '/admin', label: 'Dashboard UPA', icon: LayoutGrid, end: true },
        ],
    },
    {
        key: 'techno',
        title: 'Technopreneurship',
        subtitle: 'Inkubator, sewa ruang, spin-off',
        items: [
            { to: '/admin/workspace', label: 'Sewa Ruang', icon: Building2 },
            { to: '/admin/tenants', label: 'Tenant', icon: Users },
            { to: '/admin/applications', label: 'Pendaftaran', icon: FileText },
            { to: '/admin/monev-assessments', label: 'Penilaian Inkubasi', icon: ClipboardCheck },
            { to: '/admin/tenant-needs', label: 'Kebutuhan Tenant', icon: ClipboardList },
            { to: '/admin/research-topics', label: 'Topik Riset', icon: FilePlus },
            { to: '/admin/milestones', label: 'Milestone', icon: Target },
            { to: '/admin/progress-reports', label: 'Laporan Progress', icon: BarChart3 },
            { to: '/admin/certifications', label: 'Legalitas & Sertifikasi', icon: FileBadge },
            { to: '/admin/graduations', label: 'Kelulusan Tenant', icon: GraduationCap },
            { to: '/admin/program-certificates', label: 'Sertifikat Peserta', icon: Award },
            { to: '/admin/alumni-insights', label: 'Alumni Insights', icon: Sparkles },
        ],
    },
    {
        key: 'kam',
        title: 'Knowledge Asset Management',
        subtitle: 'Komersialisasi HKI, royalti',
        items: [
            { to: '/admin/patents', label: 'Portofolio Paten', icon: Lightbulb },
            { to: '/admin/hki-rekap', label: 'Rekap HKI (Sentra)', icon: ShieldCheck },
            { to: '/admin/license-deals', label: 'Deal Lisensi', icon: DollarSign },
            { to: '/admin/royalty-payments', label: 'Royalti Masuk', icon: TrendingUp },
        ],
    },
    {
        key: 'ari',
        title: 'Applied Research & Innovation',
        subtitle: 'TKT/MRL, produk inovasi',
        items: [
            { to: '/admin/research-products', label: 'Produk Dosen', icon: FlaskConical },
            { to: '/admin/trl-assessments', label: 'Pengukuran TKT', icon: TrendingUp },
            { to: '/admin/mrl-assessments', label: 'Pengukuran MRL', icon: Lightbulb },
            { to: '/admin/product-inquiries', label: 'Inquiry Komersialisasi', icon: Sparkles },
        ],
    },
    {
        key: 'tcd',
        title: 'Tech Deployment & Partnership',
        subtitle: 'R&D industri, jasa lab',
        items: [
            { to: '/admin/partnerships', label: 'Kerjasama / MoU', icon: FileSignature },
            { to: '/admin/partner-companies', label: 'Mitra Industri', icon: Handshake },
            { to: '/admin/investors', label: 'Investor', icon: Briefcase },
            { to: '/admin/match-records', label: 'Match Records', icon: Link2 },
            { to: '/admin/collaborations', label: 'Kolaborasi B2B', icon: Handshake },
            { to: '/admin/meeting-requests', label: 'Permintaan Meeting', icon: Calendar },
            { to: '/admin/company-interests', label: 'Minat Kolaborasi', icon: Target },
            { to: '/admin/rd-projects', label: 'Proyek R&D Industri', icon: Cog },
            { to: '/admin/lab-services', label: 'Katalog Jasa Lab', icon: FlaskConical },
        ],
    },
    {
        key: 'mentoring',
        title: 'Mentoring',
        items: [
            { to: '/admin/mentors', label: 'Mentor', icon: GraduationCap },
            { to: '/admin/mentoring-sessions', label: 'Sesi Mentoring', icon: MessageSquare },
        ],
    },
    {
        key: 'master',
        title: 'Master Data',
        items: [
            { to: '/admin/sectors', label: 'Sektor', icon: Palette },
            { to: '/admin/incubation-phases', label: 'Tahap Inkubasi', icon: ClipboardList },
            { to: '/admin/tenant-stages', label: 'Tahap Produk', icon: Rocket },
            { to: '/admin/batches', label: 'Batch', icon: Calendar },
        ],
    },
    {
        key: 'system',
        title: 'Sistem',
        items: [
            { to: '/admin/users', label: 'Pengguna', icon: UserCog },
            { to: '/admin/surveys', label: 'Survey & Review', icon: ClipboardList },
            { to: '/admin/activity-logs', label: 'Activity Logs', icon: Activity },
            { to: '/admin/api-clients', label: 'API Clients', icon: Key },
            { to: '/admin/quests', label: '🎯 Quest Gamifikasi', icon: Trophy },
        ],
    },
];

const ROLE_GROUP_ACCESS = {
    'kadiv-techno': ['overview', 'techno', 'mentoring'],
    'kadiv-tcd': ['overview', 'tcd'],
    'kadiv-kam': ['overview', 'kam'],
    'kadiv-ari': ['overview', 'ari'],
};

function filterNavGroups(userRoles) {
    if (userRoles.some((r) => FULL_ACCESS_ROLES.includes(r))) return navGroups;
    const allowed = new Set();
    userRoles.forEach((r) => (ROLE_GROUP_ACCESS[r] || []).forEach((k) => allowed.add(k)));
    return navGroups.filter((g) => allowed.has(g.key));
}

const ROLE_LABEL = {
    'kepala-upa': 'Kepala UPA',
    'super-admin': 'Super Admin',
    'stp-admin': 'Admin',
    'sekretaris': 'Sekretaris UPA',
    'kadiv-techno': 'Kadiv Technopreneurship',
    'kadiv-tcd': 'Kadiv Tech Deployment',
    'kadiv-kam': 'Kadiv Knowledge Asset',
    'kadiv-ari': 'Kadiv Applied Research',
};

function roleLabel(roles) {
    for (const r of roles) if (ROLE_LABEL[r]) return ROLE_LABEL[r];
    return roles[0] || '—';
}

// localStorage helper untuk persist group collapse state
const COLLAPSE_KEY = 'pensnova:admin:collapsed-groups';
const loadCollapsed = () => {
    try {
        return new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '[]'));
    } catch { return new Set(); }
};
const saveCollapsed = (set) => {
    try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...set])); } catch {}
};

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState(() => loadCollapsed());

    const userRoles = Array.isArray(user?.roles) ? user.roles : [];
    const visibleGroups = filterNavGroups(userRoles);
    const userRoleDisplay = roleLabel(userRoles);

    // Tutup mobile sidebar saat route berubah
    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    const toggleGroup = (key) => {
        setCollapsedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            saveCollapsed(next);
            return next;
        });
    };

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
                <Link to="/admin" className="flex items-center gap-2">
                    <Logo variant="mark" size="sm" />
                    <span className="font-bold text-slate-900 text-sm">PENSNOVA</span>
                </Link>
                <div className="flex items-center gap-1">
                    <NotificationBell variant="light" />
                    <MobileUserMenu user={user} userRoleDisplay={userRoleDisplay} onLogout={logout} />
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-100 transform transition-transform duration-200 ease-out lg:transform-none lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:z-10 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 flex flex-col`}
            >
                {/* Sidebar header */}
                <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
                    <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
                        <Logo variant="mark" size="sm" />
                        <div className="min-w-0">
                            <div className="font-bold text-white text-sm leading-tight">PENSNOVA</div>
                            <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                                Admin Panel
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                        aria-label="Tutup menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Sidebar nav */}
                <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3">
                    {visibleGroups.map((group) => {
                        const isCollapsible = group.items.length > 1;
                        const isCollapsed = isCollapsible && collapsedGroups.has(group.key);

                        return (
                            <div key={group.key}>
                                {group.key !== 'overview' && (
                                    <button
                                        onClick={() => isCollapsible && toggleGroup(group.key)}
                                        className={`w-full px-2 py-1.5 flex items-center gap-1.5 text-left ${isCollapsible ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                                    >
                                        {isCollapsible && (
                                            <ChevronRight
                                                className={`h-3 w-3 text-slate-500 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-tight">
                                                {group.title}
                                            </div>
                                            {group.subtitle && ! isCollapsed && (
                                                <div className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                                                    {group.subtitle}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )}
                                <div className={`space-y-0.5 transition-all ${isCollapsed ? 'hidden' : ''}`}>
                                    {group.items.map((n, idx) => {
                                        const Icon = n.icon;
                                        if (n.comingSoon) {
                                            return (
                                                <div
                                                    key={`${group.key}-${idx}`}
                                                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed select-none"
                                                    title="Modul ini sedang disiapkan"
                                                >
                                                    <Icon className="h-4 w-4 flex-shrink-0 opacity-60" />
                                                    <span className="truncate flex-1">{n.label}</span>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold uppercase tracking-wider flex-shrink-0">
                                                        Soon
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <NavLink
                                                key={n.to}
                                                to={n.to}
                                                end={n.end}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                                                        isActive
                                                            ? 'bg-primary-700/40 text-white before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:bg-amber-400 before:rounded-r'
                                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                    }`
                                                }
                                            >
                                                <Icon className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{n.label}</span>
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Sidebar footer — user info */}
                <div className="border-t border-slate-800 p-3 shrink-0 bg-slate-900/95">
                    <Link
                        to="/settings"
                        className="flex items-center gap-2.5 group"
                    >
                        <Avatar user={user} size="md" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate text-white group-hover:text-amber-300 transition">
                                {user?.name || '—'}
                            </div>
                            <div className="text-[10px] text-amber-400 truncate uppercase tracking-wider font-bold">
                                {userRoleDisplay}
                            </div>
                        </div>
                    </Link>
                    <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200"
                        >
                            <Home className="h-3 w-3" /> Beranda
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

            <main className="flex-1 min-w-0 flex flex-col">
                {/* Desktop top bar */}
                <header className="hidden lg:flex sticky top-0 z-20 bg-white border-b border-slate-200 px-6 h-14 items-center gap-3 shadow-sm">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary-700 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition flex-shrink-0"
                        title="Kembali ke beranda publik"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Beranda Publik</span>
                    </Link>
                    <div className="h-5 w-px bg-slate-200 flex-shrink-0" />
                    <Breadcrumb className="flex-1 min-w-0 text-sm" />
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <GlobalSearch />
                        <NotificationBell variant="light" />
                        <DesktopUserMenu
                            user={user}
                            userRoleDisplay={userRoleDisplay}
                            onLogout={logout}
                        />
                    </div>
                </header>

                <div className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function Avatar({ user, size = 'md' }) {
    const sizes = {
        sm: 'w-7 h-7 text-[11px]',
        md: 'w-9 h-9 text-sm',
        lg: 'w-11 h-11 text-base',
    };
    return (
        <div className={`rounded-full bg-gradient-to-br from-primary-600 to-amber-500 flex items-center justify-center text-white font-bold overflow-hidden ring-2 ring-white/10 shrink-0 ${sizes[size] || sizes.md}`}>
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

function DesktopUserMenu({ user, userRoleDisplay, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

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
                <Avatar user={user} size="sm" />
                <div className="hidden md:block text-left">
                    <div className="text-xs font-bold leading-tight text-slate-900 max-w-[180px] truncate">
                        {user?.name}
                    </div>
                    <div className="text-[10px] text-primary-700 font-semibold leading-tight max-w-[180px] truncate">
                        {userRoleDisplay}
                    </div>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-br from-primary-50 to-amber-50 border-b border-slate-100 flex items-center gap-2.5">
                        <Avatar user={user} size="md" />
                        <div className="min-w-0">
                            <div className="text-sm font-bold truncate text-slate-900">{user?.name}</div>
                            <div className="text-[11px] text-slate-600 truncate">{user?.email}</div>
                            <div className="text-[10px] text-primary-700 font-semibold uppercase tracking-wider mt-0.5">
                                {userRoleDisplay}
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
                        <Link
                            to="/"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                        >
                            <Home className="h-4 w-4 text-slate-400" /> Beranda Publik
                        </Link>
                    </div>
                    <div className="border-t border-slate-100">
                        <button
                            onClick={() => {
                                setOpen(false);
                                onLogout();
                            }}
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

function MobileUserMenu({ user, userRoleDisplay, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

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
                className="p-0.5 rounded-full"
                aria-label="User menu"
            >
                <Avatar user={user} size="sm" />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 z-50 overflow-hidden">
                    <div className="px-3 py-2.5 bg-gradient-to-br from-primary-50 to-amber-50 border-b border-slate-100">
                        <div className="text-sm font-bold truncate">{user?.name}</div>
                        <div className="text-[10px] text-primary-700 font-semibold uppercase tracking-wider">
                            {userRoleDisplay}
                        </div>
                    </div>
                    <Link
                        to="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50"
                    >
                        <Settings className="h-3.5 w-3.5" /> Pengaturan
                    </Link>
                    <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50"
                    >
                        <Home className="h-3.5 w-3.5" /> Beranda Publik
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
