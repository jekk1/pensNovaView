import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { formatApiError } from '../../lib/api';
import Spinner from '../../components/Spinner';

/**
 * Apply — single page pendaftaran tenant PENSNOVA (UPA / inkubator Sky Venture).
 *
 * 1 form terpadu:
 *   - Batch selector (cards di atas; auto-pilih kalau hanya 1 batch open)
 *   - Form lengkap di bawah (founder + startup + esai + akun + upload dokumen)
 *   - File upload: pitch deck, proposal, logo, founder CV
 *   - Submit lewat multipart/form-data → backend simpan via Document polymorphic
 */

const SECTORS = [
    'agritech',
    'edutech',
    'fintech',
    'healthtech',
    'iot',
    'ai-ml',
    'creative',
    'sustainability',
    'manufacturing',
    'logistics',
    'other',
];
const STAGES = ['idea', 'prototype', 'mvp', 'early-revenue', 'growth'];

const FILE_FIELDS = [
    {
        name: 'pitch_deck',
        label: 'Pitch Deck',
        accept: '.pdf,.ppt,.pptx',
        maxMB: 10,
        hint: 'PDF/PPT/PPTX, maks 10 MB. Slide presentasi singkat (10-15 halaman) tentang startup Anda.',
    },
    {
        name: 'proposal',
        label: 'Proposal Bisnis',
        accept: '.pdf,.doc,.docx',
        maxMB: 5,
        hint: 'PDF/DOC/DOCX, maks 5 MB. Dokumen ringkasan model bisnis & roadmap.',
    },
    {
        name: 'logo',
        label: 'Logo Startup',
        accept: '.png,.jpg,.jpeg,.svg',
        maxMB: 2,
        hint: 'PNG/JPG/SVG, maks 2 MB. Logo resolusi tinggi untuk publikasi.',
    },
    {
        name: 'founder_cv',
        label: 'CV Founder Utama',
        accept: '.pdf,.doc,.docx',
        maxMB: 3,
        hint: 'PDF/DOC/DOCX, maks 3 MB. CV singkat founder yang ditugaskan sebagai PIC.',
    },
];

