import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Flame, Zap, Lock, ChevronRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../lib/api';
import AchievementModal from './AchievementModal';

/**
 * Widget gamifikasi untuk dashboard — tampilkan XP, Level, Streak, Badges.
 * Single compact card yang fit di top dashboard.
 */
export default function GamificationWidget() {
    const [modalOpen, setModalOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['me', 'gamification'],
        queryFn: () => api.get('/api/me/gamification').then((r) => r.data.data),
        staleTime: 60_000,
    });

    const { data: xpHistory } = useQuery({
        queryKey: ['me', 'xp-history'],
        queryFn: () => api.get('/api/me/xp-history').then((r) => r.data.data),
        staleTime: 5 * 60_000,
    });

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-gradient-to-br from-primary-800 via-primary-900 to-slate-900 text-white p-5 sm:p-6 animate-pulse">
                <div className="h-4 w-32 bg-white/10 rounded mb-3" />
                <div className="h-8 w-48 bg-white/10 rounded mb-2" />
                <div className="h-2 w-full bg-white/10 rounded-full" />
            </div>
        );
    }

    if (! data) return null;

    const {
        total_xp, current_level, xp_for_next_level, progress_to_next_level,
        badges_earned_count, badges_total_count, current_streak_days,
        recent_badges = [],
    } = data;

    return (
        <div className="rounded-2xl bg-gradient-to-br from-primary-800 via-primary-900 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

            <div className="relative">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold mb-0.5 flex items-center gap-1.5">
                            <Trophy className="w-3 h-3" /> Pencapaian Anda
                        </div>
                        <div className="text-2xl font-extrabold flex items-baseline gap-1.5">
                            Level <span className="text-amber-400">{current_level}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-300 font-semibold">{total_xp.toLocaleString('id-ID')} XP</div>
                        <div className="text-[10px] text-slate-400">menuju Level {current_level + 1}</div>
                    </div>
                </div>

                {/* XP progress bar */}
                <div className="mb-4">
                    <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
                            style={{ width: `${progress_to_next_level}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1.5 text-right">
                        {Math.round(progress_to_next_level)}% — {(xp_for_next_level - total_xp).toLocaleString('id-ID')} XP lagi
                    </div>
                </div>

                {/* XP history sparkline (30 hari) */}
                {xpHistory && xpHistory.length > 0 && (
                    <div className="mb-4 -mx-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">30 Hari Terakhir</div>
                            <div className="text-[10px] text-amber-300 font-bold">+{xpHistory.reduce((s, d) => s + d.daily, 0)} XP</div>
                        </div>
                        <div className="h-12 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={xpHistory} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                                    <defs>
                                        <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.6} />
                                            <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, fontSize: 11, padding: '4px 8px' }}
                                        labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                                        itemStyle={{ color: '#fbbf24' }}
                                        formatter={(v) => [`+${v} XP`, '']}
                                        labelFormatter={(d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    />
                                    <Area type="monotone" dataKey="daily" stroke="#fbbf24" strokeWidth={1.5} fill="url(#xpGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Mini stats: badges + streak */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg bg-white/5 backdrop-blur ring-1 ring-white/10 p-3">
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                            <Trophy className="w-3.5 h-3.5" /> Badge
                        </div>
                        <div className="text-lg font-extrabold mt-0.5">
                            {badges_earned_count}<span className="text-sm text-slate-400">/{badges_total_count}</span>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white/5 backdrop-blur ring-1 ring-white/10 p-3">
                        <div className="flex items-center gap-1.5 text-xs text-orange-300 font-bold uppercase tracking-wider">
                            <Flame className="w-3.5 h-3.5" /> Streak
                        </div>
                        <div className="text-lg font-extrabold mt-0.5">
                            {current_streak_days}<span className="text-sm text-slate-400"> hari</span>
                        </div>
                    </div>
                </div>

                {/* Recent badges showcase */}
                {recent_badges.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Badge Terakhir</div>
                            <button onClick={() => setModalOpen(true)} className="text-[10px] uppercase tracking-wider font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-0.5">
                                Lihat Semua <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recent_badges.slice(0, 5).map((b) => (
                                <BadgeChip key={b.slug} badge={b} />
                            ))}
                        </div>
                    </div>
                )}

                {recent_badges.length === 0 && (
                    <button onClick={() => setModalOpen(true)} className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 p-3 text-xs text-slate-300 flex items-center justify-between hover:bg-white/10 transition">
                        <span className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" />
                            Belum ada badge — lihat 19 badge yang bisa dikoleksi
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <AchievementModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
    );
}

function BadgeChip({ badge }) {
    return (
        <div
            className="group relative rounded-lg bg-gradient-to-br p-0.5 cursor-help"
            style={{
                background: `linear-gradient(135deg, ${badge.tier_color}, ${badge.tier_color}80)`,
            }}
            title={`${badge.name} — ${badge.description}`}
        >
            <div className="bg-slate-900/90 rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
                <span className="text-base">{badge.icon}</span>
                <span className="text-xs font-bold whitespace-nowrap">{badge.name}</span>
            </div>
        </div>
    );
}
