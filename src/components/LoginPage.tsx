import React, { useState } from 'react';
import { useCBT } from '../context/CBTContext';
import { UserRole } from '../types';
import { MobileWifiGuideModal } from './MobileWifiGuideModal';
import {
  ShieldCheck,
  Server,
  BookOpen,
  GraduationCap,
  Lock,
  User as UserIcon,
  AlertCircle,
  Clock,
  Wifi,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  School,
  LogIn,
  Smartphone,
  QrCode
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const {
    madrasah,
    sessionConfigs,
    login,
    systemHealth
  } = useCBT();

  // Form State
  const [selectedRole, setSelectedRole] = useState<UserRole>('siswa');
  const [identifier, setIdentifier] = useState<string>('siswa01');
  const [password, setPassword] = useState<string>('123456');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showMobileGuide, setShowMobileGuide] = useState<boolean>(false);

  // Handle Form Submit
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password, selectedRole);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (onLoginSuccess) onLoginSuccess();
      }
    }, 250);
  };

  // Quick Select from Form preset roles
  const handleSelectRoleOption = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    // Auto-fill sensible default demo account based on chosen role
    if (role === 'siswa') {
      setIdentifier('siswa01');
      setPassword('123456');
    } else if (role === 'guru') {
      setIdentifier('guru.fauzi');
      setPassword('123456');
    } else if (role === 'admin') {
      setIdentifier('operator');
      setPassword('123456');
    } else if (role === 'super_admin') {
      setIdentifier('admin');
      setPassword('123456');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#D1D1D1] flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Status Bar */}
      <div className="bg-[#121214] border-b border-[#222224] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">Server CBT Madrasah:</span>
            <span className="font-mono text-emerald-400 font-bold">{madrasah.serverIp}:{madrasah.serverPort || '8393'}</span>
            <span className="hidden sm:inline-block text-[#52525B]">•</span>
            <span className="hidden sm:inline-block text-[#71717A]">Jaringan LAN / Wi-Fi Lokal</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-[#A1A1AA]">
            <button
              type="button"
              onClick={() => setShowMobileGuide(true)}
              className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 bg-[#1C1C1F] border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Akses HP (Wi-Fi)</span>
            </button>

            <div className="flex items-center space-x-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span><strong className="text-white">{systemHealth.serverTime} {madrasah.timezone}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl w-full">
          {/* Madrasah Branding & Identity */}
          <div className="text-center mb-6 space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-b from-[#1C1C1F] to-[#121214] border border-[#2D2D31] rounded-2xl shadow-xl mb-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <School className="w-7 h-7" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {madrasah.namaMadrasah}
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto">
              Sistem Ujian Berbasis Komputer & Jaringan Lokal Madrasah (CBT Pro) • NSM: <span className="font-mono font-semibold text-white">{madrasah.nsm}</span> | NPSN: <span className="font-mono font-semibold text-white">{madrasah.npsn}</span>
            </p>
          </div>

          {/* FORM LOGIN KREDENSIAL */}
          <div className="bg-[#161618] border border-[#262629] rounded-3xl shadow-2xl overflow-hidden">
            {/* Role Option Bar */}
            <div className="p-4 sm:p-6 bg-[#121214] border-b border-[#222224]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Langkah 1: Pilih Opsi Peran Login</span>
                </span>
                <span className="text-[11px] text-[#71717A]">
                  Pilih akses sesuai tugas Anda
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Super Admin */}
                <button
                  type="button"
                  onClick={() => handleSelectRoleOption('super_admin')}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    selectedRole === 'super_admin'
                      ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/40 text-white'
                      : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${selectedRole === 'super_admin' ? 'bg-rose-500/20 text-rose-400' : 'bg-[#222225] text-[#71717A]'}`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    {selectedRole === 'super_admin' && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs">Super Admin</div>
                  <div className="text-[10px] text-[#71717A] mt-0.5">Proktor Utama Server</div>
                </button>

                {/* Operator / Admin */}
                <button
                  type="button"
                  onClick={() => handleSelectRoleOption('admin')}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    selectedRole === 'admin'
                      ? 'bg-blue-950/30 border-blue-500/60 ring-1 ring-blue-500/40 text-white'
                      : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${selectedRole === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#222225] text-[#71717A]'}`}>
                      <Server className="w-4 h-4" />
                    </div>
                    {selectedRole === 'admin' && (
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs">Operator CBT</div>
                  <div className="text-[10px] text-[#71717A] mt-0.5">Data & Jadwal Ujian</div>
                </button>

                {/* Guru Mapel */}
                <button
                  type="button"
                  onClick={() => handleSelectRoleOption('guru')}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    selectedRole === 'guru'
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40 text-white'
                      : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${selectedRole === 'guru' ? 'bg-amber-500/20 text-amber-400' : 'bg-[#222225] text-[#71717A]'}`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    {selectedRole === 'guru' && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs">Guru Mapel</div>
                  <div className="text-[10px] text-[#71717A] mt-0.5">Bank Soal & Penilaian</div>
                </button>

                {/* Peserta (Siswa) */}
                <button
                  type="button"
                  onClick={() => handleSelectRoleOption('siswa')}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    selectedRole === 'siswa'
                      ? 'bg-emerald-950/40 border-emerald-500/70 ring-1 ring-emerald-500/50 text-white'
                      : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${selectedRole === 'siswa' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#222225] text-[#71717A]'}`}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    {selectedRole === 'siswa' && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs">Peserta</div>
                  <div className="text-[10px] text-[#71717A] mt-0.5">Peserta Ujian CBT</div>
                </button>
              </div>
            </div>

            {/* Login Form Body */}
            <form onSubmit={handleFormLogin} className="p-6 sm:p-8 space-y-5">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Langkah 2: Masukkan Kredensial Akun
                </span>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-start space-x-3 text-xs text-rose-300 animate-in fade-in duration-100">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Gagal Masuk:</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Username / Identifier Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    {selectedRole === 'siswa' ? 'Username / NISN / Nomor Peserta' :
                     selectedRole === 'guru' ? 'Username / NIP / NUPTK / Email' :
                     'Username Administrator / Email'}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'siswa' ? 'Contoh: siswa01 atau 0098765431 atau 02-001-023-9' :
                        selectedRole === 'guru' ? 'Contoh: guru.fauzi atau 198205142008011012' :
                        'Contoh: admin atau operator'
                      }
                      className="w-full pl-10 pr-4 py-3 bg-[#121214] border border-[#2D2D31] rounded-xl text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    {selectedRole === 'siswa' ? 'Password / PIN Peserta' : 'Password Akun'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan password akun..."
                      className="w-full pl-10 pr-10 py-3 bg-[#121214] border border-[#2D2D31] rounded-xl text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white p-2 min-w-[40px] flex items-center justify-center"
                      aria-label="Toggle Password Visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-[#71717A]">
                    <span>Password bawaan akun demo: <code className="text-emerald-400 font-mono">123456</code></span>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-[#A1A1AA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#2D2D31] text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Ingat sesi di perangkat ini</span>
                  </label>

                  {selectedRole === 'siswa' && (
                    <span className="text-[11px] text-amber-400/90 font-medium">
                      Pastikan berada di ruang & sesi ujian Anda
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 min-h-[48px]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>
                      Masuk Sebagai {selectedRole === 'super_admin' ? 'Super Admin' :
                                     selectedRole === 'admin' ? 'Operator CBT' :
                                     selectedRole === 'guru' ? 'Guru Mapel' : 'Peserta Ujian'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Session Overview & Mobile Wifi Guidance Card */}
          <div className="mt-6 p-4 bg-[#121214] border border-[#222224] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#71717A]">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Jadwal Sesi Ujian Hari Ini (Maks. 4 Sesi):</span>
                <span className="block sm:inline sm:ml-2 text-[#A1A1AA]">
                  {(sessionConfigs || []).map(s => `Sesi ${s.nomorSesi} (${s.jamMulai}-${s.jamSelesai})`).join(' • ') || 'Sesi 1-4 Terjadwal'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileGuide(true)}
              className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold shrink-0"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Panduan HP & Scan QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-4 text-[11px] text-[#52525B] border-t border-[#1C1C1F]">
        © {new Date().getFullYear()} {madrasah.namaMadrasah}. Hak Cipta Dilindungi. Sistem Ujian Berbasis Komputer & Jaringan Madrasah.
      </div>

      {/* Mobile Wi-Fi Modal */}
      <MobileWifiGuideModal
        isOpen={showMobileGuide}
        onClose={() => setShowMobileGuide(false)}
      />
    </div>
  );
};
