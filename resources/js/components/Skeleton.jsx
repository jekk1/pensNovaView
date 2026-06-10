/**
 * Skeleton loaders — placeholder untuk konten yang masih di-fetch.
 *
 * Variants:
 *   <Skeleton /> — generic block
 *   <Skeleton.Text lines={3} /> — multi-line text placeholder
 *   <Skeleton.Card /> — card with header + content
 *   <Skeleton.Table rows={5} cols={4} /> — tabel placeholder
 *   <Skeleton.Avatar /> — avatar bulat
 */

export default function Skeleton({ className = '', height = 'h-4', width = 'w-full' }) {
    return (
        <div
            className={`bg-slate-200 animate-pulse rounded ${height} ${width} ${className}`}
            aria-hidden="true"
        />
    );
}

Skeleton.Text = function SkeletonText({ lines = 3, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`} aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="h-3"
                    width={i === lines - 1 ? 'w-3/4' : 'w-full'}
                />
            ))}
        </div>
    );
};

Skeleton.Card = function SkeletonCard({ className = '' }) {
    return (
        <div className={`bg-white ring-1 ring-slate-200 rounded-2xl p-5 ${className}`} aria-busy="true">
            <Skeleton height="h-5" width="w-1/3" className="mb-3" />
            <Skeleton.Text lines={3} />
        </div>
    );
};

Skeleton.Table = function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
    return (
        <div className={`bg-white ring-1 ring-slate-200 rounded-2xl overflow-hidden ${className}`} aria-busy="true">
            <div className="bg-slate-50 px-4 py-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={`h-${i}`} height="h-3" width="w-2/3" />
                ))}
            </div>
            <div className="divide-y divide-slate-100">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="px-4 py-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                        {Array.from({ length: cols }).map((_, c) => (
                            <Skeleton
                                key={`r${r}c${c}`}
                                height="h-3"
                                width={c === 0 ? 'w-3/4' : 'w-1/2'}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

Skeleton.Avatar = function SkeletonAvatar({ size = 'h-10 w-10' }) {
    return <div className={`bg-slate-200 animate-pulse rounded-full ${size}`} aria-hidden="true" />;
};

Skeleton.Stats = function SkeletonStats({ count = 4 }) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-${count} gap-3 sm:gap-4`} aria-busy="true">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 ring-1 ring-slate-200">
                    <Skeleton height="h-8" width="w-1/2" className="mb-2" />
                    <Skeleton height="h-3" width="w-2/3" />
                </div>
            ))}
        </div>
    );
};
