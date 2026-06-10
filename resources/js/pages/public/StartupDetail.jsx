import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Globe, Users, Calendar, ArrowLeft, CheckCircle2, Circle, Star, Lock } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import Spinner from '../../components/Spinner';
import Skeleton from '../../components/Skeleton';

// Label, warna, dan urutan stage inkubasi
const STAGES = [
    { key: 'Prototype',     label: 'Prototype',     color: '#b91c1c', activeBg: 'rgba(239,68,68,0.12)'   },
    { key: 'MVP',           label: 'MVP',            color: '#0e7490', activeBg: 'rgba(6,182,212,0.12)'   },
    { key: 'Early Revenue', label: 'Early Revenue',  color: '#c2410c', activeBg: 'rgba(251,146,60,0.12)'  },
    { key: 'Growth',        label: 'Growth',         color: '#0369a1', activeBg: 'rgba(14,165,233,0.12)'  },
];

const stageIndex = {
    Prototype: 0, prototype: 0,
    MVP: 1,       mvp: 1,
    'Early Revenue': 2, early_revenue: 2,
    Growth: 3,    growth: 3,
};

// Badge yang ditampilkan beserta kondisi aktifnya
const TENANT_BADGES = [
    { key: 'hki',      label: 'HKI Pioneer',    desc: 'Telah mendaftarkan Hak Kekayaan Intelektual' },
    { key: 'mentor',   label: "Mentor's Choice", desc: 'Dipilih mentor sebagai startup unggulan'     },
    { key: 'investor', label: 'Investor Ready',  desc: 'Dinilai siap bertemu investor'               },
    { key: 'trail',    label: 'Trailblazer',     desc: 'Startup pertama di sektor ini di PENSNOVA'   },
];

// Data demo untuk kondisi API tidak tersedia
const MOCK_TENANT_DETAIL = {
    id: 1,
    slug: 'aitoma-automation',
    name: 'AITOMA',
    one_liner: 'Solusi AI IoT Automation untuk efisiensi rantai pasokan manufaktur dan pelacakan gudang real-time.',
    description: 'AITOMA mengembangkan platform terintegrasi yang menggabungkan kecerdasan buatan dengan sensor IoT untuk membantu perusahaan manufaktur memantau inventaris gudang secara real-time, meminimalisir downtime, dan mengoptimalkan rantai pasokan mereka. Platform kami sudah dipakai oleh 3 perusahaan manufaktur di Surabaya.',
    stage: 'MVP',
    sector: 'IoT & AI',
    subPhase: 'Beta Testing',
    stageProgress: 2,
    stageBadges: ['HKI Terdaftar', 'Mentor Endorsed'],
    has_hki: true,
    website: 'https://aitoma.id',
    activeBadges: ['hki', 'mentor'],
    stageChecklist: [
        { label: 'Profil startup lengkap 100%',          done: true  },
        { label: 'HKI / paten terdaftar',                done: true  },
        { label: 'Minimal 3 sesi mentoring selesai',     done: true  },
        { label: 'Laporan kemajuan disubmit ke admin',   done: false },
    ],
    founders: [
        { id: 1, name: 'Ahmad Rifai', role: 'CEO & Co-Founder' },
        { id: 2, name: 'Dina Puspita', role: 'CTO & Co-Founder' },
    ],
    tech_stack: ['Python', 'TensorFlow', 'MQTT', 'React', 'PostgreSQL'],
    batch: { name: 'Batch 2025' },
};

