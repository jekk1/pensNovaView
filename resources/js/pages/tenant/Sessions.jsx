import { useQuery } from '@tanstack/react-query';
import { Calendar, Video, MapPin, Clock, User } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Spinner from '../../components/Spinner';

const STATUS_COLOR = {
    scheduled: 'default',
    completed: 'success',
    cancelled: 'destructive',
    rescheduled: 'warning',
};

export default function TenantSessions() {
    const { data, isLoading } = useQuery({
        queryKey: ['tenant', 'mentoring-sessions'],
        queryFn: () => api.get('/api/tenant/mentoring-sessions').then((r) => r.data),
    });

    const sessions = data?.data || data || [];
    const upcoming = sessions.filter((s) => new Date(s.scheduled_at) >= new Date());
    const past = sessions.filter((s) => new Date(s.scheduled_at) < new Date());

    return (
        <div>
            <header className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-7 w-7 text-emerald-700" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Sesi Mentoring
                    </h1>
                </div>
                <p className="text-sm text-slate-600">
                    Jadwal sesi mentoring dengan mentor yang ditugaskan ke startup Anda.
                </p>
            </header>

            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <Spinner className="h-8 w-8 text-emerald-600" />
                </div>
            ) : sessions.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-bold text-base">Belum ada sesi terjadwal</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Mentor akan menjadwalkan sesi saat program inkubasi berjalan.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {upcoming.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
                                Akan Datang ({upcoming.length})
                            </h2>
                            <div className="space-y-3">
                                {upcoming.map((s) => (
                                    <SessionCard key={s.id} session={s} highlight />
                                ))}
                            </div>
                        </section>
                    )}

                    {past.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                                Riwayat ({past.length})
                            </h2>
                            <div className="space-y-3">
                                {past.slice(0, 10).map((s) => (
                                    <SessionCard key={s.id} session={s} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

function SessionCard({ session, highlight = false }) {
    const date = new Date(session.scheduled_at);
    const isVideo = ['online', 'video'].includes(session.mode);

    return (
        <Card className={highlight ? 'ring-2 ring-emerald-200' : ''}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div
                        className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center ${
                            highlight ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                        <div className="text-xs uppercase font-semibold leading-none">
                            {date.toLocaleDateString('id-ID', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-extrabold leading-none mt-0.5">
                            {date.getDate()}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-base leading-tight">{session.title}</h3>
                            <Badge variant={STATUS_COLOR[session.status] || 'secondary'}>
                                {session.status}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5">
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {date.toLocaleString('id-ID', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                            {session.mentor && (
                                <span className="inline-flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {session.mentor.name}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                                {isVideo ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                {session.mode}
                            </span>
                        </div>
                        {session.notes && (
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
                                {session.notes}
                            </p>
                        )}
                        {session.meeting_link && session.status === 'scheduled' && (
                            <a
                                href={session.meeting_link}
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-700 hover:underline"
                            >
                                <Video className="h-3 w-3" />
                                Join meeting →
                            </a>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
