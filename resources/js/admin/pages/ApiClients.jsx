import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import Spinner from '../../components/Spinner';

export default function ApiClients() {
    const qc = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [newToken, setNewToken] = useState(null); // {plaintext, name} — ditampilkan SEKALI

    const { data: list, isLoading } = useQuery({
        queryKey: ['admin', 'api-clients'],
        queryFn: () => api.get('/api/admin/api-clients').then((r) => r.data.data),
    });
    const { data: scopes } = useQuery({
        queryKey: ['admin', 'api-clients', 'scopes'],
        queryFn: () => api.get('/api/admin/api-clients-scopes').then((r) => r.data.data),
        staleTime: 60 * 60_000,
    });

    const revokeMutation = useMutation({
        mutationFn: (id) => api.post(`/api/admin/api-clients/${id}/revoke`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'api-clients'] }),
        onError: (e) => alert(apiErrorMessage(e)),
    });
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/admin/api-clients/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'api-clients'] }),
        onError: (e) => alert(apiErrorMessage(e)),
    });

    return (
        <div>
            <header className="mb-6 flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">API Clients</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Token untuk consumer eksternal akses <code className="text-xs bg-slate-100 px-1 rounded">/api/v1/*</code>{' '}
                        (Wirau, mobile, future apps). Token plaintext hanya muncul sekali saat dibuat — simpan baik-baik.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm"
                >
                    + Buat Token Baru
                </button>
            </header>

            {newToken && <TokenRevealDialog token={newToken} onClose={() => setNewToken(null)} />}

            {showCreate && (
                <CreateDialog
                    scopes={scopes || {}}
                    onClose={() => setShowCreate(false)}
                    onCreated={(res) => {
                        setShowCreate(false);
                        setNewToken({ plaintext: res.token, name: res.data.name });
                        qc.invalidateQueries({ queryKey: ['admin', 'api-clients'] });
                    }}
                />
            )}

            {isLoading ? (
                <div className="text-center py-12"><Spinner className="h-6 w-6 text-primary-700 mx-auto" /></div>
            ) : (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Nama</th>
                                    <th className="px-4 py-3 text-left font-semibold">Token Prefix</th>
                                    <th className="px-4 py-3 text-left font-semibold">Scopes</th>
                                    <th className="px-4 py-3 text-left font-semibold">Rate/min</th>
                                    <th className="px-4 py-3 text-left font-semibold">Usage</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(list || []).length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-slate-500">
                                        Belum ada API Client. Klik "Buat Token Baru" untuk mulai.
                                    </td></tr>
                                ) : (list || []).map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-900">{c.name}</div>
                                            {c.description && <div className="text-xs text-slate-500 mt-0.5">{c.description}</div>}
                                            {c.created_by && <div className="text-[10px] text-slate-400 mt-0.5">dibuat oleh {c.created_by.name}</div>}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{c.token_prefix}…</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {c.scopes.map((s) => (
                                                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{c.rate_limit_per_minute}</td>
                                        <td className="px-4 py-3 text-xs">
                                            <div className="font-semibold">{c.usage_count} calls</div>
                                            {c.last_used_at && (
                                                <div className="text-slate-500 mt-0.5">
                                                    Terakhir: {new Date(c.last_used_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                </div>
                                            )}
                                            {c.last_used_ip && <div className="text-slate-400 text-[10px]">{c.last_used_ip}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.is_active ? (
                                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700">● Aktif</span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-700">● Revoked</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {c.is_active && (
                                                    <button
                                                        onClick={() => { if (confirm(`Revoke "${c.name}"? Token tidak bisa dipakai lagi.`)) revokeMutation.mutate(c.id); }}
                                                        className="text-xs px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold"
                                                    >Revoke</button>
                                                )}
                                                <button
                                                    onClick={() => { if (confirm(`Hapus PERMANEN "${c.name}"? Tidak bisa di-undo.`)) deleteMutation.mutate(c.id); }}
                                                    className="text-xs px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
                                                >Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-6 p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 text-sm">Cara pakai (consumer)</div>
                <div>
                    Auth header: <code className="bg-white px-1.5 py-0.5 rounded font-mono">Authorization: Bearer pns_&lt;token&gt;</code> atau{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded font-mono">X-API-KEY: pns_&lt;token&gt;</code>
                </div>
                <div>
                    Manifest endpoint (no auth): <a href="/api/v1" target="_blank" rel="noreferrer" className="text-primary-700 hover:underline">GET /api/v1</a>
                </div>
                <div>
                    Test token: <code className="bg-white px-1.5 py-0.5 rounded font-mono">curl -H "Authorization: Bearer pns_xxx" https://pensnova.org/api/v1/me</code>
                </div>
            </div>
        </div>
    );
}

function CreateDialog({ scopes, onClose, onCreated }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedScopes, setSelectedScopes] = useState([]);
    const [rateLimit, setRateLimit] = useState(60);
    const [formError, setFormError] = useState('');

    const createMutation = useMutation({
        mutationFn: (payload) => api.post('/api/admin/api-clients', payload).then((r) => r.data),
        onSuccess: (data) => onCreated(data),
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    function toggleScope(s) {
        setSelectedScopes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    }

    function handleSubmit() {
        setFormError('');
        if (!name.trim()) { setFormError('Nama wajib diisi.'); return; }
        if (selectedScopes.length === 0) { setFormError('Pilih minimal 1 scope.'); return; }
        createMutation.mutate({
            name: name.trim(),
            description: description.trim() || null,
            scopes: selectedScopes,
            rate_limit_per_minute: Number(rateLimit) || 60,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-extrabold mb-4">Buat API Client Baru</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nama</label>
                        <input value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="cth: Wirau Production"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi (opsional)</label>
                        <input value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="cth: Token untuk wira.pensnova.org tarik data tenant"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Scopes</label>
                        <div className="space-y-1 max-h-48 overflow-y-auto p-2 ring-1 ring-slate-200 rounded-lg">
                            {Object.entries(scopes || {}).map(([s, desc]) => (
                                <label key={s} className="flex items-start gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                                    <input type="checkbox" checked={selectedScopes.includes(s)} onChange={() => toggleScope(s)}
                                        className="mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <code className="text-xs font-mono font-bold">{s}</code>
                                        <div className="text-[11px] text-slate-600">{desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Rate Limit (request/menit)</label>
                        <input type="number" min="1" max="6000" value={rateLimit} onChange={(e) => setRateLimit(e.target.value)}
                            className="w-32 px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    </div>
                    {formError && <div className="text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100">Batal</button>
                    <button onClick={handleSubmit} disabled={createMutation.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm disabled:opacity-60">
                        {createMutation.isPending && <Spinner className="h-4 w-4" />}
                        Buat Token
                    </button>
                </div>
            </div>
        </div>
    );
}

function TokenRevealDialog({ token, onClose }) {
    const [copied, setCopied] = useState(false);
    function copyToken() {
        navigator.clipboard.writeText(token.plaintext);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🔑</span>
                    <h2 className="text-lg font-extrabold">Token "{token.name}" berhasil dibuat</h2>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 ring-1 ring-amber-200 text-amber-900 text-xs mb-4">
                    <strong>⚠️ SIMPAN SEKARANG.</strong> Token plaintext ini <strong>hanya muncul sekali</strong>.
                    Setelah dialog ini ditutup, tidak ada cara recovery — kamu harus bikin token baru kalau hilang.
                </div>
                <div className="p-3 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs break-all mb-3">
                    {token.plaintext}
                </div>
                <button onClick={copyToken}
                    className="w-full px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm">
                    {copied ? '✓ Tersalin!' : '📋 Salin Token'}
                </button>
                <button onClick={onClose} className="w-full mt-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100">
                    Saya sudah simpan, tutup
                </button>
            </div>
        </div>
    );
}
