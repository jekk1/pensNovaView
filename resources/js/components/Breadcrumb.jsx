import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb — auto-generated dari URL path.
 *
 * /admin/applications/123 → Home > Admin > Applications > 123
 * Custom labels via prop `labels` map: { 'applications': 'Pendaftaran' }
 */

const DEFAULT_LABELS = {
    admin: 'Admin',
    dashboard: 'Dashboard',
    tenant: 'Tenant',
    mentor: 'Mentor',
    investor: 'Investor',
    sectors: 'Sektor',
    'incubation-phases': 'Tahap Inkubasi',
    'tenant-stages': 'Tahap Produk',
    batches: 'Batch',
    tenants: 'Tenant',
    applications: 'Pendaftaran',
    'research-topics': 'Topik Riset',
    milestones: 'Milestone',
    'progress-reports': 'Laporan Progress',
    mentors: 'Mentor',
    investors: 'Investor',
    'partner-companies': 'Perusahaan Mitra',
    'company-interests': 'Minat Kolaborasi',
    'mentoring-sessions': 'Sesi Mentoring',
    'match-records': 'Match Records',
    collaborations: 'Kolaborasi',
    'meeting-requests': 'Permintaan Meeting',
    'activity-logs': 'Activity Logs',
    users: 'Pengguna',
    sessions: 'Sesi',
    research: 'Topik Riset',
    meetings: 'Meeting',
    settings: 'Pengaturan',
};

export default function Breadcrumb({ labels = {}, className = '' }) {
    const location = useLocation();
    const segments = location.pathname.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    const items = segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = labels[seg] || DEFAULT_LABELS[seg] || seg;
        return { path, label, isLast: i === segments.length - 1 };
    });

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-1 text-xs text-slate-500 ${className}`}
        >
            <Link
                to="/"
                className="inline-flex items-center hover:text-primary-700 transition"
                title="Beranda"
            >
                <Home className="h-3.5 w-3.5" />
            </Link>
            {items.map((item) => (
                <span key={item.path} className="inline-flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                    {item.isLast ? (
                        <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                            {item.label}
                        </span>
                    ) : (
                        <Link
                            to={item.path}
                            className="hover:text-primary-700 transition truncate max-w-[120px]"
                        >
                            {item.label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    );
}
