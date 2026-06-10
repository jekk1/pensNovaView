import ResourceCRUD from '../components/ResourceCRUD';

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
];

export default function Batches() {
    return (
        <ResourceCRUD
            resource="batches"
            title="Batch Inkubasi"
            subtitle="Periode pendaftaran & pembinaan tenant. Hanya batch dengan status 'open' yang menerima pendaftaran publik."
            pluralLabel="Batch"
            defaultValues={{ status: 'draft', quota: 10, year: new Date().getFullYear() }}
            columns={[
                { key: 'name', label: 'Nama', render: (r) => <strong>{r.name}</strong> },
                { key: 'year', label: 'Tahun' },
                {
                    key: 'status', label: 'Status',
                    render: (r) => {
                        const colors = {
                            draft: 'bg-slate-100 text-slate-700',
                            open: 'bg-emerald-50 text-emerald-700',
                            in_progress: 'bg-amber-50 text-amber-700',
                            closed: 'bg-rose-50 text-rose-700',
                        };
                        return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${colors[r.status]}`}>{r.status.replace('_',' ')}</span>;
                    },
                },
                { key: 'start_date', label: 'Mulai' },
                { key: 'end_date', label: 'Selesai' },
                { key: 'quota', label: 'Kuota' },
                { key: 'tenants_count', label: 'Tenant', render: (r) => r.tenants_count ?? '—' },
                { key: 'applications_count', label: 'Aplikasi', render: (r) => r.applications_count ?? '—' },
            ]}
            filters={[
                { key: 'status', label: 'Status', options: STATUS_OPTIONS },
            ]}
            formFields={[
                { name: 'name', label: 'Nama Batch', type: 'text', required: true, placeholder: 'PENSNOVA Batch 2026 Wave 1' },
                { name: 'year', label: 'Tahun', type: 'number', required: true, min: 2020, max: 2100 },
                { name: 'start_date', label: 'Tanggal Mulai', type: 'date', required: true },
                { name: 'end_date', label: 'Tanggal Selesai', type: 'date', required: true },
                { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
                { name: 'quota', label: 'Kuota Tenant', type: 'number', required: true, min: 1, max: 1000 },
                { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
            ]}
        />
    );
}
