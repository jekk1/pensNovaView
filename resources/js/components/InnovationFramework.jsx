import { Handshake, Lightbulb, FlaskConical, DollarSign, GraduationCap, Rocket, Factory } from 'lucide-react';

const STAGES = {
    demand: {
        icon: Handshake,
        label: 'Demand-Pull',
        desc: 'Needs & Demands dari government / industrial market',
        colorMain: '#0284c7',
        colorLight: '#7dd3fc',
        colorBg: '#f0f9ff',
    },
    ideation: {
        icon: Lightbulb,
        label: 'Ideation',
        desc: 'Divisi Applied Research & Innovation melakukan brainstorming dengan Industri',
        colorMain: '#0891b2',
        colorLight: '#67e8f9',
        colorBg: '#ecfeff',
    },
    development: {
        icon: FlaskConical,
        label: 'Development',
        desc: 'Inventions from Internal Academic Sources',
        colorMain: '#0d9488',
        colorLight: '#5eead4',
        colorBg: '#f0fdfa',
    },
    auctions: {
        icon: DollarSign,
        label: 'Auctions',
        desc: 'IP Protection & IP Valuation oleh Divisi Knowledge Asset Management',
        colorMain: '#ea580c',
        colorLight: '#fdba74',
        colorBg: '#fff7ed',
    },
    selfComm: {
        icon: GraduationCap,
        label: 'Self-Commercialization',
        desc: 'Komersialisasi via skema Teaching Industry oleh Divisi Tech Deployment',
        colorMain: '#16a34a',
        colorLight: '#86efac',
        colorBg: '#f0fdf4',
    },
    spinoff: {
        icon: Rocket,
        label: 'Spin-off',
        desc: 'Pembentukan startup oleh Divisi Technopreneurship & Incubator',
        colorMain: '#d97706',
        colorLight: '#fcd34d',
        colorBg: '#fffbeb',
    },
    wellEst: {
        icon: Factory,
        label: 'Well-established Industry',
        desc: 'Industri yang sudah matang, mapan, dan memiliki standar yang jelas',
        colorMain: '#4338ca',
        colorLight: '#a5b4fc',
        colorBg: '#eef2ff',
    },
};

const VIEW_W = 1240;
const VIEW_H = 600;
const RADIUS = 40;
const CARD_W = 180;
const CARD_W_WIDE = 200;
const CARD_H = 130;
const CARD_TOP = 70;
const ROW_Y = 300;
const WELLEST_Y = 460;

const LAYOUT = {
    demand: { cx: 130, cy: ROW_Y, cardX: 40, cardY: CARD_TOP, cardW: CARD_W, cardH: CARD_H },
    ideation: { cx: 330, cy: ROW_Y, cardX: 240, cardY: CARD_TOP, cardW: CARD_W, cardH: CARD_H },
    development: { cx: 530, cy: ROW_Y, cardX: 440, cardY: CARD_TOP, cardW: CARD_W, cardH: CARD_H },
    auctions: { cx: 730, cy: ROW_Y, cardX: 640, cardY: CARD_TOP, cardW: CARD_W, cardH: CARD_H },
    selfComm: {
        cx: 940,
        cy: ROW_Y,
        cardX: 840,
        cardY: CARD_TOP,
        cardW: CARD_W_WIDE,
        cardH: CARD_H,
    },
    spinoff: {
        cx: 1140,
        cy: ROW_Y,
        cardX: 1050,
        cardY: CARD_TOP,
        cardW: CARD_W,
        cardH: CARD_H,
    },
    wellEst: {
        cx: 730,
        cy: WELLEST_Y,
        cardX: 470,
        cardY: WELLEST_Y - CARD_H / 2,
        cardW: CARD_W_WIDE,
        cardH: CARD_H,
    },
};

// * Komponen visual ekosistem inovasi terapan PENSNOVA untuk desktop dan mobile
export default function InnovationFramework({ className = '' }) {
    return (
        <div className={`relative ${className}`}>
            {/* * ------------------------------------------------------------ */}
            <div className="hidden md:block">
                <DesktopDiagram />
            </div>

            {/* * ------------------------------------------------------------ */}
            <div className="md:hidden">
                <MobileDiagram />
            </div>
        </div>
    );
}

