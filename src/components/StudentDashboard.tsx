import React, { useState } from 'react';
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
  QrCode
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

  const studentResults = (examResults || []).filter(r => r.studentId === currentStudent?.id);

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
              Selamat datang di sistem CBT {madrasah.namaMadrasah}. Pastikan koneksi Wi-Fi/LAN lokal Anda terhubung ke server CBT sebelum memulai ujian.
            </p>

            <div className="pt-1">
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

      {/* Available Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Jadwal Ujian Tersedia</h2>
          </div>
          <span className="text-xs font-mono text-[#71717A]">
            {availableExams.length} Mata Ujian Terjadwal
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
                        {exam.status}
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
                      <span className="text-[10px] text-[#71717A] block">Jadwal</span>
                      <span className="font-semibold text-[#E5E5E7]">
                        {exam.tanggalMulai} ({exam.jamMulai} - {exam.jamSelesai})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#71717A] block">Alokasi Waktu</span>
                      <span className="font-semibold text-[#E5E5E7]">{exam.durasiMenit} Menit</span>
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

      {/* Exam Results & History */}
      {studentResults.length > 0 && (
        <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl border border-[#222224] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#222224]">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Riwayat & Nilai Ujian Saya</h2>
          </div>

          <div className="border border-[#222224] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
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
          <li>Jawaban Anda otomatis tersimpan (autosave) secara berkala setiap detik ke server lokal.</li>
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
