import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import Logo from '../../components/Logo';
import Spinner from '../../components/Spinner';

/**
 * Public Survey Responder — halaman survey untuk external reviewer / responden
 * tanpa login. Token shared via query param ?t=...
 *
 * Tipe survey yang di-handle:
 * - mrl_external_review: 7 kriteria MRL dengan scale 1-5
 * - tenant_satisfaction: dynamic question dari config
 * - market_validation: dynamic
 * - custom: dynamic
 */
export default function SurveyResponder() {
    const { slug } = useParams();
    const [params] = useSearchParams();
    const token = params.get('t');

    const { data, isLoading, error } = useQuery({
        queryKey: ['public', 'survey', slug, token],
        queryFn: () => api.get(`/api/survey/${slug}`, { params: { t: token } }).then((r) => r.data.data),
        retry: false,
    });

    const [respondent, setRespondent] = useState({
        respondent_name: '',
        respondent_email: '',
        respondent_affiliation: '',
        respondent_phone: '',
    });
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const submitMutation = useMutation({
        mutationFn: () => api.post(`/api/survey/${slug}/submit`, {
            ...respondent,
            answers,
        }, { params: { t: token } }),
        onSuccess: () => setSubmitted(true),
    });

    // Loading state
    if (isLoading) {
        return (
            <SurveyLayout>
                <div className="text-center py-12">
                    <Spinner className="h-10 w-10 mx-auto text-primary-600" />
                    <p className="text-sm text-slate-500 mt-3">Memuat survey…</p>
                </div>
            </SurveyLayout>
        );
    }

    // Error state — token invalid / survey not found / closed
    if (error) {
        const status = error.response?.status;
        return (
            <SurveyLayout>
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-rose-400 mb-3" />
                    <h2 className="text-lg font-bold text-slate-900">
                        {status === 403 ? 'Token Tidak Valid' : status === 404 ? 'Survey Tidak Ditemukan' : 'Terjadi Kesalahan'}
                    </h2>
                    <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                        {error.response?.data?.message || 'Link survey mungkin sudah kadaluarsa atau tidak valid. Hubungi tim UPA PENS.'}
                    </p>
                </div>
            </SurveyLayout>
        );
    }

    const survey = data;

    // Submitted state
    if (submitted) {
        return (
            <SurveyLayout title={survey?.title}>
                <div className="text-center py-12">
                    <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500 mb-3" />
                    <h2 className="text-2xl font-bold text-slate-900">Terima Kasih!</h2>
                    <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                        Tanggapan Anda telah berhasil tersimpan. Tim UPA Pengembangan Teknologi & Produk Unggulan PENS sangat menghargai
                        kontribusi review Anda.
                    </p>
                </div>
            </SurveyLayout>
        );
    }

    // Survey closed
    if (!survey?.is_open) {
        return (
            <SurveyLayout title={survey?.title}>
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-amber-400 mb-3" />
                    <h2 className="text-lg font-bold text-slate-900">Survey Sudah Ditutup</h2>
                    <p className="text-sm text-slate-600 mt-2">
                        Survey ini sudah tidak menerima tanggapan. Hubungi tim UPA PENS untuk informasi lebih lanjut.
                    </p>
                </div>
            </SurveyLayout>
        );
    }

    const questions = survey.config?.questions || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        submitMutation.mutate();
    };

    return (
        <SurveyLayout title={survey.title}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {survey.description && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-900 leading-relaxed">
                        {survey.description}
                    </div>
                )}

                {/* Identity section */}
                <section className="space-y-3">
                    <h3 className="font-bold text-base flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary-700" />
                        Identitas Reviewer
                    </h3>
                    <Field label="Nama Lengkap *" required>
                        <input
                            type="text"
                            required
                            value={respondent.respondent_name}
                            onChange={(e) => setRespondent({ ...respondent, respondent_name: e.target.value })}
                            className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Email *" required>
                            <input
                                type="email"
                                required
                                value={respondent.respondent_email}
                                onChange={(e) => setRespondent({ ...respondent, respondent_email: e.target.value })}
                                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
                            />
                        </Field>
                        <Field label="Telepon (opsional)">
                            <input
                                type="tel"
                                value={respondent.respondent_phone}
                                onChange={(e) => setRespondent({ ...respondent, respondent_phone: e.target.value })}
                                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
                            />
                        </Field>
                    </div>
                    <Field label="Afiliasi / Organisasi">
                        <input
                            type="text"
                            value={respondent.respondent_affiliation}
                            onChange={(e) => setRespondent({ ...respondent, respondent_affiliation: e.target.value })}
                            placeholder="Mis: PT Telkom — Industry Expert / Universitas X — Konsultan"
                            className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
                        />
                    </Field>
                </section>

                <hr className="border-slate-200" />

                {/* Questions */}
                <section className="space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary-700" />
                        Pertanyaan Survey
                    </h3>
                    {questions.map((q, idx) => (
                        <QuestionRenderer
                            key={q.key}
                            index={idx}
                            question={q}
                            value={answers[q.key]}
                            onChange={(val) => setAnswers({ ...answers, [q.key]: val })}
                        />
                    ))}
                </section>

                {submitMutation.isError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-800 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{submitMutation.error?.response?.data?.message || 'Gagal mengirim. Coba lagi.'}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full h-12 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {submitMutation.isPending ? <Spinner className="h-4 w-4" /> : <CheckCircle2 className="h-5 w-5" />}
                    {submitMutation.isPending ? 'Mengirim…' : 'Kirim Tanggapan'}
                </button>

                <div className="text-[11px] text-slate-500 text-center">
                    Tanggapan Anda akan diteruskan ke tim Divisi Applied Research & Innovation UPA PENS.
                </div>
            </form>
        </SurveyLayout>
    );
}

