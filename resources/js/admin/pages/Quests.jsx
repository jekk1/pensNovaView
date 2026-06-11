import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';

/**
 * Admin CRUD page untuk Quest gamifikasi.
 * Bisa bikin quest custom ad-hoc untuk event tertentu (Demo Day, KMI Expo, dll).
 */
export default function AdminQuests() {
    const qc = useQueryClient();
    const [status, setStatus] = useState('active');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'quests', status],
        queryFn: () => api.get('/api/admin/quests', { params: { status } }).then((r) => r.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/admin/quests/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'quests'] }),
        onError: (e) => alert(apiErrorMessage(e)),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, is_active }) => api.patch(`/api/admin/quests/${id}`, { is_active }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'quests'] }),
        onError: (e) => alert(apiErrorMessage(e)),
    });

    const quests = data?.data?.data ?? [];
    const eventKeys = data?.event_keys ?? {};

    return (
        <div>
            <header className="mb-6 flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Quest Gamifikasi</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Kelola quest mingguan dan custom untuk event tertentu (Demo Day, KMI Expo). Quest yang sedang aktif akan tampil di Dashboard Tenant.
                    </p>
                </div>
                <button
                    onClick={() => { setEditing(null); setShowForm(true); }}
                    className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm"
                >
                    + Buat Quest Baru
                </button>
            </header>

            {/* Filter tabs */}
            <div className="mb-4 flex gap-1 border-b border-slate-200">
                {[
                    { key: 'active', label: 'Aktif' },
                    { key: 'upcoming', label: 'Akan Datang' },
                    { key: 'past', label: 'Selesai' },
                    { key: 'inactive', label: 'Nonaktif' },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setStatus(t.key)}
                        className={`px-4 py-2 text-sm font-bold border-b-2 transition ${
                            status === t.key
                                ? 'border-primary-700 text-primary-800'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="bg-white rounded-xl p-8 text-center text-slate-500">Memuat...</div>
            ) : quests.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-slate-500">
                    <p>Tidak ada quest dengan filter ini.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="text-left px-4 py-3">Quest</th>
                                <th className="text-left px-4 py-3">Event Key</th>
                                <th className="text-center px-4 py-3">Target</th>
                                <th className="text-center px-4 py-3">XP</th>
                                <th className="text-left px-4 py-3">Periode</th>
                                <th className="text-center px-4 py-3">Status</th>
                                <th className="text-right px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {quests.map((q) => (
                                <tr key={q.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{q.icon || '—'}</span>
                                            <div>
                                                <div className="font-bold text-slate-900">{q.name}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{q.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        <code className="bg-slate-100 px-1.5 py-0.5 rounded">{q.event_key}</code>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold">{q.target_count}</td>
                                    <td className="px-4 py-3 text-center font-bold text-amber-700">+{q.xp_reward}</td>
                                    <td className="px-4 py-3 text-xs">
                                        <div>{new Date(q.starts_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                        <div className="text-slate-500">→ {new Date(q.ends_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => toggleMutation.mutate({ id: q.id, is_active: ! q.is_active })}
                                            className={`text-xs px-2 py-1 rounded font-bold ${
                                                q.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {q.is_active ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => { setEditing(q); setShowForm(true); }}
                                                className="text-xs px-2 py-1 rounded text-primary-700 hover:bg-primary-50 font-bold"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => confirm(`Hapus quest "${q.name}"?`) && deleteMutation.mutate(q.id)}
                                                className="text-xs px-2 py-1 rounded text-rose-600 hover:bg-rose-50 font-bold"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <QuestFormModal
                    quest={editing}
                    eventKeys={eventKeys}
                    onClose={() => setShowForm(false)}
                    onSaved={() => {
                        setShowForm(false);
                        qc.invalidateQueries({ queryKey: ['admin', 'quests'] });
                    }}
                />
            )}
        </div>
    );
}

function QuestFormModal({ quest, eventKeys, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: quest?.name ?? '',
        description: quest?.description ?? '',
        icon: quest?.icon ?? '—',
        event_key: quest?.event_key ?? Object.keys(eventKeys)[0] ?? 'login',
        target_count: quest?.target_count ?? 1,
        xp_reward: quest?.xp_reward ?? 100,
        starts_at: quest?.starts_at ? quest.starts_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
        ends_at: quest?.ends_at ? quest.ends_at.slice(0, 16) : new Date(Date.now() + 7*86400_000).toISOString().slice(0, 16),
        is_active: quest?.is_active ?? true,
    });

    const saveMutation = useMutation({
        mutationFn: () => quest
            ? api.patch(`/api/admin/quests/${quest.id}`, form)
            : api.post('/api/admin/quests', form),
        onSuccess: onSaved,
        onError: (e) => alert(apiErrorMessage(e)),
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="p-5 border-b border-slate-200">
                    <h2 className="text-xl font-extrabold">{quest ? 'Edit Quest' : 'Quest Baru'}</h2>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-3">
                        <Field label="Icon">
                            <input type="text" value={form.icon} onChange={(e) => setForm({...form, icon: e.target.value})} maxLength={4} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-center text-2xl" />
                        </Field>
                        <Field label="Nama Quest" required>
                            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required maxLength={150} className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                        </Field>
                    </div>
                    <Field label="Deskripsi" required>
                        <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required maxLength={500} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                    </Field>
                    <Field label="Event Trigger" required>
                        <select value={form.event_key} onChange={(e) => setForm({...form, event_key: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300">
                            {Object.entries(eventKeys).map(([k, v]) => (
                                <option key={k} value={k}>{v} <span className="text-slate-400">({k})</span></option>
                            ))}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Target Count" required>
                            <input type="number" min={1} max={1000} value={form.target_count} onChange={(e) => setForm({...form, target_count: Number(e.target.value)})} required className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                        </Field>
                        <Field label="XP Reward" required>
                            <input type="number" min={10} max={10000} value={form.xp_reward} onChange={(e) => setForm({...form, xp_reward: Number(e.target.value)})} required className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Mulai" required>
                            <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({...form, starts_at: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                        </Field>
                        <Field label="Selesai" required>
                            <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({...form, ends_at: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                        </Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({...form, is_active: e.target.checked})} />
                        Aktifkan quest ini
                    </label>
                </div>
                <div className="p-5 border-t border-slate-200 flex gap-2 justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm">Batal</button>
                    <button type="submit" disabled={saveMutation.isPending} className="px-5 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm disabled:opacity-60">
                        {saveMutation.isPending ? 'Menyimpan...' : (quest ? 'Update' : 'Buat Quest')}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, required, children }) {
    return (
        <label className="block">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {label}{required && <span className="text-rose-600 ml-0.5">*</span>}
            </div>
            {children}
        </label>
    );
}
