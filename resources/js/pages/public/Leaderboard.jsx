import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import api from '../../lib/api';
import PageHero from '../../components/PageHero';
import Avatar from '../../components/Avatar';

const ROLES = [
    { key: 'all', label: 'Semua' },
    { key: 'tenant', label: 'Tenant' },
    { key: 'mentor', label: 'Mentor' },
    { key: 'investor', label: 'Investor' },
];

/**
 * Leaderboard publik — top 20 user by total XP, filter per role.
 */
export default function Leaderboard() {
    const [role, setRole] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['leaderboard', 'xp', role],
        queryFn: () => api.get('/api/leaderboard/xp', { params: { role } }).then((r) => r.data.data),
        staleTime: 60_000,
    });

    return (
        <div className="bg-slate-50">
            <PageHero
                eyebrow="Pencapaian Komunitas"
                title="Leaderboard"
                accent="XP"
                titleAfter=" PENSNOVA"
                subtitle="Top 20 user dengan XP tertinggi — dari tenant founders, mentor, sampai investor. Kumpulkan badge & naik level untuk masuk daftar ini!"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                {/* Role filter tabs */}
                <div className="mb-6 flex flex-wrap gap-2 justify-center">
                    {ROLES.map((r) => (
                        <button
                            key={r.key}
                            onClick={() => setRole(r.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                                role === r.key
                                    ? 'bg-primary-700 text-white'
                                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-slate-500">Memuat leaderboard...</div>
                ) : ! data || data.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-900">Belum ada peserta di leaderboard ini</h3>
                        <p className="text-sm text-slate-600 mt-2">Mulai aktif untuk masuk daftar top 20!</p>
                    </div>
                ) : (
                    <>
                        {/* Top 3 podium */}
                        {data.length >= 3 && (
                            <div className="grid grid-cols-3 gap-3 mb-8 items-end">
                                <PodiumCard user={data[1]} place={2} />
                                <PodiumCard user={data[0]} place={1} />
                                <PodiumCard user={data[2]} place={3} />
                            </div>
                        )}

                        {/* List */}
                        <div className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden shadow-sm">
                            {data.slice(data.length >= 3 ? 3 : 0).map((u) => (
                                <RankRow key={u.rank} user={u} />
                            ))}
                        </div>

                        <div className="mt-6 text-center text-xs text-slate-500">
                            Leaderboard diperbarui setiap menit. XP didapat dari achievement, login streak, dan progress program.
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function PodiumCard({ user, place }) {
    const config = {
        1: { color: '#f59e0b', icon: Crown, h: 'h-44', text: 'text-amber-900' },
        2: { color: '#94a3b8', icon: Medal, h: 'h-36', text: 'text-slate-800' },
        3: { color: '#f97316', icon: Award, h: 'h-32', text: 'text-orange-900' },
    }[place];

    const Icon = config.icon;

    return (
        <div className={`${config.h} rounded-t-2xl p-4 flex flex-col items-center justify-end relative overflow-hidden`} style={{ background: config.color }}>
            <div className="absolute -top-2 -right-2 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
            <Icon className="w-7 h-7 text-white mb-1 relative" />
            <Avatar
                user={{ name: user.name, avatar: user.avatar, frame_tier: user.frame_tier }}
                size="md"
                showLevel
                level={user.current_level}
            />
            <div className="text-2xl font-black text-white mt-2 relative">#{place}</div>
            <div className={`text-xs font-bold text-center line-clamp-2 px-1 relative ${config.text}`}>
                {user.name}
            </div>
            <div className="mt-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-bold relative">
                {user.total_xp.toLocaleString('id-ID')} XP
            </div>
        </div>
    );
}

function RankRow({ user }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition">
            <div className="w-8 text-center">
                <span className="text-sm font-bold text-slate-500">#{user.rank}</span>
            </div>
            <Avatar
                user={{ name: user.name, avatar: user.avatar, frame_tier: user.frame_tier }}
                size="sm"
                showLevel
                level={user.current_level}
            />
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="text-amber-600 font-bold">Lv {user.current_level}</span>
                    <span>·</span>
                    <span>{user.badges} <Medal className="h-3 w-3 inline" /></span>
                </div>
            </div>
            <div className="text-right">
                <div className="text-sm font-extrabold text-primary-800">{user.total_xp.toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-slate-500 font-medium">XP</div>
            </div>
        </div>
    );
}
