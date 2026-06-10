import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Users, Calendar, TrendingUp, LogIn, LogOut, FilePlus, Edit, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';

/**
 * Admin Activity Logs — audit trail user actions.
 *
 * Filter: user search · action · date range.
 * Table: time, user, action badge, description, IP.
 */

const ACTION_ICONS = {
    login: LogIn,
    logout: LogOut,
    'create.tenant': FilePlus,
    'create.application': FilePlus,
    'update.application': Edit,
    'delete.tenant': Trash2,
};

const ACTION_COLORS = {
    login: 'success',
    logout: 'secondary',
    'create.tenant': 'default',
    'create.application': 'default',
    'update.application': 'warning',
    'delete.tenant': 'destructive',
};

export default function ActivityLogs() {
    const [filters, setFilters] = useState({
        action: '',
        from: '',
        to: '',
        page: 1,
    });

    const { data: stats } = useQuery({
        queryKey: ['admin', 'activity-logs', 'stats'],
        queryFn: () => api.get('/api/admin/activity-logs/stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'activity-logs', filters],
        queryFn: () =>
            api
                .get('/api/admin/activity-logs', {
                    params: {
                        action: filters.action || undefined,
                        from: filters.from || undefined,
                        to: filters.to || undefined,
                        page: filters.page,
                        per_page: 25,
                    },
                })
                .then((r) => r.data),
    });

    const logs = data?.data ?? [];
    const meta = data?.meta ?? data;

    return (
        <div>
            <header className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-7 w-7 text-primary-700" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Activity Logs
                    </h1>
                </div>
                <p className="text-sm text-slate-600">
                    Audit trail aksi user di seluruh PENSNOVA — login, CRUD, status update, dst.
                </p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <StatCard
                    label="Total Activity"
                    value={stats?.total ?? '—'}
                    icon={Activity}
                    color="primary"
                />
                <StatCard
                    label="Hari Ini"
                    value={stats?.today ?? '—'}
                    icon={Calendar}
                    color="emerald"
                />
                <StatCard
                    label="Minggu Ini"
                    value={stats?.this_week ?? '—'}
                    icon={TrendingUp}
                    color="amber"
                />
                <StatCard
                    label="Top Action"
                    value={stats?.top_actions?.[0]?.action || '—'}
                    icon={Users}
                    color="violet"
                />
            </div>

            {/* Filter bar */}
            <Card className="mb-4">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                Action
                            </label>
                            <Input
                                placeholder="login, create.tenant, …"
                                value={filters.action}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, action: e.target.value, page: 1 }))
                                }
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                Dari Tanggal
                            </label>
                            <Input
                                type="date"
                                value={filters.from}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, from: e.target.value, page: 1 }))
                                }
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                Sampai Tanggal
                            </label>
                            <Input
                                type="date"
                                value={filters.to}
                                onChange={(e) =>
                                    setFilters((f) => ({ ...f, to: e.target.value, page: 1 }))
                                }
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setFilters({ action: '', from: '', to: '', page: 1 })
                                }
                                className="w-full"
                            >
                                Reset Filter
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Waktu
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Action
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Deskripsi
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700 hidden md:table-cell">
                                        IP
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-4 py-12 text-center text-slate-500"
                                        >
                                            Memuat...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-4 py-12 text-center text-slate-500"
                                        >
                                            <Activity className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                            Belum ada activity tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => <LogRow key={log.id} log={log} />)
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta && meta.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-200">
                            <span className="text-xs text-slate-500">
                                Halaman {meta.current_page} dari {meta.last_page} ·{' '}
                                {meta.total} total
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filters.page <= 1}
                                    onClick={() =>
                                        setFilters((f) => ({ ...f, page: f.page - 1 }))
                                    }
                                >
                                    ← Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filters.page >= meta.last_page}
                                    onClick={() =>
                                        setFilters((f) => ({ ...f, page: f.page + 1 }))
                                    }
                                >
                                    Next →
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function LogRow({ log }) {
    const Icon = ACTION_ICONS[log.action] || Activity;
    const color = ACTION_COLORS[log.action] || 'secondary';
    const time = new Date(log.created_at).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <tr className="hover:bg-slate-50 transition">
            <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{time}</td>
            <td className="px-4 py-3">
                {log.user ? (
                    <div>
                        <div className="font-semibold text-sm">{log.user.name}</div>
                        <div className="text-xs text-slate-500">{log.user.email}</div>
                    </div>
                ) : (
                    <span className="text-xs italic text-slate-400">System</span>
                )}
            </td>
            <td className="px-4 py-3">
                <Badge variant={color} className="font-mono whitespace-nowrap">
                    <Icon className="h-3 w-3 mr-1 inline" />
                    {log.action}
                </Badge>
            </td>
            <td className="px-4 py-3 text-sm text-slate-700 max-w-md">
                <div className="line-clamp-2">{log.description || '—'}</div>
            </td>
            <td className="px-4 py-3 text-xs text-slate-500 font-mono hidden md:table-cell">
                {log.ip_address || '—'}
            </td>
        </tr>
    );
}
