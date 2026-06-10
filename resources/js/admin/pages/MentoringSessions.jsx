import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import ResourceCRUD from '../components/ResourceCRUD';

const STATUS_OPTIONS = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' },
];

const MODE_OPTIONS = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'hybrid', label: 'Hybrid' },
];

export default function MentoringSessions() {
    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants', 'simple'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200 } }).then((r) => r.data.data),
    });
    const { data: mentors } = useQuery({
        queryKey: ['admin', 'mentors', 'simple'],
        queryFn: () => api.get('/api/admin/mentors', { params: { per_page: 200 } }).then((r) => r.data.data),
    });

    const tenantOptions = (tenants || []).map((t) => ({ value: t.id, label: t.name }));
    const mentorOptions = (mentors || []).map((m) => ({ value: m.id, label: m.user?.name || `Mentor #${m.id}` }));

    return (
        <ResourceCRUD
            resource="mentoring-sessions"
            title="Sesi Mentoring"
            subtitle="Jadwal sesi mentoring antara mentor dan tenant binaan."
            pluralLabel="Sesi"
            defaultValues={{ status: 'scheduled', mode: 'online', duration_minutes: 60 }}
            columns={[
                { key: 'scheduled_at', label: 'Jadwal', render: (r) => <span className="text-sm">{new Date(r.scheduled_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span> },
                { key: 'mentor', label: 'Mentor', sortable: false, render: (r) => r.mentor?.user?.name || '—' },
                { key: 'tenant', label: 'Tenant', sortable: false, render: (r) => r.tenant?.name || '—' },
                { key: 'mode', label: 'Mode', render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-slate-100 uppercase">{r.mode}</span> },
                {
                    key: 'status', label: 'Status',
                    render: (r) => {
                        const colors = {
                            scheduled: 'bg-blue-50 text-blue-700',
                            in_progress: 'bg-amber-50 text-amber-700',
                            done: 'bg-emerald-50 text-emerald-700',
                            cancelled: 'bg-rose-50 text-rose-700',
                            rescheduled: 'bg-violet-50 text-violet-700',
                        };
                        return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[r.status]}`}>{r.status.replace('_', ' ').toUpperCase()}</span>;
                    },
                },
                { key: 'duration_minutes', label: 'Durasi', render: (r) => `${r.duration_minutes}m` },
            ]}
            filters={[
                { key: 'status', label: 'Status', options: STATUS_OPTIONS },
                { key: 'mentor_id', label: 'Mentor', options: mentorOptions },
                { key: 'tenant_id', label: 'Tenant', options: tenantOptions },
            ]}
            formFields={[
                { name: 'mentor_id', label: 'Mentor', type: 'select', required: true, options: mentorOptions },
                { name: 'tenant_id', label: 'Tenant', type: 'select', required: true, options: tenantOptions },
                { name: 'scheduled_at', label: 'Tanggal & Jam', type: 'datetime-local', required: true },
                { name: 'duration_minutes', label: 'Durasi (menit)', type: 'number', required: true, min: 15, max: 240 },
                { name: 'mode', label: 'Mode', type: 'select', required: true, options: MODE_OPTIONS },
                { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
                { name: 'location_or_link', label: 'Lokasi / Link Meeting', type: 'text' },
                { name: 'agenda', label: 'Agenda', type: 'textarea', rows: 2 },
                { name: 'notes', label: 'Catatan Sesi', type: 'textarea', rows: 3 },
                { name: 'action_items', label: 'Action Items', type: 'textarea', rows: 2 },
                { name: 'rating_by_tenant', label: 'Rating dari Tenant (1-5)', type: 'number', min: 1, max: 5 },
                { name: 'feedback_by_tenant', label: 'Feedback Tenant', type: 'textarea', rows: 2 },
            ]}
        />
    );
}
