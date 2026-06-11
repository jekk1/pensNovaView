import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Building2, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Spinner from '../../components/Spinner';

export default function MentorTenants() {
    const { data, isLoading } = useQuery({
        queryKey: ['mentor', 'tenants'],
        queryFn: () => api.get('/api/mentor/tenants').then((r) => r.data),
    });

    const tenants = data?.data || data || [];

    return (
        <div>
            <header className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Users className="h-7 w-7 text-sky-700" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Tenant Binaan
                    </h1>
                </div>
                <p className="text-sm text-slate-600">
                    Startup yang sedang Anda bina dalam program inkubasi.
                </p>
            </header>

            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <Spinner className="h-8 w-8 text-sky-600" />
                </div>
            ) : tenants.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-bold text-base">Belum ada tenant binaan</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Admin akan menugaskan tenant kepada Anda sesuai ekspertise.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tenants.map((t) => (
                        <TenantCard key={t.id} tenant={t} />
                    ))}
                </div>
            )}
        </div>
    );
}

function TenantCard({ tenant }) {
    return (
        <Card className="hover:shadow-md transition">
            <CardContent className="p-5">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-lg">
                        {tenant.logo ? (
                            <img
                                src={`/storage/${tenant.logo}`}
                                alt={tenant.name}
                                className="w-full h-full rounded-xl object-cover"
                            />
                        ) : (
                            <Building2 className="h-6 w-6" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-900">{tenant.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {tenant.one_liner}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {tenant.sector && (
                                <Badge variant="secondary" className="text-[10px]">
                                    {tenant.sector}
                                </Badge>
                            )}
                            {tenant.stage && (
                                <Badge variant="outline" className="text-[10px]">
                                    {tenant.stage}
                                </Badge>
                            )}
                            {tenant.incubation_phase && (
                                <Badge variant="warning" className="text-[10px]">
                                    {tenant.incubation_phase}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {tenant.batch && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                        <span>Batch: <strong className="text-slate-700">{tenant.batch.name}</strong></span>
                        {tenant.user && (
                            <Link
                                to={`mailto:${tenant.user.email}`}
                                className="text-sky-700 hover:underline"
                            >
                                Email founder →
                            </Link>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
