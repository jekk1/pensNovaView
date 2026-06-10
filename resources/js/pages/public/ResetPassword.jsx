import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import api, { formatApiError } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import Spinner from '../../components/Spinner';
import Logo from '../../components/Logo';

/**
 * ResetPassword — landing untuk link email "reset password".
 * URL: /password/reset?token=...&email=...
 */
export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const token = params.get('token') || '';
    const initialEmail = params.get('email') || '';

    const [form, setForm] = useState({
        email: initialEmail,
        password: '',
        password_confirmation: '',
    });

    const mutation = useMutation({
        mutationFn: () =>
            api.post('/api/password/reset', {
                token,
                ...form,
            }),
        onSuccess: () => {
            setDone(true);
            setTimeout(() => navigate('/login'), 3000);
        },
        onError: (err) => {
            setErrors(err.response?.data?.errors || {});
            setError(formatApiError(err, 'Reset password gagal.'));
        },
    });

    if (!token) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <div className="text-5xl mb-3">🔗</div>
                        <h2 className="font-bold text-lg">Link Reset Tidak Valid</h2>
                        <p className="text-sm text-slate-600 mt-2">
                            Link reset tidak valid atau sudah kedaluwarsa.
                        </p>
                        <div className="mt-5 flex gap-2 justify-center">
                            <Button asChild variant="outline">
                                <Link to="/login">Kembali ke Login</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/lupa-password">Minta Link Baru</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (done) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-3" />
                        <h2 className="font-bold text-lg">Password Berhasil Direset</h2>
                        <p className="text-sm text-slate-600 mt-2">
                            Anda akan otomatis diarahkan ke halaman login dalam 3 detik...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 flex justify-center">
                    <Link to="/">
                        <Logo variant="stacked" size="lg" />
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            <div className="flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-amber-600" />
                                Reset Password
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Buat password baru untuk akun <strong>{form.email}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setError('');
                                setErrors({});
                                mutation.mutate();
                            }}
                            className="space-y-4"
                        >
                            {error && (
                                <div className="p-3 rounded-lg bg-rose-50 ring-1 ring-rose-200 text-sm text-rose-800">
                                    {error}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, email: e.target.value }))
                                    }
                                    className="mt-1"
                                />
                                {errors.email && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.email[0]}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password">Password Baru</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, password: e.target.value }))
                                    }
                                    className="mt-1"
                                />
                                {errors.password && (
                                    <p className="text-xs text-rose-600 mt-1">
                                        {errors.password[0]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    value={form.password_confirmation}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            password_confirmation: e.target.value,
                                        }))
                                    }
                                    className="mt-1"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="amber"
                                disabled={mutation.isPending}
                                className="w-full"
                            >
                                {mutation.isPending && <Spinner className="h-4 w-4" />}
                                <KeyRound className="h-4 w-4" />
                                Reset Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
