import { FlaskConical, ShieldAlert, Handshake, Rocket, FileText } from 'lucide-react';

const defaultData = {
    director: {
        title: 'Direktur',
        subtitle: 'Politeknik Elektronika Negeri Surabaya',
    },
    vice: {
        title: 'Wakil Direktur',
        subtitle: 'Bidang Kerjasama, Humas & Sistem Informasi',
    },
    head: {
        title: 'Kepala UPA',
        subtitle: 'Pengembangan Teknologi & Produk Unggulan',
    },
    admin: {
        title: 'Administratif',
        subtitle: 'Sekretaris & Administrasi',
        icon: FileText,
    },
    divisions: [
        {
            icon: FlaskConical,
            title: 'Divisi Applied Research & Innovation',
            desc: 'Brainstorming & Ideation dengan Industri',
        },
        {
            icon: ShieldAlert,
            title: 'Divisi Knowledge Asset Management',
            desc: 'IP Protection & IP Valuation (Auctions)',
        },
        {
            icon: Handshake,
            title: 'Divisi Tech Deployment & Partnership',
            desc: 'Komersialisasi & Teaching Industry',
        },
        {
            icon: Rocket,
            title: 'Divisi Technopreneurship & Venture Building',
            desc: 'PENS Sky Venture: Startup & Spin-off',
        },
    ],
};

// * Komponen utama penampil bagan struktur organisasi UPA PENS
export default function OrgChart({ data = defaultData, className = '' }) {
    return (
        <div className={`relative w-full ${className}`}>
            {/* * ------------------------------------------------------------ */}
            <div className="flex flex-col items-center">
                <Box {...data.director} />
                <Line height={28} />

                <Box {...data.vice} />
                <Line height={28} />

                <KepalaRow head={data.head} admin={data.admin} />

                <Line height={28} />

                <TreeSplitter count={data.divisions.length} />
            </div>

            {/* * ------------------------------------------------------------ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-1">
                {data.divisions.map((d, i) => (
                    <DivisionCard key={i} {...d} />
                ))}
            </div>

            {/* * ------------------------------------------------------------ */}
            <div className="md:hidden mt-6 mx-auto max-w-xs">
                <Box
                    title={data.admin.title}
                    subtitle={data.admin.subtitle}
                    variant="muted"
                    small
                    icon={data.admin.icon}
                />
            </div>
        </div>
    );
}

// * Render kotak box individu dalam struktur organisasi
function Box({ title, subtitle, variant = 'blue', highlighted = false, small = false, icon: Icon }) {
    const variants = {
        navy: 'bg-primary-900 text-white border-primary-900',
        blue: 'bg-primary-700 text-white border-primary-700',
        amber: 'bg-amber-400 text-primary-900 border-amber-500',
        muted: 'bg-slate-100 text-slate-700 border-slate-300',
    };

    const padding = small ? 'px-3 py-2' : 'px-5 py-3 sm:px-7 sm:py-4';
    const titleSize = small ? 'text-xs' : 'text-sm sm:text-base';
    const subSize = small ? 'text-[10px]' : 'text-xs sm:text-sm';
    const highlight = highlighted
        ? 'ring-4 ring-amber-300/40 border-[3px]'
        : 'border-2';
    const minWidth = small ? 'min-w-[10rem]' : 'min-w-[15rem] sm:min-w-[18rem]';

    return (
        <div
            className={`rounded-xl text-center ${minWidth} max-w-[22rem] ${padding} ${variants[variant]} ${highlight} transition duration-200`}
        >
            <div className={`font-extrabold tracking-tight leading-tight flex items-center justify-center gap-1.5 ${titleSize}`}>
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                <span>{title}</span>
            </div>
            <div className={`mt-0.5 opacity-90 leading-snug ${subSize}`}>{subtitle}</div>
        </div>
    );
}

// * Menggambar garis penghubung vertikal antar box bagan organisasi
function Line({ height = 24 }) {
    return <div className="w-0.5 bg-slate-400" style={{ height }} aria-hidden />;
}

// * Baris kepala UPA yang mendampingi box administratif di sampingnya
function KepalaRow({ head, admin }) {
    return (
        <div className="relative flex items-center justify-center w-full">
            <Box
                title={head.title}
                subtitle={head.subtitle}
                variant="amber"
                highlighted
            />
            <div className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-y-1/2 ml-[15rem] gap-2">
                <svg width="48" height="2" viewBox="0 0 48 2" aria-hidden>
                    <line
                        x1="0"
                        y1="1"
                        x2="48"
                        y2="1"
                        stroke="rgb(148 163 184)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                    />
                </svg>
                <Box
                    title={admin.title}
                    subtitle={admin.subtitle}
                    variant="muted"
                    small
                    icon={admin.icon}
                />
            </div>
        </div>
    );
}

