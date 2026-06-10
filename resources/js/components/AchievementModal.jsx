import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Lock, Trophy, Target, Calendar, Users, Gift } from 'lucide-react';
import api from '../lib/api';

/**
 * Modal showcase semua achievement — grid 19 badge dengan tier filter.
 * Earned: vibrant + earned date tooltip
 * Locked: grayed + lock icon
 * Hidden + not earned: full mask "???"
 */
export default function AchievementModal({ open, onClose }) {
    const [tab, setTab] = useState('quests');     // quests | team | badges | rewards
    const [filter, setFilter] = useState('all');
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['me', 'gamification', 'all'],
        queryFn: () => api.get('/api/me/gamification/all').then((r) => r.data.data),
        enabled: open && tab === 'badges',
        staleTime: 30_000,
    });

    const { data: quests, isLoading: qLoading } = useQuery({
        queryKey: ['me', 'quests'],
        queryFn: () => api.get('/api/me/quests').then((r) => r.data.data),
        enabled: open && tab === 'quests',
        staleTime: 30_000,
    });

    const { data: teamChallenges, isLoading: tcLoading } = useQuery({
        queryKey: ['me', 'team-challenges'],
        queryFn: () => api.get('/api/me/team-challenges').then((r) => r.data.data),
        enabled: open && tab === 'team',
        staleTime: 30_000,
    });

    const { data: rewards, isLoading: rLoading } = useQuery({
        queryKey: ['rewards'],
        queryFn: () => api.get('/api/rewards').then((r) => r.data.data),
        enabled: open && tab === 'rewards',
        staleTime: 60_000,
    });

    const { data: myGamification } = useQuery({
        queryKey: ['me', 'gamification'],
        queryFn: () => api.get('/api/me/gamification').then((r) => r.data.data),
        enabled: open,
    });

    const redeemMutation = useMutation({
        mutationFn: (rewardId) => api.post(`/api/rewards/${rewardId}/redeem`),
        onSuccess: (r) => {
            alert(r.data.data.message);
            qc.invalidateQueries({ queryKey: ['rewards'] });
            qc.invalidateQueries({ queryKey: ['me', 'gamification'] });
        },
        onError: (e) => alert(e?.response?.data?.message ?? 'Gagal redeem reward.'),
    });

    if (! open) return null;

    const filtered = (data || []).filter((b) => {
        if (filter === 'all') return true;
        if (filter === 'earned') return b.is_earned;
        if (filter === 'locked') return ! b.is_earned;
        return b.tier === filter;
    });

    const earnedCount = (data || []).filter((b) => b.is_earned).length;
    const totalCount = (data || []).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-primary-800 via-primary-900 to-slate-900 text-white p-5 sm:p-6 relative">
                    <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/10 transition" aria-label="Tutup">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-3">
                            <Trophy className="w-7 h-7 text-amber-400" />
                            <h2 className="text-xl sm:text-2xl font-extrabold">
                                {tab === 'quests' ? 'Quest Mingguan'
                                : tab === 'team' ? 'Team Challenge'
                                : tab === 'rewards' ? 'Reward Shop'
                                : 'Koleksi Pencapaian'}
                            </h2>
                        </div>
                        {myGamification && (
                            <div className="text-right text-xs">
                                <div className="text-amber-300 font-bold">{myGamification.total_xp?.toLocaleString('id-ID')} XP</div>
                                <div className="text-slate-400">Lv {myGamification.current_level}</div>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-slate-300">
                        {tab === 'quests'
                            ? 'Selesaikan quest minggu ini untuk dapat bonus XP.'
                            : tab === 'team'
                            ? 'Quest kolektif — gotong-royong capai target, semua peserta dapat reward.'
                            : tab === 'rewards'
                            ? 'Tukar XP Anda dengan reward virtual, benefit, sertifikat, atau merchandise!'
                            : <><strong className="text-amber-400">{earnedCount}</strong> dari <strong>{totalCount}</strong> badge terbuka.</>
                        }
                    </p>
                </div>

                {/* Top tabs: Quest / Team / Badge / Reward */}
                <div className="border-b border-slate-200 bg-white flex overflow-x-auto">
                    <button onClick={() => setTab('quests')}
                        className={`flex-1 min-w-[120px] px-3 py-3 text-xs sm:text-sm font-bold transition inline-flex items-center justify-center gap-1.5 ${
                            tab === 'quests' ? 'text-primary-800 border-b-2 border-primary-700 bg-primary-50/50' : 'text-slate-600 hover:bg-slate-50'
                        }`}>
                        <Target className="w-4 h-4" /> Quest
                    </button>
                    <button onClick={() => setTab('team')}
                        className={`flex-1 min-w-[120px] px-3 py-3 text-xs sm:text-sm font-bold transition inline-flex items-center justify-center gap-1.5 ${
                            tab === 'team' ? 'text-primary-800 border-b-2 border-primary-700 bg-primary-50/50' : 'text-slate-600 hover:bg-slate-50'
                        }`}>
                        <Users className="w-4 h-4" /> Team
                    </button>
                    <button onClick={() => setTab('badges')}
                        className={`flex-1 min-w-[120px] px-3 py-3 text-xs sm:text-sm font-bold transition inline-flex items-center justify-center gap-1.5 ${
                            tab === 'badges' ? 'text-primary-800 border-b-2 border-primary-700 bg-primary-50/50' : 'text-slate-600 hover:bg-slate-50'
                        }`}>
                        <Trophy className="w-4 h-4" /> Badge
                    </button>
                    <button onClick={() => setTab('rewards')}
                        className={`flex-1 min-w-[120px] px-3 py-3 text-xs sm:text-sm font-bold transition inline-flex items-center justify-center gap-1.5 ${
                            tab === 'rewards' ? 'text-primary-800 border-b-2 border-primary-700 bg-primary-50/50' : 'text-slate-600 hover:bg-slate-50'
                        }`}>
                        <Gift className="w-4 h-4" /> Reward Shop
                    </button>
                </div>

                {/* Filter tabs (badge only) */}
                {tab === 'badges' && (
                    <div className="border-b border-slate-200 px-3 sm:px-5 flex gap-1 overflow-x-auto bg-slate-50">
                        {[
                            { key: 'all', label: 'Semua', count: totalCount },
                            { key: 'earned', label: 'Dikoleksi', count: earnedCount },
                            { key: 'locked', label: 'Belum', count: totalCount - earnedCount },
                            { key: 'bronze', label: '🥉 Bronze', count: (data || []).filter((b) => b.tier === 'bronze').length },
                            { key: 'silver', label: '🥈 Silver', count: (data || []).filter((b) => b.tier === 'silver').length },
                            { key: 'gold', label: '🥇 Gold', count: (data || []).filter((b) => b.tier === 'gold').length },
                        ].map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setFilter(t.key)}
                                className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                                    filter === t.key
                                        ? 'border-primary-700 text-primary-800'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {t.label} <span className="ml-0.5 opacity-70">({t.count})</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    {tab === 'quests' && (
                        qLoading ? <div className="text-center py-12 text-slate-500 text-sm">Memuat quest...</div>
                        : ! quests || quests.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">Belum ada quest aktif minggu ini.</p>
                                <p className="text-xs text-slate-500 mt-1">Quest baru akan muncul Senin pagi.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {quests.map((q) => <QuestCard key={q.slug} quest={q} />)}
                            </div>
                        )
                    )}
                    {tab === 'team' && (
                        tcLoading ? <div className="text-center py-12 text-slate-500 text-sm">Memuat team challenge...</div>
                        : ! teamChallenges || teamChallenges.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">Belum ada team challenge aktif.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {teamChallenges.map((c) => <TeamChallengeCard key={c.slug} challenge={c} />)}
                            </div>
                        )
                    )}
                    {tab === 'rewards' && (
                        rLoading ? <div className="text-center py-12 text-slate-500 text-sm">Memuat reward shop...</div>
                        : ! rewards || rewards.length === 0 ? (
                            <div className="text-center py-12">
                                <Gift className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">Reward shop kosong saat ini.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {rewards.map((r) => (
                                    <RewardCard
                                        key={r.slug}
                                        reward={r}
                                        userXp={myGamification?.total_xp ?? 0}
                                        onRedeem={() => {
                                            if (confirm(`Redeem "${r.name}" dengan ${r.xp_cost} XP?`)) {
                                                redeemMutation.mutate(r.id);
                                            }
                                        }}
                                        disabled={redeemMutation.isPending}
                                    />
                                ))}
                            </div>
                        )
                    )}
                    {tab === 'badges' && (
                        isLoading ? <div className="text-center py-12 text-slate-500 text-sm">Memuat...</div>
                        : filtered.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-sm">Tidak ada badge dengan filter ini.</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filtered.map((b) => (
                                    <BadgeCard key={b.slug} badge={b} />
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

function TeamChallengeCard({ challenge }) {
    const done = challenge.is_completed;
    return (
        <div className={`rounded-xl p-4 ring-1 transition relative overflow-hidden ${
            done ? 'bg-emerald-50 ring-emerald-200' : 'bg-gradient-to-br from-violet-50 to-fuchsia-50 ring-violet-200'
        }`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-3xl shrink-0">{challenge.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-slate-900">{challenge.name}</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600 text-white font-bold uppercase tracking-wider">TEAM</span>
                            {done && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">DONE!</span>}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{challenge.description}</p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-violet-700 font-extrabold text-sm">+{challenge.xp_reward_per_participant} XP</div>
                    <div className="text-[10px] text-slate-500">per peserta</div>
                </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-700 ${done ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
                        style={{ width: `${challenge.progress_pct}%` }}
                    />
                </div>
                <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                    {challenge.current_count}/{challenge.target_count}
                </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600">
                <span>👥 {challenge.participants_count} peserta · kamu kontribusi {challenge.my_contribution}</span>
                <span>{challenge.days_left}h tersisa</span>
            </div>
        </div>
    );
}

function RewardCard({ reward, userXp, onRedeem, disabled }) {
    const canAfford = userXp >= reward.xp_cost;
    const typeBadge = {
        virtual: { bg: 'bg-cyan-100 text-cyan-700', label: 'Instant' },
        benefit: { bg: 'bg-violet-100 text-violet-700', label: 'Benefit' },
        certificate: { bg: 'bg-amber-100 text-amber-700', label: 'Sertifikat' },
        merchandise: { bg: 'bg-rose-100 text-rose-700', label: 'Merch' },
    }[reward.type] || { bg: 'bg-slate-100 text-slate-700', label: reward.type };

    return (
        <div className={`rounded-xl p-4 ring-1 transition flex flex-col ${
            canAfford && reward.in_stock ? 'bg-white ring-slate-200 hover:ring-amber-300 hover:shadow-md' : 'bg-slate-50 ring-slate-200 opacity-70'
        }`}>
            <div className="flex items-start justify-between mb-2">
                <div className="text-4xl">{reward.icon}</div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${typeBadge.bg}`}>
                    {typeBadge.label}
                </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900">{reward.name}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2 flex-1">{reward.description}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
                <div>
                    <div className="text-amber-700 font-extrabold text-base">{reward.xp_cost.toLocaleString('id-ID')} XP</div>
                    {reward.stock > 0 && reward.stock <= 5 && (
                        <div className="text-[10px] text-rose-600 font-bold">Sisa {reward.stock}</div>
                    )}
                </div>
                <button
                    onClick={onRedeem}
                    disabled={! canAfford || ! reward.in_stock || disabled}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        canAfford && reward.in_stock
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {! reward.in_stock ? 'Stok habis' : canAfford ? 'Redeem' : 'XP kurang'}
                </button>
            </div>
        </div>
    );
}

function QuestCard({ quest }) {
    const pct = Math.min(100, (quest.current_progress / quest.target_count) * 100);
    const done = quest.is_completed;
    return (
        <div className={`rounded-xl p-4 ring-1 transition ${
            done ? 'bg-emerald-50 ring-emerald-200' : 'bg-white ring-slate-200'
        }`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-3xl shrink-0">{quest.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-slate-900">{quest.name}</h3>
                            {done && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">SELESAI</span>}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{quest.description}</p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-amber-700 font-extrabold text-sm">+{quest.xp_reward} XP</div>
                    <div className="text-[10px] text-slate-500">{quest.days_left}h tersisa</div>
                </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-700 ${done ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-amber-500'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                    {quest.current_progress}/{quest.target_count}
                </span>
            </div>
        </div>
    );
}

function BadgeCard({ badge }) {
    const tierClass = {
        bronze: 'from-amber-700/10 to-orange-800/10 ring-amber-700/40',
        silver: 'from-slate-400/10 to-slate-600/10 ring-slate-400/40',
        gold: 'from-amber-400/10 to-yellow-500/10 ring-amber-400/40',
    }[badge.tier];

    return (
        <div
            className={`relative rounded-xl p-4 ring-1 bg-gradient-to-br transition ${
                badge.is_earned ? `${tierClass}` : 'from-slate-100 to-slate-50 ring-slate-200'
            }`}
            title={badge.description}
        >
            {! badge.is_earned && (
                <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-slate-400" />
            )}
            <div className={`text-3xl mb-2 ${! badge.is_earned ? 'grayscale opacity-50' : ''}`}>
                {badge.icon}
            </div>
            <div className={`text-xs uppercase tracking-wider font-bold mb-1`}
                 style={{ color: badge.is_earned ? badge.tier_color : '#94a3b8' }}>
                {badge.tier}
            </div>
            <h3 className={`font-bold text-sm leading-tight ${badge.is_earned ? 'text-slate-900' : 'text-slate-600'}`}>
                {badge.name}
            </h3>
            <p className={`text-[10px] mt-1.5 line-clamp-2 ${badge.is_earned ? 'text-slate-700' : 'text-slate-500'}`}>
                {badge.description}
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[10px]">
                <span className={`font-bold ${badge.is_earned ? 'text-amber-700' : 'text-slate-400'}`}>
                    +{badge.xp_reward} XP
                </span>
                {badge.is_earned && badge.earned_at && (
                    <span className="text-emerald-600 font-semibold">
                        ✓ {new Date(badge.earned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                )}
            </div>
        </div>
    );
}
