import ResourceCRUD from '../components/ResourceCRUD';

export default function IncubationPhases() {
    return (
        <ResourceCRUD
            resource="incubation-phases"
            title="Tahap Inkubasi"
            subtitle="Tahap perjalanan tenant di PENSNOVA: Pra-Inkubasi → Inkubasi → Scale-Up → Graduated."
            pluralLabel="Tahap"
            defaultValues={{ is_active: true, color_hex: '#1e3a8a', sort_order: 100 }}
            columns={[
                { key: 'icon', label: '', sortable: false, render: (r) => <span className="text-xl">{r.icon || '📋'}</span> },
                { key: 'name', label: 'Nama', render: (r) => <strong>{r.name}</strong> },
                { key: 'focus', label: 'Fokus' },
                { key: 'typical_duration', label: 'Durasi' },
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
                { name: 'name', label: 'Nama Tahap', type: 'text', required: true },
                { name: 'slug', label: 'Slug', type: 'text', placeholder: 'auto kalau kosong' },
                { name: 'icon', label: 'Icon (emoji)', type: 'text', maxLength: 8 },
                { name: 'color_hex', label: 'Warna Hex', type: 'color' },
                { name: 'focus', label: 'Fokus Tahap', type: 'text', placeholder: 'Product Focus / Customer Focus / Mass Product' },
                { name: 'typical_duration', label: 'Durasi Tipikal', type: 'text', placeholder: '6 - 12 Bulan' },
                { name: 'typical_funding', label: 'Sumber Pendanaan', type: 'text', placeholder: 'CPPBT, PPBT, Investor' },
                { name: 'sort_order', label: 'Urutan', type: 'number' },
                { name: 'is_active', label: 'Aktif', type: 'toggle' },
                { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 2 },
                { name: 'mentoring_scope', label: 'Mentoring Scope', type: 'tags', placeholder: 'Team Formation, UI/UX, Branding & HKI' },
            ]}
        />
    );
}
