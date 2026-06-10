import { createContext, useContext, useEffect, useState } from 'react';
import api, { getToken, setToken, clearToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchMe() {
        if (!getToken()) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get('/api/me', { _skipAuthRedirect: true });
            setUser(data.data ?? data);
        } catch {
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMe();
    }, []);

    async function login({ email, password, remember = false }) {
        const { data } = await api.post('/api/login', {
            email,
            password,
            remember,
            device_name: navigator.userAgent.slice(0, 80),
        });
        if (data.token) {
            setToken(data.token);
        }
        const u = data.data ?? data;
        setUser(u);
        return u;
    }

    async function logout() {
        try {
            await api.post('/api/logout');
        } catch {
            // ignore — kita bersihkan token client-side toh
        } finally {
            clearToken();
            setUser(null);
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }
    }

    function hasRole(role) {
        if (!user) return false;
        const roles = Array.isArray(user.roles) ? user.roles : [];
        if (Array.isArray(role)) return role.some((r) => roles.includes(r));
        return roles.includes(role);
    }

    function defaultDashboardPath(forUser) {
        // Accept optional user arg — important saat dipanggil langsung
        // setelah login() karena React state user belum re-render.
        const u = forUser ?? user;
        if (!u) return '/login';
        const roles = Array.isArray(u.roles) ? u.roles : [];
        // Semua role manajerial UPA → admin panel (granular akses diatur di sidebar/controller)
        const adminRoles = ['super-admin', 'stp-admin', 'kepala-upa', 'sekretaris', 'kadiv-techno', 'kadiv-tcd', 'kadiv-kam', 'kadiv-ari'];
        if (roles.some((r) => adminRoles.includes(r))) return '/admin';
        if (roles.includes('tenant')) return '/dashboard/tenant';
        if (roles.includes('mentor')) return '/dashboard/mentor';
        if (roles.includes('investor')) return '/dashboard/investor';
        return '/';
    }

    const value = { user, loading, login, logout, hasRole, defaultDashboardPath, refresh: fetchMe };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
    return ctx;
}
