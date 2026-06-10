import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api, { formatApiError } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import Spinner from '../../components/Spinner';
import Logo from '../../components/Logo';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: () => api.post('/api/password/forgot', { email }),
        onSuccess: () => setSubmitted(true),
        onError: (err) => setError(formatApiError(err, 'Gagal kirim email reset.')),
    });

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
                                <Mail className="h-5 w-5 text-primary-700" />
                                Lupa Password
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Masukkan email akun Anda. Kami akan kirim link untuk reset password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className="text-center py-6">
                                <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-3" />
                                <h3 className="font-bold text-lg text-slate-900">Link Terkirim</h3>
                                <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
                                    Jika email <strong>{email}</strong> terdaftar di sistem,
                                    link reset password telah dikirim. Cek inbox dan folder spam.
                                </p>
                                <p className="text-xs text-slate-500 mt-3">
                                    Link valid selama <strong>60 menit</strong>.
                                </p>
                                <div className="mt-6 space-y-2">
                                    <Button asChild variant="outline" className="w-full">
                                        <Link to="/login">
                                            <ArrowLeft className="h-4 w-4" />
                                            Kembali ke Login
                                        </Link>
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubmitted(false);
                                            setEmail('');
                                        }}
                                        className="text-xs text-slate-500 hover:text-slate-700"
                                    >
                                        Coba email lain
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setError('');
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
                                        autoFocus
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="anda@example.com"
                                        className="mt-1"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full"
                                >
                                    {mutation.isPending && <Spinner className="h-4 w-4" />}
                                    Kirim Link Reset
                                </Button>

                                <div className="text-center pt-2">
                                    <Link
                                        to="/login"
                                        className="text-sm text-slate-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        Kembali ke Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
