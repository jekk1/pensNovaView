import ResourceCRUD from '../components/ResourceCRUD';

export default function Sectors() {
    return (
        <ResourceCRUD
            resource="sectors"
            title="Master Sektor"
            subtitle="Kategori industri startup PENSNOVA. Bisa ditambah/diedit kapan saja — perubahan otomatis tampil di filter publik."
            pluralLabel="Sektor"
            defaultValues={{ is_active: true, color_hex: '#6366f1', sort_order: 100 }}
            columns={[
                { key: 'icon', label: '', sortable: false, render: (r) => <span className="text-xl">{r.icon || '📦'}</span> },
                { key: 'name', label: 'Nama', render: (r) => <strong>{r.name}</strong> },
                { key: 'slug', label: 'Slug', render: (r) => <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{r.slug}</code> },
                {
                    key: 'color_hex', label: 'Warna', sortable: false,
                    render: (r) => (
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-5 h-5 rounded ring-1 ring-slate-200" style={{ background: r.color_hex }} />
                            <code className="text-xs">{r.color_hex}</code>
                        </div>
                    ),
                },
                { key: 'sort_order', label: 'Urutan' },
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
                { key: 'is_active', label: 'Status', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
            ]}
            formFields={[
                { name: 'name', label: 'Nama Sektor', type: 'text', required: true, placeholder: 'misal: FoodTech' },
                { name: 'slug', label: 'Slug (URL-safe)', type: 'text', placeholder: 'food-tech (auto kalau kosong)' },
                { name: 'icon', label: 'Icon (emoji)', type: 'text', maxLength: 8, placeholder: '🍔' },
                { name: 'color_hex', label: 'Warna Hex', type: 'color' },
                { name: 'sort_order', label: 'Urutan', type: 'number', min: 0, max: 9999 },
                { name: 'is_active', label: 'Aktif', type: 'toggle' },
                { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 2 },
            ]}
        />
    );
}
