import React, { useState, useMemo } from 'react';
import { useCBT } from '../context/CBTContext';
import { Exam } from '../types';
import { ExamRunner } from './ExamRunner';
import { MobileWifiGuideModal } from './MobileWifiGuideModal';
import {
  CalendarCheck,
  Award,
  Play,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Info,
  Smartphone,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface StudentDashboardProps {
  onStartExam?: (examId: string, token: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onStartExam }) => {
  const {
    currentUser,
    students,
    exams,
    examResults,
    examSessions,
    madrasah,
    showToast
  } = useCBT();

  // Find the student profile matching currentUser
  const currentStudent = (students || []).find(s => s.userId === currentUser?.id) || students[0];

  // Active exam session being taken right now (if not handled by App.tsx)
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string>('');

  // Token input modal state
  const [selectedExamForToken, setSelectedExamForToken] = useState<Exam | null>(null);
  const [inputToken, setInputToken] = useState<string>('');
  const [showMobileGuide, setShowMobileGuide] = useState<boolean>(false);

  // Filter exams available for student's class
  const availableExams = (exams || []).filter(e => {
    if (!currentStudent) return true;
    if (!e.targetClassIds || e.targetClassIds.length === 0) return true;
    return e.targetClassIds.includes(currentStudent.kelasId);
  });

  const handleStartExamClick = (exam: Exam) => {
    // If student already has an active in-progress session, resume directly
    const sessionId = `sess-${currentStudent?.id}-${exam.id}`;
    const existingSession = examSessions[sessionId];

    if (existingSession && existingSession.status === 'sedang_mengerjakan') {
      if (onStartExam) {
        onStartExam(exam.id, exam.token);
      } else {
        setActiveExamId(exam.id);
        setActiveToken(exam.token);
      }
      return;
    }

    setSelectedExamForToken(exam);
    setInputToken('');
  };

  const handleConfirmToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamForToken) return;

    if (inputToken.trim().toUpperCase() !== selectedExamForToken.token.toUpperCase()) {
      showToast('Token Ujian yang Anda masukkan TIDAK VALID! Hubungi pengawas ruang.', 'error');
      return;
    }

    const examId = selectedExamForToken.id;
    const token = selectedExamForToken.token;
    setSelectedExamForToken(null);
    if (onStartExam) {
      onStartExam(examId, token);
    } else {
      setActiveExamId(examId);
      setActiveToken(token);
    }
    showToast(`Token valid! Selamat mengerjakan ujian ${selectedExamForToken.namaUjian}.`, 'success');
  };

  if (activeExamId) {
    return (
      <ExamRunner
        examId={activeExamId}
        token={activeToken}
        onExit={() => setActiveExamId(null)}
      />
    );
  }

  const studentResults = useMemo(() => {
    return (examResults || []).filter(r => r.studentId === currentStudent?.id);
  }, [examResults, currentStudent?.id]);

  // Compute performance metrics
  const completedCount = studentResults.length;
  const averageGrade = useMemo(() => {
    if (completedCount === 0) return 0;
    const sum = studentResults.reduce((acc, r) => acc + (r.nilaiAkhir || 0), 0);
    return Math.round((sum / completedCount) * 10) / 10;
  }, [studentResults, completedCount]);

  const passedCount = useMemo(() => {
    return studentResults.filter(r => r.statusLulus === 'LULUS' || (r.nilaiAkhir || 0) >= (r.kkm || 75)).length;
  }, [studentResults]);

  const passRate = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0;
  const totalExamsCount = availableExams.length;
  const completionProgress = totalExamsCount > 0 ? Math.round((completedCount / totalExamsCount) * 100) : 0;

  const upcomingExams = useMemo(() => {
    return availableExams.filter(exam => !studentResults.some(r => r.examId === exam.id));
  }, [availableExams, studentResults]);

  // Predikat Nilai helper
  const getGradePredikat = (score: number) => {
    if (score >= 88) return { label: 'A (Sangat Baik)', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/50' };
    if (score >= 75) return { label: 'B (Baik / Tuntas)', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-800/50' };
    if (score >= 60) return { label: 'C (Cukup)', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/50' };
    return { label: 'D (Perlu Bimbingan)', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800/50' };
  };

  const predikat = getGradePredikat(averageGrade);

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-[#0F0F11] border border-[#222224] rounded-2xl p-5 sm:p-8 text-[#E5E5E7] shadow-xl shadow-black/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#161618] rounded-full text-xs font-mono text-emerald-400 border border-[#2D2D31]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>PORTAL ASESMEN SISWA MADRASAH</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white">
              Ahlan Wa Sahlan, {currentStudent?.nama}!
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
              Selamat datang di sistem CBT {madrasah.namaMadrasah}. Pantau rekap capaian belajar, progres ujian terjadwal, dan riwayat nilai asesmen Anda secara transparan.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowMobileGuide(true)}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-[#161618] hover:bg-[#1C1C1F] border border-emerald-500/40 px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Panduan Akses HP & Scan Barcode QR</span>
              </button>
            </div>
          </div>

          {/* Student ID Card Badge */}
          <div className="bg-[#161618] p-4 rounded-xl border border-[#2D2D31] text-xs space-y-1.5 shrink-0 min-w-[240px]">
            <div className="flex justify-between">
              <span className="text-[#71717A]">NISN:</span>
              <span className="font-mono font-bold text-white">{currentStudent?.nisn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Kelas / Rombel:</span>
              <span className="font-bold text-white">{currentStudent?.namaKelas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Nomor Peserta:</span>
              <span className="font-mono font-bold text-amber-400">{currentStudent?.nomorPeserta}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Ruang Ujian:</span>
              <span className="font-bold text-emerald-400">{currentStudent?.ruangId || 'LAB-01'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Performance Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Rata-Rata Nilai */}
        <div className="bg-[#161618] rounded-2xl p-5 border border-[#222224] shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717A]">Rata-Rata Nilai</span>
            <div className="w-8 h-8 rounded-xl bg-[#1C1C1F] border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {completedCount > 0 ? averageGrade : '—'}
              </span>
              <span className="text-xs text-[#71717A] font-mono">/ 100</span>
            </div>

            {/* Score progress bar */}
            <div className="mt-2.5 space-y-1">
              <div className="w-full bg-[#1C1C1F] h-2 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, averageGrade)}%` }}
                />
                {/* KKM 75 Benchmark Marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{ left: '75%' }}
                  title="Batas KKM (75)"
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#71717A]">
                <span>0</span>
                <span className="text-amber-400 font-mono">KKM 75</span>
                <span>100</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#222224] flex items-center justify-between">
            <span className="text-[11px] text-[#71717A]">Predikat:</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${predikat.bg} ${predikat.color}`}>
              {completedCount > 0 ? predikat.label : 'Belum Ada Data'}
            </span>
          </div>
        </div>

        {/* Card 2: Tingkat Kelulusan */}
        <div className="bg-[#161618] rounded-2xl p-5 border border-[#222224] shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717A]">Tingkat Kelulusan</span>
            <div className="w-8 h-8 rounded-xl bg-[#1C1C1F] border border-blue-500/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-blue-400">
                {completedCount > 0 ? `${passRate}%` : '0%'}
              </span>
              <span className="text-xs text-[#71717A]">Tuntas KKM</span>
            </div>

            <div className="mt-2.5 space-y-1">
              <div className="w-full bg-[#1C1C1F] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${passRate}%` }}
                />
              </div>
              <div className="text-[10px] text-[#71717A] text-right font-mono">
                {passedCount} dari {completedCount} Ujian Tuntas
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#222224] flex items-center justify-between text-[11px]">
            <span className="text-[#71717A]">Status Asesmen:</span>
            <span className={`font-semibold ${passRate >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {passRate >= 75 ? 'Memuaskan' : 'Perlu Peningkatan'}
            </span>
          </div>
        </div>

        {/* Card 3: Progres Ujian Semester */}
        <div className="bg-[#161618] rounded-2xl p-5 border border-[#222224] shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717A]">Progres Kurikulum</span>
            <div className="w-8 h-8 rounded-xl bg-[#1C1C1F] border border-amber-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {completedCount}
              </span>
              <span className="text-xs text-[#71717A] font-mono">/ {totalExamsCount} Ujian</span>
            </div>

            <div className="mt-2.5 space-y-1">
              <div className="w-full bg-[#1C1C1F] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${completionProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#71717A]">
                <span>Selesai</span>
                <span className="text-amber-400 font-mono font-bold">{completionProgress}%</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#222224] flex items-center justify-between text-[11px]">
            <span className="text-[#71717A]">Sisa Ujian:</span>
            <span className="font-bold text-white font-mono">{upcomingExams.length} Mata Pelajaran</span>
          </div>
        </div>

        {/* Card 4: Ujian Mendatang */}
        <div className="bg-[#161618] rounded-2xl p-5 border border-[#222224] shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717A]">Jadwal Terdekat</span>
            <div className="w-8 h-8 rounded-xl bg-[#1C1C1F] border border-purple-500/30 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-purple-400" />
            </div>
          </div>

          <div>
            {upcomingExams.length > 0 ? (
              <div className="space-y-1">
                <span className="text-base font-bold text-white line-clamp-1">
                  {upcomingExams[0].namaUjian}
                </span>
                <div className="text-xs font-medium text-emerald-400">
                  {upcomingExams[0].subjectName}
                </div>
                <div className="text-[11px] text-[#71717A] flex items-center gap-1 font-mono pt-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{upcomingExams[0].tanggalMulai} • {upcomingExams[0].durasiMenit} Menit</span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-[#71717A]">
                Semua mata ujian telah selesai dikerjakan.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#222224] flex items-center justify-between text-[11px]">
            <span className="text-[#71717A]">Status Pelaksanaan:</span>
            <span className="font-semibold text-emerald-400">
              {upcomingExams.some(e => e.status === 'aktif') ? 'Ujian Aktif Tersedia' : 'Menunggu Sesi'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Performance History & Progress Chart */}
      <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl border border-[#222224] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#222224]">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Grafik Riwayat & Capaian Nilai Siswa
            </h2>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-[#A1A1AA]">Nilai Ujian</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-amber-400" />
              <span className="text-amber-400 font-mono">Batas KKM (75)</span>
            </div>
          </div>
        </div>

        {studentResults.length > 0 ? (
          <div className="space-y-4">
            {/* Progress Bars Chart View */}
            <div className="space-y-3 pt-2">
              {studentResults.map((r, idx) => {
                const score = r.nilaiAkhir || 0;
                const isPass = score >= (r.kkm || 75);
                const percentage = Math.min(100, Math.max(5, score));

                return (
                  <div key={r.id || idx} className="p-3.5 bg-[#121214] border border-[#222224] rounded-xl hover:border-[#2D2D31] transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{r.examName}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded font-medium">
                            {r.subjectName}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                          Diselesaikan: {r.submittedAt} • Benar: {r.benarCount}/{r.totalSoal} Soal
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPass
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                              : 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                          }`}
                        >
                          {isPass ? 'LULUS KKM' : 'REMIDI'}
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-extrabold font-mono text-emerald-400">
                            {score}
                          </span>
                          <span className="text-[10px] text-[#71717A] font-mono block">KKM: {r.kkm || 75}</span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Stepped / Linear Bar with KKM Marker */}
                    <div className="relative pt-1">
                      <div className="w-full bg-[#1C1C1F] h-3.5 rounded-lg overflow-hidden relative">
                        <div
                          className={`h-full rounded-lg transition-all duration-700 ${
                            isPass
                              ? 'bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : 'bg-linear-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                        {/* KKM 75 Reference Line Indicator */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-amber-400/90 z-20"
                          style={{ left: `${r.kkm || 75}%` }}
                          title={`Ambang Batas KKM (${r.kkm || 75})`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance Analysis Note */}
            <div className="p-3 bg-[#121214] border border-[#222224] rounded-xl flex items-start space-x-2.5 text-xs text-[#A1A1AA]">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-white">Catatan Evaluasi Pembelajaran Siswa:</span>
                <p className="leading-relaxed text-[11px]">
                  Rata-rata nilai keseluruhan Anda adalah <strong className="text-emerald-400 font-mono">{averageGrade}</strong> dengan predikat <strong className="text-white">{predikat.label}</strong>. Pertahankan konsistensi belajar Anda pada mata ujian berikutnya.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#121214] border border-[#222224] rounded-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1C1C1F] border border-[#2D2D31] flex items-center justify-center mx-auto text-[#71717A]">
              <BarChart3 className="w-6 h-6 text-[#71717A]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">Belum Ada Riwayat Ujian</h4>
              <p className="text-xs text-[#71717A] max-w-md mx-auto">
                Grafik performa dan rekap nilai otomatis terisi setelah Anda menyelesaikan ujian pada daftar jadwal di bawah.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Available & Upcoming Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Jadwal Ujian Tersedia & Mendatang</h2>
          </div>
          <span className="text-xs font-mono text-[#71717A]">
            {availableExams.length} Mata Ujian Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableExams.map(exam => {
            const isCompleted = studentResults.some(
              r => r.examId === exam.id
            );
            const isAktif = exam.status === 'aktif';

            return (
              <div
                key={exam.id}
                className="bg-[#161618] rounded-2xl p-5 border border-[#222224] shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#1C1C1F] text-[#A1A1AA] border border-[#2D2D31] px-2 py-0.5 rounded">
                      {exam.kodeUjian}
                    </span>
                    {isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-950/50 text-blue-400 border border-blue-800/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sudah Selesai
                      </span>
                    ) : isAktif ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
                        Sedang Berlangsung
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#1C1C1F] text-[#71717A] border border-[#2D2D31] capitalize">
                        {exam.status === 'draft' ? 'Akan Datang (Terjadwal)' : exam.status}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mt-2">
                    {exam.namaUjian}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {exam.subjectName} • {exam.jenisUjian}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-[#121214] border border-[#222224] rounded-xl text-xs text-[#A1A1AA]">
                    <div>
                      <span className="text-[10px] text-[#71717A] block">Jadwal Pelaksanaan</span>
                      <span className="font-semibold text-[#E5E5E7]">
                        {exam.tanggalMulai} ({exam.jamMulai} - {exam.jamSelesai})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#71717A] block">Alokasi Waktu & Soal</span>
                      <span className="font-semibold text-[#E5E5E7]">{exam.durasiMenit} Menit ({exam.jumlahSoal || 0} Soal)</span>
                    </div>
                  </div>
                </div>

                {isCompleted ? (
                  <div className="p-3 bg-[#121214] border border-[#222224] rounded-xl text-center text-xs text-[#71717A]">
                    Hasil lembar jawaban Anda telah tersimpan di server.
                  </div>
                ) : isAktif ? (
                  <button
                    onClick={() => handleStartExamClick(exam)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2 transition-all active:scale-98 min-h-[44px]"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Mulai Kerjakan Ujian</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 bg-[#1C1C1F] text-[#52525B] border border-[#222224] text-xs font-bold rounded-xl cursor-not-allowed min-h-[44px]"
                  >
                    Ujian Belum Dibuka
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Exam Results Table */}
      {studentResults.length > 0 && (
        <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl border border-[#222224] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#222224]">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tabel Rincian Lembar Jawaban & Nilai</h2>
          </div>

          <div className="border border-[#222224] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-[#0F0F11] text-[#71717A] font-bold border-b border-[#222224]">
                <tr>
                  <th className="p-3">Mata Ujian</th>
                  <th className="p-3">Waktu Selesai</th>
                  <th className="p-3 text-center">Jawaban Benar</th>
                  <th className="p-3 text-center">Nilai Akhir</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222224]">
                {studentResults.map(r => (
                  <tr key={r.id} className="hover:bg-[#1C1C1F] transition-colors">
                    <td className="p-3 font-bold text-white">{r.examName}</td>
                    <td className="p-3 text-[#71717A] font-mono">{r.submittedAt}</td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-emerald-400 font-mono">{r.benarCount}</span> / {r.totalSoal}
                    </td>
                    <td className="p-3 text-center font-mono font-extrabold text-sm text-emerald-400">
                      {r.nilaiAkhir}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.statusLulus === 'LULUS'
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                            : 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                        }`}
                      >
                        {r.statusLulus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tata Tertib & Rules Card */}
      <div className="bg-[#161618] border border-[#2D2D31] rounded-2xl p-5 space-y-3 text-xs">
        <div className="flex items-center space-x-2 font-bold text-amber-400">
          <Info className="w-4 h-4 text-amber-400" />
          <span className="uppercase tracking-wider">Tata Tertib & Petunjuk Pengerjaan CBT Madrasah</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-[#A1A1AA] text-[11px] leading-relaxed">
          <li>Pastikan perangkat HP/laptop Anda terhubung ke jaringan Wi-Fi CBT Madrasah yang sama dengan komputer server.</li>
          <li>Masukkan <strong className="text-white">Token Ujian</strong> yang diberikan oleh Bapak/Ibu Pengawas Ruang.</li>
          <li>Jawaban Anda otomatis tersimpan (autosave) secara berkala setiap detik ke server lokal dan IndexedDB.</li>
          <li>Dilarang membuka tab baru, browser lain, atau aplikasi selain jendela ujian CBT.</li>
          <li>Jika terjadi kendala sinyal atau baterai HP habis, segera hubungi Proktor Ruang untuk melanjutkan ujian.</li>
        </ul>
      </div>

      {/* Modal: Input Token */}
      {selectedExamForToken && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleConfirmToken}
            className="bg-[#161618] rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-[#2D2D31] space-y-4 animate-in fade-in zoom-in-95 duration-150 text-[#D1D1D1]"
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-[#1C1C1F] text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Masukkan Token Ujian</h3>
              <p className="text-xs text-[#71717A]">
                {selectedExamForToken.namaUjian}
              </p>
            </div>

            <div>
              <input
                type="text"
                required
                autoFocus
                value={inputToken}
                onChange={e => setInputToken(e.target.value.toUpperCase())}
                placeholder="CONTOH: CBT-2026-01"
                className="w-full px-4 py-3 text-center font-mono font-bold text-lg uppercase tracking-widest bg-[#0E0E10] border border-[#2D2D31] focus:border-emerald-500 rounded-xl focus:outline-none text-emerald-400 focus:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              />
              <div className="text-[10px] text-center text-[#52525B] mt-1.5">
                (Mintalah token resmi kepada pengawas di ruang ujian)
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedExamForToken(null)}
                className="flex-1 py-2.5 bg-[#1C1C1F] hover:bg-[#252529] text-[#A1A1AA] border border-[#2D2D31] text-xs font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
              >
                Konfirmasi & Mulai
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Wi-Fi Guide Modal */}
      <MobileWifiGuideModal
        isOpen={showMobileGuide}
        onClose={() => setShowMobileGuide(false)}
      />
    </div>
  );
};

