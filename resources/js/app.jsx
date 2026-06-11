import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Construction, HelpCircle } from 'lucide-react';
import '../css/app.css';

import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider } from './lib/toast';
import { queryClient } from './lib/query-client';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// ──────────────────────────────────────────────────────────────────────────
// EAGER imports — public-facing pages (high traffic, must be fast on first load)
// ──────────────────────────────────────────────────────────────────────────
import Home from './pages/public/Home';
import About from './pages/public/About';
import Programs from './pages/public/Programs';
import Login from './pages/public/Login';
import StartupsList from './pages/public/StartupsList';
import StartupDetail from './pages/public/StartupDetail';
import ResearchList from './pages/public/ResearchList';
import ResearchDetail from './pages/public/ResearchDetail';
import InnovationsList from './pages/public/InnovationsList';
import InnovationDetail from './pages/public/InnovationDetail';
import AlumniList from './pages/public/AlumniList';
import AlumniDetail from './pages/public/AlumniDetail';
import Impact from './pages/public/Impact';
import Leaderboard from './pages/public/Leaderboard';
import XpToast from './components/XpToast';
import Companies from './pages/public/Companies';
import Apply from './pages/public/Apply';
import ApplyThanks from './pages/public/ApplyThanks';
import ArticlesList from './pages/public/ArticlesList';
import ArticleDetail from './pages/public/ArticleDetail';
import Guides from './pages/public/Guides';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

const Settings = lazy(() => import('./pages/Settings'));

// ──────────────────────────────────────────────────────────────────────────
// LAZY imports — authenticated dashboards (loaded on-demand, behind auth)
// Mengurangi bundle initial dari ~514KB ke ~250KB untuk pengunjung publik.
// ──────────────────────────────────────────────────────────────────────────
const TenantDashboard = lazy(() => import('./pages/tenant/Dashboard'));
const ProgressReports = lazy(() => import('./pages/tenant/ProgressReports'));
const TenantMilestones = lazy(() => import('./pages/tenant/Milestones'));
const TenantResearchTopics = lazy(() => import('./pages/tenant/ResearchTopics'));
const TenantSessions = lazy(() => import('./pages/tenant/Sessions'));
const MentorDashboard = lazy(() => import('./pages/mentor/Dashboard'));
const MentorTenants = lazy(() => import('./pages/mentor/Tenants'));
const MentorSessions = lazy(() => import('./pages/mentor/Sessions'));
const InvestorDashboard = lazy(() => import('./pages/investor/Dashboard'));
const InvestorMeetings = lazy(() => import('./pages/investor/Meetings'));

