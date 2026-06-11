import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

const COLLAB_TYPES = [
    { value: 'research', label: 'Research' },
    { value: 'technology_licensing', label: 'Technology Licensing' },
    { value: 'pilot_project', label: 'Pilot Project' },
    { value: 'investment', label: 'Investment' },
    { value: 'csr', label: 'CSR' },
    { value: 'talent_hiring', label: 'Talent Hiring' },
    { value: 'joint_venture', label: 'Joint Venture' },
    { value: 'other', label: 'Other' },
];

const STAGE_OPTIONS = [
    { value: 'idea', label: 'Idea' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'mvp', label: 'MVP' },
    { value: 'early-revenue', label: 'Early Revenue' },
    { value: 'growth', label: 'Growth' },
];

export default function CompanyInterests() {
    const { data: master } = useQuery({
        queryKey: ['public', 'master'],
        queryFn: () => api.get('/api/public/master').then((r) => r.data),
        staleTime: 5 * 60_000,
    });
    const sectorOptions = (master?.sectors || []).map((s) => ({ value: s.slug, label: `${s.icon || ''} ${s.name}` }));

    const { data: companies } = useQuery({
        queryKey: ['admin', 'partner-companies', 'simple'],
        queryFn: () => api.get('/api/admin/partner-companies', { params: { per_page: 200 } }).then((r) => r.data.data),
    });
    const companyOptions = (companies || []).map((c) => ({ value: c.id, label: c.name }));

    return (
        <ResourceCRUD
            resource="company-interests"
            title="Minat Kolaborasi"
            subtitle="Minat dari perusahaan mitra — sektor, keyword, tipe kolaborasi, range budget. Dipakai engine matchmaking."
            pluralLabel="Minat"
            defaultValues={{ collaboration_type: 'pilot_project', is_active: true, technology_readiness_min: 4, technology_readiness_max: 9 }}
            columns={[
                { key: 'partner_company', label: 'Mitra', sortable: false, render: (r) => r.partner_company?.name || '—' },
                { key: 'collaboration_type', label: 'Tipe', render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-700 uppercase font-semibold">{r.collaboration_type.replace(/_/g, ' ')}</span> },
                { key: 'sectors', label: 'Sektor', sortable: false, render: (r) => (r.sectors || []).slice(0, 3).join(', ') },
                { key: 'budget', label: 'Budget', sortable: false, render: (r) => r.budget_min || r.budget_max ? `Rp ${Number(r.budget_min || 0).toLocaleString('id-ID')} – ${Number(r.budget_max || 0).toLocaleString('id-ID')}` : '—' },
                { key: 'trl_range', label: 'TRL', sortable: false, render: (r) => r.technology_readiness_min || r.technology_readiness_max ? `${r.technology_readiness_min || '?'}–${r.technology_readiness_max || '?'}` : '—' },
                {
                    key: 'is_active', label: 'Aktif', sortable: false,
                    render: (r) => r.is_active ? <span className="text-emerald-700 font-bold">Ya</span> : <span className="text-slate-400">—</span>,
                },
            ]}
            filters={[
                { key: 'collaboration_type', label: 'Tipe', options: COLLAB_TYPES },
                { key: 'partner_company_id', label: 'Mitra', options: companyOptions },
                { key: 'is_active', label: 'Status', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
            ]}
            formFields={[
                { name: 'partner_company_id', label: 'Perusahaan Mitra', type: 'select', required: true, options: companyOptions },
                { name: 'collaboration_type', label: 'Tipe Kolaborasi', type: 'select', required: true, options: COLLAB_TYPES },
                { name: 'sectors', label: 'Sektor Yang Diminati', type: 'multiselect', options: sectorOptions },
                { name: 'keywords', label: 'Keywords', type: 'tags', placeholder: 'iot, fintech, b2b' },
                { name: 'looking_for_stage', label: 'Tahap Startup Yang Dicari', type: 'multiselect', options: STAGE_OPTIONS },
                { name: 'technology_readiness_min', label: 'TRL Min', type: 'number', min: 1, max: 9 },
                { name: 'technology_readiness_max', label: 'TRL Max', type: 'number', min: 1, max: 9 },
                { name: 'budget_min', label: 'Budget Min (Rp)', type: 'currency' },
                { name: 'budget_max', label: 'Budget Max (Rp)', type: 'currency' },
                { name: 'valid_until', label: 'Berlaku Sampai', type: 'date' },
                { name: 'is_active', label: 'Aktif untuk matching', type: 'toggle' },
                { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
            ]}
        />
    );
}
