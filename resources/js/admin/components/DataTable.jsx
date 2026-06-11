import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Spinner from '../../components/Spinner';

/**
 * DataTable generic untuk admin CRUD pages.
 * Density-optimized: tighter row, smaller toolbar, sticky header.
 *
 * Props:
 *   resource          : string  - "sectors", dst (path API: /api/admin/{resource})
 *   columns           : array of { key, label, render?, sortable?, align? }
 *   filters?          : array of { key, label, type, options? }
 *   defaultPerPage?   : number (default 25)
 *   onEdit, onCreate  : callbacks
 *   newButtonLabel?   : string
 */
export default function DataTable({
    resource,
    columns,
    filters = [],
    defaultPerPage = 25,
    onEdit,
    onCreate,
    newButtonLabel = 'Tambah',
}) {
    const qc = useQueryClient();
    const toast = useToast();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(defaultPerPage);
    const [q, setQ] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [sortBy, setSortBy] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const params = {
        page,
        per_page: perPage,
        q: q || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        ...filterValues,
    };

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['admin', resource, params],
        queryFn: () => api.get(`/api/admin/${resource}`, { params }).then((r) => r.data),
        keepPreviousData: true,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/admin/${resource}/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', resource] });
            toast.success('Data berhasil dihapus');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Gagal menghapus'),
    });

    function toggleSort(key) {
        if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else {
            setSortBy(key);
            setSortDir('asc');
        }
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="px-3 py-2.5 border-b border-slate-200 flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                        type="search"
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Cari…"
                        className="w-full pl-8 pr-3 h-8 rounded-md border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    />
                </div>

                {filters.map((f) => (
                    <select
                        key={f.key}
                        value={filterValues[f.key] || ''}
                        onChange={(e) => {
                            setFilterValues({
                                ...filterValues,
                                [f.key]: e.target.value || undefined,
                            });
                            setPage(1);
                        }}
                        className="h-8 px-2 rounded-md border border-slate-300 text-xs"
                    >
                        <option value="">{f.label}: Semua</option>
                        {f.options.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                ))}

                {onCreate && (
                    <Button onClick={onCreate} size="sm" className="ml-auto h-8">
                        <Plus className="h-3.5 w-3.5" />
                        {newButtonLabel}
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider sticky top-0">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-3 py-2 font-bold ${
                                        col.align === 'right' ? 'text-right' :
                                        col.align === 'center' ? 'text-center' :
                                        'text-left'
                                    } ${col.sortable !== false ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                                    onClick={() => col.sortable !== false && toggleSort(col.key)}
                                    style={{ width: col.width }}
                                >
                                    <div className={`flex items-center gap-1 ${
                                        col.align === 'right' ? 'justify-end' :
                                        col.align === 'center' ? 'justify-center' :
                                        ''
                                    }`}>
                                        {col.label}
                                        {col.sortable !== false && (
                                            sortBy === col.key ? (
                                                <span className="text-[10px] text-primary-700">
                                                    {sortDir === 'asc' ? '▲' : '▼'}
                                                </span>
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 text-slate-300" />
                                            )
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-3 py-2 text-right font-bold w-[100px]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center py-10">
                                    <Spinner className="h-5 w-5 mx-auto text-primary-700" />
                                </td>
                            </tr>
                        ) : (data?.data || []).length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="text-center py-10 text-slate-500 text-xs"
                                >
                                    <div className="text-slate-400 text-sm mb-1">—</div>
                                    Tidak ada data.
                                </td>
                            </tr>
                        ) : (
                            data.data.map((row) => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-amber-50/40 transition-colors group"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-3 py-2 align-middle ${
                                                col.align === 'right' ? 'text-right' :
                                                col.align === 'center' ? 'text-center' :
                                                ''
                                            }`}
                                        >
                                            {col.render
                                                ? col.render(row)
                                                : row[col.key] ?? (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                        </td>
                                    ))}
                                    <td className="px-3 py-2 text-right whitespace-nowrap">
                                        <div className="inline-flex gap-0.5">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="inline-flex items-center justify-center h-7 w-7 rounded-md text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    confirm(
                                                        `Hapus "${row.name || row.email || row.title || row.id}"?`
                                                    ) && deleteMutation.mutate(row.id)
                                                }
                                                className="inline-flex items-center justify-center h-7 w-7 rounded-md text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data && (data.last_page > 1 || data.total > 0) && (
                <div className="px-3 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
                    <div className="text-xs text-slate-600">
                        <strong>{data.from || 0}</strong>–<strong>{data.to || 0}</strong> dari{' '}
                        <strong>{data.total || 0}</strong>
                        {isFetching && (
                            <span className="ml-2 text-slate-400 italic">memuat…</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(+e.target.value);
                                setPage(1);
                            }}
                            className="text-[10px] h-7 px-1.5 rounded border border-slate-300"
                        >
                            {[10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n}/hal
                                </option>
                            ))}
                        </select>
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-300 disabled:opacity-40 hover:bg-white"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs text-slate-700 px-2 font-semibold">
                            {data.current_page} / {data.last_page}
                        </span>
                        <button
                            disabled={page >= data.last_page}
                            onClick={() => setPage(page + 1)}
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-300 disabled:opacity-40 hover:bg-white"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
