import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellRing, Check, CheckCheck, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Button } from './ui/button';

const NOTIF_STORAGE_KEY = 'pensnova_notif_last_opened';

/**
 * NotificationBell — bell icon dengan badge unread + dropdown daftar notifikasi.
 *
 * - Poll unread count setiap 30 detik (refetch interval)
 * - Click bell → buka popover dengan 10 notifikasi terbaru
 * - Click row → mark as read (auto)
 * - Tombol mark-all-read + delete per row
 * - First‑visit tracking via localStorage — indikator "Baru" muncul sampai dibuka
 * - Browser Notification API — kirim notif ke HP/desktop saat unread bertambah
 */
export default function NotificationBell({ variant = 'light' }) {
    const [open, setOpen] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const qc = useQueryClient();
    const navigate = useNavigate();
    const prevOpen = useRef(false);
    const prevUnread = useRef(0);
    const permissionAsked = useRef(false);

    // * Cek localStorage: apakah user pernah membuka notifikasi sebelumnya
    useEffect(() => {
        try {
            const lastOpened = localStorage.getItem(NOTIF_STORAGE_KEY);
            if (! lastOpened) setIsFirstVisit(true);
        } catch { /* ignore */ }
    }, []);

    // * Simpan timestamp saat bell pertama kali dibuka
    useEffect(() => {
        if (open && ! prevOpen.current) {
            try {
                localStorage.setItem(NOTIF_STORAGE_KEY, String(Date.now()));
                setIsFirstVisit(false);
            } catch { /* ignore */ }
        }
        prevOpen.current = open;
    }, [open]);

    // * Minta izin notifikasi browser (sekali saat mount)
    useEffect(() => {
        if (! permissionAsked.current && 'Notification' in window && Notification.permission === 'default') {
            permissionAsked.current = true;
            Notification.requestPermission();
        }
    }, []);

    // * Kirim browser notification saat unread count bertambah
    useEffect(() => {
        if (
            unreadCount > prevUnread.current &&
            prevUnread.current > 0 &&
            'Notification' in window &&
            Notification.permission === 'granted' &&
            document.visibilityState !== 'visible'
        ) {
            new Notification('PENSNOVA', {
                body: `Anda memiliki ${unreadCount} notifikasi baru`,
                icon: '/images/pensnova-logo.png',
                tag: 'pensnova-notif',
            });
        }
        prevUnread.current = unreadCount;
    }, [unreadCount]);

    const { data: countData } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => api.get('/api/notifications/unread-count').then((r) => r.data),
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });

    const { data: listData, isLoading } = useQuery({
        queryKey: ['notifications', 'list'],
        queryFn: () =>
            api.get('/api/notifications', { params: { per_page: 10 } }).then((r) => r.data),
        enabled: open,
    });

    const unreadCount = countData?.unread_count ?? 0;
    const notifications = listData?.data ?? [];

    const markRead = useMutation({
        mutationFn: (id) => api.patch(`/api/notifications/${id}/read`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllRead = useMutation({
        mutationFn: () => api.post('/api/notifications/mark-all-read'),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const removeNotif = useMutation({
        mutationFn: (id) => api.delete(`/api/notifications/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const triggerClass =
        variant === 'dark'
            ? 'text-slate-300 hover:text-white hover:bg-primary-800'
            : 'text-slate-700 hover:text-primary-700 hover:bg-slate-100';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Notifikasi"
                    className={cn(
                        'relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition',
                        triggerClass
                    )}
                >
                    {unreadCount > 0 ? (
                        <BellRing className="h-5 w-5" />
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}
                    {/* First‑visit pulsing dot */}
                    {isFirstVisit && unreadCount === 0 && (
                        <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
                    )}
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-80 sm:w-96 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900">Notifikasi</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllRead.mutate()}
                            disabled={markAllRead.isPending}
                            className="text-xs"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Tandai semua
                        </Button>
                    )}
                </div>

                <div className="max-h-[28rem] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-sm text-slate-500">Memuat...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                            <p className="text-sm text-slate-500">Belum ada notifikasi</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {notifications.map((n) => (
                                <NotificationRow
                                    key={n.id}
                                    notification={n}
                                    onRead={() => markRead.mutate(n.id)}
                                    onDelete={() => removeNotif.mutate(n.id)}
                                    onNavigate={(url) => {
                                        setOpen(false);
                                        // Internal route → React Router, external → window.location
                                        if (url.startsWith('http://') || url.startsWith('https://')) {
                                            window.open(url, '_blank', 'noopener');
                                        } else {
                                            navigate(url);
                                        }
                                    }}
                                />
                            ))}
                        </ul>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="border-t border-slate-200 px-4 py-2 text-center">
                        <span className="text-xs text-slate-500">
                            {listData?.meta?.total || notifications.length} total
                        </span>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

function NotificationRow({ notification, onRead, onDelete, onNavigate }) {
    const isUnread = !notification.read_at;
    const data =
        typeof notification.data === 'string'
            ? safeParseJson(notification.data)
            : notification.data || {};

    // Title fallback ladder — title > subject > derived from type
    const title = data.title || data.subject
        || (data.message ? data.message.substring(0, 80) : null)
        || prettifyType(notification.type)
        || 'Notifikasi';
    const body = data.message && (data.title || data.subject) ? data.message : (data.body || data.description || '');
    const link = data.action_url || data.link || data.url || null;
    const time = relativeTime(notification.created_at);

    return (
        <li
            className={cn(
                'group flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition cursor-pointer',
                isUnread && 'bg-amber-50/40'
            )}
            onClick={(e) => {
                e.stopPropagation();
                if (isUnread) onRead();
                if (link && onNavigate) onNavigate(link);
            }}
        >
            <div className="flex-shrink-0 mt-0.5">
                <span
                    className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        isUnread ? 'bg-amber-500' : 'bg-slate-300'
                    )}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={cn(
                            'text-sm leading-tight',
                            isUnread ? 'font-semibold text-slate-900' : 'text-slate-700'
                        )}
                    >
                        {title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                        {time}
                    </span>
                </div>
                {body && (
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{body}</p>
                )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition">
                {isUnread && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRead();
                        }}
                        className="text-slate-400 hover:text-emerald-600 p-1"
                        title="Tandai sudah dibaca"
                    >
                        <Check className="h-3.5 w-3.5" />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Hapus"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </li>
    );
}

function safeParseJson(str) {
    try {
        return JSON.parse(str);
    } catch {
        return {};
    }
}

function prettifyType(type) {
    if (! type) return '';
    const className = type.split('\\').pop() || type;
    // CamelCase → "Camel Case"
    return className
        .replace(/([A-Z])/g, ' $1')
        .replace(/^\s+/, '')
        .replace(/InApp$/i, '');
}

function relativeTime(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}j`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}h`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
