import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Building2, Mail, Phone, Clock, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import Spinner from '../../components/Spinner';

const STATUS_COLOR = {
    pending: 'warning',
    accepted: 'success',
    declined: 'destructive',
    rescheduled: 'secondary',
    completed: 'default',
};

const STATUS_LABEL = {
    pending: 'Menunggu',
    accepted: 'Diterima',
    declined: 'Ditolak',
    rescheduled: 'Re-schedule',
    completed: 'Selesai',
};

export default function InvestorMeetings() {
    const { data, isLoading } = useQuery({
        queryKey: ['investor', 'meeting-requests'],
        queryFn: () => api.get('/api/investor/meeting-requests').then((r) => r.data),
    });

    const meetings = data?.data || data || [];
    const pending = meetings.filter((m) => m.status === 'pending');
    const others = meetings.filter((m) => m.status !== 'pending');

    return (
        <div>
            <header className="mb-5 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-7 w-7 text-violet-700" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Permintaan Meeting
                        </h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        Status meeting yang Anda ajukan dengan startup binaan PENSNOVA.
                    </p>
                </div>
                <Button asChild>
                    <Link to="/startup">
                        <Building2 className="h-4 w-4" />
                        Browse Startup
                    </Link>
                </Button>
            </header>

            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <Spinner className="h-8 w-8 text-violet-600" />
                </div>
            ) : meetings.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-bold text-base">Belum ada permintaan meeting</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                            Telusuri direktori startup, lalu klik "Request Meeting" di halaman tenant.
                        </p>
                        <Button asChild>
                            <Link to="/startup">
                                <Building2 className="h-4 w-4" />
                                Browse Startup
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {pending.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3">
                                ⏳ Menunggu Response ({pending.length})
                            </h2>
                            <div className="space-y-3">
                                {pending.map((m) => (
                                    <MeetingCard key={m.id} meeting={m} highlight />
                                ))}
                            </div>
                        </section>
                    )}

                    {others.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                                Riwayat ({others.length})
                            </h2>
                            <div className="space-y-3">
                                {others.map((m) => (
                                    <MeetingCard key={m.id} meeting={m} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

function MeetingCard({ meeting, highlight = false }) {
    const requested = new Date(meeting.created_at);
    const preferred = meeting.preferred_at ? new Date(meeting.preferred_at) : null;

    return (
        <Card className={highlight ? 'ring-2 ring-amber-200' : ''}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="font-bold text-base">
                                {meeting.tenant?.name || 'Startup'}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                                Diajukan {requested.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>
                    <Badge variant={STATUS_COLOR[meeting.status] || 'secondary'}>
                        {STATUS_LABEL[meeting.status] || meeting.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {meeting.purpose && (
                        <div className="sm:col-span-2">
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">
                                Tujuan
                            </div>
                            <p className="text-slate-700 line-clamp-2">{meeting.purpose}</p>
                        </div>
                    )}
                    {preferred && (
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                    Tanggal yang Diharapkan
                                </div>
                                <div className="text-sm font-medium">
                                    {preferred.toLocaleString('id-ID', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    {meeting.tenant?.user && (
                        <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                    Kontak Founder
                                </div>
                                <a
                                    href={`mailto:${meeting.tenant.user.email}`}
                                    className="text-sm font-medium text-violet-700 hover:underline truncate"
                                >
                                    {meeting.tenant.user.email}
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {meeting.tenant?.slug && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        <Link
                            to={`/startup/${meeting.tenant.slug}`}
                            className="text-xs font-semibold text-violet-700 hover:underline inline-flex items-center gap-1"
                        >
                            Lihat profil startup
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