export default function Apply() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const { data: batches, isLoading } = useQuery({
        queryKey: ['public', 'batches', 'open'],
        queryFn: () => api.get('/api/public/batches/open').then((r) => r.data.data),
    });

    const preselectedId = searchParams.get('batch');
    const [selectedBatchId, setSelectedBatchId] = useState(preselectedId ? parseInt(preselectedId, 10) : null);

    // Auto-select kalau hanya 1 batch open
    const effectiveBatchId = useMemo(() => {
        if (selectedBatchId) return selectedBatchId;
        if (batches?.length === 1) return batches[0].id;
        return null;
    }, [selectedBatchId, batches]);

    const selectedBatch = useMemo(
        () => batches?.find((b) => b.id === effectiveBatchId),
        [batches, effectiveBatchId]
    );

    function pickBatch(id) {
        setSelectedBatchId(id);
        setSearchParams({ batch: String(id) });
        // Scroll ke form
        setTimeout(() => {
            document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    return (
        <div className="bg-slate-50">
            {/* Hero — explain UPA → Sky Venture relationship */}
            <section className="bg-gradient-to-br from-primary-800 via-primary-900 to-slate-900 text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <Link to="/" className="text-amber-300 hover:text-amber-400 text-sm mb-4 inline-block">
                        ← Beranda
                    </Link>
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400 mb-2">
                        Pendaftaran Tenant
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                        Bergabung dengan <span className="text-amber-300">PENSNOVA</span>
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed">
                        <strong className="text-white">UPA Pengembangan Teknologi & Produk Unggulan PENS</strong>{' '}
                        adalah unit inkubasi resmi PENS sejak 2015 yang telah membina puluhan startup teknologi
                        dengan akses pendanaan BRIN, mentor industri, dan workspace inkubator gratis bagi tenant terpilih.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 text-xs">
                        <Badge>Mentoring 1-on-1</Badge>
                        <Badge>Workshop Kewirausahaan</Badge>
                        <Badge>Business Matching</Badge>
                        <Badge>Akses Pendanaan</Badge>
                        <Badge>Workspace Inkubator</Badge>
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl ring-1 ring-slate-200 p-6">
                                <div className="h-5 w-2/3 bg-slate-200 animate-pulse rounded mb-2" />
                                <div className="h-3 w-1/2 bg-slate-200 animate-pulse rounded mb-4" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-200 animate-pulse rounded" />
                                    <div className="h-3 bg-slate-200 animate-pulse rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !batches || batches.length === 0 ? (
                    <ClosedNotice />
                ) : (
                    <>
                        <BatchSelector
                            batches={batches}
                            selected={effectiveBatchId}
                            onPick={pickBatch}
                        />

                        {selectedBatch && (
                            <ApplyFormSection
                                batch={selectedBatch}
                                onSuccess={() => navigate('/daftar/terima-kasih')}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components

function Badge({ children }) {
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-white/90 font-medium">
            ✓ {children}
        </span>
    );
}

function ClosedNotice() {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 text-center">
            <div className="text-5xl mb-3">⏳</div>
            <h2 className="text-lg sm:text-xl font-bold text-amber-900">
                Belum ada batch yang dibuka saat ini
            </h2>
            <p className="text-amber-800 mt-2 text-sm">
                Pantau halaman ini, ikuti Instagram <a href="https://instagram.com/pensskyventure" className="font-semibold underline" target="_blank" rel="noopener">@pensskyventure</a>,
                atau kontak email kami untuk informasi pembukaan batch berikutnya.
            </p>
            <a
                href="mailto:penssky.inkubator@div.pens.ac.id"
                className="inline-block mt-4 px-5 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
            >
                ✉️ Hubungi Tim
            </a>
        </div>
    );
}

function BatchSelector({ batches, selected, onPick }) {
    if (batches.length === 1) {
        // Single batch — tampilkan info singkat saja, form auto-show
        const b = batches[0];
        return (
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-6 mb-6">
                <div className="flex items-start gap-3">
                    <div className="text-3xl">📋</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="font-bold text-lg sm:text-xl text-slate-900">{b.name}</h2>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                                ● Open
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{b.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>📅 {b.start_date} — {b.end_date}</span>
                            <span>👥 Kuota {b.quota} startup</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="mb-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                1. Pilih Batch yang Ingin Dilamar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {batches.map((b) => (
                    <button
                        key={b.id}
                        type="button"
                        onClick={() => onPick(b.id)}
                        className={`text-left p-4 rounded-xl ring-2 transition ${
                            selected === b.id
                                ? 'bg-primary-50 ring-primary-600 shadow-md'
                                : 'bg-white ring-slate-200 hover:ring-primary-300'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-sm text-slate-900">{b.name}</h3>
                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                                Open
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">{b.description}</p>
                        <div className="text-[11px] text-slate-500">
                            📅 {b.start_date} — {b.end_date} · 👥 {b.quota} kuota
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}

function ApplyFormSection({ batch, onSuccess }) {
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [files, setFiles] = useState({}); // { fieldName: File }

    const mutation = useMutation({
        mutationFn: (formData) =>
            api.post(`/api/public/batches/${batch.id}/apply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess,
        onError: (err) => {
            setErrors(err.response?.data?.errors || {});
            setGeneralError(formatApiError(err, 'Periksa kembali isian Anda.'));
        },
    });

    function submit(e) {
        e.preventDefault();
        setErrors({});
        setGeneralError('');

        const fd = new FormData(e.target);
        // FormData sudah include input + file. Pastikan file fields ke-attach.
        Object.entries(files).forEach(([name, file]) => {
            if (file) fd.set(name, file);
        });
        mutation.mutate(fd);
    }

    return (
        <form id="apply-form" onSubmit={submit} className="space-y-5 sm:space-y-6">
            {generalError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800">
                    {generalError}
                </div>
            )}

            <Section title="Founder">
                <Grid>
                    <Input name="founder_name" label="Nama Lengkap *" required errors={errors} />
                    <Input
                        name="founder_email"
                        type="email"
                        label="Email *"
                        required
                        errors={errors}
                    />
                    <Input name="founder_phone" type="tel" label="No. HP" errors={errors} />
                    <Input
                        name="founder_role"
                        label="Jabatan"
                        placeholder="CEO, CTO, dst"
                        errors={errors}
                    />
                </Grid>
            </Section>

            <Section title="Tentang Startup">
                <Grid>
                    <Input name="startup_name" label="Nama Startup *" required errors={errors} />
                    <Select name="sector" label="Sektor *" options={SECTORS} required errors={errors} />
                    <Select name="stage" label="Tahap *" options={STAGES} required errors={errors} />
                    <Input name="team_size" type="number" label="Ukuran Tim" errors={errors} />
                    <Input
                        name="website"
                        type="url"
                        label="Website"
                        placeholder="https://…"
                        errors={errors}
                    />
                    <Input
                        name="pitch_deck_url"
                        type="url"
                        label="Pitch Deck URL (opsional, kalau di Google Drive/Notion)"
                        placeholder="https://…"
                        errors={errors}
                    />
                    <div className="sm:col-span-2">
                        <Input name="one_liner" label="One-liner *" required errors={errors} />
                    </div>
                    <div className="sm:col-span-2">
                        <Textarea
                            name="description"
                            label="Deskripsi Startup * (min 100 karakter)"
                            rows={4}
                            required
                            errors={errors}
                        />
                    </div>
                </Grid>
            </Section>

            <Section title="Esai Singkat">
                <Textarea
                    name="problem"
                    label="Problem yang Diselesaikan * (min 50 karakter)"
                    rows={3}
                    required
                    errors={errors}
                />
                <Textarea
                    name="solution"
                    label="Solusi yang Ditawarkan * (min 50 karakter)"
                    rows={3}
                    required
                    errors={errors}
                />
                <Textarea
                    name="target_market"
                    label="Target Market"
                    rows={2}
                    errors={errors}
                />
                <Textarea
                    name="achievements"
                    label="Pencapaian Saat Ini"
                    rows={2}
                    errors={errors}
                    placeholder="MoU, pengguna aktif, revenue, prototype, penghargaan…"
                />
            </Section>

            <Section title="Dokumen Pendukung (opsional, sangat dianjurkan)">
                <p className="text-xs text-slate-500 mb-3">
                    Upload dokumen di bawah untuk mempercepat proses review oleh tim PENSNOVA.
                    Semua file disimpan dengan aman dan hanya bisa diakses tim review.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FILE_FIELDS.map((f) => (
                        <FileUploadField
                            key={f.name}
                            field={f}
                            file={files[f.name]}
                            onChange={(file) => setFiles((prev) => ({ ...prev, [f.name]: file }))}
                            error={errors[f.name]?.[0]}
                        />
                    ))}
                </div>
            </Section>

            <Section title="Akun Login">
                <p className="text-sm text-slate-600 mb-3">
                    Buat password untuk akun dashboard tenant Anda. Setelah submit,
                    Anda bisa login di <Link to="/login" className="text-primary-700 font-semibold underline">/login</Link>.
                </p>
                <Input
                    name="password"
                    type="password"
                    label="Password * (min 8 karakter)"
                    required
                    errors={errors}
                />
            </Section>

            <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-bold disabled:opacity-60 transition shadow-md"
            >
                {mutation.isPending && <Spinner className="h-5 w-5" />}
                {mutation.isPending ? 'Mengirim…' : 'Submit Pendaftaran →'}
            </button>

            <p className="text-center text-xs text-slate-500 mt-2">
                Dengan submit, Anda menyetujui data digunakan oleh Pengelola PENSNOVA — UPA
                Pengembangan Teknologi & Produk Unggulan PENS — untuk proses seleksi dan inkubasi.
            </p>
        </form>
    );
}

// ──────────────────────────────────────────────────────────────────────────
// Form atoms

function Section({ title, children }) {
    return (
        <fieldset className="bg-white rounded-2xl p-5 sm:p-6 ring-1 ring-slate-200 space-y-3">
            <legend className="px-2 text-xs sm:text-sm font-bold uppercase tracking-wide text-primary-700">
                {title}
            </legend>
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
            <input
                name={name}
                type={type}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-500"
            />
            {errors[name] && <p className="mt-1 text-xs text-rose-600">{errors[name][0]}</p>}
        </div>
    );
}

function Select({ name, label, options, required, errors }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <select
                name={name}
                required={required}
                defaultValue=""
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-400"
            >
                <option value="" disabled>
                    — pilih —
                </option>
                {options.map((s) => (
                    <option key={s} value={s}>
                        {s}
                    </option>
                ))}
            </select>
            {errors[name] && <p className="mt-1 text-xs text-rose-600">{errors[name][0]}</p>}
        </div>
    );
}

function Textarea({ name, label, rows = 3, required, errors, placeholder }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <textarea
                name={name}
                rows={rows}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-500"
            />
            {errors[name] && <p className="mt-1 text-xs text-rose-600">{errors[name][0]}</p>}
        </div>
    );
}

function FileUploadField({ field, file, onChange, error }) {
    function onPick(e) {
        const f = e.target.files?.[0];
        if (f && f.size > field.maxMB * 1024 * 1024) {
            alert(`File terlalu besar. Maks ${field.maxMB} MB.`);
            e.target.value = '';
            return;
        }
        onChange(f || null);
    }

    return (
        <div className="bg-slate-50 rounded-xl p-3 ring-1 ring-slate-200">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
                {field.label}
            </label>
            <p className="text-[11px] text-slate-500 mb-2 leading-snug">{field.hint}</p>
            <input
                type="file"
                accept={field.accept}
                onChange={onPick}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 cursor-pointer"
            />
            {file && (
                <div className="mt-2 flex items-center justify-between gap-2 text-xs bg-emerald-50 ring-1 ring-emerald-200 rounded-lg px-2.5 py-1.5">
                    <span className="text-emerald-800 font-medium truncate">
                        ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="text-rose-600 font-bold flex-shrink-0"
                        aria-label="Hapus file"
                    >
                        ✕
                    </button>
                </div>
            )}
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
    );
}
