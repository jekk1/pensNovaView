import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Sparkles, ShieldCheck, TrendingUp, Lightbulb, Building2, Mail, Phone,
    ArrowLeft, CheckCircle2, Users, BadgeCheck, Send, X,
} from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import Skeleton from '../../components/Skeleton';

const INTEREST_OPTIONS = [
    { value: 'license', label: 'Lisensi penggunaan' },
    { value: 'purchase', label: 'Pembelian / pengadaan' },
    { value: 'research_collab', label: 'Riset kolaboratif' },
    { value: 'distribution', label: 'Distribusi / reseller' },
    { value: 'other', label: 'Lainnya' },
];

export default function InnovationDetail() {
    const { slug } = useParams();
    const [showForm, setShowForm] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['public', 'innovation', slug],
        queryFn: () => api.get(`/api/public/innovations/${slug}`).then((r) => r.data.data),
    });

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <Skeleton height="h-4" width="w-32" className="mb-4" />
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 mb-5">
                    <Skeleton height="h-8" width="w-3/4" className="mb-3" />
                    <Skeleton height="h-4" width="w-1/2" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-3"><Skeleton.Card /><Skeleton.Card /></div>
                    <Skeleton.Card />
                </div>
            </div>
        );
    }
    if (! data) return <div className="max-w-3xl mx-auto p-8 text-center text-slate-500">Produk tidak ditemukan.</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Link to="/produk-inovasi" className="text-sm text-primary-700 hover:underline inline-flex items-center mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke katalog
            </Link>

            <header className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 sm:p-8 mb-5">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {data.is_commercialized ? (
                        <span className="text-xs px-2 py-1 rounded bg-violet-100 text-violet-800 font-semibold inline-flex items-center gap-1">
                            <BadgeCheck className="h-3 w-3" /> Sudah Dikomersialisasi
                        </span>
                    ) : (
                        <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Siap Komersialisasi
                        </span>
                    )}
                    {data.linked_patent && (
                        <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 font-semibold inline-flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> HKI Terdaftar
                        </span>
                    )}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">{data.title}</h1>
                <p className="text-slate-600 text-sm">
                    Inventor utama: <strong className="text-slate-800">{data.primary_inventor_name}</strong>
                    {data.holding_unit && <span> · <span className="text-slate-700">{data.holding_unit}</span></span>}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {data.current_trl_level && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                            <TrendingUp className="h-4 w-4" /> <strong>TKT {data.current_trl_level}</strong> / 9
                        </div>
                    )}
                    {data.current_mrl_score && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 text-amber-800">
                            <Lightbulb className="h-4 w-4" /> <strong>MRL {Number(data.current_mrl_score).toFixed(1)}</strong> / 9
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-5">
                    <Section title="Deskripsi Produk">
                        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">{data.description}</p>
                    </Section>

                    {data.value_proposition && (
                        <Section title="Nilai Tambah / Value Proposition" tone="emerald">
                            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">{data.value_proposition}</p>
                        </Section>
                    )}

                    {data.target_market && (
                        <Section title="Target Pasar" tone="sky">
                            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">{data.target_market}</p>
                        </Section>
                    )}

                    {data.co_inventors && data.co_inventors.length > 0 && (
                        <Section title="Tim Inventor">
                            <ul className="text-sm text-slate-700 space-y-1">
                                {data.co_inventors.map((inv, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        {typeof inv === 'string' ? inv : inv?.name}
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}
                </div>

                <aside className="space-y-4">
                    <div className="text-white rounded-2xl p-5" style={{ background: '#0d1830' }}>
                        <h3 className="font-bold text-lg mb-1">Tertarik dengan produk ini?</h3>
                        <p className="text-xs text-primary-100 mb-3">Lisensi, pembelian, atau kolaborasi riset.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold text-sm transition inline-flex items-center justify-center gap-1"
                        >
                            <Send className="h-4 w-4" /> Kirim Inquiry
                        </button>
                    </div>

                    {data.linked_patent && (
                        <div className="bg-white rounded-2xl ring-1 ring-amber-200 p-4">
                            <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                                <ShieldCheck className="h-4 w-4" /> Dilindungi HKI
                            </div>
                            <div className="font-bold text-sm mb-1">{data.linked_patent.title}</div>
                            {data.linked_patent.reference_number && (
                                <div className="text-xs font-mono text-slate-500">No. {data.linked_patent.reference_number}</div>
                            )}
                            <div className="text-xs text-slate-600 mt-2">
                                Status: <span className="font-semibold">{data.linked_patent.status}</span>
                            </div>
                            {data.linked_patent.licensee_partner && (
                                <div className="text-xs text-slate-600 mt-1">
                                    Lisensee: <span className="font-semibold">{data.linked_patent.licensee_partner.name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {data.linked_tenant && (
                        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4">
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                <Building2 className="h-4 w-4" /> Tim Startup
                            </div>
                            <Link to={`/startup/${data.linked_tenant.slug}`} className="font-bold text-sm text-primary-700 hover:underline">
                                {data.linked_tenant.name}
                            </Link>
                            {data.linked_tenant.one_liner && (
                                <p className="text-xs text-slate-600 mt-1">{data.linked_tenant.one_liner}</p>
                            )}
                        </div>
                    )}

                    {data.category && (
                        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kategori TKT</div>
                            <div className="font-semibold text-sm text-slate-800">{data.category.label}</div>
                        </div>
                    )}
                </aside>
            </div>

            {showForm && <InquiryDialog slug={slug} productTitle={data.title} onClose={() => setShowForm(false)} />}
        </div>
    );
}

function Section({ title, children, tone }) {
    const toneClass = {
        emerald: 'bg-emerald-50 ring-emerald-200',
        sky: 'bg-sky-50 ring-sky-200',
    }[tone] || 'bg-white ring-slate-200';

    return (
        <section className={`rounded-2xl ring-1 p-5 ${toneClass}`}>
            <h2 className="font-bold mb-3 text-slate-900">{title}</h2>
            {children}
        </section>
    );
}

function InquiryDialog({ slug, productTitle, onClose }) {
    const [form, setForm] = useState({
        inquirer_name: '',
        inquirer_email: '',
        inquirer_phone: '',
        inquirer_organization: '',
        inquirer_position: '',
        interest_type: 'license',
        message: '',
    });
    const [success, setSuccess] = useState(false);

    const submit = useMutation({
        mutationFn: (payload) => api.post(`/api/public/innovations/${slug}/inquiry`, payload).then((r) => r.data),
        onSuccess: () => setSuccess(true),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        submit.mutate(form);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold">{success ? 'Terkirim!' : 'Form Inquiry Komersialisasi'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
                </div>

                {success ? (
                    <div className="p-6 text-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                        <h4 className="font-bold mb-2">Terima kasih atas ketertarikan Anda!</h4>
                        <p className="text-sm text-slate-600 mb-4">
                            Tim Divisi <strong>Knowledge Asset Management</strong> UPA PENSNOVA akan menghubungi Anda dalam <strong>2-3 hari kerja</strong> untuk pembahasan lebih lanjut.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-semibold"
                        >
                            Tutup
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto">
                        <p className="text-xs text-slate-500">
                            Untuk produk: <strong className="text-slate-800">{productTitle}</strong>
                        </p>
                        <FormField label="Nama Lengkap" required>
                            <input
                                type="text"
                                required
                                value={form.inquirer_name}
                                onChange={(e) => setForm({ ...form, inquirer_name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                        </FormField>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Email" required>
                                <input
                                    type="email"
                                    required
                                    value={form.inquirer_email}
                                    onChange={(e) => setForm({ ...form, inquirer_email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                />
                            </FormField>
                            <FormField label="Telepon (opsional)">
                                <input
                                    type="tel"
                                    value={form.inquirer_phone}
                                    onChange={(e) => setForm({ ...form, inquirer_phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                />
                            </FormField>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Organisasi / Perusahaan">
                                <input
                                    type="text"
                                    value={form.inquirer_organization}
                                    onChange={(e) => setForm({ ...form, inquirer_organization: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                />
                            </FormField>
                            <FormField label="Jabatan">
                                <input
                                    type="text"
                                    value={form.inquirer_position}
                                    onChange={(e) => setForm({ ...form, inquirer_position: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                />
                            </FormField>
                        </div>
                        <FormField label="Jenis Ketertarikan" required>
                            <select
                                required
                                value={form.interest_type}
                                onChange={(e) => setForm({ ...form, interest_type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            >
                                {INTEREST_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Pesan / Detail Permintaan" required>
                            <textarea
                                required
                                rows={5}
                                minLength={20}
                                maxLength={2000}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Ceritakan rencana penggunaan produk, skala target, atau pertanyaan spesifik (min. 20 karakter)."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-y"
                            />
                            <div className="text-[10px] text-slate-400 text-right">{form.message.length}/2000</div>
                        </FormField>

                        {submit.isError && (
                            <div className="text-xs text-rose-700 bg-rose-50 px-3 py-2 rounded">
                                {submit.error?.response?.data?.message || 'Gagal mengirim. Coba lagi.'}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg hover:bg-slate-100">Batal</button>
                            <button
                                type="submit"
                                disabled={submit.isPending}
                                className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 disabled:opacity-50 inline-flex items-center gap-1"
                            >
                                <Send className="h-4 w-4" /> {submit.isPending ? 'Mengirim…' : 'Kirim Inquiry'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function FormField({ label, required, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
                {label} {required && <span className="text-rose-600">*</span>}
            </label>
            {children}
        </div>
    );
}
