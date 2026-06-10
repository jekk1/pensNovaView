import { useEffect, useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';

// Peta warna per stage untuk flex card
const stageConfig = {
    mvp:           { label: 'MVP',          gradient: 'linear-gradient(135deg, #1a5d94, #142143)', accent: '#ffaf00' },
    early_revenue: { label: 'Early Revenue', gradient: 'linear-gradient(135deg, #92400e, #ffaf00)', accent: '#ffffff' },
    growth:        { label: 'Growth',        gradient: 'linear-gradient(135deg, #14532d, #16a34a)', accent: '#ffffff' },
    MVP:           { label: 'MVP',          gradient: 'linear-gradient(135deg, #1a5d94, #142143)', accent: '#ffaf00' },
    'Early Revenue': { label: 'Early Revenue', gradient: 'linear-gradient(135deg, #92400e, #ffaf00)', accent: '#ffffff' },
    Growth:        { label: 'Growth',        gradient: 'linear-gradient(135deg, #14532d, #16a34a)', accent: '#ffffff' },
};

// Komponen kartu pencapaian tenant — downloadable via print
export default function FlexCard({ tenant, newStage, onClose }) {
    const cardRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const config = stageConfig[newStage] ?? stageConfig.mvp;
    const achievedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Download card sebagai image via browser print dialog
    function handleDownload() {
        const card = cardRef.current;
        if (!card) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>PENSNOVA Flex Card — ${tenant?.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f0f0f0; font-family: 'Plus Jakarta Sans', sans-serif; }
                    @media print { body { background: white; } @page { margin: 0; } }
                </style>
            </head>
            <body>
                ${card.outerHTML}
                <script>window.onload = () => { window.print(); window.close(); }<\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // Copy link profil startup ke clipboard
    function handleShare() {
        if (!tenant?.slug) return;
        navigator.clipboard.writeText(`${window.location.origin}/startup/${tenant.slug}`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="w-full max-w-lg space-y-4">
                {/* Tombol tutup */}
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Kartu pencapaian */}
                <div
                    ref={cardRef}
                    className="relative rounded-2xl overflow-hidden p-8"
                    style={{ background: config.gradient, minHeight: 280 }}
                >
                    {/* Ornamen background */}
                    <div
                        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
                        style={{ background: config.accent, transform: 'translate(30%, -30%)' }}
                    />
                    <div
                        className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10"
                        style={{ background: config.accent, transform: 'translate(-30%, 30%)' }}
                    />

                    <div className="relative">
                        {/* Header card */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div
                                    className="text-[10px] font-bold uppercase tracking-widest mb-1"
                                    style={{ color: config.accent, opacity: 0.8 }}
                                >
                                    PENSNOVA · Innovation Hub PENS
                                </div>
                                <div className="text-2xl font-extrabold text-white leading-tight">
                                    Pencapaian Stage
                                </div>
                            </div>
                            <div
                                className="px-3 py-1.5 rounded-full text-xs font-bold"
                                style={{ background: config.accent, color: '#142143' }}
                            >
                                {config.label}
                            </div>
                        </div>

                        {/* Nama startup */}
                        <div className="text-4xl font-extrabold text-white mb-2 leading-tight">
                            {tenant?.name || 'Startup'}
                        </div>
                        <div className="text-sm text-white/70 mb-6">{tenant?.one_liner}</div>

                        {/* Footer card */}
                        <div className="flex items-end justify-between border-t border-white/20 pt-4">
                            <div>
                                <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                                    Dicapai pada
                                </div>
                                <div className="text-sm font-bold text-white">{achievedDate}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                                    Batch
                                </div>
                                <div className="text-sm font-bold text-white">
                                    {tenant?.batch?.name || '2026'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                        style={{ background: '#ffaf00', color: '#142143' }}
                    >
                        <Download className="w-4 h-4" />
                        Download Kartu
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
                        style={{
                            background: copied ? 'rgba(22,163,74,0.15)' : 'rgba(255,255,255,0.1)',
                            color: copied ? '#16a34a' : 'white',
                            border: copied ? '1px solid rgba(22,163,74,0.3)' : '1px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                        {copied ? 'Link tersalin!' : 'Share ke LinkedIn'}
                    </button>
                </div>

                <p className="text-center text-[11px] text-white/40">
                    Kartu ini terbit otomatis saat kamu naik stage — terasa spesial karena hanya muncul 2-3 kali selama inkubasi.
                </p>
            </div>
        </div>
    );
}
