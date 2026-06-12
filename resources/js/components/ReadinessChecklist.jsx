import { useState, useEffect, useRef } from 'react';
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
        komposisi: false,
        dokumen: false,
        legalitas: false,
        persyaratan: false,
    });

    const [groupIdx, setGroupIdx] = useState(0);
    const groupScrollRef = useRef(null);

    // Mengatur index slide aktif berdasarkan posisi scroll horizontal container carousel checklist.
    const handleScroll = () => {
        const container = groupScrollRef.current;
        if (!container) return;
        const { scrollLeft } = container;
        const card = container.firstElementChild;
        if (card) {
            const cardWidth = card.clientWidth + 16;
            if (cardWidth > 0) {
                const index = Math.round(scrollLeft / cardWidth);
                setGroupIdx(index);
            }
        }
    };

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
                className="px-5 py-4"
                style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}
            >
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-extrabold" style={{ color: '#0f172a' }}>
                        Checklist Kesiapan Pendaftaran
                    </h3>
                    <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{
                            background: totalChecked === totalItems ? '#dcfce7' : '#f1f5f9',
                            color: totalChecked === totalItems ? '#15803d' : '#475569'
                        }}
                    >
                        {totalChecked}/{totalItems}
                    </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${totalItems > 0 ? (totalChecked / totalItems) * 100 : 0}%`,
                            background: totalChecked === totalItems ? '#22c55e' : '#1a5d94',
                        }}
                    />
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: '#94a3b8' }}>
                    Klik tiap kategori untuk detail
                </p>
            </div>

            {/* Tampilan Desktop: Akordeon vertical */}
            <div className="hidden md:block divide-y divide-slate-100">
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
                                className="w-full flex items-center gap-2.5 px-5 py-3 transition-colors hover:bg-slate-50"
                                style={{ background: 'transparent' }}
                            >
                                <div
                                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                    style={{
                                        background: isGroupCompleted ? '#eef2f9' : '#f1f5f9',
                                        color: isGroupCompleted ? '#1a5d94' : '#475569'
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className="flex-1 text-left text-[13px] font-bold text-slate-800">
                                    {group.label}
                                </span>
                                <span
                                    className="text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors"
                                    style={{
                                        background: isGroupCompleted ? '#dcfce7' : '#f1f5f9',
                                        color: isGroupCompleted ? '#15803d' : '#475569'
                                    }}
                                >
                                    {groupChecked}/{group.items.length}
                                </span>
                                {isOpen
                                    ? <ChevronUp className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                    : <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                }
                            </button>

                            {/* Item checklist di dalam grup */}
                            {isOpen && (
                                <div className="px-5 pb-3 space-y-1.5">
                                    {group.items.map((item) => {
                                        const isChecked = !!checked[item.id];
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => toggleItem(item.id)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-left border"
                                                style={{
                                                    background: isChecked ? '#f0fdf4' : '#f8fafc',
                                                    borderColor: isChecked ? '#bbf7d0' : '#e2e8f0',
                                                }}
                                            >
                                                {/* Custom checkbox */}
                                                <div
                                                    className="shrink-0 w-4.5 h-4.5 rounded flex items-center justify-center transition-all"
                                                    style={{
                                                        background: isChecked ? '#22c55e' : 'transparent',
                                                        border: isChecked ? '2px solid #22c55e' : '2px solid #cbd5e1',
                                                    }}
                                                >
                                                    {isChecked && (
                                                        <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div
                                                        className="text-[13px] font-bold leading-tight truncate transition-colors"
                                                        style={{ color: isChecked ? '#15803d' : '#0f172a' }}
                                                    >
                                                        {item.label}
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-[11px] mt-0.5 text-slate-400 leading-normal truncate">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <span
                                                    className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border"
                                                    style={{
                                                        background: '#fffbeb',
                                                        color: '#d97706',
                                                        borderColor: '#fde68a'
                                                    }}
                                                >
                                                    Wajib
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tampilan Mobile: Carousel horizontal */}
            <div className="block md:hidden bg-slate-50 p-4 w-full min-w-0 overflow-hidden" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div
                    ref={groupScrollRef}
                    onScroll={handleScroll}
                    className="flex gap-4 w-full max-w-full overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scroll-smooth scrollbar-none"
                >
                    {CHECKLIST_GROUPS.map((group) => {
                        const groupChecked = group.items.filter((item) => checked[item.id]).length;
                        const Icon = group.icon;
                        const isGroupCompleted = groupChecked === group.items.length;

                        return (
                            <div
                                key={group.id}
                                className="snap-start shrink-0 w-[82vw] sm:w-[45vw] bg-white rounded-xl p-4 border border-slate-100 flex flex-col"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div
                                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            background: isGroupCompleted ? '#eef2f9' : '#f1f5f9',
                                            color: isGroupCompleted ? '#1a5d94' : '#475569'
                                        }}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="flex-1 text-left text-[12px] font-bold text-slate-800 truncate">
                                        {group.label}
                                    </span>
                                    <span
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                        style={{
                                            background: isGroupCompleted ? '#dcfce7' : '#f1f5f9',
                                            color: isGroupCompleted ? '#15803d' : '#475569'
                                        }}
                                    >
                                        {groupChecked}/{group.items.length}
                                    </span>
                                </div>

                                <div className="space-y-1.5 flex-1">
                                    {group.items.map((item) => {
                                        const isChecked = !!checked[item.id];
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => toggleItem(item.id)}
                                                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200 text-left border"
                                                style={{
                                                    background: isChecked ? '#f0fdf4' : '#f8fafc',
                                                    borderColor: isChecked ? '#bbf7d0' : '#e2e8f0',
                                                }}
                                            >
                                                <div
                                                    className="shrink-0 w-4.5 h-4.5 rounded flex items-center justify-center transition-all mr-2"
                                                    style={{
                                                        background: isChecked ? '#22c55e' : 'transparent',
                                                        border: isChecked ? '2px solid #22c55e' : '2px solid #cbd5e1',
                                                    }}
                                                >
                                                    {isChecked && (
                                                        <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div
                                                        className="text-[11px] font-bold leading-tight truncate"
                                                        style={{ color: isChecked ? '#15803d' : '#0f172a' }}
                                                    >
                                                        {item.label}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center gap-1.5 mt-2">
                    {CHECKLIST_GROUPS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                const container = groupScrollRef.current;
                                if (container) {
                                    const card = container.firstElementChild;
                                    if (card) {
                                        const cardWidth = card.clientWidth + 16;
                                        container.scrollTo({
                                            left: idx * cardWidth,
                                            behavior: 'smooth'
                                        });
                                    }
                                }
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                idx === groupIdx ? 'bg-primary-600 w-5' : 'bg-slate-300 w-2'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* * ------------------------------------------------------------ */}
            {/* Footer CTA */}
            <div className="px-5 py-3.5 bg-white border-t border-slate-100">
                {totalChecked === totalItems ? (
                    <Link
                        to="/daftar"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-95 text-center"
                        style={{ background: '#142143' }}
                    >
                        Kamu siap daftar inkubasi
                    </Link>
                ) : (
                    <p className="text-[11px] text-center font-semibold text-slate-500">
                        <span className="text-slate-800 font-extrabold">{totalChecked}</span>/{totalItems} selesai — lengkapi untuk siap daftar
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

### handleScroll()
- Fungsi: Handler event scroll untuk mendeteksi indeks halaman aktif pada carousel horizontal checklist grup di mobile.
- Parameter: Tidak ada.
- Return: Tidak ada.
- Cara pakai: `onScroll={handleScroll}`
- Catatan: Indeks halaman dihitung berdasarkan lebar clientWidth container dikali faktor lebar card.
*/
