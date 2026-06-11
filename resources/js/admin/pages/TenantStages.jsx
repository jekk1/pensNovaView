import ResourceCRUD from '../components/ResourceCRUD';

export default function TenantStages() {
    return (
        <ResourceCRUD
            resource="tenant-stages"
            title="Tahap Produk"
            subtitle="Tahap kematangan produk: Idea → Prototype → MVP → Early Revenue → Growth."
            pluralLabel="Tahap"
            defaultValues={{ is_active: true, color_hex: '#f59e0b', sort_order: 100 }}
            columns={[
                { key: 'icon', label: '', sortable: false, render: (r) => <span className="text-xl">{r.icon || '—'}</span> },
                { key: 'name', label: 'Nama', render: (r) => <strong>{r.name}</strong> },
                { key: 'slug', label: 'Slug', render: (r) => <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{r.slug}</code> },
                {
                    key: 'color_hex', label: 'Warna', sortable: false,
                    render: (r) => <span className="inline-block w-5 h-5 rounded ring-1 ring-slate-200" style={{ background: r.color_hex }} />,
                },
                { key: 'sort_order', label: 'Urutan' },
                {
                    key: 'is_active', label: 'Status', sortable: false,
                    render: (r) => <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{r.is_active ? 'Aktif' : 'Nonaktif'}</span>,
                },
            ]}
            formFields={[
                { name: 'name', label: 'Nama', type: 'text', required: true },
                { name: 'slug', label: 'Slug', type: 'text', placeholder: 'auto kalau kosong' },
                { name: 'icon', label: 'Icon', type: 'text', maxLength: 8 },
                { name: 'color_hex', label: 'Warna Hex', type: 'color' },
                { name: 'sort_order', label: 'Urutan', type: 'number' },
                { name: 'is_active', label: 'Aktif', type: 'toggle' },
                { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 2 },
            ]}
        />
    );
}
