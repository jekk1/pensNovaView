import { useState, useEffect } from 'react';
import { Users, FileText, Shield, CheckSquare, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'pensnova_readiness_checklist';

const CHECKLIST_GROUPS = [
    {
        id: 'komposisi',
        label: 'Komposisi Tim',
        icon: Users,
        items: [
            {
                id: 'minimal2',
                label: 'Minimal 2 anggota tim',
                description: 'Kombinasi peran teknis + bisnis lebih ideal',
            },
            {
                id: 'peranTeknis',
                label: 'Peran teknis & bisnis',
                description: 'Ada 1 orang teknis (dev/engineering) & 1 bisnis (marketing/finance)',
            },
        ],
    },
    {
        id: 'dokumen',
        label: 'Dokumen Produk/Ide',
        icon: FileText,
        items: [
            {
                id: 'proposal',
                label: 'Proposal/Executive Summary',
                description: 'Dokumen bisnis minimal 3-5 halaman',
            },
            {
                id: 'prototype',
                label: 'Prototype atau MVP',
                description: 'Minimal TRL 4-5 untuk inkubator kampus',
            },
            {
                id: 'deckPresentasi',
                label: 'Deck Presentasi',
                description: 'Pitch deck 10-15 slide',
            },
        ],
    },
    {
        id: 'legalitas',
        label: 'Legalitas Awal',
        icon: Shield,
        items: [
            {
                id: 'ktpAnggota',
                label: 'KTP semua anggota',
                description: 'Scan/foto KTP yang masih berlaku',
            },
            {
                id: 'suratKeterangan',
                label: 'Surat Keterangan Aktif',
                description: 'Mahasiswa aktif atau surat alumni',
            },
        ],
    },
    {
        id: 'persyaratan',
        label: 'Persyaratan Umum',
        icon: CheckSquare,
        items: [
            {
                id: 'belumInkubator',
                label: 'Belum terdaftar inkubator lain',
                description: 'Tidak sedang mengikuti program inkubasi sejenis',
            },
            {
                id: 'bersediaProses',
                label: 'Bersedia ikuti seluruh proses',
                description: 'Komitmen penuh selama masa inkubasi',
            },
        ],
    },
];

// * Komponen interaktif checklist kesiapan pendaftaran inkubasi mahasiswa
export default function ReadinessChecklist() {
    const [checked, setChecked] = useState({});
    const [openGroups, setOpenGroups] = useState({
        komposisi: true,
        dokumen: true,
        legalitas: true,
        persyaratan: true,
    });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setChecked(JSON.parse(saved));
        } catch {
            /* ignore */
        }
    }, []);

    // * Menyimpan status centang item checklist ke local storage
    function toggleItem(id) {
        setChecked((prev) => {
            const next = { ...prev, [id]: !prev[id] };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                /* ignore */
            }
            return next;
        });
    }

    // * Membuka atau menutup grup akordeon checklist
    function toggleGroup(groupId) {
        setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    }

    const allItems = CHECKLIST_GROUPS.flatMap((g) => g.items);
    const totalChecked = allItems.filter((item) => checked[item.id]).length;
    const totalItems = allItems.length;

    return (
        <div
            className="rounded-2xl overflow-hidden transition-all duration-200"
            style={{ border: '1px solid #e2e8f0', background: '#ffffff' }}
        >
            {/* * ------------------------------------------------------------ */}
            {/* Header utama */}
            <div
                className="px-6 py-5"
                style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}
            >
                <h3 className="text-base font-extrabold" style={{ color: '#0f172a' }}>
                    Checklist Kesiapan Pendaftaran
                </h3>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                    Centang tiap poin yang sudah kamu penuhi
                </p>
            </div>

            {/* * ------------------------------------------------------------ */}
            {/* Grup akordeon */}
            <div className="divide-y divide-slate-100">
                {CHECKLIST_GROUPS.map((group) => {
                    const groupChecked = group.items.filter((item) => checked[item.id]).length;
                    const isOpen = openGroups[group.id];
                    const Icon = group.icon;
                    const isGroupCompleted = groupChecked === group.items.length;

                    return (
                        <div key={group.id} className="bg-white">
                            {/* Header grup */}
                            <button
                                type="button"
                                onClick={() => toggleGroup(group.id)}
                                className="w-full flex items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50"
                                style={{ background: 'transparent' }}
                            >
                                <div
                                    className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                                    style={{
                                        background: isGroupCompleted ? '#eef2f9' : '#f1f5f9',
                                        color: isGroupCompleted ? '#1a5d94' : '#475569'
                                    }}
                                >
                                    <Icon className="w-4.5 h-4.5" />
                                </div>
                                <span className="flex-1 text-left text-sm font-bold text-slate-800">
                                    {group.label}
                                </span>
                                <span
                                    className="text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors"
                                    style={{
                                        background: isGroupCompleted ? '#dcfce7' : '#f1f5f9',
                                        color: isGroupCompleted ? '#15803d' : '#475569'
                                    }}
                                >
                                    {groupChecked}/{group.items.length}
                                </span>
                                {isOpen
                                    ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" />
                                    : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                                }
                            </button>

                            {/* Item checklist di dalam grup */}
                            {isOpen && (
                                <div className="px-6 pb-4 space-y-2">
                                    {group.items.map((item) => {
                                        const isChecked = !!checked[item.id];
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => toggleItem(item.id)}
                                                className="w-full flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 text-left border"
                                                style={{
                                                    background: isChecked ? '#f0fdf4' : '#f8fafc',
                                                    borderColor: isChecked ? '#bbf7d0' : '#e2e8f0',
                                                }}
                                            >
                                                {/* Custom checkbox */}
                                                <div
                                                    className="shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all mt-0.5"
                                                    style={{
                                                        background: isChecked ? '#22c55e' : 'transparent',
                                                        border: isChecked ? '2px solid #22c55e' : '2px solid #cbd5e1',
                                                    }}
                                                >
                                                    {isChecked && (
                                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div
                                                        className="text-sm font-extrabold leading-tight transition-colors"
                                                        style={{ color: isChecked ? '#15803d' : '#0f172a' }}
                                                    >
                                                        {item.label}
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-xs mt-1 text-slate-500 leading-normal">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                    <div className="mt-2.5">
                                                        <span
                                                            className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border"
                                                            style={{
                                                                background: '#fffbeb',
                                                                color: '#d97706',
                                                                borderColor: '#fde68a'
                                                            }}
                                                        >
                                                            Wajib
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* * ------------------------------------------------------------ */}
            {/* Footer CTA */}
            <div className="px-6 py-5 bg-white border-t border-slate-100">
                {totalChecked === totalItems ? (
                    <Link
                        to="/daftar"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-95 text-center"
                        style={{ background: 'linear-gradient(135deg, #142143, #1a5d94)' }}
                    >
                        Kamu siap daftar inkubasi
                    </Link>
                ) : (
                    <p className="text-xs text-center font-semibold text-slate-500">
                        <span className="text-slate-800 font-extrabold">{totalChecked}</span> dari {totalItems} poin selesai — lengkapi checklist untuk siap daftar inkubasi
                    </p>
                )}
            </div>
        </div>
    );
}

/*
## PENJELASAN CODE:

### ReadinessChecklist()
- Fungsi: Komponen checklist interaktif kesiapan pendaftaran inkubasi untuk membantu founder (mahasiswa/dosen) melakukan audit mandiri kelengkapan syarat administrasi.
- Parameter: Tidak ada.
- Return: Elemen JSX accordion checklist.
- Cara pakai: `<ReadinessChecklist />`
- Catatan: State centang disimpan di localStorage agar persisten. Warna dirombak agar lebih premium, modern, bersih (menggunakan dominasi putih, slate, navy, hijau lembut, dan oranye lembut), serta memperbaiki typo label grup ke-4 menjadi "Persyaratan Umum".
*/
