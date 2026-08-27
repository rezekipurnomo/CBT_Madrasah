import React, { useState } from 'react';
import { CBTProvider, useCBT } from './context/CBTContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveMonitoring } from './components/LiveMonitoring';
import { QuestionBankManager } from './components/QuestionBankManager';
import { ExamManager } from './components/ExamManager';
import { MasterDataManager } from './components/MasterDataManager';
import { GradingAndAnalysis } from './components/GradingAndAnalysis';
import { PrintCenter } from './components/PrintCenter';
import { ServerLanSettings } from './components/ServerLanSettings';
import { StudentDashboard } from './components/StudentDashboard';
import { ExamRunner } from './components/ExamRunner';
import { LoginPage } from './components/LoginPage';

const CBTAppContent: React.FC = () => {
  const { currentUser } = useCBT();

  // Persistent Current View
  const [currentView, setCurrentView] = useState<NavView>(() => {
    const saved = localStorage.getItem('CBT_MADRASAH_CURRENT_VIEW');
    const validViews: NavView[] = [
      'dashboard',
      'monitoring',
      'question_bank',
      'exams',
      'master_data',
      'grading',
      'print_center',
      'server_settings'
    ];
    return (validViews.includes(saved as NavView) ? (saved as NavView) : 'dashboard');
  });

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Active Exam state for Student Runner (persisted across refresh)
  const [activeRunningExamId, setActiveRunningExamId] = useState<string | null>(() => {
    return localStorage.getItem('CBT_MADRASAH_RUNNING_EXAM_ID') || null;
  });
  const [activeRunningToken, setActiveRunningToken] = useState<string>(() => {
    return localStorage.getItem('CBT_MADRASAH_RUNNING_EXAM_TOKEN') || '';
  });

  // Sync view to localStorage
  React.useEffect(() => {
    if (currentView) {
      localStorage.setItem('CBT_MADRASAH_CURRENT_VIEW', currentView);
    }
  }, [currentView]);

  // Sync active exam running state to localStorage
  React.useEffect(() => {
    if (activeRunningExamId) {
      localStorage.setItem('CBT_MADRASAH_RUNNING_EXAM_ID', activeRunningExamId);
      localStorage.setItem('CBT_MADRASAH_RUNNING_EXAM_TOKEN', activeRunningToken);
    } else {
      localStorage.removeItem('CBT_MADRASAH_RUNNING_EXAM_ID');
      localStorage.removeItem('CBT_MADRASAH_RUNNING_EXAM_TOKEN');
    }
  }, [activeRunningExamId, activeRunningToken]);

  const handleStartExam = (examId: string, token: string) => {
    setActiveRunningExamId(examId);
    setActiveRunningToken(token);
  };

  const handleFinishOrExitExam = () => {
    setActiveRunningExamId(null);
    setActiveRunningToken('');
    localStorage.removeItem('CBT_MADRASAH_RUNNING_EXAM_ID');
    localStorage.removeItem('CBT_MADRASAH_RUNNING_EXAM_TOKEN');
    setCurrentView('dashboard');
  };

  // If no user is logged in, display the dedicated Login Page with role options & registered accounts
  if (!currentUser) {
    return <LoginPage onLoginSuccess={() => setCurrentView('dashboard')} />;
  }

  // If a student is currently taking an exam, show the full-screen ExamRunner
  if (activeRunningExamId) {
    return (
      <ExamRunner
        examId={activeRunningExamId}
        token={activeRunningToken}
        onExit={handleFinishOrExitExam}
      />
    );
  }

  const isStudentRole = currentUser?.role === 'siswa';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#D1D1D1] flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for Admin, Super Admin, and Guru */}
        {!isStudentRole && (
          <Sidebar
            currentView={currentView}
            onSelectView={view => {
              setCurrentView(view);
              setSidebarOpen(false);
            }}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {isStudentRole ? (
            <StudentDashboard onStartExam={handleStartExam} />
          ) : (
            <>
              {currentView === 'dashboard' && (
                <Dashboard
                  onNavigate={setCurrentView}
                  onStartExamAsStudent={handleStartExam}
                />
              )}
              {currentView === 'monitoring' && <LiveMonitoring />}
              {currentView === 'question_bank' && <QuestionBankManager />}
              {currentView === 'exams' && <ExamManager />}
              {currentView === 'master_data' && <MasterDataManager />}
              {currentView === 'grading' && <GradingAndAnalysis />}
              {currentView === 'print_center' && <PrintCenter />}
              {currentView === 'server_settings' && <ServerLanSettings />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <CBTProvider>
      <CBTAppContent />
    </CBTProvider>
  );
}
