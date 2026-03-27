
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ImpersonationProvider } from './context/ImpersonationContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import PageLoadingFallback from './components/ui/PageLoadingFallback';
import MainLayout from './layouts/MainLayout';

// Auth Features (eager load - needed immediately)
import Login from './features/auth/Login';

// Lazy-loaded Feature Modules (code splitting)
const Dashboard = React.lazy(() => import('./features/dashboard/Dashboard'));
const PersonalDashboard = React.lazy(() => import('./features/dashboard/PersonalDashboard'));

// Contractor-aware home: redirect contractors to CDE
const ContractorAwareHome: React.FC = () => {
    const { userType } = useAuth();
    if (userType === 'contractor') return <Navigate to="/cde" replace />;
    return <React.Suspense fallback={<PageLoadingFallback />}><Dashboard /></React.Suspense>;
};
const ProjectList = React.lazy(() => import('./features/projects/ProjectList'));
const ProjectDetail = React.lazy(() => import('./features/projects/ProjectDetail'));

const PackageDetail = React.lazy(() => import('./features/projects/PackageDetail'));
const ContractDetail = React.lazy(() => import('./features/contracts/ContractDetail'));
const BiddingContractPage = React.lazy(() => import('./features/bidding/BiddingContractPage'));
const ContractorList = React.lazy(() => import('./features/contractors/ContractorList'));
const ContractorDetail = React.lazy(() => import('./features/contractors/ContractorDetail'));
const EmployeeList = React.lazy(() => import('./features/employees/EmployeeList'));
const EmployeeDetail = React.lazy(() => import('./features/employees/EmployeeDetail'));
const TaskList = React.lazy(() => import('./features/tasks/TaskList'));
const TaskDetail = React.lazy(() => import('./features/tasks/TaskDetail'));
// PaymentList now loaded inside BiddingContractPage
// DocumentManager removed — integrated into CDE as 'Kho lưu trữ' tab
const CDEPage = React.lazy(() => import('./features/cde/CDEPage'));
const BimPage = React.lazy(() => import('./features/bim/BimPage'));
const ReportCenter = React.lazy(() => import('./features/reports/ReportCenter'));
const MidTermCapitalPage = React.lazy(() => import('./features/capital/MidTermCapitalPage'));
const Regulations = React.lazy(() => import('./features/regulations/Regulations'));
const LegalDocumentSearch = React.lazy(() => import('./features/legal-documents/LegalDocumentSearch'));
const Settings = React.lazy(() => import('./features/settings/Settings'));
const AuditLogViewer = React.lazy(() => import('./features/admin/AuditLogViewer'));
const AdminUserManagement = React.lazy(() => import('./features/admin/AdminUserManagement'));
const WorkflowMasterPage = React.lazy(() => import('./features/workflows/WorkflowMasterPage'));
import ProtectedRoute from './components/ProtectedRoute';


import { ToastProvider } from './components/ui/Toast';

import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';

const mutationCache = new MutationCache({
    onError: (error) => {
        console.error('[Global Mutation Error]', error);
    },
});

