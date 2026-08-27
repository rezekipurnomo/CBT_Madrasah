import React from 'react';
import { useCBT } from '../context/CBTContext';
import { NavView } from '../components/Sidebar';
import { ExamSession } from '../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Activity,
  Server,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: NavView) => void;
  onStartExamAsStudent?: (examId: string, token: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onStartExamAsStudent }) => {
  const {
    madrasah,
    students,
    teachers,
    questionBanks,
    exams,
    examSessions,
    examResults,
    currentUser
  } = useCBT();

  const activeSessions = (Object.values(examSessions) as ExamSession[]).filter(s => s.status === 'sedang_mengerjakan');
  const activeExams = exams.filter(e => e.status === 'aktif');
  const totalSubmissions = examResults.length;

  return (
    <div className="space-y-6">
      {/* Madrasah Hero Banner */}
      <div className="bg-[#0F0F11] border border-[#222224] rounded-2xl p-6 sm:p-8 text-[#E5E5E7] shadow-xl shadow-black/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#161618] rounded-full text-xs font-mono text-emerald-400 border border-[#2D2D31]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
              <span>SERVER CBT MADRASAH • LAN {madrasah.serverIp}:8393</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {madrasah.namaMadrasah}
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-2xl leading-relaxed">
              Sistem Computer Based Test (CBT) Asesmen Madrasah modern, aman, responsif, dan siap pakai untuk jenjang MI, MTs, dan MA dalam jaringan LAN/WiFi lokal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('monitoring')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95"
            >
              <Activity className="w-4 h-4 text-white animate-pulse" />
              <span>Monitoring Live Siswa</span>
            </button>
            <button
              onClick={() => onNavigate('print_center')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#1C1C1F] hover:bg-[#252529] text-[#D1D1D1] border border-[#2D2D31] text-xs font-bold rounded-xl transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Cetak Kartu & Dokumen</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div
          onClick={() => onNavigate('master_data')}
          className="bg-[#161618] p-5 rounded-2xl border border-[#222224] hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-[0.15em]">Total Siswa</span>
            <div className="p-2 bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31] rounded-xl group-hover:border-emerald-500/50 transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">
            {students.length}
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1">
            Terdaftar di rombel kelas
          </div>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => onNavigate('question_bank')}
          className="bg-[#161618] p-5 rounded-2xl border border-[#222224] hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-[0.15em]">Bank Soal</span>
            <div className="p-2 bg-[#1C1C1F] text-blue-400 border border-[#2D2D31] rounded-xl group-hover:border-blue-500/50 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">
            {questionBanks.length}
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1">
            Mapel PAI & Umum
          </div>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => onNavigate('exams')}
          className="bg-[#161618] p-5 rounded-2xl border border-[#222224] hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-[0.15em]">Jadwal Ujian</span>
            <div className="p-2 bg-[#1C1C1F] text-amber-400 border border-[#2D2D31] rounded-xl group-hover:border-amber-500/50 transition-colors">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">
            {exams.length}
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1">
            {activeExams.length} ujian sedang aktif
          </div>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => onNavigate('monitoring')}
          className="bg-[#161618] p-5 rounded-2xl border border-[#222224] hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-[0.15em]">Sesi Aktif</span>
            <div className="p-2 bg-[#1C1C1F] text-rose-400 border border-[#2D2D31] rounded-xl group-hover:border-rose-500/50 transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">
            {activeSessions.length}
          </div>
          <div className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Mengerjakan saat ini
          </div>
        </div>
      </div>

      {/* Main Grid: Active Exams & Live Proctors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Active Exam Schedules */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl border border-[#222224] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Jadwal Ujian Aktif Hari Ini</h2>
              </div>
              <button
                onClick={() => onNavigate('exams')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Kelola Jadwal →
              </button>
            </div>

            <div className="space-y-3">
              {activeExams.length > 0 ? (
                activeExams.map(exam => (
                  <div
                    key={exam.id}
                    className="p-4 bg-[#121214] hover:bg-[#1C1C1F] rounded-xl border border-[#222224] transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-emerald-950/50 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800/40">
                          {exam.jenisUjian}
                        </span>
                        <span className="text-xs text-[#A1A1AA] font-mono">
                          Token: <strong className="text-white font-bold bg-[#161618] px-2 py-0.5 rounded border border-[#2D2D31]">{exam.token}</strong>
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm mt-1.5">{exam.namaUjian}</h3>
                      <div className="text-xs text-[#71717A] mt-0.5">
                        Kelas: {exam.targetClassNames.join(', ')} | Durasi: {exam.durasiMenit} Menit
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => onNavigate('monitoring')}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-lg transition-all"
                      >
                        Pantau Siswa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[#52525B] text-xs">
                  Tidak ada jadwal ujian yang sedang aktif saat ini.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('question_bank')}
              className="p-4 bg-[#161618] rounded-xl border border-[#222224] text-left hover:border-emerald-500/40 transition-all shadow-xs group"
            >
              <div className="p-2.5 bg-[#1C1C1F] rounded-lg text-emerald-400 border border-[#2D2D31] w-fit group-hover:border-emerald-500/40 transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white mt-2">Buat Butir Soal</div>
              <div className="text-[11px] text-[#71717A]">6 Tipe soal + Rumus</div>
            </button>

            <button
              onClick={() => onNavigate('grading')}
              className="p-4 bg-[#161618] rounded-xl border border-[#222224] text-left hover:border-emerald-500/40 transition-all shadow-xs group"
            >
              <div className="p-2.5 bg-[#1C1C1F] rounded-lg text-blue-400 border border-[#2D2D31] w-fit group-hover:border-blue-500/40 transition-colors">
                <Award className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white mt-2">Koreksi & Nilai</div>
              <div className="text-[11px] text-[#71717A]">Koreksi essay & KKM</div>
            </button>

            <button
              onClick={() => onNavigate('server_settings')}
              className="p-4 bg-[#161618] rounded-xl border border-[#222224] text-left hover:border-emerald-500/40 transition-all shadow-xs group col-span-2 sm:col-span-1"
            >
              <div className="p-2.5 bg-[#1C1C1F] rounded-lg text-teal-400 border border-[#2D2D31] w-fit group-hover:border-teal-500/40 transition-colors">
                <Server className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white mt-2">Backup Data CBT</div>
              <div className="text-[11px] text-[#71717A]">Snapshot JSON aman</div>
            </button>
          </div>
        </div>

        {/* Right 4 Cols: LAN Status & Quick Student Session List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Server Info Card */}
          <div className="bg-[#161618] p-5 rounded-2xl border border-[#222224] shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#222224]">
              <div className="flex items-center space-x-2 font-bold text-white">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Status Server LAN</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 font-bold rounded text-[10px] uppercase tracking-wider">
                AKTIF
              </span>
            </div>

            <div className="space-y-2 text-[#A1A1AA]">
              <div className="flex justify-between">
                <span className="text-[#71717A]">IP Host CBT:</span>
                <span className="font-mono font-bold text-white">{madrasah.serverIp}:8393</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Jenjang:</span>
                <span className="font-bold text-white">{madrasah.jenjang}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">NSM / NPSN:</span>
                <span className="font-mono text-white">{madrasah.nsm} / {madrasah.npsn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Kepala Madrasah:</span>
                <span className="font-semibold text-white">{madrasah.kepalaMadrasah}</span>
              </div>
            </div>
          </div>

          {/* Realtime Proctoring Quick Feed */}
          <div className="bg-[#161618] p-5 rounded-2xl border border-[#222224] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#222224]">
              <div className="flex items-center space-x-2 font-bold text-white text-xs">
                <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Live Feed Peserta Ujian</span>
              </div>
              <button
                onClick={() => onNavigate('monitoring')}
                className="text-[11px] font-semibold text-emerald-400 hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-60">
              {(Object.values(examSessions) as ExamSession[]).slice(0, 5).map(s => (
                <div key={s.id} className="p-2.5 bg-[#121214] border border-[#222224] rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#E5E5E7]">{s.studentName}</div>
                    <div className="text-[10px] text-[#71717A]">{s.namaKelas} • {s.roomName}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        s.status === 'sedang_mengerjakan'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                          : 'bg-blue-950/50 text-blue-400 border border-blue-800/40'
                      }`}
                    >
                      {s.status === 'sedang_mengerjakan' ? 'Aktif' : 'Selesai'}
                    </span>
                    <div className="text-[10px] font-mono text-[#71717A] mt-0.5">
                      {s.totalAnswered}/{s.totalQuestions} Soal
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
