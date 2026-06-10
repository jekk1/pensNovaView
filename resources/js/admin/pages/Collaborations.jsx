import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

const STATUS_OPTIONS = [
    { value: 'planned', label: 'Planned' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
    { value: 'research', label: 'Research' },
    { value: 'technology_licensing', label: 'Technology Licensing' },
    { value: 'pilot_project', label: 'Pilot Project' },
    { value: 'investment', label: 'Investment' },
    { value: 'csr', label: 'CSR' },
    { value: 'talent_hiring', label: 'Talent Hiring' },
    { value: 'joint_venture', label: 'Joint Venture' },
    { value: 'other', label: 'Other' },
];

export default function Collaborations() {
    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants', 'simple'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200 } }).then((r) => r.data.data),
    });
    const { data: companies } = useQuery({
        queryKey: ['admin', 'partner-companies', 'simple'],
        queryFn: () => api.get('/api/admin/partner-companies', { params: { per_page: 200 } }).then((r) => r.data.data),
    });
    const tenantOptions = (tenants || []).map((t) => ({ value: t.id, label: t.name }));
    const companyOptions = (companies || []).map((c) => ({ value: c.id, label: c.name }));

    return (
        <ResourceCRUD
            resource="collaborations"
            title="Kolaborasi"
            subtitle="Kontrak kolaborasi resmi antara mitra industri dan tenant."
            pluralLabel="Kolaborasi"
            defaultValues={{ status: 'planned', type: 'pilot_project' }}
            columns={[
                { key: 'title', label: 'Judul', render: (r) => <strong className="line-clamp-1">{r.title}</strong> },
                { key: 'partner', label: 'Mitra', sortable: false, render: (r) => r.partner_company?.name || '—' },
                { key: 'tenant', label: 'Tenant', sortable: false, render: (r) => r.tenant?.name || '—' },
                { key: 'type', label: 'Tipe', render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-700 uppercase font-semibold">{r.type.replace(/_/g, ' ')}</span> },
                {
                    key: 'status', label: 'Status',
                    render: (r) => {
                        const colors = {
                            planned: 'bg-slate-100 text-slate-700',
                            ongoing: 'bg-blue-50 text-blue-700',
                            completed: 'bg-emerald-50 text-emerald-700',
                            cancelled: 'bg-rose-50 text-rose-700',
                        };
                        return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[r.status]}`}>{r.status.toUpperCase()}</span>;
                    },
                },
                { key: 'value', label: 'Nilai', render: (r) => r.value ? `Rp ${Number(r.value).toLocaleString('id-ID')}` : '—' },
                { key: 'started_at', label: 'Mulai' },
            ]}
            filters={[
                { key: 'status', label: 'Status', options: STATUS_OPTIONS },
                { key: 'type', label: 'Tipe', options: TYPE_OPTIONS },
                { key: 'partner_company_id', label: 'Mitra', options: companyOptions },
                { key: 'tenant_id', label: 'Tenant', options: tenantOptions },
            ]}
            formFields={[
                { name: 'partner_company_id', label: 'Perusahaan Mitra', type: 'select', required: true, options: companyOptions },
                { name: 'tenant_id', label: 'Tenant', type: 'select', required: true, options: tenantOptions },
                { name: 'title', label: 'Judul Kolaborasi', type: 'text', required: true },
                { name: 'type', label: 'Tipe', type: 'select', required: true, options: TYPE_OPTIONS },
                { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
                { name: 'started_at', label: 'Tanggal Mulai', type: 'date', required: true },
                { name: 'ended_at', label: 'Tanggal Selesai', type: 'date' },
                { name: 'value', label: 'Nilai Kontrak (Rp)', type: 'currency' },
                { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
                { name: 'outcomes', label: 'Outcomes', type: 'textarea', rows: 3 },
            ]}
        />
    );
}