const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminHome = lazy(() => import('./admin/pages/AdminHome'));
const Sectors = lazy(() => import('./admin/pages/Sectors'));
const IncubationPhases = lazy(() => import('./admin/pages/IncubationPhases'));
const TenantStages = lazy(() => import('./admin/pages/TenantStages'));
const Batches = lazy(() => import('./admin/pages/Batches'));
const Users = lazy(() => import('./admin/pages/Users'));
const Tenants = lazy(() => import('./admin/pages/Tenants'));
const Applications = lazy(() => import('./admin/pages/Applications'));
const Mentors = lazy(() => import('./admin/pages/Mentors'));
const Investors = lazy(() => import('./admin/pages/Investors'));
const PartnerCompanies = lazy(() => import('./admin/pages/PartnerCompanies'));
const ResearchTopics = lazy(() => import('./admin/pages/ResearchTopics'));
const MentoringSessions = lazy(() => import('./admin/pages/MentoringSessions'));
const Milestones = lazy(() => import('./admin/pages/Milestones'));
const AdminProgressReports = lazy(() => import('./admin/pages/ProgressReports'));
const Collaborations = lazy(() => import('./admin/pages/Collaborations'));
const MeetingRequests = lazy(() => import('./admin/pages/MeetingRequests'));
const CompanyInterests = lazy(() => import('./admin/pages/CompanyInterests'));
const MatchRecords = lazy(() => import('./admin/pages/MatchRecords'));
const ActivityLogs = lazy(() => import('./admin/pages/ActivityLogs'));
const ApiClients = lazy(() => import('./admin/pages/ApiClients'));
const AdminQuests = lazy(() => import('./admin/pages/Quests'));
const MonevAssessments = lazy(() => import('./admin/pages/MonevAssessments'));
const TenantMonev = lazy(() => import('./pages/tenant/Monev'));
const AdminTenantNeeds = lazy(() => import('./admin/pages/TenantNeeds'));
const TenantNeedsForm = lazy(() => import('./pages/tenant/Needs'));
const TenantWorkspaceRentals = lazy(() => import('./pages/tenant/WorkspaceRentals'));
const TenantRoomBookings = lazy(() => import('./pages/tenant/RoomBookings'));
const TenantProducts = lazy(() => import('./pages/tenant/Products'));
const TenantProgramCertificates = lazy(() => import('./pages/tenant/ProgramCertificates'));
const TenantDocuments = lazy(() => import('./pages/tenant/Documents'));
const TenantAlumniHub = lazy(() => import('./pages/tenant/AlumniHub'));
const TracerStudyRedirect = lazy(() => import('./pages/public/TracerStudyRedirect'));
const Graduations = lazy(() => import('./admin/pages/Graduations'));
const Certifications = lazy(() => import('./admin/pages/Certifications'));
const Partnerships = lazy(() => import('./admin/pages/Partnerships'));
const WorkspaceManagement = lazy(() => import('./admin/pages/WorkspaceManagement'));
const WorkspaceRentalPublic = lazy(() => import('./pages/public/WorkspaceRental'));
const Patents = lazy(() => import('./admin/pages/Patents'));
const HkiRekap = lazy(() => import('./admin/pages/HkiRekap'));
const TrlAssessments = lazy(() => import('./admin/pages/TrlAssessments'));
const MrlAssessments = lazy(() => import('./admin/pages/MrlAssessments'));
const ResearchProducts = lazy(() => import('./admin/pages/ResearchProducts'));
const Surveys = lazy(() => import('./admin/pages/Surveys'));
const ProgramCertificates = lazy(() => import('./admin/pages/ProgramCertificates'));
const ProductInquiries = lazy(() => import('./admin/pages/ProductInquiries'));
const AlumniInsights = lazy(() => import('./admin/pages/AlumniInsights'));
const LicenseDeals = lazy(() => import('./admin/pages/LicenseDeals'));
const RoyaltyPayments = lazy(() => import('./admin/pages/RoyaltyPayments'));
const RdProjects = lazy(() => import('./admin/pages/RdProjects'));
const LabServices = lazy(() => import('./admin/pages/LabServices'));
const LabServicesCatalog = lazy(() => import('./pages/public/LabServicesCatalog'));
const SurveyResponder = lazy(() => import('./pages/public/SurveyResponder'));
const FeedbackRedirect = lazy(() => import('./pages/public/FeedbackRedirect'));
const CertificateVerify = lazy(() => import('./pages/public/CertificateVerify'));

