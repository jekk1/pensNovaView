import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { User, KeyRound, Camera, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import api, { formatApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import TwoFactorSection from '../components/TwoFactorSection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import Spinner from '../components/Spinner';

/**
 * Settings — self-service profile page (semua role authenticated).
 *
 * Section:
 *   1. Profile (name, email read-only, phone)
 *   2. Avatar (upload + remove)
 *   3. Change Password
 *   4. Account info (role, registered, last activity — read only)
 */
export default function Settings() {
    const { user, refresh } = useAuth();
    const toast = useToast();
    const qc = useQueryClient();
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState({ name: '', phone: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const updateProfile = useMutation({
        mutationFn: (data) => api.put('/api/profile', data),
        onSuccess: () => {
            toast.success('Profil berhasil diperbarui');
            refresh();
            setErrors({});
        },
        onError: (err) => {
            setErrors(err.response?.data?.errors || {});
            toast.error(formatApiError(err));
        },
    });

    const uploadAvatar = useMutation({
        mutationFn: (file) => {
            const fd = new FormData();
            fd.append('avatar', file);
            return api.post('/api/profile/avatar', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            toast.success('Avatar berhasil diupload');
            refresh();
        },
        onError: (err) => toast.error(formatApiError(err)),
    });

    const deleteAvatar = useMutation({
        mutationFn: () => api.delete('/api/profile/avatar'),
        onSuccess: () => {
            toast.success('Avatar dihapus');
            refresh();
        },
    });

    const [pwd, setPwd] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [pwdErrors, setPwdErrors] = useState({});

    const changePassword = useMutation({
        mutationFn: (data) => api.post('/api/profile/change-password', data),
        onSuccess: (res) => {
            toast.success(res.data.message || 'Password berhasil diubah');
            setPwd({ current_password: '', password: '', password_confirmation: '' });
            setPwdErrors({});
        },
        onError: (err) => {
            setPwdErrors(err.response?.data?.errors || {});
            toast.error(formatApiError(err, 'Periksa password Anda'));
        },
    });

    function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File terlalu besar. Maks 2 MB.');
            return;
        }
        uploadAvatar.mutate(file);
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8 text-primary-600" />
            </div>
        );
    }

    const avatarUrl = user.avatar
        ? `/storage/${user.avatar}`
        : null;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <header>
                <div className="flex items-center gap-3 mb-1">
                    <User className="h-7 w-7 text-primary-700" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Pengaturan Akun
                    </h1>
                </div>
                <p className="text-sm text-slate-600">
                    Kelola profil, avatar, dan keamanan akun Anda.
                </p>
            </header>

            {/* Avatar */}
            <Card>
                <CardHeader>
                    <CardTitle>Avatar</CardTitle>
                    <CardDescription>
                        Foto profil terlihat di komentar, mention, dan dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-4 ring-white shadow-md">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user.name?.charAt(0)?.toUpperCase() || '?'
                                )}
                            </div>
                            {uploadAvatar.isPending && (
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                                    <Spinner className="h-6 w-6 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadAvatar.isPending}
                            >
                                <Camera className="h-4 w-4" />
                                Upload Foto
                            </Button>
                            {avatarUrl && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => deleteAvatar.mutate()}
                                    disabled={deleteAvatar.isPending}
                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                </Button>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                PNG/JPG/WEBP, maks 2 MB. Square recommended.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile */}
            <Card>
                <CardHeader>
                    <CardTitle>Profil</CardTitle>
                    <CardDescription>Informasi dasar akun Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            updateProfile.mutate(profile);
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) =>
                                    setProfile((p) => ({ ...p, name: e.target.value }))
                                }
                                className="mt-1"
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-rose-600 mt-1">{errors.name[0]}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="mt-1 bg-slate-50"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Email tidak bisa diubah sendiri. Hubungi admin.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="phone">Nomor HP</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={profile.phone}
                                onChange={(e) =>
                                    setProfile((p) => ({ ...p, phone: e.target.value }))
                                }
                                className="mt-1"
                                placeholder="0812-3456-7890"
                            />
                            {errors.phone && (
                                <p className="text-xs text-rose-600 mt-1">{errors.phone[0]}</p>
                            )}
                        </div>

                        <Button type="submit" disabled={updateProfile.isPending}>
                            {updateProfile.isPending && <Spinner className="h-4 w-4" />}
                            Simpan Perubahan
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-amber-600" />
                            Ubah Password
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Password baru min 8 karakter. Setelah ubah, sesi di device lain otomatis logout.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            changePassword.mutate(pwd);
                        }}
                        className="space-y-4 max-w-md"
                    >
                        <div>
                            <Label htmlFor="current_password">Password Lama</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={pwd.current_password}
                                onChange={(e) =>
                                    setPwd((p) => ({ ...p, current_password: e.target.value }))
                                }
                                className="mt-1"
                                required
                            />
                            {pwdErrors.current_password && (
                                <p className="text-xs text-rose-600 mt-1">
                                    {pwdErrors.current_password[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Password Baru</Label>
                            <Input
                                id="password"
                                type="password"
                                value={pwd.password}
                                onChange={(e) => setPwd((p) => ({ ...p, password: e.target.value }))}
                                className="mt-1"
                                required
                                minLength={8}
                            />
                            {pwdErrors.password && (
                                <p className="text-xs text-rose-600 mt-1">{pwdErrors.password[0]}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={pwd.password_confirmation}
                                onChange={(e) =>
                                    setPwd((p) => ({
                                        ...p,
                                        password_confirmation: e.target.value,
                                    }))
                                }
                                className="mt-1"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="amber"
                            disabled={changePassword.isPending}
                        >
                            {changePassword.isPending && <Spinner className="h-4 w-4" />}
                            <KeyRound className="h-4 w-4" />
                            Update Password
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <TwoFactorSection />

            {/* Account info */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            Informasi Akun
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt className="text-xs text-slate-500 uppercase font-semibold">
                                Role
                            </dt>
                            <dd className="mt-1 flex flex-wrap gap-1">
                                {(user.roles || []).map((r) => (
                                    <Badge key={r} variant="secondary">
                                        {r}
                                    </Badge>
                                ))}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500 uppercase font-semibold">
                                Status
                            </dt>
                            <dd className="mt-1">
                                <Badge variant={user.is_active ? 'success' : 'destructive'}>
                                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500 uppercase font-semibold">
                                User ID
                            </dt>
                            <dd className="mt-1 font-mono text-xs text-slate-700">#{user.id}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500 uppercase font-semibold">
                                Verifikasi Email
                            </dt>
                            <dd className="mt-1">
                                {user.email_verified_at ? (
                                    <Badge variant="success">✓ Verified</Badge>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                                        <AlertCircle className="h-3 w-3" />
                                        Belum diverifikasi
                                    </span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <div className="text-center pt-4">
                <Link
                    to="/"
                    className="text-sm text-slate-600 hover:text-primary-700 font-medium"
                >
                    ← Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
