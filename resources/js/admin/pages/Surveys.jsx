import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ClipboardList, Plus, Eye, Copy, ExternalLink, CheckCircle2, X,
    FileText, TrendingUp, BarChart3, LayoutTemplate, Sparkles, Mail, Send,
    Lock, Unlock,
} from 'lucide-react';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';

const TYPE_LABEL = {
    mrl_external_review: 'MRL External Review',
    tenant_satisfaction: 'Kepuasan Tenant',
    market_validation: 'Validasi Pasar',
    custom: 'Custom',
};

const STATUS_BADGE = {
    draft: { label: 'Draft', variant: 'secondary' },
    active: { label: 'Aktif', variant: 'success' },
    closed: { label: 'Ditutup', variant: 'destructive' },
    archived: { label: 'Diarsipkan', variant: 'secondary' },
};

export default function Surveys() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '', type: '', q: '' });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'surveys', 'stats'],
        queryFn: () => api.get('/api/admin/surveys-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'surveys', filters],
        queryFn: () => api.get('/api/admin/surveys', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    const rows = data?.data ?? [];

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ClipboardList className="h-6 w-6 text-primary-700" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Survey & External Review
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Modul survey fleksibel untuk MRL external review (reviewer luar isi via link tanpa login),
                        kepuasan tenant, validasi pasar, atau survey custom.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowTemplates(true)}>
                        <LayoutTemplate className="h-4 w-4 mr-1" /> Pakai Template
                    </Button>
                    <Button onClick={() => setCreating(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Buat Survey
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <StatCard label="Total Survey" value={stats?.total ?? '—'} icon={ClipboardList} color="primary" />
                <StatCard label="Aktif" value={stats?.active ?? '—'} icon={CheckCircle2} color="emerald" />
                <StatCard label="Total Tanggapan" value={stats?.total_responses ?? '—'} icon={BarChart3} color="amber" />
                <StatCard label="MRL Review" value={stats?.by_type?.mrl_external_review ?? 0} icon={TrendingUp} color="primary" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari judul survey…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Tipe</option>
                        {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <ClipboardList className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <h3 className="font-bold text-sm">Belum ada survey</h3>
                        <p className="text-xs text-slate-500 mt-1">Klik <strong>Buat Survey</strong> untuk mulai.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Judul</th>
                                <th className="px-3 py-2 text-left">Tipe</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-right">Tanggapan</th>
                                <th className="px-3 py-2 text-left">Berakhir</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = STATUS_BADGE[r.status] || STATUS_BADGE.draft;
                                return (
                                    <tr key={r.id} className="hover:bg-amber-50/40">
                                        <td className="px-3 py-2 font-semibold max-w-xs truncate">{r.title}</td>
                                        <td className="px-3 py-2 text-slate-600">{TYPE_LABEL[r.type] || r.type}</td>
                                        <td className="px-3 py-2"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-3 py-2 text-right font-mono font-semibold">
                                            {r.response_count}{r.max_responses ? ` / ${r.max_responses}` : ''}
                                        </td>
                                        <td className="px-3 py-2 text-[11px]">{r.expires_at ? new Date(r.expires_at).toLocaleDateString('id-ID') : '—'}</td>
                                        <td className="px-3 py-2 text-right">
                                            <button onClick={() => setEditing(r.id)} className="text-primary-700 hover:underline font-semibold inline-flex items-center gap-1">
                                                <Eye className="h-3.5 w-3.5" /> Buka
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {creating && <CreateDialog onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setEditing(id); qc.invalidateQueries({ queryKey: ['admin', 'surveys'] }); }} />}
            {editing && <DetailDialog id={editing} onClose={() => setEditing(null)} />}
            {showTemplates && <TemplateGallery onClose={() => setShowTemplates(false)} onCreated={(id) => { setShowTemplates(false); setEditing(id); qc.invalidateQueries({ queryKey: ['admin', 'surveys'] }); qc.invalidateQueries({ queryKey: ['admin', 'surveys', 'stats'] }); }} />}
        </div>
    );
}

function TemplateGallery({ onClose, onCreated }) {
    const { data: templates } = useQuery({
        queryKey: ['admin', 'surveys-templates'],
        queryFn: () => api.get('/api/admin/surveys-templates').then((r) => r.data.data),
    });

    const [activating, setActivating] = useState(null);
    const [formError, setFormError] = useState('');

    const mutation = useMutation({
        mutationFn: ({ key, activate }) => api.post('/api/admin/surveys-from-template', {
            template_key: key,
            activate,
        }),
        onSuccess: (res) => onCreated(res.data.data.id),
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <Backdrop onClose={onClose} title="Library Template Survey" wide>
            <div className="space-y-3">
                <div className="bg-primary-50 border border-primary-200 rounded p-3 text-xs text-primary-900">
                    Pilih template siap pakai. Pertanyaan & konfigurasi sudah diisi sesuai standar (SKM Permenpan-RB, dll).
                </div>
                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}

                {!templates ? (
                    <Spinner className="mx-auto" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {templates.map((tpl) => (
                            <Card key={tpl.key} className="hover:shadow-md transition">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm leading-tight">{tpl.title}</h3>
                                            {tpl.rubric && (
                                                <div className="text-[10px] text-amber-700 mt-0.5 font-semibold">
                                                    <ClipboardList className="h-3 w-3 inline mr-0.5" /> {tpl.rubric}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-3 line-clamp-3 leading-relaxed">
                                        {tpl.description}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3">
                                        <span>{tpl.question_count} pertanyaan</span>
                                        <span>{tpl.allow_anonymous ? <><Unlock className="h-3 w-3 inline mr-0.5" />Anonim OK</> : <><Lock className="h-3 w-3 inline mr-0.5" />Identitas wajib</>}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setFormError(''); setActivating(tpl.key); mutation.mutate({ key: tpl.key, activate: false }); }}
                                            disabled={mutation.isPending}
                                            className="flex-1"
                                        >
                                            {mutation.isPending && activating === tpl.key ? 'Membuat…' : 'Buat sebagai Draft'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => { setFormError(''); setActivating(tpl.key); mutation.mutate({ key: tpl.key, activate: true }); }}
                                            disabled={mutation.isPending}
                                            className="flex-1"
                                        >
                                            Buat & Aktifkan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Backdrop>
    );
}

function CreateDialog({ onClose, onCreated }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'custom',
        status: 'draft',
        allow_anonymous: false,
        max_responses: '',
    });
    const [formError, setFormError] = useState('');

    const mutation = useMutation({
        mutationFn: () => api.post('/api/admin/surveys', {
            ...form,
            max_responses: form.max_responses ? Number(form.max_responses) : null,
        }),
        onSuccess: (res) => onCreated(res.data.data.id),
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <Backdrop onClose={onClose} title="Buat Survey Baru">
            <div className="space-y-3">
                <Field label="Tipe Survey *">
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                        {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {form.type === 'mrl_external_review' && (
                        <div className="text-[10px] text-emerald-700 mt-1">
                            ⓘ Pertanyaan 7 kriteria MRL akan auto-generate. Setelah dijawab reviewer, MrlAssessment ter-update otomatis.
                        </div>
                    )}
                    <div className="text-[10px] text-slate-500 mt-1">
                        Untuk MRL External Review, gunakan tombol "Generate Survey" di detail produk dosen agar otomatis ter-link ke MrlAssessment.
                    </div>
                </Field>
                <Field label="Judul Survey *">
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mis: Validasi pasar IoT pertanian 2026" />
                </Field>
                <Field label="Deskripsi (instruksi untuk responden)">
                    <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Max Tanggapan (opsional)">
                        <Input type="number" min="1" value={form.max_responses} onChange={(e) => setForm({ ...form, max_responses: e.target.value })} placeholder="Tanpa batas" />
                    </Field>
                    <Field label="Status Awal">
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                            <option value="draft">Draft (belum dipublikasi)</option>
                            <option value="active">Aktif (langsung publish)</option>
                        </select>
                    </Field>
                </div>
                <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={form.allow_anonymous} onChange={(e) => setForm({ ...form, allow_anonymous: e.target.checked })} />
                    Boleh tanggapan anonim (tanpa nama/email)
                </label>

                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button onClick={() => { setFormError(''); mutation.mutate(); }} disabled={!form.title || mutation.isPending}>
                        {mutation.isPending ? 'Membuat…' : 'Buat'}
                    </Button>
                </div>
            </div>
        </Backdrop>
    );
}

function DetailDialog({ id, onClose }) {
    const qc = useQueryClient();
    const [tab, setTab] = useState('info');
    const [copied, setCopied] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'surveys', id],
        queryFn: () => api.get(`/api/admin/surveys/${id}`).then((r) => r.data),
    });

    const { data: responses } = useQuery({
        queryKey: ['admin', 'surveys', id, 'responses'],
        queryFn: () => api.get(`/api/admin/surveys/${id}/responses`).then((r) => r.data.data),
        enabled: tab === 'responses',
    });

    const survey = data?.data;
    const publicUrl = data?.public_url;

    const updateMutation = useMutation({
        mutationFn: (changes) => api.patch(`/api/admin/surveys/${id}`, changes),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'surveys', id] });
            qc.invalidateQueries({ queryKey: ['admin', 'surveys'] });
        },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    if (isLoading || !survey) {
        return <Backdrop onClose={onClose} title="Memuat…" wide><Spinner className="mx-auto" /></Backdrop>;
    }

    const copyLink = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Backdrop onClose={onClose} title={survey.title} wide>
            {/* Public URL banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-emerald-700" />
                    <strong className="text-sm text-emerald-900">Public URL Survey</strong>
                    <Badge variant={survey.status === 'active' ? 'success' : 'secondary'}>{STATUS_BADGE[survey.status]?.label}</Badge>
                </div>
                <div className="bg-white rounded p-2 font-mono text-[11px] break-all border border-emerald-200">
                    {publicUrl}
                </div>
                <div className="flex gap-2 mt-2">
                    <button onClick={copyLink} className="text-[11px] px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1">
                        {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? 'Tersalin!' : 'Copy Link'}
                    </button>
                    <a href={publicUrl} target="_blank" rel="noopener" className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Preview
                    </a>
                    {survey.status !== 'active' && (
                        <button onClick={() => updateMutation.mutate({ status: 'active' })} className="text-[11px] px-2 py-1 rounded bg-primary-600 hover:bg-primary-700 text-white font-semibold ml-auto">
                            Aktifkan Survey
                        </button>
                    )}
                    {survey.status === 'active' && (
                        <button onClick={() => updateMutation.mutate({ status: 'closed' })} className="text-[11px] px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold ml-auto">
                            Tutup Survey
                        </button>
                    )}
                </div>
            </div>

            <div className="border-b border-slate-200 flex gap-1 mb-4">
                {[
                    ['info', 'Info'],
                    ['questions', `Pertanyaan (${survey.config?.questions?.length || 0})`],
                    ['responses', `Tanggapan (${survey.response_count})`],
                    ['reviewers', `Reviewer (${survey.invited_emails?.length || 0})`],
                ].map(([k, label]) => (
                    <button
                        key={k}
                        onClick={() => setTab(k)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                            tab === k ? 'border-primary-700 text-primary-700' : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'info' && (
                <div className="space-y-3 text-sm">
                    <Info label="Tipe" value={TYPE_LABEL[survey.type] || survey.type} />
                    <Info label="Deskripsi" value={survey.description || '—'} multiline />
                    <Info label="Maks Tanggapan" value={survey.max_responses ? `${survey.response_count} / ${survey.max_responses}` : `${survey.response_count} (tanpa batas)`} />
                    <Info label="Berakhir" value={survey.expires_at ? new Date(survey.expires_at).toLocaleString('id-ID') : '—'} />
                    <Info label="Anonim" value={survey.allow_anonymous ? 'Ya' : 'Tidak'} />
                    <Info label="Dibuat oleh" value={survey.creator?.name || '—'} />
                </div>
            )}

            {tab === 'questions' && (
                <div className="space-y-3">
                    {survey.config?.questions?.map((q, i) => (
                        <div key={i} className="bg-white border rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded">{q.type}</span>
                                <div className="flex-1">
                                    {q.label ? (
                                        <>
                                            <div className="font-semibold text-sm">{q.label}{q.required && <span className="text-rose-600 ml-1">*</span>}</div>
                                            {q.description && <div className="text-[11px] text-slate-600 mt-0.5">{q.description}</div>}
                                            {q.weight && <div className="text-[10px] text-amber-700 mt-0.5">Bobot: {q.weight}</div>}
                                        </>
                                    ) : (
                                        <div className="text-xs text-slate-600 italic">{q.content || JSON.stringify(q)}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'responses' && (
                <ResponsesTab responses={responses} questions={survey.config?.questions || []} />
            )}

            {tab === 'reviewers' && (
                <ReviewersTab survey={survey} surveyId={id} />
            )}
        </Backdrop>
    );
}

function ReviewersTab({ survey, surveyId }) {
    const qc = useQueryClient();
    const [bulkText, setBulkText] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const invitations = survey.invited_emails || [];

    const send = useMutation({
        mutationFn: (payload) => api.post(`/api/admin/surveys/${surveyId}/send-invitations`, payload).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['admin', 'surveys', surveyId] });
            qc.invalidateQueries({ queryKey: ['admin', 'surveys'] });
            alert(res.message);
            setBulkText('');
            setCustomMessage('');
        },
        onError: (err) => alert(err.response?.data?.message || 'Gagal kirim undangan.'),
    });

    const parseAndSend = () => {
        // Parse format "Name <email@x.com>" atau "email@x.com" per line
        const lines = bulkText.split(/[\n,;]/).map((l) => l.trim()).filter(Boolean);
        const parsed = lines.map((line) => {
            const match = line.match(/^(.+?)\s*<\s*([^>]+@[^>]+)\s*>$/);
            if (match) return { name: match[1].trim(), email: match[2].trim() };
            if (line.includes('@')) return { email: line };
            return null;
        }).filter(Boolean);

        if (parsed.length === 0) return alert('Format tidak valid. Pakai "Nama <email@x.com>" per baris atau email saja.');
        send.mutate({ invitations: parsed, custom_message: customMessage || null });
    };

    const respondedCount = invitations.filter((i) => i.responded_at).length;

    return (
        <div className="space-y-4">
            <div className="bg-sky-50 ring-1 ring-sky-200 rounded-lg p-3 text-xs text-sky-900">
                <strong>Cara pakai:</strong> Tambah daftar reviewer (1 per baris, format <code>Nama Lengkap &lt;email@domain.com&gt;</code> atau cukup email).
                Klik "Kirim Undangan" — email + link survey ter-kirim otomatis. Status "responded" akan auto-update saat reviewer submit jawaban.
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
                <Stat label="Total Diundang" value={invitations.length} />
                <Stat label="Sudah Merespons" value={`${respondedCount} / ${invitations.length}`} tone="emerald" />
            </div>

            {invitations.length > 0 && (
                <div>
                    <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">Reviewer Terdaftar</div>
                    <div className="space-y-2">
                        {invitations.map((inv, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white ring-1 ring-slate-200 rounded p-2 text-sm">
                                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate">{inv.name || inv.email}</div>
                                    {inv.name && <div className="text-[11px] text-slate-500 truncate">{inv.email}</div>}
                                </div>
                                <div className="text-[11px]">
                                    {inv.responded_at ? (
                                        <Badge variant="success" className="text-[10px]">
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Merespons
                                        </Badge>
                                    ) : inv.sent_at ? (
                                        <Badge variant="secondary" className="text-[10px]">Terkirim {new Date(inv.sent_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Badge>
                                    ) : (
                                        <Badge variant="warning" className="text-[10px]">Pending</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t pt-4">
                <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">Tambah / Kirim Ulang Undangan</div>
                <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    rows={4}
                    placeholder={`Dr. Budi Hartono <budi@bnpb.go.id>\nNurul Hidayati <nurul@kemenkes.go.id>\ndirektur@industri.id`}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm font-mono"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                    1 per baris. Format <code>Nama &lt;email&gt;</code> atau email saja.
                </div>

                <div className="mt-3">
                    <label className="text-xs font-semibold text-slate-700">Pesan Tambahan (opsional)</label>
                    <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={2}
                        placeholder="Mis: Tim UPA mengundang Anda sebagai reviewer karena keahlian di bidang IoT industrial."
                        className="w-full rounded-md border border-slate-300 p-2 text-sm mt-1"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-3">
                    <Button onClick={parseAndSend} disabled={send.isPending || ! bulkText.trim()}>
                        <Send className="h-4 w-4 mr-1" /> {send.isPending ? 'Mengirim…' : 'Kirim Undangan'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value, tone = 'slate' }) {
    const colors = {
        slate: 'bg-slate-50 ring-slate-200 text-slate-800',
        emerald: 'bg-emerald-50 ring-emerald-200 text-emerald-800',
    };
    return (
        <div className={`rounded-lg ring-1 p-3 ${colors[tone]}`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{label}</div>
        </div>
    );
}

function ResponsesTab({ responses, questions }) {
    const rows = responses?.data || [];

    if (rows.length === 0) {
        return (
            <div className="text-center py-10 text-sm text-slate-600">
                Belum ada tanggapan masuk.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {rows.map((r) => (
                <Card key={r.id}>
                    <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                                <div className="font-semibold text-sm">{r.respondent_name || '(Anonim)'}</div>
                                <div className="text-[11px] text-slate-500">
                                    {r.respondent_email} {r.respondent_affiliation && `· ${r.respondent_affiliation}`}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500">{new Date(r.submitted_at).toLocaleString('id-ID')}</div>
                                {r.computed_score && (
                                    <Badge variant="success" className="mt-1">Skor: {Number(r.computed_score).toFixed(2)}</Badge>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1 text-xs">
                            {Object.entries(r.answers || {}).map(([key, val]) => {
                                const q = questions.find((qu) => qu.key === key);
                                if (!q || q.type === 'intro') return null;
                                return (
                                    <div key={key} className="flex gap-2">
                                        <span className="text-slate-500 flex-shrink-0 min-w-[140px]">{q.label || key}:</span>
                                        <span className="font-semibold">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function Info({ label, value, multiline }) {
    return (
        <div className="bg-slate-50 rounded p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
            <div className={`text-sm mt-0.5 ${multiline ? 'whitespace-pre-line' : ''}`}>{value || '—'}</div>
        </div>
    );
}

function Backdrop({ children, onClose, title, wide = false }) {
    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className={`w-full bg-white shadow-2xl flex flex-col h-full overflow-hidden ${wide ? 'max-w-3xl' : 'max-w-xl'}`} onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight truncate pr-3">{title}</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200 flex-shrink-0"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return <div><label className="text-xs font-semibold text-slate-700 block mb-1">{label}</label>{children}</div>;
}