const tenantNav = [
    { to: '/dashboard/tenant', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/dashboard/tenant/progress-reports', label: 'Laporan', icon: 'laporan' },
    { to: '/dashboard/tenant/milestones', label: 'Milestone', icon: 'milestone' },
    { to: '/dashboard/tenant/research', label: 'Riset', icon: 'riset' },
    { to: '/dashboard/tenant/sessions', label: 'Mentoring', icon: 'mentoring' },
    { to: '/dashboard/tenant/monev', label: 'Monev', icon: 'monev' },
    { to: '/dashboard/tenant/needs', label: 'Kebutuhan', icon: 'kebutuhan' },
    { to: '/dashboard/tenant/sewa', label: 'Sewa Ruang', icon: 'sewa' },
    { to: '/dashboard/tenant/pinjam-ruang', label: 'Pinjam Ruang', icon: 'pinjam' },
    { to: '/dashboard/tenant/produk', label: 'Produk Saya', icon: 'produk' },
    { to: '/dashboard/tenant/sertifikat', label: 'Sertifikat', icon: 'sertifikat' },
    { to: '/dashboard/tenant/documents', label: 'Document Vault', icon: 'documents' },
    { to: '/dashboard/tenant/alumni', label: 'Alumni Hub', icon: 'alumni' },
];
const mentorNav = [
    { to: '/dashboard/mentor', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/dashboard/mentor/tenants', label: 'Binaan', icon: 'binaan' },
    { to: '/dashboard/mentor/sessions', label: 'Sesi', icon: 'sesi' },
];
const investorNav = [
    { to: '/dashboard/investor', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/startup', label: 'Browse', icon: 'browse' },
    { to: '/dashboard/investor/meetings', label: 'Meeting', icon: 'meeting' },
];

function DashboardRedirect() {
    const { defaultDashboardPath } = useAuth();
    return <Navigate to={defaultDashboardPath()} replace />;
}

function PageFallback() {
    return (
        <div className="min-h-[40vh] flex items-center justify-center">
            <Spinner className="h-8 w-8 text-primary-600" />
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <AuthProvider>
                            <XpToast />
                            <Suspense fallback={<PageFallback />}>
                                <Routes>
                                    {/* Public Survey — di luar PublicLayout supaya tampilan clean */}
                                    <Route path="/survey/:slug" element={<SurveyResponder />} />
                                    {/* Permanent link untuk kop surat/footer — auto redirect ke survey kepuasan aktif */}
                                    <Route path="/feedback" element={<FeedbackRedirect />} />
                                    {/* Verifikasi keaslian sertifikat peserta — link tercetak di PDF */}
                                    <Route path="/sertifikat/verifikasi" element={<CertificateVerify />} />
                                    <Route path="/alumni/tracer-study" element={<TracerStudyRedirect />} />

                                    <Route element={<PublicLayout />}>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/tentang" element={<About />} />
                                        <Route path="/program" element={<Programs />} />
                                        <Route path="/startup" element={<StartupsList />} />
                                        <Route path="/startup/:slug" element={<StartupDetail />} />
                                        <Route path="/riset" element={<ResearchList />} />
                                        <Route path="/riset/:slug" element={<ResearchDetail />} />
                                        <Route path="/produk-inovasi" element={<InnovationsList />} />
                                        <Route path="/produk-inovasi/:slug" element={<InnovationDetail />} />
                                        <Route path="/alumni" element={<AlumniList />} />
                                        <Route path="/alumni/:slug" element={<AlumniDetail />} />
                                        <Route path="/dampak" element={<Impact />} />
                                        <Route path="/leaderboard" element={<Leaderboard />} />
                                        <Route path="/jasa-lab" element={<LabServicesCatalog />} />
                                        <Route path="/mitra" element={<Companies />} />
                                        <Route path="/daftar" element={<Apply />} />
                                        <Route path="/daftar/terima-kasih" element={<ApplyThanks />} />
                                        <Route path="/daftar/:id" element={<RedirectDaftarLegacy />} />
                                        <Route path="/artikel" element={<ArticlesList />} />
                                        <Route path="/artikel/:slug" element={<ArticleDetail />} />
                                        <Route path="/panduan" element={<Guides />} />
                                        <Route path="/sewa-ruang" element={<WorkspaceRentalPublic />} />
                                        {/* Sky Venture = inkubator UPA itu sendiri — redirect ke /tentang */}
                                        <Route path="/sky-venture" element={<Navigate to="/tentang" replace />} />
                                        <Route path="/skyventure" element={<Navigate to="/tentang" replace />} />

                                        <Route path="/startups" element={<Navigate to="/startup" replace />} />
                                        <Route path="/startups/:slug" element={<RedirectStartup />} />
                                        <Route path="/research" element={<Navigate to="/riset" replace />} />
                                        <Route path="/research/:slug" element={<RedirectResearch />} />
                                        <Route path="/companies" element={<Navigate to="/mitra" replace />} />
                                        <Route path="/apply" element={<Navigate to="/daftar" replace />} />
                                        <Route path="/apply/thanks" element={<Navigate to="/daftar/terima-kasih" replace />} />
                                        <Route path="/apply/:id" element={<RedirectApply />} />

                                        {/* Backward compat URL Filament panel lama (sudah dihapus) */}
                                        <Route path="/tenant" element={<Navigate to="/dashboard/tenant" replace />} />
                                        <Route path="/tenant/login" element={<Navigate to="/login" replace />} />
                                        <Route path="/mentor" element={<Navigate to="/dashboard/mentor" replace />} />
                                        <Route path="/mentor/login" element={<Navigate to="/login" replace />} />
                                        <Route path="/investor" element={<Navigate to="/dashboard/investor" replace />} />
                                        <Route path="/investor/login" element={<Navigate to="/login" replace />} />
                                        <Route path="/admin-legacy" element={<Navigate to="/admin" replace />} />
                                        <Route path="/admin-legacy/login" element={<Navigate to="/login" replace />} />

                                        <Route path="/login" element={<Login />} />
                                        <Route path="/lupa-password" element={<ForgotPassword />} />
                                        <Route path="/password/reset" element={<ResetPassword />} />

                                        {/* Settings — universal untuk semua role authenticated */}
                                        <Route
                                            path="/settings"
                                            element={
                                                <ProtectedRoute>
                                                    <Settings />
                                                </ProtectedRoute>
                                            }
                                        />
                                    </Route>

                                    <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

                                    <Route element={<ProtectedRoute roles="tenant"><DashboardLayout navItems={tenantNav} brandColor="emerald" label="Tenant" /></ProtectedRoute>}>
                                        <Route path="/dashboard/tenant" element={<TenantDashboard />} />
                                        <Route path="/dashboard/tenant/progress-reports" element={<ProgressReports />} />
                                        <Route path="/dashboard/tenant/milestones" element={<TenantMilestones />} />
                                        <Route path="/dashboard/tenant/research" element={<TenantResearchTopics />} />
                                        <Route path="/dashboard/tenant/sessions" element={<TenantSessions />} />
                                        <Route path="/dashboard/tenant/monev" element={<TenantMonev />} />
                                        <Route path="/dashboard/tenant/needs" element={<TenantNeedsForm />} />
                                        <Route path="/dashboard/tenant/sewa" element={<TenantWorkspaceRentals />} />
                                        <Route path="/dashboard/tenant/pinjam-ruang" element={<TenantRoomBookings />} />
                                        <Route path="/dashboard/tenant/produk" element={<TenantProducts />} />
                                        <Route path="/dashboard/tenant/sertifikat" element={<TenantProgramCertificates />} />
                                        <Route path="/dashboard/tenant/documents" element={<TenantDocuments />} />
                                        <Route path="/dashboard/tenant/alumni" element={<TenantAlumniHub />} />
                                    </Route>

                                    <Route element={<ProtectedRoute roles="mentor"><DashboardLayout navItems={mentorNav} brandColor="sky" label="Mentor" /></ProtectedRoute>}>
                                        <Route path="/dashboard/mentor" element={<MentorDashboard />} />
                                        <Route path="/dashboard/mentor/tenants" element={<MentorTenants />} />
                                        <Route path="/dashboard/mentor/sessions" element={<MentorSessions />} />
                                    </Route>

                                    <Route element={<ProtectedRoute roles="investor"><DashboardLayout navItems={investorNav} brandColor="violet" label="Investor" /></ProtectedRoute>}>
                                        <Route path="/dashboard/investor" element={<InvestorDashboard />} />
                                        <Route path="/dashboard/investor/meetings" element={<InvestorMeetings />} />
                                    </Route>

                                    <Route element={<ProtectedRoute roles={['super-admin', 'stp-admin', 'kepala-upa', 'sekretaris', 'kadiv-techno', 'kadiv-tcd', 'kadiv-kam', 'kadiv-ari']}><AdminLayout /></ProtectedRoute>}>
                                        <Route path="/admin" element={<AdminHome />} />
                                        <Route path="/admin/sectors" element={<Sectors />} />
                                        <Route path="/admin/incubation-phases" element={<IncubationPhases />} />
                                        <Route path="/admin/tenant-stages" element={<TenantStages />} />
                                        <Route path="/admin/batches" element={<Batches />} />
                                        <Route path="/admin/users" element={<Users />} />

                                        <Route path="/admin/tenants" element={<Tenants />} />
                                        <Route path="/admin/applications" element={<Applications />} />
                                        <Route path="/admin/mentors" element={<Mentors />} />
                                        <Route path="/admin/investors" element={<Investors />} />
                                        <Route path="/admin/partner-companies" element={<PartnerCompanies />} />

                                        <Route path="/admin/research-topics" element={<ResearchTopics />} />
                                        <Route path="/admin/milestones" element={<Milestones />} />
                                        <Route path="/admin/progress-reports" element={<AdminProgressReports />} />
                                        <Route path="/admin/monev-assessments" element={<MonevAssessments />} />
                                        <Route path="/admin/tenant-needs" element={<AdminTenantNeeds />} />
                                        <Route path="/admin/graduations" element={<Graduations />} />
                                        <Route path="/admin/certifications" element={<Certifications />} />
                                        <Route path="/admin/partnerships" element={<Partnerships />} />
                                        <Route path="/admin/workspace" element={<WorkspaceManagement />} />
                                        <Route path="/admin/patents" element={<Patents />} />
                                        <Route path="/admin/hki-rekap" element={<HkiRekap />} />
                                        <Route path="/admin/trl-assessments" element={<TrlAssessments />} />
                                        <Route path="/admin/mrl-assessments" element={<MrlAssessments />} />
                                        <Route path="/admin/research-products" element={<ResearchProducts />} />
                                        <Route path="/admin/surveys" element={<Surveys />} />
                                        <Route path="/admin/program-certificates" element={<ProgramCertificates />} />
                                        <Route path="/admin/product-inquiries" element={<ProductInquiries />} />
                                        <Route path="/admin/alumni-insights" element={<AlumniInsights />} />
                                        <Route path="/admin/license-deals" element={<LicenseDeals />} />
                                        <Route path="/admin/royalty-payments" element={<RoyaltyPayments />} />
                                        <Route path="/admin/rd-projects" element={<RdProjects />} />
                                        <Route path="/admin/lab-services" element={<LabServices />} />
                                        <Route path="/admin/mentoring-sessions" element={<MentoringSessions />} />
                                        <Route path="/admin/company-interests" element={<CompanyInterests />} />
                                        <Route path="/admin/match-records" element={<MatchRecords />} />
                                        <Route path="/admin/collaborations" element={<Collaborations />} />
                                        <Route path="/admin/meeting-requests" element={<MeetingRequests />} />
                                        <Route path="/admin/activity-logs" element={<ActivityLogs />} />
                                        <Route path="/admin/api-clients" element={<ApiClients />} />
                                        <Route path="/admin/quests" element={<AdminQuests />} />
                                    </Route>

                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </Suspense>
                        </AuthProvider>
                    </ToastProvider>
                </QueryClientProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

function RedirectStartup() {
    const slug = window.location.pathname.split('/').pop();
    return <Navigate to={`/startup/${slug}`} replace />;
}

function RedirectResearch() {
    const slug = window.location.pathname.split('/').pop();
    return <Navigate to={`/riset/${slug}`} replace />;
}

function RedirectApply() {
    const id = window.location.pathname.split('/').pop();
    return <Navigate to={`/daftar?batch=${id}`} replace />;
}

function RedirectDaftarLegacy() {
    // /daftar/:id (legacy ApplyForm route) → /daftar?batch=:id
    const id = window.location.pathname.split('/').pop();
    return <Navigate to={`/daftar?batch=${id}`} replace />;
}

function ComingSoon({ title }) {
    return (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-8 text-center">
            <Construction className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-slate-600 mt-1">Halaman ini sedang dikembangkan.</p>
        </div>
    );
}

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <HelpCircle className="h-12 w-12 text-slate-300 mx-auto" />
                <h1 className="text-2xl font-bold mt-4">Halaman tidak ditemukan</h1>
                <a href="/" className="inline-block mt-4 text-primary-700 hover:underline">← Ke Beranda</a>
            </div>
        </div>
    );
}

createRoot(document.getElementById('app')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
