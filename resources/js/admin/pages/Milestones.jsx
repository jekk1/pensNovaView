import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

const STATUS_OPTIONS = [
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'achieved', label: 'Achieved' },
    { value: 'missed', label: 'Missed' },
];

export default function Milestones() {
    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants', 'simple'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200 } }).then((r) => r.data.data),
    });
    const tenantOptions = (tenants || []).map((t) => ({ value: t.id, label: t.name }));

    return (
        <ResourceCRUD
            resource="milestones"
            title="Milestone"
            subtitle="Target & KPI tenant untuk monitoring progress per periode."
            pluralLabel="Milestone"
            defaultValues={{ status: 'planned', weight: 1 }}
            columns={[
                { key: 'title', label: 'Milestone', render: (r) => <strong>{r.title}</strong> },
                { key: 'tenant', label: 'Tenant', sortable: false, render: (r) => r.tenant?.name || '—' },
                { key: 'due_date', label: 'Due', render: (r) => r.due_date },
                {
                    key: 'status', label: 'Status',
                    render: (r) => {
                        const colors = {
                            planned: 'bg-slate-100 text-slate-700',
                            in_progress: 'bg-amber-50 text-amber-700',
                            achieved: 'bg-emerald-50 text-emerald-700',
                            missed: 'bg-rose-50 text-rose-700',
                        };
                        return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[r.status]}`}>{r.status.replace('_', ' ').toUpperCase()}</span>;
                    },
                },
                { key: 'kpi', label: 'KPI', sortable: false, render: (r) => r.kpi_name ? `${r.kpi_name}: ${r.kpi_actual ?? '—'}/${r.kpi_target ?? '—'}` : '—' },
                { key: 'weight', label: 'Bobot' },
            ]}
            filters={[
                { key: 'status', label: 'Status', options: STATUS_OPTIONS },
                { key: 'tenant_id', label: 'Tenant', options: tenantOptions },
            ]}
            formFields={[
                { name: 'tenant_id', label: 'Tenant', type: 'select', required: true, options: tenantOptions },
                { name: 'title', label: 'Judul Milestone', type: 'text', required: true },
                { name: 'due_date', label: 'Tanggal Target', type: 'date', required: true },
                { name: 'completed_at', label: 'Tanggal Selesai (kalau achieved)', type: 'date' },
                { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
                { name: 'weight', label: 'Bobot (1-10)', type: 'number', min: 1, max: 10 },
                { name: 'kpi_name', label: 'Nama KPI', type: 'text', placeholder: 'misal: Active Users' },
                { name: 'kpi_target', label: 'Target KPI', type: 'text', placeholder: '50' },
                { name: 'kpi_actual', label: 'Aktual KPI', type: 'text', placeholder: '32' },
                { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
            ]}
        />
    );
}
