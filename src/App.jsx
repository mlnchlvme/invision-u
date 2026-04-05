import { useState } from 'react';
import './styles/global.css';
import './styles/components/Layout.css';
import './i18n';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/shared/Toast';
import { ErrorBoundary, NoApplicationScreen } from './components/shared/ErrorBoundary';

import Landing  from './pages/Landing';
import AuthPage from './pages/Auth';
import Header   from './components/layout/Header';
import Sidebar  from './components/layout/Sidebar';

import CommDashboard  from './components/commission/CommDashboard';
import CommCandidates from './components/commission/CommCandidates';
import CommAIChat     from './components/commission/CommAIChat';
import CommSettings   from './components/commission/CommSettings';
import CommAnalytics  from './components/commission/CommAnalytics';

import CandidateStatus     from './components/candidate/CandidateStatus';
import CandidateQuestions  from './components/candidate/CandidateQuestions';
import CandidateInterview  from './components/candidate/CandidateInterview';
import CandidateVideo      from './components/candidate/CandidateVideo';
import CandidateProcessing from './components/candidate/CandidateProcessing';

import { COMM_NAV, CAND_NAV } from './data/mockData';
import { IconConstruction } from './components/icons';

function UnderConstruction() {
  return (
    <div className="processing fade-in">
      <IconConstruction size={40} style={{ opacity: 0.2 }} />
      <p className="text-muted" style={{ fontWeight: 600 }}>Страница в разработке</p>
    </div>
  );
}

function renderPage(role, page) {
  if (role === 'reviewer') {
    if (page === 'dashboard')  return <CommDashboard />;
    if (page === 'candidates') return <CommCandidates />;
    if (page === 'ai-chat')    return <CommAIChat />;
    if (page === 'settings')   return <CommSettings />;
    if (page === 'analytics')  return <CommAnalytics />;
    return <UnderConstruction />;
  }
  if (page === 'status')     return <CandidateStatus />;
  if (page === 'questions')  return <CandidateQuestions />;
  if (page === 'interview')  return <CandidateInterview />;
  if (page === 'video')      return <CandidateVideo />;
  if (page === 'processing') return <CandidateProcessing />;
  return <UnderConstruction />;
}

function Portal() {
  const { user, createApplicationIfMissing } = useAuth();
  const isComm = user?.role === 'reviewer';
  const nav    = isComm ? COMM_NAV : CAND_NAV;
  const defaultPage = isComm ? 'dashboard' : 'status';
  const [page, setPage]     = useState(defaultPage);
  const [creating, setCreating] = useState(false);

  const role = isComm ? 'reviewer' : 'candidate';

  const noApp = !isComm && !user?.appId;

  const handleCreateApp = async () => {
    setCreating(true);
    await createApplicationIfMissing();
    setCreating(false);
  };

  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar role={role} nav={nav} page={page} setPage={setPage} />
        <main className="layout__main">
          <ErrorBoundary>
            <div key={page} className="page-enter">
              {noApp
                ? <NoApplicationScreen onCreate={handleCreateApp} creating={creating} />
                : renderPage(role, page)
              }
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('landing');

  if (loading) {
    return (
      <div className="processing">
        <div className="spinner" />
      </div>
    );
  }

  if (user) return <Portal />;

  if (screen === 'landing') {
    return (
      <Landing
        onSignIn={() => setScreen('auth-login')}
        onSignUp={() => setScreen('auth-register')}
      />
    );
  }

  return (
    <AuthPage
      initialTab={screen === 'auth-register' ? 'register' : 'login'}
      onDone={() => {}}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}