export default function StartupDetail() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [showMeeting, setShowMeeting] = useState(false);
    const [meetingSuccess, setMeetingSuccess] = useState(false);

    const { data: apiData, isLoading, error } = useQuery({
        queryKey: ['public', 'tenants', slug],
        queryFn: () => api.get(`/api/public/tenants/${slug}`).then((r) => r.data.data),
    });

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e4e4e4', background: '#fff' }}>
                    <div className="h-32 sm:h-40 animate-pulse" style={{ background: '#e4e4e4' }} />
                    <div className="p-5 sm:p-8 -mt-14 sm:-mt-16">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl animate-pulse mb-4" style={{ background: '#e4e4e4' }} />
                        <Skeleton height="h-8" width="w-2/3" className="mb-2" />
                        <Skeleton height="h-4" width="w-1/2" className="mb-6" />
                    </div>
                </div>
            </div>
        );
    }

    const t = error ? MOCK_TENANT_DETAIL : apiData;

    if (!t) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="rounded-2xl p-8" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)' }}>
                    <h2 className="text-xl font-bold" style={{ color: '#991b1b' }}>Startup Tidak Ditemukan</h2>
                    <p className="text-sm mt-2" style={{ color: '#dc2626' }}>Halaman yang Anda cari tidak tersedia.</p>
                    <Link to="/startup" className="inline-block mt-4 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: '#dc2626' }}>
                        Kembali ke Direktori
                    </Link>
                </div>
            </div>
        );
    }

    const currentIdx = stageIndex[t.stage] ?? 0;
    const activeBadges = t.activeBadges ?? [];
    const stageChecklist = t.stageChecklist ?? [];
    const nextStage = STAGES[currentIdx + 1];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Link to="/startup" className="inline-flex items-center gap-1 text-sm font-semibold mb-6 hover:underline" style={{ color: '#1a5d94' }}>
                <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>

            {error && (
                <div className="mb-4 p-3 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 ring-1 ring-amber-200">
                    Gagal terhubung ke API backend. Menampilkan data demo/offline.
                </div>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e4e4e4', background: '#ffffff' }}>

                {/* Cover header */}
                <div
                    className="h-28 sm:h-36"
                    style={{
                        background: t.cover_image
                            ? `url(${t.cover_image}) center/cover`
                            : 'linear-gradient(135deg, #142143, #1a5d94)',
                    }}
                />

                <div className="p-5 sm:p-8 -mt-12 sm:-mt-14">

                    {/* Logo */}
                    {t.logo ? (
                        <img src={t.logo} alt={t.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ring-white object-cover bg-white mb-4" />
                    ) : (
                        <div
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ring-white flex items-center justify-center text-3xl font-black mb-4"
                            style={{ background: 'linear-gradient(135deg, #142143, #1a5d94)', color: '#ffaf00' }}
                        >
                            {t.name.charAt(0)}
                        </div>
                    )}

                    {/* Header info */}
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#142143' }}>{t.name}</h1>
                            {t.subPhase && (
                                <p className="text-xs font-semibold mt-0.5" style={{ color: '#64748b' }}>
                                    Tahap inkubasi: {t.subPhase}
                                </p>
                            )}
                            <p className="mt-1 text-sm" style={{ color: '#475569' }}>{t.one_liner}</p>
                        </div>
                        {/* Stage pill */}
                        {STAGES[currentIdx] && (
                            <span
                                className="px-3 py-1 rounded-full text-xs font-bold uppercase shrink-0"
                                style={{ background: STAGES[currentIdx].activeBg, color: STAGES[currentIdx].color }}
                            >
                                {STAGES[currentIdx].label}
                            </span>
                        )}
                    </div>

                    {/* Website */}
                    {t.website && (
                        <a
                            href={t.website}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1.5 mt-1 text-sm font-semibold hover:underline"
                            style={{ color: '#1a5d94' }}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {t.website}
                        </a>
                    )}

                    {/* CTA Request Meeting */}
                    <button
                        onClick={() => setShowMeeting(true)}
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: '#ffaf00', color: '#0d1830' }}
                    >
                        <Calendar className="w-4 h-4" />
                        Request Meeting
                    </button>

                    {meetingSuccess && (
                        <div
                            className="mt-3 p-3 rounded-xl text-sm"
                            style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', color: '#166534' }}
                        >
                            Permintaan meeting Anda sudah terkirim. Tim PENSNOVA akan menghubungi Anda dalam 2x24 jam.
                        </div>
                    )}

                    {/* Perjalanan Stage — timeline horizontal */}
                    <div className="mt-8 p-5 rounded-2xl" style={{ background: '#f8f9fc', border: '1px solid #e4e4e4' }}>
                        <h2 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: '#94a3b8' }}>
                            Perjalanan Inkubasi
                        </h2>
                        <StageTimeline currentIdx={currentIdx} />
                    </div>

                    {/* Syarat Naik ke Stage Berikutnya */}
                    {nextStage && stageChecklist.length > 0 && (
                        <div className="mt-5 p-5 rounded-2xl" style={{ background: '#fef9ee', border: '1px solid #fde68a' }}>
                            <h2 className="text-sm font-bold mb-4" style={{ color: '#142143' }}>
                                Syarat Naik ke {nextStage.label}
                            </h2>
                            <ul className="space-y-2.5">
                                {stageChecklist.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm">
                                        {item.done ? (
                                            <div
                                                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ background: '#ffaf00' }}
                                            >
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4L3.5 6.5L9 1" stroke="#0d1830" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <Circle className="shrink-0 w-5 h-5" style={{ color: '#cbd5e1' }} />
                                        )}
                                        <span style={{ color: item.done ? '#142143' : '#64748b' }}>
                                            {item.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Badge yang Sudah Diraih */}
                    <div className="mt-5">
                        <h2 className="text-sm font-bold mb-3" style={{ color: '#142143' }}>Badge yang Sudah Diraih</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {TENANT_BADGES.map((badge) => {
                                const isActive = activeBadges.includes(badge.key);
                                return (
                                    <div
                                        key={badge.key}
                                        className="rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all"
                                        style={{
                                            background: isActive ? 'rgba(22,163,74,0.07)' : '#f8f9fc',
                                            border: isActive ? '1.5px solid rgba(22,163,74,0.25)' : '1px solid #e4e4e4',
                                        }}
                                        title={badge.desc}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ background: isActive ? 'rgba(255,175,0,0.15)' : 'rgba(148,163,184,0.12)' }}
                                        >
                                            <Star
                                                className="w-5 h-5"
                                                style={{ color: isActive ? '#ffaf00' : '#cbd5e1' }}
                                                fill={isActive ? '#ffaf00' : 'none'}
                                            />
                                        </div>
                                        <span
                                            className="text-[11px] font-bold leading-tight"
                                            style={{ color: isActive ? '#142143' : '#94a3b8' }}
                                        >
                                            {badge.label}
                                        </span>
                                        {!isActive && (
                                            <span className="text-[10px]" style={{ color: '#cbd5e1' }}>
                                                Belum diraih
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content grid — Tentang + Sidebar */}
                    <div className="mt-8 sm:mt-10 grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-bold mb-3" style={{ color: '#142143' }}>Tentang</h2>
                            <p className="leading-relaxed whitespace-pre-line" style={{ color: '#475569' }}>{t.description}</p>

                            {t.research_topics?.length > 0 && (
                                <>
                                    <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: '#142143' }}>Topik Riset</h2>
                                    <ul className="space-y-3">
                                        {t.research_topics.map((r) => (
                                            <li
                                                key={r.id}
                                                className="p-4 rounded-xl"
                                                style={{ background: '#f8f9fc', border: '1px solid #e4e4e4' }}
                                            >
                                                <Link to={`/riset/${r.slug}`} className="font-semibold hover:underline" style={{ color: '#142143' }}>
                                                    {r.title}
                                                </Link>
                                                <p className="text-sm mt-1 line-clamp-2" style={{ color: '#64748b' }}>{r.abstract}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {t.founders?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: '#94a3b8' }}>
                                        <Users className="w-4 h-4" /> Tim
                                    </h3>
                                    <ul className="space-y-2">
                                        {t.founders.map((f) => (
                                            <li key={f.id} className="text-sm">
                                                <div className="font-semibold" style={{ color: '#142143' }}>{f.name}</div>
                                                <div style={{ color: '#64748b' }}>{f.role}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {t.tech_stack?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#94a3b8' }}>Tech Stack</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {t.tech_stack.map((s) => (
                                            <span
                                                key={s}
                                                className="text-xs px-2.5 py-1 rounded-lg"
                                                style={{ background: 'rgba(26,93,148,0.08)', color: '#1a5d94' }}
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {t.batch && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#94a3b8' }}>Batch Inkubasi</h3>
                                    <div
                                        className="text-sm px-3 py-2 rounded-xl font-semibold inline-block"
                                        style={{ background: 'rgba(20,33,67,0.06)', color: '#142143' }}
                                    >
                                        {t.batch.name}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showMeeting && (
                <MeetingModal
                    tenant={t}
                    onClose={() => setShowMeeting(false)}
                    onSuccess={() => { setShowMeeting(false); setMeetingSuccess(true); }}
                    user={user}
                />
            )}
        </div>
    );
}

// Timeline horizontal perjalanan stage inkubasi
function StageTimeline({ currentIdx }) {
    return (
        <div className="relative">
            {/* Garis penghubung */}
            <div
                className="absolute top-4 left-4 right-4 h-0.5"
                style={{ background: '#e4e4e4', zIndex: 0 }}
            />
            {/* Garis pengisi sesuai progress */}
            <div
                className="absolute top-4 left-4 h-0.5 animate-stage-fill"
                style={{
                    width: currentIdx === 0
                        ? '0%'
                        : `${(currentIdx / (STAGES.length - 1)) * 92}%`,
                    background: 'linear-gradient(90deg, #142143, #06b6d4)',
                    zIndex: 1,
                }}
            />

            <div className="relative flex justify-between" style={{ zIndex: 2 }}>
                {STAGES.map((stage, i) => {
                    const done = i < currentIdx;
                    const active = i === currentIdx;
                    return (
                        <div key={stage.key} className="flex flex-col items-center gap-2">
                            {/* Titik stage */}
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all relative"
                                style={{
                                    background: done
                                        ? '#06b6d4'
                                        : active
                                        ? stage.activeBg
                                        : '#f1f5f9',
                                    border: active
                                        ? `2.5px solid ${stage.color}`
                                        : done
                                        ? '2px solid #06b6d4'
                                        : '2px solid #e4e4e4',
                                }}
                            >
                                {done ? (
                                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                        <path d="M1 5L4 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : active ? (
                                    <div
                                        className="w-3 h-3 rounded-full animate-pulse"
                                        style={{ background: stage.color }}
                                    />
                                ) : (
                                    <Lock className="w-3.5 h-3.5" style={{ color: '#cbd5e1' }} />
                                )}
                            </div>

                            {/* Label stage */}
                            <span
                                className="text-[10px] font-bold text-center leading-tight"
                                style={{
                                    color: done
                                        ? '#06b6d4'
                                        : active
                                        ? stage.color
                                        : '#94a3b8',
                                    maxWidth: '60px',
                                }}
                            >
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MeetingModal({ tenant, user, onClose, onSuccess }) {
    const [form, setForm] = useState({
        requester_name: user?.name || '',
        requester_email: user?.email || '',
        requester_organization: '',
        requester_type: 'public',
        subject: '',
        message: '',
        preferred_at: '',
    });
    const [errors, setErrors] = useState({});

    const mutation = useMutation({
        mutationFn: (payload) => api.post(`/api/public/tenants/${tenant.slug}/meeting-request`, payload),
        onSuccess: () => onSuccess(),
        onError: (err) => setErrors(err.response?.data?.errors || {}),
    });

    function submit(e) {
        e.preventDefault();
        setErrors({});
        const payload = { ...form };
        if (!payload.preferred_at) delete payload.preferred_at;
        mutation.mutate(payload);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,24,48,0.7)' }} onClick={onClose}>
            <div
                className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-2xl"
                style={{ background: '#ffffff' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-5">
                    <h3 className="text-lg font-bold" style={{ color: '#142143' }}>Request Meeting dengan {tenant.name}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg font-bold">x</button>
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <Field label="Nama" name="requester_name" value={form.requester_name} onChange={(v) => setForm({ ...form, requester_name: v })} error={errors.requester_name} required />
                    <Field label="Email" type="email" name="requester_email" value={form.requester_email} onChange={(v) => setForm({ ...form, requester_email: v })} error={errors.requester_email} required />
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Organisasi" name="requester_organization" value={form.requester_organization} onChange={(v) => setForm({ ...form, requester_organization: v })} error={errors.requester_organization} />
                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Saya seorang</label>
                            <select
                                value={form.requester_type}
                                onChange={(e) => setForm({ ...form, requester_type: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl text-sm"
                                style={{ border: '1px solid #e4e4e4', color: '#142143' }}
                            >
                                <option value="investor">Investor</option>
                                <option value="partner_company">Perusahaan</option>
                                <option value="mentor">Mentor</option>
                                <option value="public">Lainnya</option>
                            </select>
                        </div>
                    </div>
                    <Field label="Subjek" name="subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} error={errors.subject} required />
                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                            Pesan <span className="font-normal" style={{ color: '#94a3b8' }}>(min 30 karakter)</span>
                        </label>
                        <textarea
                            rows={4}
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            required
                            className="w-full px-3 py-2 rounded-xl text-sm"
                            style={{ border: '1px solid #e4e4e4' }}
                        />
                        {errors.message && <p className="mt-1 text-xs" style={{ color: '#dc2626' }}>{errors.message[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Waktu Disarankan</label>
                        <input
                            type="datetime-local"
                            value={form.preferred_at}
                            onChange={(e) => setForm({ ...form, preferred_at: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl text-sm"
                            style={{ border: '1px solid #e4e4e4' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ background: '#142143', color: 'white' }}
                    >
                        {mutation.isPending && <Spinner className="h-4 w-4" />}
                        Kirim Permintaan
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({ label, type = 'text', name, value, onChange, error, required }) {
    return (
        <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ border: '1px solid #e4e4e4' }}
            />
            {error && <p className="mt-1 text-xs" style={{ color: '#dc2626' }}>{error[0]}</p>}
        </div>
    );
}
