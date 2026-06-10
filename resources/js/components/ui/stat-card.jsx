import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './card';
import { cn } from '../../lib/utils';

/**
 * StatCard — KPI display dengan optional sparkline trend (Tremor-style).
 *
 * Usage:
 *   <StatCard
 *     label="Startup Binaan"
 *     value={50}
 *     change={12}
 *     trend={[5, 8, 12, 18, 25, 38, 50]}
 *     color="emerald"
 *   />
 */

const COLOR_MAP = {
    primary: { text: 'text-primary-700', stroke: '#4338ca', bg: 'bg-primary-50' },
    emerald: { text: 'text-emerald-700', stroke: '#10b981', bg: 'bg-emerald-50' },
    amber: { text: 'text-amber-700', stroke: '#f59e0b', bg: 'bg-amber-50' },
    sky: { text: 'text-sky-700', stroke: '#0284c7', bg: 'bg-sky-50' },
    rose: { text: 'text-rose-700', stroke: '#e11d48', bg: 'bg-rose-50' },
    violet: { text: 'text-violet-700', stroke: '#7c3aed', bg: 'bg-violet-50' },
};

export function StatCard({
    label,
    value,
    change,
    trend,
    icon: Icon,
    color,
    tone, // alias for color (backward compat)
    className,
}) {
    // 'orange' tone (legacy) → 'amber' equivalent
    const normalized = (tone === 'orange' ? 'amber' : tone) || color || 'primary';
    const c = COLOR_MAP[normalized] || COLOR_MAP.primary;
    const isPositive = change >= 0;

    const chartData = (trend || []).map((v, i) => ({ x: i, y: v }));

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {label}
                        </div>
                        <div className={cn('mt-1 text-3xl font-extrabold leading-tight', c.text)}>
                            {value}
                        </div>
                        {change !== undefined && change !== null && (
                            <div
                                className={cn(
                                    'mt-1.5 inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5',
                                    isPositive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-rose-50 text-rose-700'
                                )}
                            >
                                {isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {isPositive ? '+' : ''}
                                {change}%
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0',
                                c.bg
                            )}
                        >
                            <Icon className={cn('h-5 w-5', c.text)} />
                        </div>
                    )}
                </div>

                {chartData.length > 1 && (
                    <div className="mt-3 h-10 -mx-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <Line
                                    type="monotone"
                                    dataKey="y"
                                    stroke={c.stroke}
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
