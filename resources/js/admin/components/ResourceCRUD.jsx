import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import DataTable from './DataTable';
import FormBuilder from './FormBuilder';

/**
 * ResourceCRUD — gabung DataTable + FormBuilder dalam 1 page admin.
 *
 * Props:
 *   resource     : 'sectors' | 'incubation-phases' | dst — path API & query key
 *   title        : 'Sektor', 'Tahap Inkubasi', dst
 *   subtitle?    : optional helper text
 *   columns      : DataTable columns config
 *   filters?     : DataTable filters config
 *   formFields   : FormBuilder fields
 *   defaultValues? : nilai default saat create (override defaults)
 */
export default function ResourceCRUD({
    resource,
    title,
    subtitle,
    columns,
    filters,
    formFields,
    defaultValues = {},
    pluralLabel = 'data',
}) {
    const qc = useQueryClient();
    const [editing, setEditing] = useState(null); // null = closed, {} = create, {...} = edit
    const isCreate = editing && !editing.id;
    const isEdit = editing && editing.id;

    const saveMutation = useMutation({
        mutationFn: (payload) => {
            if (isEdit) return api.patch(`/api/admin/${resource}/${editing.id}`, payload);
            return api.post(`/api/admin/${resource}`, payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', resource] });
            // master data juga refresh di public
            qc.invalidateQueries({ queryKey: ['public', 'master'] });
            setEditing(null);
        },
    });

    return (
        <div>
            <header className="mb-4">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
                        {subtitle}
                    </p>
                )}
            </header>

            <DataTable
                resource={resource}
                columns={columns}
                filters={filters}
                onCreate={() => setEditing({ ...defaultValues })}
                onEdit={(row) => setEditing(row)}
                newButtonLabel={`Tambah ${pluralLabel}`}
            />

            {editing && (
                <Drawer onClose={() => setEditing(null)} title={`${isEdit ? 'Edit' : 'Tambah'} ${pluralLabel}`}>
                    <FormBuilder
                        fields={formFields}
                        initial={editing}
                        onSubmit={(payload) =>
                            saveMutation.mutateAsync(payload).then((r) => r.data)
                        }
                        onCancel={() => setEditing(null)}
                        submitLabel={isEdit ? 'Update' : 'Buat'}
                    />
                </Drawer>
            )}
        </div>
    );
}

function Drawer({ children, onClose, title }) {
    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div
                className="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-200 text-slate-600"
                        aria-label="Tutup"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}
