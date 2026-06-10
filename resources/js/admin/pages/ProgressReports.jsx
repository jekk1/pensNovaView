import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

export default function ProgressReports() {
    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants', 'simple'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200 } }).then((r) => r.data.data),
    });
    const tenantOptions = (tenants || []).map((t) => ({ value: t.id, label: t.name }));

    return (
        <ResourceCRUD
            resource="progress-reports"
            title="Laporan Progress"
            subtitle="Laporan bulanan tenant — revenue, pengguna, tim, dan narasi."
            pluralLabel="Laporan"
            defaultValues={{ is_submitted: false, period_year: new Date().getFullYear(), period_month: new Date().getMonth() + 1 }}
            columns={[
                { key: 'tenant', label: 'Tenant', sortable: false, render: (r) => r.tenant?.name || '—' },
                { key: 'period', label: 'Periode', sortable: false, render: (r) => `${String(r.period_year)}-${String(r.period_month).padStart(2,'0')}` },
                { key: 'revenue', label: 'Revenue', render: (r) => r.revenue ? `Rp ${Number(r.revenue).toLocaleString('id-ID')}` : '—' },
                { key: 'users_count', label: 'Users' },
                { key: 'team_size', label: 'Tim' },
                {
                    key: 'is_submitted', label: 'Submitted', sortable: false,
                    render: (r) => r.is_submitted
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">SUBMITTED</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">DRAFT</span>,
                },
            ]}
            filters={[
                { key: 'tenant_id', label: 'Tenant', options: tenantOptions },
                { key: 'is_submitted', label: 'Status', options: [{ value: '1', label: 'Submitted' }, { value: '0', label: 'Draft' }] },
            ]}
            formFields={[
                { name: 'tenant_id', label: 'Tenant', type: 'select', required: true, options: tenantOptions },
                { name: 'period_year', label: 'Tahun', type: 'number', required: true, min: 2020, max: 2100 },
                { name: 'period_month', label: 'Bulan (1-12)', type: 'number', required: true, min: 1, max: 12 },
                { name: 'revenue', label: 'Revenue (Rp)', type: 'currency' },
                { name: 'users_count', label: 'Jumlah User', type: 'number' },
                { name: 'team_size', label: 'Ukuran Tim', type: 'number' },
                { name: 'funding_raised', label: 'Funding Raised (Rp)', type: 'currency' },
                { name: 'is_submitted', label: 'Submitted final', type: 'toggle' },
                { name: 'narrative', label: 'Narasi Bulan Ini', type: 'textarea', rows: 4 },
                { name: 'challenges', label: 'Tantangan', type: 'textarea', rows: 3 },
                { name: 'next_steps', label: 'Rencana Bulan Depan', type: 'textarea', rows: 3 },
            ]}
        />
    );
}