// * Render diagram alur inovasi lengkap dalam format SVG SVG responsive desktop
function DesktopDiagram() {
    return (
        <div className="w-full" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
            <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient id="ifw-bg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fafbfc" />
                        <stop offset="100%" stopColor="#f1f5f9" />
                    </linearGradient>

                    {Object.entries(STAGES).map(([key, s]) => (
                        <radialGradient
                            key={key}
                            id={`ifw-grad-${key}`}
                            cx="0.3"
                            cy="0.3"
                            r="0.9"
                        >
                            <stop offset="0%" stopColor={s.colorLight} />
                            <stop offset="100%" stopColor={s.colorMain} />
                        </radialGradient>
                    ))}

                    <marker
                        id="ifw-arrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                    </marker>
                    <marker
                        id="ifw-arrow-fade"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                    </marker>
                </defs>

                <rect width={VIEW_W} height={VIEW_H} fill="url(#ifw-bg)" rx="20" />

                <text
                    x={VIEW_W / 2}
                    y={32}
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="800"
                    fill="#0f172a"
                    letterSpacing="-0.5"
                >
                    Applied Innovation Framework
                </text>

                {['demand', 'ideation', 'development', 'auctions', 'selfComm'].map((key, i) => {
                    const next = ['ideation', 'development', 'auctions', 'selfComm', 'spinoff'][i];
                    const a = LAYOUT[key];
                    const b = LAYOUT[next];
                    return (
                        <line
                            key={`flow-${key}`}
                            x1={a.cx + RADIUS + 4}
                            y1={a.cy}
                            x2={b.cx - RADIUS - 8}
                            y2={b.cy}
                            stroke="#475569"
                            strokeWidth="2.5"
                            markerEnd="url(#ifw-arrow)"
                        />
                    );
                })}

                <line
                    x1={LAYOUT.auctions.cx}
                    y1={LAYOUT.auctions.cy + RADIUS + 4}
                    x2={LAYOUT.wellEst.cx}
                    y2={LAYOUT.wellEst.cy - RADIUS - 8}
                    stroke="#475569"
                    strokeWidth="2.5"
                    markerEnd="url(#ifw-arrow)"
                />

                {['demand', 'ideation', 'development', 'auctions', 'selfComm', 'spinoff'].map(
                    (key) => {
                        const stage = STAGES[key];
                        const pos = LAYOUT[key];
                        return (
                            <line
                                key={`conn-${key}`}
                                x1={pos.cx}
                                y1={pos.cardY + pos.cardH + 2}
                                x2={pos.cx}
                                y2={pos.cy - RADIUS - 4}
                                stroke={stage.colorMain}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        );
                    }
                )}

                <line
                    x1={LAYOUT.wellEst.cardX + LAYOUT.wellEst.cardW + 2}
                    y1={LAYOUT.wellEst.cy}
                    x2={LAYOUT.wellEst.cx - RADIUS - 4}
                    y2={LAYOUT.wellEst.cy}
                    stroke={STAGES.wellEst.colorMain}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                <path
                    d={`M ${LAYOUT.spinoff.cx} ${LAYOUT.spinoff.cy + RADIUS + 4}
                        C ${LAYOUT.spinoff.cx} ${VIEW_H - 30},
                          ${LAYOUT.demand.cx} ${VIEW_H - 30},
                          ${LAYOUT.demand.cx} ${LAYOUT.demand.cy + RADIUS + 8}`}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="6 5"
                    fill="none"
                    markerEnd="url(#ifw-arrow-fade)"
                />

                <foreignObject
                    x={(LAYOUT.auctions.cx + LAYOUT.selfComm.cx) / 2 - 80}
                    y={LAYOUT.auctions.cy - 56}
                    width="160"
                    height="36"
                >
                    <div
                        style={{
                            fontSize: 11,
                            fontStyle: 'italic',
                            fontWeight: 600,
                            color: '#1e293b',
                            background: 'rgba(255,255,255,0.95)',
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            lineHeight: 1.3,
                            textAlign: 'center',
                        }}
                    >
                        Licensed, for non-capital
                    </div>
                </foreignObject>

                <foreignObject
                    x={LAYOUT.auctions.cx + 22}
                    y={(LAYOUT.auctions.cy + LAYOUT.wellEst.cy) / 2 - 18}
                    width="160"
                    height="36"
                >
                    <div
                        style={{
                            fontSize: 11,
                            fontStyle: 'italic',
                            fontWeight: 600,
                            color: '#1e293b',
                            background: 'rgba(255,255,255,0.95)',
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            lineHeight: 1.3,
                            textAlign: 'center',
                        }}
                    >
                        Licensed, for capital intensive
                    </div>
                </foreignObject>

                <foreignObject
                    x={VIEW_W / 2 - 110}
                    y={VIEW_H - 50}
                    width="220"
                    height="32"
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#475569',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            letterSpacing: '0.02em',
                        }}
                    >
                        Feedback and Iteration
                    </div>
                </foreignObject>

                {Object.entries(LAYOUT).map(([key, pos]) => {
                    const stage = STAGES[key];
                    return <Card key={`card-${key}`} stage={stage} pos={pos} />;
                })}

                {Object.entries(LAYOUT).map(([key, pos]) => {
                    const stage = STAGES[key];
                    return (
                        <CircleNode
                            key={`circle-${key}`}
                            stage={stage}
                            cx={pos.cx}
                            cy={pos.cy}
                            gradId={`ifw-grad-${key}`}
                        />
                    );
                })}
            </svg>
        </div>
    );
}

