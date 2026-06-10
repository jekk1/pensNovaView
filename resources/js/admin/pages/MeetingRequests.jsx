import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const REQUESTER_TYPE = [
    { value: 'investor', label: 'Investor' },
    { value: 'partner_company', label: 'Partner Company' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'public', label: 'Public' },
];

export default function MeetingRequests() {
    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants', 'simple'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200 } }).then((r) => r.data.data),
    });
    const tenantOptions = (tenants || []).map((t) => ({ value: t.id, label: t.name }));

    return (
        <ResourceCRUD
            resource="meeting-requests"
            title="Permintaan Meeting"
            subtitle="Request meeting dari investor / mitra / publik untuk bertemu tenant."
            pluralLabel="Request"
            defaultValues={{ status: 'pending', requester_type: 'public' }}
            columns={[
                { key: 'requester_name', label: 'Pemohon', render: (r) => <div><strong>{r.requester_name}</strong><div className="text-xs text-slate-500">{r.requester_email}</div></div> },
                { key: 'requester_type', label: 'Tipe', render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">{r.requester_type.replace('_', ' ')}</span> },
                { key: 'tenant', label: 'Tenant', sortable: false, render: (r) => r.tenant?.name || '—' },
                { key: 'subject', label: 'Subjek', render: (r) => <span className="line-clamp-1">{r.subject}</span> },
                {
                    key: 'status', label: 'Status',
                    render: (r) => {
                        const colors = {
                            pending: 'bg-amber-50 text-amber-700',
                            accepted: 'bg-emerald-50 text-emerald-700',
                            rejected: 'bg-rose-50 text-rose-700',
                            completed: 'bg-blue-50 text-blue-700',
                            cancelled: 'bg-slate-100 text-slate-600',
                        };
                        return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[r.status]}`}>{r.status.toUpperCase()}</span>;
                    },
                },
                { key: 'preferred_at', label: 'Waktu Disarankan', render: (r) => r.preferred_at ? new Date(r.preferred_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—' },
            ]}
            filters={[
                { key: 'status', label: 'Status', options: STATUS_OPTIONS },
                { key: 'requester_type', label: 'Tipe', options: REQUESTER_TYPE },
                { key: 'tenant_id', label: 'Tenant', options: tenantOptions },
            ]}
            formFields={[
                { name: 'tenant_id', label: 'Tenant', type: 'select', required: true, options: tenantOptions },
                { name: 'requester_name', label: 'Nama Pemohon', type: 'text', required: true },
                { name: 'requester_email', label: 'Email Pemohon', type: 'email', required: true },
                { name: 'requester_organization', label: 'Organisasi', type: 'text' },
                { name: 'requester_type', label: 'Tipe Pemohon', type: 'select', required: true, options: REQUESTER_TYPE },
                { name: 'subject', label: 'Subjek', type: 'text', required: true },
                { name: 'preferred_at', label: 'Waktu Disarankan', type: 'datetime-local' },
                { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
                { name: 'confirmed_at', label: 'Waktu Dikonfirmasi (kalau accepted)', type: 'datetime-local' },
                { name: 'message', label: 'Pesan', type: 'textarea', rows: 4, required: true },
                { name: 'admin_note', label: 'Catatan Admin', type: 'textarea', rows: 2 },
            ]}
        />
    );
}
