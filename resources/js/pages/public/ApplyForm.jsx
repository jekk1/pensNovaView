import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

const SECTORS = ['agritech','edutech','fintech','healthtech','iot','ai-ml','creative','sustainability','manufacturing','logistics','other'];
const STAGES = ['idea','prototype','mvp','early-revenue','growth'];

export default function ApplyForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    const { data: batch, isLoading } = useQuery({
        queryKey: ['public', 'batches', id],
        queryFn: () => api.get(`/api/public/batches/${id}`).then((r) => r.data.data),
    });

    const mutation = useMutation({
        mutationFn: (payload) => api.post(`/api/public/batches/${id}/apply`, payload),
        onSuccess: () => navigate('/daftar/terima-kasih'),
        onError: (err) => {
            setErrors(err.response?.data?.errors || {});
            setGeneralError(err.response?.data?.message || 'Terjadi kesalahan. Periksa isian Anda.');
        },
    });

    function submit(e) {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        const fd = new FormData(e.target);
        const payload = Object.fromEntries(fd.entries());
        if (payload.team_size) payload.team_size = parseInt(payload.team_size, 10);
        mutation.mutate(payload);
    }

    if (isLoading) return <div className="py-20 flex justify-center"><Spinner className="h-10 w-10 text-primary-600" /></div>;
    if (!batch) return <div className="text-center p-8 text-rose-600">Batch tidak ditemukan.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Link to="/daftar" className="inline-flex items-center gap-1 text-sm text-primary-700 mb-6 hover:underline">← Pilih batch lain</Link>

            <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daftar — {batch.name}</h1>
                <p className="text-sm sm:text-base text-slate-600 mt-2">Isi form dengan data lengkap. Setelah submit, Anda akan menerima akun dashboard tenant.</p>
            </header>

            {generalError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800">
                    {generalError}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <Section title="1. Founder">
                    <Grid>
                        <Input name="founder_name" label="Nama Lengkap *" required errors={errors} />
                        <Input name="founder_email" type="email" label="Email *" required errors={errors} />
                        <Input name="founder_phone" type="tel" label="No. HP" errors={errors} />
                        <Input name="founder_role" label="Jabatan" placeholder="CEO, CTO, dst" errors={errors} />
                    </Grid>
                </Section>

                <Section title="2. Tentang Startup">
                    <Grid>
                        <Input name="startup_name" label="Nama Startup *" required errors={errors} />
                        <Select name="sector" label="Sektor *" options={SECTORS} required errors={errors} />
                        <Select name="stage" label="Tahap *" options={STAGES} required errors={errors} />
                        <Input name="team_size" type="number" label="Ukuran Tim" errors={errors} />
                        <Input name="website" type="url" label="Website" placeholder="https://..." errors={errors} />
                        <Input name="pitch_deck_url" type="url" label="Pitch Deck URL" placeholder="Google Drive / Notion" errors={errors} />
                        <div className="sm:col-span-2">
                            <Input name="one_liner" label="One-liner *" required errors={errors} />
                        </div>
                        <div className="sm:col-span-2">
                            <Textarea name="description" label="Deskripsi Startup * (min 100 karakter)" rows={4} required errors={errors} />
                        </div>
                    </Grid>
                </Section>

                <Section title="3. Esai Singkat">
                    <Textarea name="problem" label="Problem yang Diselesaikan *" rows={3} required errors={errors} />
                    <Textarea name="solution" label="Solusi yang Ditawarkan *" rows={3} required errors={errors} />
                    <Textarea name="target_market" label="Target Market" rows={2} errors={errors} />
                    <Textarea name="achievements" label="Pencapaian Saat Ini" rows={2} errors={errors} placeholder="MoU, pengguna, revenue, prototype, dll." />
                </Section>

                <Section title="4. Akun Login">
                    <p className="text-sm text-slate-600 mb-3">Buat password untuk akun dashboard tenant Anda.</p>
                    <Input name="password" type="password" label="Password * (min 8 karakter)" required errors={errors} />
                </Section>

                <button type="submit" disabled={mutation.isPending} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold disabled:opacity-60 transition">
                    {mutation.isPending && <Spinner className="h-5 w-5" />}
                    Submit Pendaftaran →
                </button>
            </form>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <fieldset className="bg-white rounded-2xl p-5 sm:p-6 ring-1 ring-slate-200 space-y-3">
            <legend className="text-xs sm:text-sm font-bold uppercase tracking-wide text-primary-700">{title}</legend>
            {children}
        </fieldset>
    );
}

function Grid({ children }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">{children}</div>;
}

function Input({ name, label, type = 'text', required, errors, placeholder }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input name={name} type={type} required={required} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-400" />
            {errors[name] && <p className="mt-1 text-xs text-rose-600">{errors[name][0]}</p>}
        </div>
    );
}

function Select({ name, label, options, required, errors }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <select name={name} required={required} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm">
                {options.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors[name] && <p className="mt-1 text-xs text-rose-600">{errors[name][0]}</p>}
        </div>
    );
}

function Textarea({ name, label, rows = 3, required, errors, placeholder }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <textarea name={name} rows={rows} required={required} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-400" />
            {errors[name] && <p className="mt-1 text-xs text-rose-600">{errors[name][0]}</p>}
        </div>
    );
}
