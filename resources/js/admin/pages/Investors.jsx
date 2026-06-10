import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

const TYPE_OPTIONS = [
    { value: 'angel', label: 'Angel' },
    { value: 'vc', label: 'VC' },
    { value: 'cvc', label: 'CVC' },
    { value: 'family_office', label: 'Family Office' },
    { value: 'government', label: 'Government' },
    { value: 'other', label: 'Other' },
];

const STAGE_OPTIONS = [
    { value: 'idea', label: 'Idea' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'mvp', label: 'MVP' },
    { value: 'early-revenue', label: 'Early Revenue' },
    { value: 'growth', label: 'Growth' },
];

export default function Investors() {
    const { data: master } = useQuery({
        queryKey: ['public', 'master'],
        queryFn: () => api.get('/api/public/master').then((r) => r.data),
    });
    const sectorOptions = (master?.sectors || []).map((s) => ({ value: s.slug, label: `${s.icon || ''} ${s.name}` }));

    return (
        <ResourceCRUD
            resource="investors"
            title="Investor"
            subtitle="Profil investor terdaftar — angel, VC, CVC, family office, atau government."
            pluralLabel="Investor"
            defaultValues={{ type: 'angel', is_verified: false }}
            columns={[
                { key: 'user', label: 'Nama', sortable: false, render: (r) => <div><div className="font-bold">{r.user?.name || '—'}</div><div className="text-xs text-slate-500">{r.user?.email}</div></div> },
                { key: 'organization', label: 'Organisasi' },
                { key: 'type', label: 'Tipe', render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-semibold uppercase">{r.type}</span> },
                {
                    key: 'ticket_size', label: 'Ticket Size', sortable: false,
                    render: (r) => r.ticket_size_min || r.ticket_size_max
                        ? `Rp ${Number(r.ticket_size_min || 0).toLocaleString('id-ID')} – ${Number(r.ticket_size_max || 0).toLocaleString('id-ID')}`
                        : '—',
                },
                {
                    key: 'is_verified', label: 'Verified', sortable: false,
                    render: (r) => r.is_verified ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-slate-400">—</span>,
                },
            ]}
            filters={[
                { key: 'type', label: 'Tipe', options: TYPE_OPTIONS },
                { key: 'is_verified', label: 'Verified', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
            ]}
            formFields={[
                { name: 'user_id', label: 'User ID', type: 'number', required: true, help: 'ID user yang akan dijadikan investor (sudah harus ada di tabel users dengan role investor).' },
                { name: 'organization', label: 'Organisasi / VC', type: 'text' },
                { name: 'type', label: 'Tipe', type: 'select', required: true, options: TYPE_OPTIONS },
                { name: 'focus_sectors', label: 'Sektor Fokus', type: 'multiselect', options: sectorOptions },
                { name: 'focus_stages', label: 'Tahap Fokus', type: 'multiselect', options: STAGE_OPTIONS },
                { name: 'ticket_size_min', label: 'Ticket Min (Rp)', type: 'currency' },
                { name: 'ticket_size_max', label: 'Ticket Max (Rp)', type: 'currency' },
                { name: 'website', label: 'Website', type: 'url' },
                { name: 'linkedin', label: 'LinkedIn', type: 'url' },
                { name: 'is_verified', label: 'Verified oleh STP', type: 'toggle' },
                { name: 'bio', label: 'Bio', type: 'textarea', rows: 3 },
            ]}
        />
    );
}
