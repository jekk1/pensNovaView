import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

export default function Users() {
    const { data: rolesData } = useQuery({
        queryKey: ['admin', 'users-roles'],
        queryFn: () => api.get('/api/admin/users-roles').then((r) => r.data.data),
        staleTime: 5 * 60_000,
    });

    const roleOptions = (rolesData || []).map((r) => ({ value: r.name, label: r.name }));

    return (
        <ResourceCRUD
            resource="users"
            title="Pengguna"
            subtitle="Akun pengguna sistem PENSNOVA — admin, tenant founder, mentor, investor, partner company."
            pluralLabel="Pengguna"
            defaultValues={{ is_active: true, roles: [] }}
            columns={[
                { key: 'name', label: 'Nama', render: (r) => <strong>{r.name}</strong> },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Telp', render: (r) => r.phone || '—' },
                {
                    key: 'roles', label: 'Roles', sortable: false,
                    render: (r) => (
                        <div className="flex flex-wrap gap-1">
                            {(r.roles || []).map((role) => (
                                <span key={role} className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-primary-50 text-primary-700">{role}</span>
                            ))}
                        </div>
                    ),
                },
                {
                    key: 'is_active', label: 'Status', sortable: false,
                    render: (r) => (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {r.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                    ),
                },
            ]}
            filters={[
                { key: 'role', label: 'Role', options: roleOptions },
                { key: 'is_active', label: 'Status', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
            ]}
            formFields={[
                { name: 'name', label: 'Nama Lengkap', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'phone', label: 'No. HP', type: 'tel' },
                { name: 'password', label: 'Password', type: 'password', help: 'Kosongkan saat edit untuk biarkan tidak berubah. Min 8 karakter.' },
                { name: 'is_active', label: 'Akun aktif', type: 'toggle' },
                { name: 'roles', label: 'Roles', type: 'multiselect', options: roleOptions, help: 'Pilih satu atau lebih role.' },
            ]}
        />
    );
}
