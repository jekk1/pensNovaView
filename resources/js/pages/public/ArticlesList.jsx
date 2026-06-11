import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Megaphone, Newspaper, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import Animate from '../../components/Animate';

const CATEGORY_LABEL = {
    innovation: 'Artikel Inovasi',
    news: 'Berita',
    announcement: 'Pengumuman',
};
const CATEGORY_COLOR = {
    innovation: 'bg-amber-50 text-amber-800 ring-amber-200',
    news: 'bg-sky-50 text-sky-800 ring-sky-200',
    announcement: 'bg-rose-50 text-rose-800 ring-rose-200',
};

export default function ArticlesList() {
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['public', 'articles', { category, search }],
        queryFn: () =>
            api
                .get('/api/public/articles', {
                    params: { category: category || undefined, q: search || undefined },
                })
                .then((r) => r.data),
    });

    return (
        <div className="bg-slate-50">
            <section className="text-white" style={{ background: '#0d1830' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Link to="/" className="text-amber-300 hover:text-amber-400 text-sm mb-4 inline-block">
                        ← Beranda
                    </Link>
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400 mb-2">
                        Inovasi untuk Negeri
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                        Artikel, Berita & Pengumuman
                    </h1>
                    <p className="mt-3 text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed">
                        Update terbaru dari ekosistem PENSNOVA — artikel inovasi, berita kegiatan, dan
                        pengumuman penting untuk tenant, mitra, dan civitas akademika.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <CatTab active={category === ''} onClick={() => setCategory('')} label="Semua" />
                    {Object.entries(CATEGORY_LABEL).map(([k, label]) => (
                        <CatTab
                            key={k}
                            active={category === k}
                            onClick={() => setCategory(k)}
                            label={label}
                        />
                    ))}
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari…"
                        className="flex-1 min-w-[10rem] px-3 py-2 rounded-lg ring-1 ring-slate-300 text-sm focus:ring-2 focus:ring-primary-400"
                    />
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton.Card key={i} />
                        ))}
                    </div>
                ) : !data?.data?.length ? (
                    <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h2 className="font-bold text-lg">Belum ada artikel</h2>
                        <p className="text-sm text-slate-600 mt-2">
                            Artikel yang dipublikasikan akan tampil di sini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {data.data.map((a, i) => (
                            <Animate key={a.id} variant="scale-in" delay={(i % 3) + 1}>
                                <ArticleCard article={a} />
                            </Animate>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function CatTab({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                active
                    ? 'bg-primary-700 text-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-primary-300'
            }`}
        >
            {label}
        </button>
    );
}

function ArticleCard({ article }) {
    return (
        <Link
            to={`/artikel/${article.slug}`}
            className="block bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden hover:shadow-lg hover:ring-primary-300 transition card-lift h-full"
        >
            {article.cover_image ? (
                <div className="aspect-video bg-slate-100 overflow-hidden">
                    <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className="aspect-video flex items-center justify-center" style={{ background: '#eef2f9' }}>
                    {article.category === 'announcement' ? (
                        <Megaphone className="h-12 w-12 text-rose-500" />
                    ) : article.category === 'news' ? (
                        <Newspaper className="h-12 w-12 text-sky-500" />
                    ) : (
                        <Sparkles className="h-12 w-12 text-amber-500" />
                    )}
                </div>
            )}
            <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                    <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ring-1 ${CATEGORY_COLOR[article.category]}`}
                    >
                        {CATEGORY_LABEL[article.category]}
                    </span>
                    <span className="text-xs text-slate-500">
                        {new Date(article.published_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-2">
                    {article.title}
                </h3>
                {article.excerpt && (
                    <p className="text-sm text-slate-600 line-clamp-3">{article.excerpt}</p>
                )}
            </div>
        </Link>
    );
}

/*
## PENJELASAN CODE:

### ArticlesList()
- Fungsi: Komponen halaman direktori artikel, berita kegiatan, dan pengumuman resmi PENSNOVA.
- Parameter: Tidak ada.
- Return: Elemen visual JSX direktori artikel.
- Cara pakai: <ArticlesList />
- Catatan: Layout dilengkapi filter tab kategori dinamis, search bar instan, dan transisi list scale-in agar tidak kaku.

### CatTab(props)
- Fungsi: Tombol filter kategori artikel.
- Parameter: props (object) - active, onClick, label.
- Return: Elemen JSX button tab.
- Cara pakai: <CatTab active={true} label="Berita" />
- Catatan: Menyesuaikan style latar aktif/nonaktif sesuai tema warna primer navy.

### ArticleCard(props)
- Fungsi: Menampilkan cuplikan artikel, cover gambar, kategori, tanggal rilis, dan ringkasan isi.
- Parameter: props (object) - article.
- Return: Elemen JSX link card artikel.
- Cara pakai: <ArticleCard article={a} />
- Catatan: Dilengkapi dengan detail format tanggal lokal dan fallback icon kategori jika cover gambar tidak tersedia.
*/