const queryClient = new QueryClient({
    mutationCache,
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                        <ImpersonationProvider>
                        <ToastProvider>
                            <Router>
                                <Routes>
                                    <Route path="/login" element={<Login />} />

                                    {/* Protected Routes inside MainLayout */}
                                    <Route path="/" element={<MainLayout />}>
                                        <Route index element={<ContractorAwareHome />} />
                                        <Route path="my-dashboard" element={<React.Suspense fallback={<PageLoadingFallback />}><PersonalDashboard /></React.Suspense>} />

                                        {/* Projects Routes */}
                                        <Route path="projects" element={<React.Suspense fallback={<PageLoadingFallback />}><ProjectList /></React.Suspense>} />
                                        <Route path="projects/:id" element={<React.Suspense fallback={<PageLoadingFallback />}><ProjectDetail /></React.Suspense>} />
                                        <Route path="projects/:projectId/packages/:packageId" element={<React.Suspense fallback={<PageLoadingFallback />}><PackageDetail /></React.Suspense>} />

                                        {/* Tasks Routes */}
                                        <Route path="tasks" element={<React.Suspense fallback={<PageLoadingFallback />}><TaskList /></React.Suspense>} />
                                        <Route path="tasks/:id" element={<React.Suspense fallback={<PageLoadingFallback />}><TaskDetail /></React.Suspense>} />

                                        {/* HR Routes */}
                                        <Route path="employees" element={<React.Suspense fallback={<PageLoadingFallback />}><EmployeeList /></React.Suspense>} />
                                        <Route path="employees/:id" element={<React.Suspense fallback={<PageLoadingFallback />}><EmployeeDetail /></React.Suspense>} />
                                        <Route path="org-chart" element={<Navigate to="/employees" replace />} />

                                        {/* Contractor Routes */}
                                        <Route path="contractors" element={<React.Suspense fallback={<PageLoadingFallback />}><ContractorList /></React.Suspense>} />
                                        <Route path="contractors/:id" element={<React.Suspense fallback={<PageLoadingFallback />}><ContractorDetail /></React.Suspense>} />

                                        {/* Bidding & Contract Module (merged) */}
                                        <Route path="bidding" element={<React.Suspense fallback={<PageLoadingFallback />}><BiddingContractPage /></React.Suspense>} />
                                        <Route path="contracts/:id" element={<React.Suspense fallback={<PageLoadingFallback />}><ContractDetail /></React.Suspense>} />
                                        {/* Backward-compatible redirects */}
                                        <Route path="contracts" element={<Navigate to="/bidding?tab=contracts" replace />} />
                                        <Route path="payments" element={<Navigate to="/bidding?tab=payments" replace />} />
                                        <Route path="capital-planning" element={<React.Suspense fallback={<PageLoadingFallback />}><MidTermCapitalPage /></React.Suspense>} />

                                        {/* Documents & Reports */}
                                        <Route path="documents" element={<Navigate to="/cde" replace />} />
                                        <Route path="cde" element={<React.Suspense fallback={<PageLoadingFallback />}><CDEPage /></React.Suspense>} />
                                        <Route path="bim" element={<React.Suspense fallback={<PageLoadingFallback />}><BimPage /></React.Suspense>} />
                                        <Route path="bim/:projectId" element={<React.Suspense fallback={<PageLoadingFallback />}><BimPage /></React.Suspense>} />
                                        <Route path="legal-documents" element={<React.Suspense fallback={<PageLoadingFallback />}><LegalDocumentSearch /></React.Suspense>} />
                                        <Route path="reports" element={<React.Suspense fallback={<PageLoadingFallback />}><ReportCenter /></React.Suspense>} />
                                        <Route path="regulations" element={<React.Suspense fallback={<PageLoadingFallback />}><Regulations /></React.Suspense>} />

                                        {/* Admin */}
                                        <Route path="audit-log" element={<React.Suspense fallback={<PageLoadingFallback />}><AuditLogViewer /></React.Suspense>} />
                                        <Route path="admin" element={
                                            <ProtectedRoute resource="admin_accounts">
                                                <React.Suspense fallback={<PageLoadingFallback />}>
                                                    <AdminUserManagement />
                                                </React.Suspense>
                                            </ProtectedRoute>
                                        } />
                                        {/* Workflow Master */}
                                        <Route path="workflow-master" element={<React.Suspense fallback={<PageLoadingFallback />}><WorkflowMasterPage /></React.Suspense>} />
                                        {/* Backward-compatible redirects */}
                                        <Route path="user-accounts" element={<Navigate to="/admin?tab=accounts" replace />} />
                                        <Route path="permissions" element={<Navigate to="/admin?tab=permissions" replace />} />

                                        {/* Settings */}
                                        <Route path="settings" element={<React.Suspense fallback={<PageLoadingFallback />}><Settings /></React.Suspense>} />

                                        {/* Fallback */}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Route>
                                </Routes>
                            </Router>
                        </ToastProvider>
                        </ImpersonationProvider>
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default App;
