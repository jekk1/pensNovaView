import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

const STAGE_OPTIONS = [
    { value: 'concept', label: 'Concept' },
    { value: 'research', label: 'Research' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'pilot', label: 'Pilot' },
    { value: 'commercialization', label: 'Commercialization' },
];

export default function ResearchTopics() {
    const { data: master } = useQuery({
        queryKey: ['public', 'master'],
        queryFn: () => api.get('/api/public/master').then((r) => r.data),
        staleTime: 5 * 60_000,
    });
    const sectorOptions = (master?.sectors || []).map((s) => ({ value: s.slug, label: `${s.icon || ''} ${s.name}` }));

    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants', 'simple'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200 } }).then((r) => r.data.data),
    });
    const tenantOptions = (tenants || []).map((t) => ({ value: t.id, label: t.name }));

    return (
        <ResourceCRUD
            resource="research-topics"
            title="Topik Riset"
            subtitle="Riset terapan dari tenant — siap untuk lisensi industri / pilot project / spin-off."
            pluralLabel="Topik Riset"
            defaultValues={{ stage: 'concept', open_for_collaboration: true, is_published: false }}
            columns={[
                { key: 'title', label: 'Judul', render: (r) => <strong className="line-clamp-1">{r.title}</strong> },
                { key: 'tenant', label: 'Startup', sortable: false, render: (r) => r.tenant?.name || '—' },
                { key: 'stage', label: 'Stage', render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">{r.stage}</span> },
                { key: 'technology_readiness', label: 'TRL', render: (r) => r.technology_readiness ? <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">TRL {r.technology_readiness}</span> : '—' },
                { key: 'open_for_collaboration', label: 'Open Collab', sortable: false, render: (r) => r.open_for_collaboration ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-slate-400">—</span> },
                { key: 'is_published', label: 'Publish', sortable: false, render: (r) => r.is_published ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-slate-400">—</span> },
            ]}
            filters={[
                { key: 'stage', label: 'Stage', options: STAGE_OPTIONS },
                { key: 'tenant_id', label: 'Tenant', options: tenantOptions },
                { key: 'is_published', label: 'Publish', options: [{ value: '1', label: 'Published' }, { value: '0', label: 'Draft' }] },
            ]}
            formFields={[
                { name: 'tenant_id', label: 'Tenant', type: 'select', required: true, options: tenantOptions },
                { name: 'title', label: 'Judul', type: 'text', required: true },
                { name: 'slug', label: 'Slug', type: 'text', placeholder: 'auto-generated' },
                { name: 'stage', label: 'Stage', type: 'select', required: true, options: STAGE_OPTIONS },
                { name: 'technology_readiness', label: 'TRL (1-9)', type: 'number', min: 1, max: 9 },
                { name: 'open_for_collaboration', label: 'Terbuka kolaborasi industri', type: 'toggle' },
                { name: 'is_published', label: 'Tampilkan publik', type: 'toggle' },
                { name: 'abstract', label: 'Abstrak', type: 'textarea', rows: 4, required: true, help: 'Min 30 karakter' },
                { name: 'keywords', label: 'Keywords', type: 'tags', placeholder: 'ai, iot, healthcare' },
                { name: 'sectors', label: 'Sektor', type: 'multiselect', options: sectorOptions },
            ]}
        />
    );
}
