import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import PageHero from '../../components/PageHero';
import {
    FlaskConical, Search, CheckCircle2, ShieldCheck, Clock, ArrowRight,
    X, Send, AlertCircle, Building2,
} from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import Animate from '../../components/Animate';

const UNIT_LABEL = {
    per_sample: 'per sampel',
    per_hour: 'per jam',
    per_day: 'per hari',
    per_project: 'per proyek',
};

const fmtIDR = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

export default function LabServicesCatalog() {
    const [q, setQ] = useState('');
    const [selected, setSelected] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['public', 'lab-services'],
        queryFn: () => api.get('/api/public/lab-services').then((r) => r.data.data ?? []),
    });

    const services = (data || []).filter((s) =>
        ! q || s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.lab_name?.toLowerCase().includes(q.toLowerCase())
    );

    // Group by lab
    const byLab = services.reduce((acc, s) => {
        const lab = s.lab_name || 'Lainnya';
        if (! acc[lab]) acc[lab] = [];
        acc[lab].push(s);
        return acc;
    }, {});

    return (
        <div className="bg-slate-50">
            <PageHero
                eyebrow="🧪 Divisi Tech Deployment"
                title="Katalog"
                accent="Jasa Lab"
                titleAfter=" PENS"
                subtitle="Peralatan lab Politeknik Elektronika Negeri Surabaya terbuka untuk pengujian, sertifikasi, R&D, dan layanan teknis industri. Pola layanan mengikuti standar ITS LPPM dan UI Sains-Tek."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

            <div className="mb-6 max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari jasa lab atau nama lab..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm"
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton.Card key={i} />)}
                </div>
            ) : services.length === 0 ? (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-12 text-center">
                    <FlaskConical className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-600">Belum ada jasa lab yang dipublish.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(byLab).map(([labName, items]) => (
                        <section key={labName}>
                            <h2 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-sky-600" /> {labName}
                                <span className="text-xs text-slate-500 font-normal">({items.length} jasa)</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((s, i) => (
                                    <Animate key={s.id} variant="scale-in" delay={(i % 3) + 1}>
                                        <button
                                            onClick={() => setSelected(s)}
                                            className="group bg-white rounded-2xl p-5 ring-1 ring-slate-200 hover:ring-sky-400 hover:shadow-md transition text-left flex flex-col card-lift h-full w-full"
                                        >
                                            <h3 className="font-bold text-base text-slate-900 group-hover:text-sky-700 line-clamp-2 mb-2">{s.name}</h3>
                                            <p className="text-xs text-slate-600 line-clamp-3 mb-3 flex-1">{s.description}</p>
                                            {(s.certifications || []).length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {s.certifications.slice(0, 3).map((c, idx) => (
                                                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold inline-flex items-center gap-0.5">
                                                            <ShieldCheck className="h-2.5 w-2.5" /> {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 w-full mt-auto">
                                                <div>
                                                    <div className="font-bold text-sky-700 text-sm">{fmtIDR(s.base_price)}</div>
                                                    <div className="text-[10px] text-slate-500">{UNIT_LABEL[s.unit]}</div>
                                                </div>
                                                {s.typical_duration_days && (
                                                    <div className="text-[10px] text-slate-600 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {s.typical_duration_days} hari
                                                    </div>
                                                )}
                                                <ArrowRight className="h-4 w-4 text-sky-600 group-hover:translate-x-0.5 transition" />
                                            </div>
                                        </button>
                                    </Animate>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            <div className="mt-10 bg-gradient-to-br from-sky-50 to-primary-50 ring-1 ring-sky-200 rounded-2xl p-6 sm:p-8 text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-2">Butuh layanan khusus tidak ada di katalog?</h2>
                <p className="text-sm text-slate-700 max-w-2xl mx-auto mb-4">
                    Hubungi Divisi Tech Deployment &amp; Partnership UPA untuk request <strong>custom R&amp;D project</strong>,
                    contract research, atau pengujian khusus.
                </p>
                <a
                    href="mailto:penssky.inkubator@div.pens.ac.id?subject=Inquiry Custom Lab Service"
                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-bold text-sm transition"
                >
                    Hubungi UPA
                </a>
            </div>

            {selected && <OrderDialog service={selected} onClose={() => setSelected(null)} />}
            </div>
        </div>
    );
}

function OrderDialog({ service, onClose }) {
    const [form, setForm] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        client_organization: '',
        requirements: '',
        quantity: 1,
        sample_description: '',
    });
    const [success, setSuccess] = useState(false);

    const submit = useMutation({
        mutationFn: () => api.post(`/api/public/lab-services/${service.slug}/order`, form).then((r) => r.data),
        onSuccess: () => setSuccess(true),
        onError: (err) => alert(err.response?.data?.message || 'Gagal kirim.'),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold">{success ? 'Permintaan Terkirim' : `Request Quote — ${service.name}`}</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>

                {success ? (
                    <div className="p-6 text-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                        <h4 className="font-bold mb-2">Terima kasih!</h4>
                        <p className="text-sm text-slate-600">
                            Tim Divisi <strong>Tech Deployment &amp; Partnership</strong> UPA PENS akan menghubungi Anda dengan
                            <strong> quote dalam 2-3 hari kerja</strong>.
                        </p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-semibold">Tutup</button>
                    </div>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); submit.mutate(); }} className="p-5 space-y-3 overflow-y-auto">
                        <div className="bg-sky-50 ring-1 ring-sky-200 rounded-lg p-3 text-xs">
                            <div><strong>Jasa:</strong> {service.name}</div>
                            <div><strong>Lab:</strong> {service.lab_name}</div>
                            <div><strong>Tarif dasar:</strong> {fmtIDR(service.base_price)} {UNIT_LABEL[service.unit]}</div>
                            <div className="text-slate-600 mt-1 italic">Quote final akan dikirim setelah review oleh lab pengampu.</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Nama Lengkap *"><input required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></Field>
                            <Field label="Email *"><input type="email" required value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></Field>
                            <Field label="Telepon"><input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></Field>
                            <Field label="Organisasi"><input value={form.client_organization} onChange={(e) => setForm({ ...form, client_organization: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></Field>
                        </div>
                        <Field label="Jumlah Sampel"><input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></Field>
                        <Field label="Deskripsi Sampel">
                            <textarea rows="2" value={form.sample_description} onChange={(e) => setForm({ ...form, sample_description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Jenis sampel, dimensi, kondisi, dll" />
                        </Field>
                        <Field label="Persyaratan / Detail Permintaan *">
                            <textarea required minLength="20" rows="4" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Spesifikasi uji yang dibutuhkan, standar yang harus dipenuhi (min. 20 karakter)" />
                        </Field>
                        {submit.isError && (
                            <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded flex items-start gap-1">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                {submit.error?.response?.data?.message || 'Gagal kirim.'}
                            </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 mt-3">
                            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded hover:bg-slate-100">Batal</button>
                            <button type="submit" disabled={submit.isPending} className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold inline-flex items-center gap-1 disabled:opacity-50">
                                <Send className="h-4 w-4" /> {submit.isPending ? 'Mengirim…' : 'Kirim Permintaan'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
            {children}
        </div>
    );
}

/*
## PENJELASAN CODE:

### LabServicesCatalog()
- Fungsi: Komponen halaman katalog layanan jasa pengujian lab PENS bagi mitra industri.
- Parameter: Tidak ada.
- Return: Elemen visual JSX katalog jasa lab.
- Cara pakai: <LabServicesCatalog />
- Catatan: Menambahkan visual card-lift dan staggered Animate untuk merender daftar jasa secara halus.

### OrderDialog(props)
- Fungsi: Modal dialog formulir permintaan quote untuk jasa lab tertentu.
- Parameter: props (object) - service, onClose.
- Return: Elemen JSX modal dialog.
- Cara pakai: <OrderDialog service={selected} onClose={handleClose} />
- Catatan: Dilengkapi validasi minimal karakter deskripsi dan integrasi mutation API.

### Field(props)
- Fungsi: Wrapper input dengan label form.
- Parameter: props (object) - label, children.
- Return: Elemen JSX form field.
- Cara pakai: <Field label="Nama"><input /></Field>
- Catatan: Layout kompak untuk penyusunan form responsif.
*/