function QuestionRenderer({ index, question, value, onChange }) {
    if (question.type === 'intro') {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed">
                <strong>ℹ️ Informasi:</strong>{' '}{question.content}
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="mb-2">
                <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-800 rounded-full font-bold text-xs flex-shrink-0">{index}</span>
                    <div className="flex-1">
                        <div className="font-semibold text-sm text-slate-900">
                            {question.label}
                            {question.required && <span className="text-rose-600 ml-1">*</span>}
                        </div>
                        {question.description && (
                            <div className="text-[11px] text-slate-600 mt-0.5">{question.description}</div>
                        )}
                        {question.weight && (
                            <div className="text-[10px] text-amber-700 mt-0.5">Bobot: {question.weight}</div>
                        )}
                    </div>
                </div>
            </div>

            {question.type === 'scale' && (
                <div className="mt-3">
                    <div className="flex gap-1 sm:gap-2 justify-between">
                        {Array.from({ length: (question.max - question.min) + 1 }, (_, i) => i + question.min).map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => onChange(n)}
                                className={`flex-1 h-12 rounded-md border-2 font-bold text-base transition ${
                                    value === n
                                        ? 'bg-primary-600 border-primary-700 text-white'
                                        : 'bg-white border-slate-200 hover:border-primary-400 text-slate-700'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>{question.min_label || question.min}</span>
                        <span>{question.max_label || question.max}</span>
                    </div>
                </div>
            )}

            {question.type === 'text' && (
                <input
                    type="text"
                    required={question.required}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm mt-2"
                />
            )}

            {question.type === 'textarea' && (
                <textarea
                    required={question.required}
                    rows={3}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm mt-2"
                />
            )}

            {question.type === 'select' && (
                <select
                    required={question.required}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm mt-2"
                >
                    <option value="">— Pilih —</option>
                    {(question.options || []).map((opt) => (
                        <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
                    ))}
                </select>
            )}

            {question.type === 'radio' && (
                <div className="space-y-1 mt-2">
                    {(question.options || []).map((opt) => {
                        const val = opt.value ?? opt;
                        return (
                            <label key={val} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                                <input
                                    type="radio"
                                    name={question.key}
                                    value={val}
                                    checked={value === val}
                                    onChange={() => onChange(val)}
                                    required={question.required}
                                    className="mt-1"
                                />
                                <span className="text-sm">{opt.label ?? opt}</span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function Field({ label, children, required }) {
    return (
        <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{label}</label>
            {children}
        </div>
    );
}

/**
 * Clean layout untuk survey publik — tidak pakai PublicLayout supaya
 * responden fokus ke form tanpa distraksi navbar/footer.
 */
function SurveyLayout({ children, title }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-50/40 via-white to-white">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2 hover:opacity-80">
                        <Logo variant="mark" size="sm" />
                        <div>
                            <div className="font-bold text-sm text-slate-900">PENSNOVA</div>
                            <div className="text-[10px] text-slate-500 leading-none">UPA Pengembangan Teknologi PENS</div>
                        </div>
                    </a>
                    <a href="/" className="text-xs text-slate-600 hover:text-primary-700 inline-flex items-center gap-1">
                        <ArrowLeft className="h-3 w-3" /> Beranda
                    </a>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {title && (
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mb-6 text-center">
                        {title}
                    </h1>
                )}
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-8 shadow-sm">
                    {children}
                </div>
                <div className="text-[11px] text-slate-500 text-center mt-4">
                    Dipersembahkan oleh PENSNOVA — Platform UPA Pengembangan Teknologi & Produk Unggulan PENS
                </div>
            </main>
        </div>
    );
}
