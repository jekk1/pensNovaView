import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
    Lightbulb, Copyright, Palette, ShieldCheck, Search, Upload, X, FileSpreadsheet,
    CheckCircle2, AlertCircle,
} from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import { Badge } from '../../components/ui/badge';
import Spinner from '../../components/Spinner';

const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

export default function HkiRekap() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ q: '', year: '', work_type: '' });
    const [uploadOpen, setUploadOpen] = useState(false);

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin', 'hki', 'stats'],
        queryFn: () => api.get('/api/admin/hki/stats').then((r) => r.data),
    });

    const { data: workTypes } = useQuery({
        queryKey: ['admin', 'hki', 'work-types'],
        queryFn: () => api.get('/api/admin/hki/work-types').then((r) => r.data.data),
    });

    const { data: list, isLoading: listLoading } = useQuery({
        queryKey: ['admin', 'hki', 'copyrights', filters],
        queryFn: () => api.get('/api/admin/hki/copyrights', { params: { ...filters, per_page: 25 } }).then((r) => r.data),
    });

    const rows = list?.data ?? [];
    const totals = stats?.totals ?? {};

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="h-6 w-6 text-amber-600" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Rekap HKI PENS
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Rekap kekayaan intelektual PENS (Sentra HKI) — Hak Cipta, Paten Sederhana, Desain Industri.
                        Sumber: file Rekap HKI. Upload file terbaru untuk perbarui data otomatis.
                    </p>
                </div>
                <Button onClick={() => setUploadOpen(true)}>
                    <Upload className="h-4 w-4 mr-1" /> Upload Data HKI
                </Button>
            </header>

            {/* STAT CARDS */}
            {statsLoading ? (
                <Spinner className="h-8 w-8 mx-auto text-amber-600 my-8" />
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                        <StatCard label="Total Hak Cipta" value={fmt(totals.hak_cipta)} icon={Copyright} color="sky" />
                        <StatCard label="Total Paten Sederhana" value={fmt(totals.paten_sederhana)} icon={Lightbulb} color="amber" />
                        <StatCard label="Total Desain Industri" value={fmt(totals.desain_industri)} icon={Palette} color="violet" />
                        <StatCard label="Total Dapat Divaluasi" value={fmt(totals.dapat_divaluasi)} icon={ShieldCheck} color="emerald" />
                    </div>

                    {/* CHART per tahun per tipe */}
                    <Card className="mb-5">
                        <CardContent className="p-4">
                            <h3 className="font-bold text-sm mb-3 text-slate-800">Tren HKI per Tahun</h3>
                            <div style={{ width: '100%', height: 320 }}>
                                <ResponsiveContainer>
                                    <BarChart data={stats?.chart ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="hak_cipta" name="Hak Cipta" fill="#0284c7" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="paten_sederhana" name="Paten Sederhana" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="desain_industri" name="Desain Industri" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2">
                                Detail per-record tersedia untuk Hak Cipta 2022-2026 ({fmt(stats?.copyright_detail_count)} record).
                                Paten & Desain Industri: agregat jumlah per tahun.
                            </p>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* DETAIL HAK CIPTA */}
            <Card>
                <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-3 text-slate-800 flex items-center gap-2">
                        <Copyright className="h-4 w-4 text-sky-600" /> Detail Hak Cipta
                    </h3>
                    <div className="flex gap-2 flex-wrap mb-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari judul / pencipta / nomor / jenis..."
                                value={filters.q}
                                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                                className="pl-8"
                            />
                        </div>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            className="border border-slate-200 rounded-md px-3 py-2 text-sm"
                        >
                            <option value="">Semua Tahun</option>
                            {[2026, 2025, 2024, 2023, 2022].map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select
                            value={filters.work_type}
                            onChange={(e) => setFilters({ ...filters, work_type: e.target.value })}
                            className="border border-slate-200 rounded-md px-3 py-2 text-sm max-w-[200px]"
                        >
                            <option value="">Semua Jenis Ciptaan</option>
                            {(workTypes || []).map((w) => (
                                <option key={w.work_type} value={w.work_type}>{w.work_type} ({w.c})</option>
                            ))}
                        </select>
                    </div>

                    {listLoading ? (
                        <Spinner className="h-6 w-6 mx-auto text-sky-600 my-6" />
                    ) : rows.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 py-6">Tidak ada data.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Judul Ciptaan</th>
                                        <th className="px-3 py-2 text-left">Jenis</th>
                                        <th className="px-3 py-2 text-left">Pencipta</th>
                                        <th className="px-3 py-2 text-left">Tahun</th>
                                        <th className="px-3 py-2 text-left">No. Permohonan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50 align-top">
                                            <td className="px-3 py-2 font-medium text-slate-900 max-w-md">{r.title}</td>
                                            <td className="px-3 py-2">
                                                {r.work_type && <Badge variant="secondary" className="text-[10px]">{r.work_type}</Badge>}
                                            </td>
                                            <td className="px-3 py-2 text-slate-600">{r.creator || '—'}</td>
                                            <td className="px-3 py-2 text-slate-600">{r.year}</td>
                                            <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{r.app_id || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {list?.last_page > 1 && (
                                <div className="text-xs text-slate-500 mt-3 text-center">
                                    Halaman {list.current_page} dari {list.last_page} · total {fmt(list.total)} record
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {uploadOpen && (
                <UploadDialog
                    onClose={() => setUploadOpen(false)}
                    onUploaded={() => {
                        qc.invalidateQueries({ queryKey: ['admin', 'hki'] });
                        setUploadOpen(false);
                    }}
                />
            )}
        </div>
    );
}

function UploadDialog({ onClose, onUploaded }) {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);

    const upload = useMutation({
        mutationFn: () => {
            const fd = new FormData();
            fd.append('file', file);
            return api.post('/api/admin/hki/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }).then((r) => r.data);
        },
        onSuccess: (d) => setResult(d),
        onError: (e) => alert('Gagal: ' + (e.response?.data?.message || e.message)),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-600" /> Upload Data HKI
                    </h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>

                {result ? (
                    <div className="space-y-3">
                        <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-lg p-3 flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                            <div className="text-sm text-emerald-900">{result.message}</div>
                        </div>
                        <div className="text-sm text-slate-700 space-y-1">
                            <div><strong>{result.result.copyrights_imported}</strong> detail Hak Cipta dimuat</div>
                            <div><strong>{result.result.summaries_imported}</strong> baris ringkasan dimuat</div>
                            <div className="text-xs text-slate-500 mt-2">Sheet diproses:</div>
                            <ul className="text-xs text-slate-500 list-disc ml-5">
                                {(result.result.sheets_processed || []).map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <Button onClick={onUploaded} className="w-full">Selesai & Refresh</Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-amber-50 ring-1 ring-amber-200 rounded-lg p-3 text-xs text-amber-900 flex gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                                Upload file <strong>Rekap HKI (.xlsx)</strong>. Sistem otomatis baca sheet
                                "Hak Cipta YYYY" (detail) + "Rekap Grafik" (jumlah Paten/Desain/Hak Cipta).
                                Data tipe yang ada di file akan <strong>di-replace</strong>.
                            </div>
                        </div>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setFile(e.target.files?.[0])}
                            className="w-full text-sm border border-slate-200 rounded-lg p-2"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={onClose}>Batal</Button>
                            <Button onClick={() => upload.mutate()} disabled={!file || upload.isPending}>
                                <Upload className="h-4 w-4 mr-1" />
                                {upload.isPending ? 'Memproses…' : 'Upload & Parse'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
