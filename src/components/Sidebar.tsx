import React from 'react';
import { useCBT } from '../context/CBTContext';
import { ExamSession } from '../types';
import {
  LayoutDashboard,
  Database,
  BookOpen,
  CalendarCheck,
  Activity,
  Award,
  FileSpreadsheet,
  Server,
  DownloadCloud,
  ShieldCheck
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'monitoring'
  | 'question_bank'
  | 'exams'
  | 'master_data'
  | 'grading'
  | 'print_center'
  | 'server_settings';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose
}) => {
  const { currentUser, exams, examSessions, questionBanks } = useCBT();

  if (!currentUser) return null;

  const role = currentUser.role;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  const isGuru = role === 'guru' || isAdmin;
  const isSiswa = role === 'siswa';

  const activeExamsCount = exams.filter(e => e.status === 'aktif').length;
  const liveParticipantsCount = (Object.values(examSessions) as ExamSession[]).filter(
    s => s.status === 'sedang_mengerjakan'
  ).length;

  const menuItems = [
    // 1. Dashboard
    {
      id: 'dashboard' as NavView,
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin', 'guru', 'siswa'],
      badge: isSiswa ? `${activeExamsCount} Ujian` : undefined
    },
    // 2. Monitoring Realtime (Proktor / Guru / Admin)
    {
      id: 'monitoring' as NavView,
      label: 'Monitoring Live',
      icon: Activity,
      roles: ['super_admin', 'admin', 'guru'],
      badge: liveParticipantsCount > 0 ? `${liveParticipantsCount} Aktif` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
    },
    // 3. Bank Soal (Guru / Admin / Super Admin)
    {
      id: 'question_bank' as NavView,
      label: 'Bank Soal (6 Tipe)',
      icon: BookOpen,
      roles: ['super_admin', 'admin', 'guru'],
      badge: `${questionBanks.length}`
    },
    // 4. Jadwal & Konfigurasi Ujian (Guru / Admin / Super Admin)
    {
      id: 'exams' as NavView,
      label: 'Jadwal & Token Ujian',
      icon: CalendarCheck,
      roles: ['super_admin', 'admin', 'guru'],
      badge: activeExamsCount > 0 ? `${activeExamsCount} Aktif` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
    },
    // 5. Data Master (Admin / Super Admin)
    {
      id: 'master_data' as NavView,
      label: 'Data Master Madrasah',
      icon: Database,
      roles: ['super_admin', 'admin']
    },
    // 6. Penilaian & Analisis Butir Soal (Guru / Admin)
    {
      id: 'grading' as NavView,
      label: 'Penilaian & Analisis',
      icon: Award,
      roles: ['super_admin', 'admin', 'guru']
    },
    // 7. Laporan & Cetak Kartu / Berita Acara (Admin / Guru)
    {
      id: 'print_center' as NavView,
      label: 'Cetak Dokumen & Rekap',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'admin', 'guru']
    },
    // 8. Server LAN & Backup Database (Super Admin & Admin)
    {
      id: 'server_settings' as NavView,
      label: 'Server LAN & Backup',
      icon: Server,
      roles: ['super_admin', 'admin']
    }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#0F0F11] text-[#D1D1D1] border-r border-[#222224] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#52525B] border-b border-[#222224] flex items-center justify-between">
            <span>Navigasi Sistem</span>
            <span className="text-[10px] bg-[#161618] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              LAN CBT
            </span>
          </div>

          <nav className="mt-3 space-y-1 flex-1">
            {filteredMenu.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-[#1C1C1F] border border-emerald-500/40 text-white font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'text-[#A1A1AA] hover:bg-[#161618] hover:text-[#E5E5E7] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-emerald-400' : 'text-[#71717A]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded text-white shrink-0 ${
                        item.badgeColor || 'bg-[#252529] text-[#A1A1AA] border border-[#2D2D31]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Offline / LAN Status Box */}
          <div className="mt-auto p-3.5 rounded-xl bg-[#161618] border border-[#222224] text-xs">
            <div className="flex items-center justify-between text-[#D1D1D1] mb-1.5">
              <span className="font-semibold text-[11px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
                Server LAN Aktif
              </span>
              <span className="text-[10px] text-[#71717A] font-mono">100% Offline</span>
            </div>
            <p className="text-[10px] text-[#71717A] leading-relaxed">
              Arsitektur terisolasi lokal. Aman dari kendala koneksi internet.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
