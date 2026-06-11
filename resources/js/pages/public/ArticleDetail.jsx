import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { Inbox } from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

// Sanitize artikel HTML — block <script>, event handlers, javascript: URLs.
// Whitelist tag/attr typical artikel (heading, paragraph, list, img, a, code, quote).
const sanitizeHtml = (html) => DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
        'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    // Block javascript:, data: (kecuali image data URI), vbscript:
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
});

const CATEGORY_LABEL = {
    innovation: 'Artikel Inovasi',
    news: 'Berita',
    announcement: 'Pengumuman',
};

export default function ArticleDetail() {
    const { slug } = useParams();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['public', 'article', slug],
        queryFn: () => api.get(`/api/public/articles/${slug}`).then((r) => r.data.data),
    });

    if (isLoading) {
        return (
            <div className="py-20 flex justify-center">
                <Spinner className="h-10 w-10 text-primary-600" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4 text-center">
                <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Artikel tidak ditemukan</h1>
                <Link
                    to="/artikel"
                    className="inline-block mt-4 text-primary-700 hover:underline"
                >
                    ← Kembali ke daftar artikel
                </Link>
            </div>
        );
    }

    const a = data;

    return (
        <article className="bg-white">
            <header className="text-white" style={{ background: '#0d1830' }}>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <Link
                        to="/artikel"
                        className="text-amber-300 hover:text-amber-400 text-sm mb-4 inline-block"
                    >
                        ← Daftar artikel
                    </Link>
                    <div className="flex items-center gap-3 mb-4 text-sm">
                        <span className="text-xs uppercase tracking-wider font-bold px-2 py-1 rounded bg-amber-500 text-primary-900">
                            {CATEGORY_LABEL[a.category]}
                        </span>
                        <span className="text-slate-300">
                            {new Date(a.published_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                        {a.author && (
                            <span className="text-slate-300">· oleh {a.author.name}</span>
                        )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                        {a.title}
                    </h1>
                    {a.excerpt && (
                        <p className="mt-3 text-base sm:text-lg text-slate-200 max-w-2xl">
                            {a.excerpt}
                        </p>
                    )}
                </div>
            </header>

            {a.cover_image && (
                <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 mb-6">
                    <img
                        src={a.cover_image}
                        alt={a.title}
                        className="w-full rounded-2xl aspect-video object-cover"
                    />
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div
                    className="prose prose-slate max-w-none prose-img:rounded-xl prose-a:text-primary-700"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.content) }}
                />

                {a.tags?.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
                            Tag
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {a.tags.map((t) => (
                                <span
                                    key={t}
                                    className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700"
                                >
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-10 text-center text-sm text-slate-500">
                    {a.view_count} kali dibaca
                </div>
            </div>
        </article>
    );
}
