import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Spinner from './Spinner';

export default function ProtectedRoute({ roles, children }) {
    const { user, loading, hasRole, defaultDashboardPath } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner className="h-10 w-10 text-primary-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    if (roles && !hasRole(roles)) {
        return <Navigate to={defaultDashboardPath()} replace />;
    }

    return children;
}
