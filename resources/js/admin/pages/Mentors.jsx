import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

export default function Mentors() {
    const { data: master } = useQuery({
        queryKey: ['public', 'master'],
        queryFn: () => api.get('/api/public/master').then((r) => r.data),
    });

    const sectorOptions = (master?.sectors || []).map((s) => ({ value: s.slug, label: `${s.icon || ''} ${s.name}` }));

    return (
        <ResourceCRUD
            resource="mentors"
            title="Mentor"
            subtitle="Pembina startup PENSNOVA — dosen senior PENS atau praktisi industri."
            pluralLabel="Mentor"
            defaultValues={{ is_active: true }}
            columns={[
                { key: 'user', label: 'Nama', sortable: false, render: (r) => <div><div className="font-bold">{r.user?.name || '—'}</div><div className="text-xs text-slate-500">{r.user?.email}</div></div> },
                { key: 'organization', label: 'Organisasi' },
                { key: 'title', label: 'Jabatan' },
                { key: 'tenants_count', label: 'Binaan', sortable: false, render: (r) => r.tenants_count ?? 0 },
                { key: 'sessions_count', label: 'Sesi', sortable: false, render: (r) => r.sessions_count ?? 0 },
                {
                    key: 'is_active', label: 'Status', sortable: false,
                    render: (r) => <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{r.is_active ? 'Aktif' : 'Nonaktif'}</span>,
                },
            ]}
            filters={[
                { key: 'is_active', label: 'Status', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
            ]}
            formFields={[
                { name: 'user_id', label: 'User Existing (opsional)', type: 'number', help: 'Kosongkan kalau buat mentor baru sekaligus dengan user. Isi user.id kalau pakai user yang sudah ada.' },
                { name: '_user_name', label: 'Nama Mentor (kalau buat user baru)', type: 'text' },
                { name: '_user_email', label: 'Email Mentor (kalau buat user baru)', type: 'email' },
                { name: '_user_password', label: 'Password (kalau buat user baru)', type: 'password', help: 'Min 8 karakter. Default: password' },
                { name: 'organization', label: 'Organisasi', type: 'text', placeholder: 'PENS / PT XYZ' },
                { name: 'title', label: 'Jabatan', type: 'text', placeholder: 'Senior Lecturer, Product Manager, dst' },
                { name: 'expertise', label: 'Keahlian', type: 'tags', placeholder: 'IoT, Embedded Systems, Product Strategy' },
                { name: 'focus_sectors', label: 'Sektor Fokus', type: 'multiselect', options: sectorOptions },
                { name: 'linkedin', label: 'LinkedIn URL', type: 'url' },
                { name: 'is_active', label: 'Aktif', type: 'toggle' },
                { name: 'bio', label: 'Bio', type: 'textarea', rows: 3 },
            ]}
        />
    );
}
