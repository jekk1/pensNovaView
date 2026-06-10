import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Download, FolderArchive, X, Lock, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

export default function TenantDocuments() {
    const qc = useQueryClient();
    const [uploadOpen, setUploadOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['tenant', 'documents'],
        queryFn: () => api.get('/api/tenant/documents').then((r) => r.data),
    });

    const docs = data?.data ?? [];
    const allCats = data?.categories ?? {};
    const selfCats = data?.self_upload_categories ?? {};

    // Group by category
    const grouped = docs.reduce((acc, d) => {
        const key = d.category || 'other';
        (acc[key] ||= []).push(d);
        return acc;
    }, {});

    const download = async (id, filename) => {
        try {
            const r = await api.get(`/api/tenant/documents/${id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([r.data]));
            const a = window.document.createElement('a');
            a.href = url; a.download = filename || 'document';
            window.document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (e) { alert('Gagal download: ' + (e.response?.data?.message || e.message)); }
    };

    return (
        <>
            <header className="mb-5 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FolderArchive className="h-7 w-7 text-emerald-700" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Document Vault</h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        Repository terpusat untuk legalitas, kontrak, sertifikat, dan dokumen tim Anda.
                    </p>
                </div>
                <button
                    onClick={() => setUploadOpen(true)}
                    className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold inline-flex items-center"
                >
                    <Upload className="h-4 w-4 mr-1" /> Upload Dokumen
                </button>
            </header>

            <div className="bg-amber-50 ring-1 ring-amber-200 rounded-2xl p-3 mb-5 text-xs text-amber-900 flex gap-2">
                <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                    <strong>Privasi:</strong> Dokumen disimpan terenkripsi di server UPA — hanya admin UPA & tim tenant Anda yang bisa akses.
                    Dokumen legal & kontrak hanya di-upload oleh admin UPA. Tim Anda bisa upload pitch deck / business plan / laporan keuangan sendiri.
                </div>
            </div>

            {isLoading ? (
                <Spinner className="h-8 w-8 mx-auto text-emerald-600" />
            ) : docs.length === 0 ? (
                <div className="bg-white ring-1 ring-slate-200 rounded-2xl p-8 text-center">
                    <FolderArchive className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <h3 className="font-bold">Vault kosong</h3>
                    <p className="text-sm text-slate-500 mt-1">Upload pitch deck atau dokumen lain untuk mulai mengisi vault.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(grouped).map(([cat, items]) => (
                        <section key={cat} className="bg-white ring-1 ring-slate-200 rounded-2xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                <h2 className="font-bold text-sm text-slate-800">{allCats[cat] || cat}</h2>
                                <div className="text-xs text-slate-500">{items.length} dokumen</div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {items.map((d) => (
                                    <div key={d.id} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                                        <FileText className="h-5 w-5 text-primary-600 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-slate-900 truncate">{d.title}</div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {d.filename} · {Math.round(d.size / 1024)} KB ·
                                                Upload oleh {d.uploader?.name || 'admin'} ·
                                                {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => download(d.id, d.filename)}
                                            className="px-2 py-1 rounded hover:bg-slate-100 text-primary-700 text-xs font-semibold inline-flex items-center"
                                        >
                                            <Download className="h-3 w-3 mr-1" /> Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {uploadOpen && (
                <UploadDialog
                    onClose={() => setUploadOpen(false)}
                    onUploaded={() => {
                        qc.invalidateQueries({ queryKey: ['tenant', 'documents'] });
                        setUploadOpen(false);
                    }}
                    categories={selfCats}
                />
            )}
        </>
    );
}

function UploadDialog({ onClose, onUploaded, categories }) {
    const [form, setForm] = useState({ category: 'pitchdeck', title: '', file: null });

    const upload = useMutation({
        mutationFn: () => {
            const fd = new FormData();
            fd.append('category', form.category);
            if (form.title) fd.append('title', form.title);
            fd.append('file', form.file);
            return api.post('/api/tenant/documents', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => onUploaded(),
        onError: (e) => alert('Gagal upload: ' + (e.response?.data?.message || e.message)),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Upload Dokumen</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-700">Kategori</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                        >
                            {Object.entries(categories).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700">Judul (opsional)</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Mis: Pitch Deck v3 — Mei 2026"
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700">File <span className="text-rose-600">*</span></label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] })}
                            className="w-full mt-1 text-sm"
                        />
                        <div className="text-[10px] text-slate-500 mt-1">
                            PDF / Office / Image (JPG, PNG). Max 10 MB.
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
                    <button onClick={onClose} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-sm">Batal</button>
                    <button
                        onClick={() => upload.mutate()}
                        disabled={! form.file || upload.isPending}
                        className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold disabled:opacity-50 inline-flex items-center"
                    >
                        <Upload className="h-4 w-4 mr-1" />
                        {upload.isPending ? 'Uploading…' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}
