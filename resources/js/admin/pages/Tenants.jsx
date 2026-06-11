import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'incubation', label: 'Incubation' },
    { value: 'graduated', label: 'Graduated' },
    { value: 'paused', label: 'Paused' },
    { value: 'rejected', label: 'Rejected' },
];

export default function Tenants() {
    const { data: master } = useQuery({
        queryKey: ['public', 'master'],
        queryFn: () => api.get('/api/public/master').then((r) => r.data),
        staleTime: 5 * 60_000,
    });

    const { data: batches } = useQuery({
        queryKey: ['admin', 'applications-batches'],
        queryFn: () => api.get('/api/admin/applications-batches').then((r) => r.data.data),
        staleTime: 5 * 60_000,
    });

    const sectorOptions = (master?.sectors || []).map((s) => ({ value: s.slug, label: `${s.icon || ''} ${s.name}` }));
    const stageOptions = (master?.stages || []).map((s) => ({ value: s.slug, label: s.name }));
    const phaseOptions = (master?.incubation_phases || []).map((p) => ({ value: p.slug, label: p.name }));
    const batchOptions = (batches || []).map((b) => ({ value: b.id, label: `${b.name} (${b.year})` }));

    return (
        <ResourceCRUD
            resource="tenants"
            title="Tenant Startup"
            subtitle="Startup binaan PENSNOVA — kelola profil, sektor, tahap inkubasi, dan publikasi."
            pluralLabel="Tenant"
            defaultValues={{ status: 'draft', is_published: false, incubation_phase: 'pra-inkubasi' }}
            columns={[
                { key: 'name', label: 'Nama', render: (r) => <strong>{r.name}</strong> },
                {
                    key: 'sector', label: 'Sektor',
                    render: (r) => {
                        const s = r.sector_master;
                        return (
                            <span className="text-xs px-2 py-0.5 rounded uppercase font-semibold"
                                style={{ background: (s?.color_hex || '#6366f1') + '15', color: s?.color_hex || '#6366f1' }}>
                                {s?.icon ? `${s.icon} ` : ''}{s?.name || r.sector}
                            </span>
                        );
                    },
                },
                { key: 'stage', label: 'Tahap', render: (r) => r.stage_master?.name || r.stage },
                { key: 'incubation_phase', label: 'Tahap Inkubasi', render: (r) => r.incubation_phase },
                {
                    key: 'status', label: 'Status',
                    render: (r) => {
                        const colors = {
                            draft: 'bg-slate-100 text-slate-700',
                            incubation: 'bg-blue-50 text-blue-700',
                            graduated: 'bg-emerald-50 text-emerald-700',
                            paused: 'bg-amber-50 text-amber-700',
                            rejected: 'bg-rose-50 text-rose-700',
                        };
                        return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[r.status]}`}>{r.status}</span>;
                    },
                },
                {
                    key: 'is_published', label: 'Publish', sortable: false,
                    render: (r) => r.is_published
                        ? <span className="text-emerald-700 font-bold">Ya</span>
                        : <span className="text-slate-400">—</span>,
                },
                { key: 'research_topics_count', label: 'Riset', sortable: false, render: (r) => r.research_topics_count ?? 0 },
            ]}
            filters={[
                { key: 'sector', label: 'Sektor', options: sectorOptions },
                { key: 'stage', label: 'Tahap', options: stageOptions },
                { key: 'phase', label: 'Inkubasi', options: phaseOptions },
                { key: 'status', label: 'Status', options: STATUS_OPTIONS },
                { key: 'batch_id', label: 'Batch', options: batchOptions },
            ]}
            formFields={[
                { name: 'name', label: 'Nama Startup', type: 'text', required: true },
                { name: 'slug', label: 'Slug', type: 'text', placeholder: 'auto-generated kalau kosong' },
                { name: 'sector', label: 'Sektor', type: 'select', required: true, options: sectorOptions },
                { name: 'stage', label: 'Tahap Produk', type: 'select', required: true, options: stageOptions },
                { name: 'incubation_phase', label: 'Tahap Inkubasi', type: 'select', required: true, options: phaseOptions },
                { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
                { name: 'batch_id', label: 'Batch', type: 'select', options: batchOptions },
                { name: 'founded_at', label: 'Tanggal Berdiri', type: 'date' },
                { name: 'is_published', label: 'Tampilkan di publik', type: 'toggle' },
                { name: 'website', label: 'Website', type: 'url' },
                { name: 'pitch_deck_url', label: 'Pitch Deck URL', type: 'url' },
                { name: 'one_liner', label: 'One-liner', type: 'text', maxLength: 255 },
                { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 4 },
                { name: 'tech_stack', label: 'Tech Stack', type: 'tags', placeholder: 'Laravel, React, PostgreSQL' },
                { name: 'achievements', label: 'Pencapaian', type: 'tags', placeholder: 'Juara X, Pendanaan Y, dst' },
            ]}
        />
    );
}
