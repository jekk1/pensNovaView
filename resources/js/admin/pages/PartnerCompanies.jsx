import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

const MOU_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'draft', label: 'Draft' },
    { value: 'signed', label: 'Signed' },
    { value: 'expired', label: 'Expired' },
];

export default function PartnerCompanies() {
    const { data: master } = useQuery({
        queryKey: ['public', 'master'],
        queryFn: () => api.get('/api/public/master').then((r) => r.data),
        staleTime: 5 * 60_000,
    });
    const sectorOptions = (master?.sectors || []).map((s) => ({ value: s.slug, label: `${s.icon || ''} ${s.name}` }));

    return (
        <ResourceCRUD
            resource="partner-companies"
            title="Perusahaan Mitra"
            subtitle="Industri yang berkolaborasi dengan PENSNOVA — Teaching Industry, lisensi teknologi, pilot project."
            pluralLabel="Perusahaan"
            defaultValues={{ mou_status: 'none', country: 'Indonesia', is_published: true }}
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
                { key: 'city', label: 'Kota' },
                {
                    key: 'mou_status', label: 'MoU',
                    render: (r) => {
                        const colors = {
                            none: 'bg-slate-100 text-slate-600',
                            draft: 'bg-amber-50 text-amber-700',
                            signed: 'bg-emerald-50 text-emerald-700',
                            expired: 'bg-rose-50 text-rose-700',
                        };
                        return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[r.mou_status]}`}>{r.mou_status.toUpperCase()}</span>;
                    },
                },
                { key: 'interests_count', label: 'Minat', sortable: false, render: (r) => r.interests_count ?? 0 },
                { key: 'collaborations_count', label: 'Kolab', sortable: false, render: (r) => r.collaborations_count ?? 0 },
            ]}
            filters={[
                { key: 'sector', label: 'Sektor', options: sectorOptions },
                { key: 'mou_status', label: 'MoU', options: MOU_OPTIONS },
            ]}
            formFields={[
                { name: 'user_id', label: 'User ID (PIC)', type: 'number', help: 'Optional. User yang jadi PIC perusahaan.' },
                { name: 'name', label: 'Nama Perusahaan', type: 'text', required: true },
                { name: 'slug', label: 'Slug', type: 'text', placeholder: 'auto-generated' },
                { name: 'sector', label: 'Sektor', type: 'select', required: true, options: sectorOptions },
                { name: 'size', label: 'Ukuran (small/medium/large)', type: 'text' },
                { name: 'website', label: 'Website', type: 'url' },
                { name: 'country', label: 'Negara', type: 'text' },
                { name: 'city', label: 'Kota', type: 'text' },
                { name: 'contact_person', label: 'PIC', type: 'text' },
                { name: 'contact_email', label: 'Email PIC', type: 'email' },
                { name: 'contact_phone', label: 'Telp PIC', type: 'tel' },
                { name: 'mou_status', label: 'Status MoU', type: 'select', required: true, options: MOU_OPTIONS },
                { name: 'mou_signed_at', label: 'Tgl MoU Signed', type: 'date' },
                { name: 'mou_expires_at', label: 'Tgl MoU Expired', type: 'date' },
                { name: 'is_published', label: 'Tampilkan publik', type: 'toggle' },
                { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
            ]}
        />
    );
}
