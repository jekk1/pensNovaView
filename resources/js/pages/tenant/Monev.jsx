import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Award } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Spinner from '../../components/Spinner';

const STAGE_LABEL = {
    monev_1: 'Monev I — Pertengahan Inkubasi',
    monev_2: 'Monev II — Akhir / Kelulusan',
};

const STATUS_LABEL = {
    scheduled: { label: 'Terjadwal', variant: 'secondary' },
    in_progress: { label: 'Berlangsung', variant: 'warning' },
    completed: { label: 'Selesai', variant: 'success' },
    cancelled: { label: 'Dibatalkan', variant: 'destructive' },
};

export default function TenantMonev() {
    const { data, isLoading } = useQuery({
        queryKey: ['tenant', 'monev'],
        queryFn: () => api.get('/api/tenant/monev-assessments').then((r) => r.data),
    });

    const assessments = data?.data || data || [];

    return (
        <div>
            <header className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <ClipboardCheck className="h-7 w-7 text-emerald-700" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Monev Inkubasi</h1>
                </div>
                <p className="text-sm text-slate-600">
                    Penilaian formal program inkubasi dari tim Monev PENS Sky Venture. Kelulusan: skor minimal 80.
                </p>
            </header>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner className="h-8 w-8 text-emerald-600" /></div>
            ) : assessments.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <ClipboardCheck className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-bold text-base">Belum ada Monev terjadwal</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Tim Monev akan menjadwalkan penilaian 2 kali per batch (pertengahan & akhir).
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {assessments.map((a) => (
                        <AssessmentCard key={a.id} assessment={a} />
                    ))}
                </div>
            )}
        </div>
    );
}

function AssessmentCard({ assessment: a }) {
    const status = STATUS_LABEL[a.status] || STATUS_LABEL.scheduled;
    const items = a.score_items || [];

    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <h3 className="font-bold text-base">{STAGE_LABEL[a.stage] || a.stage}</h3>
                        <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {a.scheduled_at ? new Date(a.scheduled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                            </span>
                            {a.assessor && <span>Pemeriksa: <strong>{a.assessor.name}</strong></span>}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {a.total_score !== null && a.total_score !== undefined && (
                            <div className="flex items-center gap-1.5 mt-1">
                                {a.passed ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-rose-600" />
                                )}
                                <span className="font-mono font-extrabold text-lg">
                                    {Number(a.total_score).toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500">/100</span>
                            </div>
                        )}
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="border rounded-lg overflow-hidden mt-3">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-[10px] uppercase">
                                <tr>
                                    <th className="px-2 py-1.5 text-left">Uraian</th>
                                    <th className="px-2 py-1.5 text-left">Target</th>
                                    <th className="px-2 py-1.5 text-right">Bobot</th>
                                    <th className="px-2 py-1.5 text-right">Skor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((it) => (
                                    <tr key={it.id}>
                                        <td className="px-2 py-1.5">
                                            <div className="font-semibold">{it.kpi_label}</div>
                                            <div className="text-[10px] text-slate-500">{it.kpi_indicator}</div>
                                        </td>
                                        <td className="px-2 py-1.5 text-slate-600">{it.target || '—'}</td>
                                        <td className="px-2 py-1.5 text-right font-mono">{Number(it.weight)}%</td>
                                        <td className="px-2 py-1.5 text-right font-mono font-semibold">
                                            {it.score !== null && it.score !== undefined ? Number(it.score).toFixed(2) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {a.notes && (
                    <div className="mt-3 text-xs">
                        <div className="font-semibold text-slate-700 mb-0.5">Catatan Tim Monev:</div>
                        <p className="text-slate-600 leading-relaxed">{a.notes}</p>
                    </div>
                )}

                {a.recommendation && (
                    <div className="mt-3 text-xs bg-amber-50 border border-amber-200 rounded p-2">
                        <div className="font-semibold text-amber-900 mb-0.5 flex items-center gap-1">
                            <Award className="h-3 w-3" /> Rekomendasi:
                        </div>
                        <p className="text-amber-800 leading-relaxed">{a.recommendation}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