// * Render garis cabang horizontal penghubung ke divisi di bawahnya
function TreeSplitter({ count }) {
    const drops = Array.from({ length: count });
    return (
        <div className="hidden sm:block w-full" aria-hidden>
            <svg
                viewBox="0 0 1000 60"
                preserveAspectRatio="none"
                className="w-full h-12"
            >
                <line
                    x1={1000 / count / 2}
                    y1="30"
                    x2={1000 - 1000 / count / 2}
                    y2="30"
                    stroke="rgb(148 163 184)"
                    strokeWidth="2"
                />
                <line
                    x1="500"
                    y1="0"
                    x2="500"
                    y2="30"
                    stroke="rgb(148 163 184)"
                    strokeWidth="2"
                />
                {drops.map((_, i) => {
                    const x = (1000 / count) * (i + 0.5);
                    return (
                        <line
                            key={i}
                            x1={x}
                            y1="30"
                            x2={x}
                            y2="60"
                            stroke="rgb(148 163 184)"
                            strokeWidth="2"
                        />
                    );
                })}
            </svg>
        </div>
    );
}

// * Render kartu representasi divisi dalam bagan struktur organisasi
function DivisionCard({ icon: Icon, title, desc }) {
    return (
        <div className="relative bg-white rounded-2xl ring-1 ring-slate-200 p-5 pt-6 hover:-translate-y-1 transition duration-200">
            <div className="absolute top-0 left-4 right-4 h-1 bg-primary-900 rounded-b-md" />

            <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center ring-1 ring-slate-200 text-primary-600">
                    {Icon && <Icon className="w-5 h-5" />}
                </div>
            </div>

            <div className="text-center">
                <h3 className="font-bold text-sm leading-snug text-slate-900 min-h-[2.5rem]">
                    {title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

/*
## PENJELASAN CODE:

### OrgChart(props)
- Fungsi: Komponen utama untuk menampilkan bagan organisasi UPA PENSNOVA.
- Parameter: data (object) - Data struktur pimpinan dan divisi, className (string) - Kelas CSS tambahan.
- Return: Elemen JSX bagan organisasi terstruktur.
- Cara pakai: `<OrgChart data={customData} />`
- Catatan: Mendukung responsivitas mobile dengan melipat bagian administratif ke bawah bagan.

### Box(props)
- Fungsi: Menampilkan kotak jabatan individu dengan varian warna dan highlight.
- Parameter: title (string), subtitle (string), variant (string), highlighted (boolean), small (boolean), icon (LucideIcon).
- Return: Elemen JSX kotak jabatan terformat.
- Cara pakai: Dipanggil internal oleh OrgChart untuk merender setiap jabatan.
- Catatan: Menghilangkan shadow dan menggantinya dengan border yang bersih serta mendukung icon di sebelah judul.

### Line(props)
- Fungsi: Merender garis penghubung vertikal sederhana di bagan.
- Parameter: height (number).
- Return: Elemen JSX garis vertikal.
- Cara pakai: `<Line height={30} />`
- Catatan: Hanya untuk keperluan dekoratif structural bagan.

### KepalaRow(props)
- Fungsi: Merender baris Kepala UPA berdampingan dengan unit Administratif pada layar lebar.
- Parameter: head (object), admin (object).
- Return: Elemen JSX baris Kepala UPA.
- Cara pakai: Dipanggil internal oleh OrgChart.
- Catatan: Unit Administratif disembunyikan di layar mobile dan dipindahkan ke bawah bagan.

### TreeSplitter(props)
- Fungsi: Menggambar garis cabang horizontal penghubung ke 4 divisi di bawahnya menggunakan SVG inline.
- Parameter: count (number) - Jumlah cabang divisi.
- Return: Elemen JSX SVG garis cabang.
- Cara pakai: Dipanggil internal oleh OrgChart.
- Catatan: Disembunyikan di perangkat seluler karena layout divisi akan otomatis menjadi satu kolom vertikal.

### DivisionCard(props)
- Fungsi: Merender kartu visual representasi divisi di bagian bawah struktur bagan.
- Parameter: icon (LucideIcon), title (string), desc (string).
- Return: Elemen JSX kartu divisi.
- Cara pakai: Dipanggil di dalam looping divisi data.
- Catatan: Mengganti emoji dengan Lucide Icons dan menggunakan lift transisi tanpa box-shadow.
*/
