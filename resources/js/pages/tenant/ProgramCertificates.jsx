import { useQuery } from '@tanstack/react-query';
import { Award, Download, ClipboardList, Clock, CheckCircle2, ShieldOff, ExternalLink, GraduationCap } from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

const STATUS_META = {
    pending_feedback: {
        label: 'Menunggu Feedback',
        tone: 'amber',
        icon: ClipboardList,
        helper: 'Isi survey feedback program dengan email yang sama untuk lanjut ke tahap persetujuan.',
    },
    pending_approval: {
        label: 'Menunggu ACC Kepala UPA',
        tone: 'orange',
        icon: Clock,
        helper: 'Feedback Anda sudah masuk. Kepala UPA akan meninjau sebelum sertifikat dicetak.',
    },
    approved: {
        label: 'Disetujui — Sedang Dicetak',
        tone: 'sky',
        icon: CheckCircle2,
        helper: 'Sertifikat sudah di-ACC. PDF sedang dipersiapkan.',
    },
    issued: {
        label: 'Sertifikat Terbit',
        tone: 'emerald',
        icon: Award,
        helper: 'Sertifikat sudah dapat di-download.',
    },
    revoked: {
        label: 'Dicabut',
        tone: 'rose',
        icon: ShieldOff,
        helper: 'Sertifikat ini telah dicabut oleh Kepala UPA.',
    },
};

const TONE_CLASSES = {
    amber: 'bg-amber-50 ring-amber-200 text-amber-900',
    orange: 'bg-orange-50 ring-orange-200 text-orange-900',
    sky: 'bg-sky-50 ring-sky-200 text-sky-900',
    emerald: 'bg-emerald-50 ring-emerald-200 text-emerald-900',
    rose: 'bg-rose-50 ring-rose-200 text-rose-900',
};

export default function TenantProgramCertificates() {
    const { data, isLoading } = useQuery({
        queryKey: ['tenant', 'program-certificates'],
        queryFn: () => api.get('/api/tenant/program-certificates').then((r) => r.data),
    });

    if (isLoading) return <Spinner className="h-10 w-10 mx-auto text-emerald-600" />;

    const certs = data?.data ?? [];
    const activeSurvey = data?.active_feedback_survey;

    return (
        <>
            <header className="mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Award className="h-7 w-7 text-amber-600" /> Sertifikat Peserta Program
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                    Sertifikat partisipasi untuk anggota tim Anda di Program Inkubasi PENSNOVA. Sertifikat dapat dicetak setelah peserta mengisi feedback program & disetujui Kepala UPA.
                </p>
            </header>

            {activeSurvey && certs.some((c) => c.status === 'pending_feedback') && (
                <a
                    href={activeSurvey.url}
                    target="_blank"
                    rel="noopener"
                    className="block ring-1 ring-amber-300 rounded-2xl p-4 mb-5 transition" style={{ background: '#fffbeb' }}
                >
                    <div className="flex items-center gap-3">
                        <ClipboardList className="h-6 w-6 text-amber-700" />
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 text-sm">Isi Feedback Program — Prasyarat Sertifikat</div>
                            <div className="text-xs text-amber-800 mt-1">
                                Klik link ini lalu isi dengan <strong>email yang terdaftar di tim tenant</strong>. Setelah submit, sertifikat akan otomatis ke tahap persetujuan Kepala UPA.
                            </div>
                        </div>
                        <ExternalLink className="h-5 w-5 text-amber-700" />
                    </div>
                </a>
            )}

            {certs.length === 0 ? (
                <div className="bg-white ring-1 ring-slate-200 rounded-2xl p-8 text-center">
                    <ClipboardList className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <h2 className="font-bold">Belum ada sertifikat</h2>
                    <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                        Sertifikat akan muncul di sini setelah admin UPA membuatkan untuk anggota tim Anda — biasanya saat batch hampir selesai.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {certs.map((c) => {
                        const meta = STATUS_META[c.status] || { label: c.status, tone: 'amber', icon: ClipboardList };
                        const StatusIcon = meta.icon;
                        return (
                            <div key={c.id} className="bg-white ring-1 ring-slate-200 rounded-2xl overflow-hidden">
                                <div className="p-4 flex items-start gap-3">
                                    <GraduationCap className="h-8 w-8 text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-900">{c.recipient_name}</div>
                                        <div className="text-xs text-slate-500">
                                            {c.role_in_program || c.founder?.role || 'Anggota tim'} · {c.recipient_email || '—'}
                                        </div>
                                        {c.certificate_number && (
                                            <div className="text-xs font-mono text-slate-600 mt-1">{c.certificate_number}</div>
                                        )}
                                    </div>
                                    {c.status === 'issued' && (
                                        <a
                                            href={`/api/tenant/program-certificates/${c.id}/download`}
                                            target="_blank"
                                            rel="noopener"
                                            className="inline-flex items-center px-3 py-2 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
                                        >
                                            <Download className="h-4 w-4 mr-1" /> PDF
                                        </a>
                                    )}
                                </div>
                                <div className={`px-4 py-2 ring-1 flex items-center gap-2 text-xs ${TONE_CLASSES[meta.tone]}`}>
                                    <StatusIcon className="h-4 w-4 shrink-0" />
                                    <div>
                                        <span className="font-semibold">{meta.label}.</span>{' '}
                                        <span>{meta.helper}</span>
                                        {c.status === 'pending_feedback' && activeSurvey && (
                                            <> {' '}
                                                <a
                                                    href={activeSurvey.url}
                                                    target="_blank"
                                                    rel="noopener"
                                                    className="font-semibold underline ml-1"
                                                >
                                                    Isi sekarang →
                                                </a>
                                            </>
                                        )}
                                        {c.status === 'revoked' && c.revoked_reason && (
                                            <div className="mt-1 italic">Alasan: {c.revoked_reason}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