// * Render kartu penjelasan detail tahap di atas bulatan node
function Card({ stage, pos }) {
    return (
        <foreignObject x={pos.cardX} y={pos.cardY} width={pos.cardW} height={pos.cardH}>
            <div
                className="ifw-card"
                style={{
                    width: '100%',
                    height: '100%',
                    background: stage.colorBg,
                    border: `2px solid ${stage.colorLight}`,
                    borderRadius: 12,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: stage.colorMain,
                        lineHeight: 1.2,
                        marginBottom: 6,
                    }}
                >
                    {stage.label}
                </div>
                <div
                    style={{
                        fontSize: 11,
                        color: '#475569',
                        lineHeight: 1.4,
                    }}
                >
                    {stage.desc}
                </div>
            </div>
        </foreignObject>
    );
}

// * Render bulatan node SVG utama yang menampung ikon tahap
function CircleNode({ stage, cx, cy, gradId }) {
    const Icon = stage.icon;
    return (
        <g>
            <circle cx={cx} cy={cy} r={RADIUS + 6} fill={stage.colorMain} opacity="0.12" />

            <circle
                cx={cx}
                cy={cy}
                r={RADIUS}
                fill={`url(#${gradId})`}
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
            />

            <circle
                cx={cx}
                cy={cy}
                r={RADIUS - 4}
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
            />

            <foreignObject
                x={cx - 14}
                y={cy - 14}
                width="28"
                height="28"
                pointerEvents="none"
            >
                <div
                    style={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                    }}
                    aria-hidden
                >
                    {Icon && <Icon className="w-6 h-6 shrink-0" />}
                </div>
            </foreignObject>
        </g>
    );
}

// * Render daftar alur alur inovasi versi responsif mobile vertikal
function MobileDiagram() {
    const flow = ['demand', 'ideation', 'development', 'auctions'];
    const branchA = ['selfComm', 'spinoff'];
    const branchB = ['wellEst'];

    return (
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 ring-1 ring-slate-200">
            <h3 className="text-center text-lg font-extrabold text-slate-900 mb-5">
                Applied Innovation Framework
            </h3>

            {flow.map((key, i) => (
                <MobileNode key={key} stage={STAGES[key]} showArrow={i < flow.length - 1} />
            ))}

            <div className="my-4 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider">
                    Cabang dari Auctions
                </div>
            </div>

            <div className="mb-4 px-3 py-3 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
                <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider mb-2">
                    Jalur Non-Capital Intensive
                </div>
                {branchA.map((key, i) => (
                    <MobileNode
                        key={key}
                        stage={STAGES[key]}
                        showArrow={i < branchA.length - 1}
                    />
                ))}
            </div>

            <div className="px-3 py-3 bg-indigo-50 rounded-xl border-l-4 border-indigo-500">
                <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider mb-2">
                    Jalur Capital Intensive
                </div>
                {branchB.map((key) => (
                    <MobileNode key={key} stage={STAGES[key]} showArrow={false} />
                ))}
            </div>

            <div className="mt-6 text-center">
                <span className="inline-block px-4 py-2 rounded-full bg-slate-200 text-slate-700 text-xs font-bold italic">
                    Feedback and Iteration
                </span>
            </div>
        </div>
    );
}

