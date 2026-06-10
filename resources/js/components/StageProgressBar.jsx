import { CheckCircle2, Circle, Lock } from 'lucide-react';

// Definisi stage inkubasi beserta syarat naik ke stage berikutnya
const STAGES = [
    {
        key: 'prototype',
        label: 'Prototype',
        short: 'Proto',
        color: '#1a5d94',
        requirements: [
            'Submit laporan bulanan',
            'Selesaikan sesi mentoring awal',
        ],
    },
    {
        key: 'mvp',
        label: 'MVP',
        short: 'MVP',
        color: '#1a5d94',
        requirements: [
            'Submit laporan bulanan',
            'Validasi pasar (wawancara user)',
            'Selesaikan sesi mentoring',
        ],
    },
    {
        key: 'early_revenue',
        label: 'Early Revenue',
        short: 'Revenue',
        color: '#ffaf00',
        requirements: [
            'Submit laporan bulanan',
            'Daftarkan HKI',
            'Selesaikan sesi mentoring',
            'Validasi pasar (wawancara user)',
        ],
    },
    {
        key: 'growth',
        label: 'Growth',
        short: 'Growth',
        color: '#16a34a',
        requirements: [
            'Submit laporan bulanan',
            'Milestone bisnis tercapai',
        ],
    },
];

// Mapping stage dari API ke index
const stageIndex = {
    prototype: 0,
    mvp: 1,
    early_revenue: 2,
    growth: 3,
    Prototype: 0,
    MVP: 1,
    'Early Revenue': 2,
    Growth: 3,
};

// Komponen bar visual stage progression tenant
export default function StageProgressBar({ currentStage, compact = false, checkedRequirements = [] }) {
    const currentIdx = stageIndex[currentStage] ?? 0;
    const fillPercent = (currentIdx / (STAGES.length - 1)) * 100;

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: '#142143' }}>
                    <span>Tahap Inkubasi</span>
                    <span style={{ color: STAGES[currentIdx]?.color }}>{STAGES[currentIdx]?.label}</span>
                </div>
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 rounded-full animate-stage-fill"
                        style={{ width: `${fillPercent}%`, background: 'linear-gradient(90deg, #1a5d94, #ffaf00)' }}
                    />
                </div>
                <div className="flex justify-between">
                    {STAGES.map((s, i) => (
                        <div key={s.key} className="flex flex-col items-center gap-1">
                            <div
                                className="w-2 h-2 rounded-full transition-all"
                                style={{ background: i <= currentIdx ? s.color : '#e4e4e4' }}
                            />
                            <span className="text-[9px] font-semibold text-slate-500">{s.short}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: '#142143' }}>
                    Perjalanan Inkubasi
                </h3>
                <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ background: STAGES[currentIdx]?.color ?? '#1a5d94' }}
                >
                    {STAGES[currentIdx]?.label ?? currentStage}
                </span>
            </div>

            {/* Track progress bar */}
            <div className="relative">
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                        className="h-full rounded-full animate-stage-fill"
                        style={{ width: `${fillPercent}%`, background: 'linear-gradient(90deg, #142143, #1a5d94, #ffaf00)' }}
                    />
                </div>

                {/* Stage dots */}
                <div className="absolute -top-[9px] left-0 right-0 flex justify-between">
                    {STAGES.map((s, i) => {
                        const done = i < currentIdx;
                        const active = i === currentIdx;
                        return (
                            <div key={s.key} className="flex flex-col items-center">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all"
                                    style={{
                                        background: done ? '#16a34a' : active ? s.color : '#e4e4e4',
                                        transform: active ? 'scale(1.2)' : 'scale(1)',
                                    }}
                                >
                                    {done ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    ) : active ? (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    ) : (
                                        <Lock className="w-3 h-3 text-slate-400" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stage labels */}
            <div className="flex justify-between pt-1">
                {STAGES.map((s, i) => {
                    const done = i < currentIdx;
                    const active = i === currentIdx;
                    return (
                        <div key={s.key} className="flex flex-col items-center gap-0.5 text-center" style={{ flex: 1 }}>
                            <span
                                className="text-[10px] font-bold"
                                style={{ color: done ? '#16a34a' : active ? s.color : '#94a3b8' }}
                            >
                                {s.short}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Syarat untuk naik ke stage berikutnya */}
            {currentIdx < STAGES.length - 1 && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 mt-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Syarat naik ke {STAGES[currentIdx + 1]?.label}
                    </div>
                    <ul className="space-y-1.5">
                        {STAGES[currentIdx + 1]?.requirements.map((req) => {
                            const checked = checkedRequirements.includes(req);
                            return (
                                <li key={req} className="flex items-center gap-2 text-xs">
                                    {checked ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                                    )}
                                    <span style={{ color: checked ? '#16a34a' : '#475569' }}>{req}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
