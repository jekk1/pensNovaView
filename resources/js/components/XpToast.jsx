import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Zap, Sparkles } from 'lucide-react';

/**
 * Global XP Toast — detect perubahan total_xp dari query cache,
 * tampilkan popup animasi "+50 XP — Badge: Tenant Created" ketika XP naik.
 *
 * Cara kerja:
 *  - Listen ke query 'me/gamification' lewat React Query subscribe
 *  - Bandingkan total_xp lama dengan baru
 *  - Kalau naik, hitung delta + cek apakah ada badge baru (compare recent_badges)
 *  - Render toast 4 detik, lalu auto-dismiss
 *  - Multiple toasts stacked
 *
 * Pasang sekali di root App (di app.jsx) — fungsi global di semua page authenticated.
 */
export default function XpToast() {
    const qc = useQueryClient();
    const [toasts, setToasts] = useState([]);
    const lastXp = useRef(null);
    const lastBadgeSlug = useRef(null);

    useEffect(() => {
        const unsub = qc.getQueryCache().subscribe((event) => {
            if (event.type !== 'updated') return;
            const q = event.query;
            if (! q.queryKey || q.queryKey[0] !== 'me' || q.queryKey[1] !== 'gamification') return;
            const data = q.state.data?.data;
            if (! data) return;

            const newXp = data.total_xp;
            const newBadge = data.recent_badges?.[0]?.slug;

            // First fetch — set baseline tanpa toast
            if (lastXp.current === null) {
                lastXp.current = newXp;
                lastBadgeSlug.current = newBadge;
                return;
            }

            const delta = newXp - lastXp.current;
            const badgeUnlocked = newBadge && newBadge !== lastBadgeSlug.current
                ? data.recent_badges[0]
                : null;

            if (delta > 0 || badgeUnlocked) {
                const id = Date.now() + Math.random();
                setToasts((t) => [...t, { id, delta, badge: badgeUnlocked }]);
                setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
            }

            lastXp.current = newXp;
            lastBadgeSlug.current = newBadge;
        });
        return () => unsub();
    }, [qc]);

    // Polling: refresh /me/gamification setiap 30 detik (kalau ada page authenticated)
    useEffect(() => {
        const interval = setInterval(() => {
            qc.invalidateQueries({ queryKey: ['me', 'gamification'] });
        }, 30_000);
        return () => clearInterval(interval);
    }, [qc]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
            {toasts.map((t) => (
                <ToastCard key={t.id} delta={t.delta} badge={t.badge} />
            ))}
        </div>
    );
}

function ToastCard({ delta, badge }) {
    if (badge) {
        return (
            <div className="pointer-events-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-2xl animate-toast-in"
                 style={{ boxShadow: `0 10px 40px ${badge.tier_color || '#f59e0b'}66` }}>
                <div className="bg-slate-900 rounded-xl p-4 flex items-center gap-3 text-white">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-2xl shadow-lg shrink-0">
                        {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Badge Unlocked!
                        </div>
                        <div className="font-extrabold text-base truncate">{badge.name}</div>
                        <div className="text-xs text-amber-300 font-bold">+{badge.xp_reward} XP</div>
                    </div>
                </div>
            </div>
        );
    }

    if (delta > 0) {
        return (
            <div className="pointer-events-auto rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 px-4 py-3 shadow-2xl text-white flex items-center gap-2 animate-toast-in">
                <Zap className="w-5 h-5 text-amber-300" />
                <div>
                    <div className="text-sm font-extrabold">+{delta} XP</div>
                    <div className="text-[10px] text-slate-300">Selamat!</div>
                </div>
            </div>
        );
    }
    return null;
}