// * Render node satuan visual untuk versi mobile
function MobileNode({ stage, showArrow }) {
    const Icon = stage.icon;
    return (
        <div>
            <div
                className="flex items-start gap-3 p-3 rounded-xl bg-white shadow-sm ring-1 ring-slate-100"
                style={{ borderLeft: `4px solid ${stage.colorMain}` }}
            >
                <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{
                        background: `linear-gradient(135deg, ${stage.colorLight}, ${stage.colorMain})`,
                    }}
                    aria-hidden
                >
                    {Icon && <Icon className="w-5 h-5 shrink-0" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div
                        className="text-sm font-bold leading-tight"
                        style={{ color: stage.colorMain }}
                    >
                        {stage.label}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 leading-snug">
                        {stage.desc}
                    </div>
                </div>
            </div>
            {showArrow && (
                <div className="flex justify-center my-2">
                    <svg width="14" height="20" viewBox="0 0 14 20" aria-hidden>
                        <line
                            x1="7"
                            y1="0"
                            x2="7"
                            y2="13"
                            stroke="#94a3b8"
                            strokeWidth="2"
                        />
                        <polygon points="7,20 2,12 12,12" fill="#94a3b8" />
                    </svg>
                </div>
            )}
        </div>
    );
}

/*
## PENJELASAN CODE:

### InnovationFramework(props)
- Fungsi: Komponen utama untuk menampilkan Applied Innovation Framework PENSNOVA.
- Parameter: className (string) - Kelas CSS tambahan.
- Return: Elemen JSX diagram alur kerja terintegrasi.
- Cara pakai: `<InnovationFramework />`
- Catatan: Secara responsif berpindah antara SVG diagram desktop dan layout vertikal mobile.

### DesktopDiagram()
- Fungsi: Menampilkan diagram alur SVG interaktif dengan visual lengkap untuk layar desktop.
- Parameter: Tidak ada.
- Return: Elemen JSX SVG.
- Cara pakai: Dipanggil internal oleh InnovationFramework.
- Catatan: Menghilangkan shadow dan emoji, menggunakan marker SVG dan Lucide icon.

### Card(props)
- Fungsi: Menampilkan tooltip/kartu informasi untuk setiap node di diagram SVG.
- Parameter: stage (object) - Data tahap, pos (object) - Data koordinat.
- Return: Elemen JSX foreignObject card.
- Cara pakai: Dipanggil di dalam perulangan alur STAGES.
- Catatan: Dihilangkan box-shadow-nya sesuai petunjuk user.

### CircleNode(props)
- Fungsi: Menggambar bulatan node interaktif yang menampung ikon di diagram SVG.
- Parameter: stage (object), cx (number), cy (number), gradId (string).
- Return: Elemen JSX g (grup SVG).
- Cara pakai: Dipanggil di dalam perulangan circle layout.
- Catatan: Menggunakan drop-shadow filter inline tipis dan merender ikon Lucide di dalamnya.

### MobileDiagram()
- Fungsi: Menyajikan alternatif alur diagram vertikal yang dioptimalkan untuk perangkat mobile.
- Parameter: Tidak ada.
- Return: Elemen JSX container mobile.
- Cara pakai: Dipanggil internal oleh InnovationFramework.
- Catatan: Alur bercabang dipisahkan ke dalam block container khusus agar mudah dipahami.

### MobileNode(props)
- Fungsi: Menampilkan item tahapan satuan dalam bentuk baris list di mobile layout.
- Parameter: stage (object), showArrow (boolean).
- Return: Elemen JSX list node.
- Cara pakai: Dipanggil di dalam perulangan alur mobile.
- Catatan: Menggunakan border-left dengan warna identitas stage sebagai aksen visual.
*/
