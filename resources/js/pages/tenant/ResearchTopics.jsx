import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FlaskConical, Pencil, Trash2, Globe, Lock } from 'lucide-react';
import api, { formatApiError } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import Spinner from '../../components/Spinner';

export default function ResearchTopics() {
    const toast = useToast();
    const qc = useQueryClient();
    const [dialog, setDialog] = useState({ open: false, editing: null });

    const { data, isLoading } = useQuery({
        queryKey: ['tenant', 'research-topics'],
        queryFn: () => api.get('/api/tenant/research-topics').then((r) => r.data),
    });

    const topics = data?.data || data || [];

    const save = useMutation({
        mutationFn: (form) =>
            form.id
                ? api.put(`/api/tenant/research-topics/${form.id}`, form)
                : api.post('/api/tenant/research-topics', form),
        onSuccess: () => {
            toast.success(dialog.editing ? 'Topik diperbarui' : 'Topik dibuat');
            qc.invalidateQueries({ queryKey: ['tenant', 'research-topics'] });
            setDialog({ open: false, editing: null });
        },
        onError: (err) => toast.error(formatApiError(err)),
    });

    const remove = useMutation({
        mutationFn: (id) => api.delete(`/api/tenant/research-topics/${id}`),
        onSuccess: () => {
            toast.success('Topik dihapus');
            qc.invalidateQueries({ queryKey: ['tenant', 'research-topics'] });
        },
    });

    return (
        <div>
            <header className="mb-5 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FlaskConical className="h-7 w-7 text-violet-700" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Topik Riset
                        </h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        Topik riset terapan yang dibuka untuk kolaborasi industri.
                    </p>
                </div>
                <Button onClick={() => setDialog({ open: true, editing: null })}>
                    <Plus className="h-4 w-4" />
                    Tambah Topik
                </Button>
            </header>

            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <Spinner className="h-8 w-8 text-violet-600" />
                </div>
            ) : topics.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FlaskConical className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-bold text-base">Belum ada topik riset</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                            Tambahkan topik untuk menarik perhatian industri & investor.
                        </p>
                        <Button onClick={() => setDialog({ open: true, editing: null })}>
                            <Plus className="h-4 w-4" />
                            Buat Topik Pertama
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topics.map((t) => (
                        <TopicCard
                            key={t.id}
                            topic={t}
                            onEdit={() => setDialog({ open: true, editing: t })}
                            onDelete={() => {
                                if (confirm(`Hapus topik "${t.title}"?`)) remove.mutate(t.id);
                            }}
                        />
                    ))}
                </div>
            )}

            <TopicDialog
                open={dialog.open}
                editing={dialog.editing}
                onClose={() => setDialog({ open: false, editing: null })}
                onSave={(form) => save.mutate(form)}
                saving={save.isPending}
            />
        </div>
    );
}

function TopicCard({ topic, onEdit, onDelete }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-tight">
                        {topic.title}
                    </h3>
                    <div className="flex items-center gap-1">
                        {topic.open_for_collaboration ? (
                            <Badge variant="success" className="text-[10px]">
                                <Globe className="h-3 w-3 mr-0.5" /> Open
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-[10px]">
                                <Lock className="h-3 w-3 mr-0.5" /> Private
                            </Badge>
                        )}
                        {topic.is_published && (
                            <Badge variant="default" className="text-[10px]">Published</Badge>
                        )}
                    </div>
                </div>
                {topic.abstract && (
                    <p className="text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                        {topic.abstract}
                    </p>
                )}
                {topic.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {topic.keywords.slice(0, 5).map((kw) => (
                            <span
                                key={kw}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>TRL: {topic.technology_readiness || '—'}</span>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={onEdit}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={onDelete}
                            className="text-rose-600 hover:bg-rose-50"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TopicDialog({ open, editing, onClose, onSave, saving }) {
    const [form, setForm] = useState({
        title: editing?.title || '',
        abstract: editing?.abstract || '',
        keywords: editing?.keywords?.join(', ') || '',
        sectors: editing?.sectors?.join(', ') || '',
        technology_readiness: editing?.technology_readiness || 3,
        open_for_collaboration: editing?.open_for_collaboration ?? true,
        is_published: editing?.is_published ?? false,
    });

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit Topik' : 'Tambah Topik Riset'}</DialogTitle>
                    <DialogDescription>
                        Topik yang di-publish & open-for-collab akan muncul di matchmaking engine.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const payload = {
                            ...form,
                            id: editing?.id,
                            keywords: form.keywords
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            sectors: form.sectors
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                        };
                        onSave(payload);
                    }}
                    className="space-y-3"
                >
                    <div>
                        <Label htmlFor="title">Judul Riset *</Label>
                        <Input
                            id="title"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="abstract">Abstrak</Label>
                        <textarea
                            id="abstract"
                            rows={4}
                            value={form.abstract}
                            onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="keywords">Keywords (pisah koma)</Label>
                            <Input
                                id="keywords"
                                placeholder="iot, ai, machine learning"
                                value={form.keywords}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, keywords: e.target.value }))
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="sectors">Sektor (pisah koma)</Label>
                            <Input
                                id="sectors"
                                placeholder="agritech, healthtech"
                                value={form.sectors}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, sectors: e.target.value }))
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="trl">TRL (1-9)</Label>
                            <Input
                                id="trl"
                                type="number"
                                min="1"
                                max="9"
                                value={form.technology_readiness}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        technology_readiness: Number(e.target.value),
                                    }))
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.open_for_collaboration}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        open_for_collaboration: e.target.checked,
                                    }))
                                }
                            />
                            Open untuk kolaborasi industri
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.is_published}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, is_published: e.target.checked }))
                                }
                            />
                            Publish ke direktori publik
                        </label>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Spinner className="h-4 w-4" />}
                            Simpan
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
