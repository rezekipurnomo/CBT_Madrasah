import React, { useState } from 'react';
import { useCBT } from '../context/CBTContext';
import { UserRole } from '../types';
import {
  School,
  Clock,
  Wifi,
  Server,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    currentUser,
    madrasah,
    serverTime,
    switchDemoRole,
    logout,
    systemHealth
  } = useCBT();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const formattedTime = serverTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = serverTime.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-950/50 text-rose-400 border border-rose-800/40">Super Admin</span>;
      case 'admin':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-950/50 text-blue-400 border border-blue-800/40">Operator</span>;
      case 'guru':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-950/50 text-amber-400 border border-amber-800/40">Guru Mapel</span>;
      case 'siswa':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">Peserta</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0F0F11] text-[#E5E5E7] border-b border-[#222224] shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Logo */}
          <div className="flex items-center space-x-3">
            {currentUser && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-[#71717A] hover:text-[#E5E5E7] hover:bg-[#1C1C1F] border border-transparent hover:border-[#2D2D31] focus:outline-none lg:hidden"
                aria-label="Toggle Sidebar"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
            
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#161618] border border-[#2D2D31] flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <School className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-[#E5E5E7] leading-tight">
                    CBT MADRASAH
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.7)]"></div>
                </div>
                <p className="text-xs text-[#71717A] truncate max-w-[240px] md:max-w-xs">
                  {madrasah.namaMadrasah}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Server Info & Time */}
          <div className="hidden md:flex items-center space-x-3 bg-[#161618] px-3.5 py-1.5 rounded-xl border border-[#222224] shadow-sm text-xs">
            <div className="flex items-center space-x-1.5 text-[#A1A1AA]">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-medium text-[#D1D1D1]">{madrasah.serverIp}:{madrasah.serverPort}</span>
            </div>
            <div className="h-3 w-px bg-[#2D2D31]" />
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="font-medium text-[11px] text-[#A1A1AA]">LAN Lokal</span>
            </div>
            <div className="h-3 w-px bg-[#2D2D31]" />
            <div className="flex items-center space-x-1.5 text-amber-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-[#E5E5E7]">{formattedTime}</span>
              <span className="text-[10px] text-[#71717A]">WIB</span>
            </div>
          </div>

          {/* Right: Quick Role Switcher (for testing/demo) & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-1.5 bg-[#1C1C1F] hover:bg-[#252529] text-xs px-2.5 py-1.5 rounded-lg border border-[#2D2D31] text-[#D1D1D1] transition-colors shadow-sm"
                title="Ganti Peran Pengguna (Simulasi)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[#71717A] font-medium">Peran:</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wider">{currentUser?.role || 'LOGIN'}</span>
                <ChevronDown className="w-3 h-3 text-[#71717A]" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#161618] rounded-xl shadow-2xl border border-[#2D2D31] py-2 z-50 text-[#D1D1D1] animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-[#222224] text-[10px] font-bold text-[#52525B] uppercase tracking-[0.15em]">
                    Simulasi Akses Peran CBT
                  </div>
                  <button
                    onClick={() => { switchDemoRole('super_admin'); setRoleDropdownOpen(false); }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-[#1C1C1F] flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-semibold text-[#E5E5E7]">Super Administrator</div>
                        <div className="text-[10px] text-[#71717A]">Akses penuh sistem & server</div>
                      </div>
                    </div>
                    {currentUser?.role === 'super_admin' && <span className="text-xs text-emerald-400 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => { switchDemoRole('admin'); setRoleDropdownOpen(false); }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-[#1C1C1F] flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-semibold text-[#E5E5E7]">Operator Madrasah</div>
                        <div className="text-[10px] text-[#71717A]">Data master, jadwal, laporan</div>
                      </div>
                    </div>
                    {currentUser?.role === 'admin' && <span className="text-xs text-emerald-400 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => { switchDemoRole('guru'); setRoleDropdownOpen(false); }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-[#1C1C1F] flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold text-[#E5E5E7]">Guru Mapel</div>
                        <div className="text-[10px] text-[#71717A]">Bank soal, nilai & analisis</div>
                      </div>
                    </div>
                    {currentUser?.role === 'guru' && <span className="text-xs text-emerald-400 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => { switchDemoRole('siswa'); setRoleDropdownOpen(false); }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-[#1C1C1F] flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-[#E5E5E7]">Peserta</div>
                        <div className="text-[10px] text-[#71717A]">Mengerjakan ujian CBT</div>
                      </div>
                    </div>
                    {currentUser?.role === 'siswa' && <span className="text-xs text-emerald-400 font-bold">✓</span>}
                  </button>

                  <div className="pt-1 mt-1 border-t border-[#222224]">
                    <button
                      onClick={() => { logout(); setRoleDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-emerald-400 hover:bg-[#1C1C1F] flex items-center space-x-2 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Buka Halaman Login Lengkap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-[#1C1C1F] border border-transparent hover:border-[#2D2D31] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1C1C1F] text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold leading-tight truncate max-w-[130px] text-[#E5E5E7]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-[#71717A] capitalize">
                      {currentUser.role.replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#71717A] hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#161618] rounded-xl shadow-2xl border border-[#2D2D31] py-2 z-50 text-[#D1D1D1] animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-[#222224]">
                      <div className="font-bold text-sm text-white truncate">{currentUser.name}</div>
                      <div className="text-xs text-[#71717A]">@{currentUser.username}</div>
                      <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                    </div>
                    <div className="px-4 py-2 text-[11px] text-[#71717A] border-b border-[#222224] space-y-1">
                      <div>IP Akses: <span className="font-mono font-semibold text-[#D1D1D1]">{systemHealth.serverIp}</span></div>
                      <div>Status Server: <span className="font-semibold text-emerald-400">Online (LAN)</span></div>
                    </div>
                    <button
                      onClick={() => { logout(); setProfileDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-xs text-rose-400 hover:bg-rose-950/30 font-semibold flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
