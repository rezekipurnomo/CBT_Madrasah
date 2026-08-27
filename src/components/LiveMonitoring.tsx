import React, { useState, useEffect, useRef } from 'react';
import { useCBT } from '../context/CBTContext';
import { ExamSession, StudentAnswer, SessionStatus } from '../types';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Clock,
  UserCheck,
  AlertCircle,
  RotateCcw,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Laptop,
  Eye,
  Send,
  Upload,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

export const LiveMonitoring: React.FC = () => {
  const {
    exams,
    examSessions,
    rooms,
    resetStudentSession,
    addTimeSession,
    finishExamSession,
    importEmergencySessionBackup,
    showToast
  } = useCBT();

  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSessionForView, setSelectedSessionForView] = useState<ExamSession | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportEmergencyFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const result = importEmergencySessionBackup(content);
        if (result.success) {
          showToast(`Berhasil memulihkan berkas jawaban darurat siswa: ${result.studentName || 'Peserta'}`, 'success');
        } else {
          showToast(`Gagal memulihkan berkas: ${result.message}`, 'error');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Auto-refresh pulse
  const [ticker, setTicker] = useState<number>(0);
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      setTicker(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const allSessions = Object.values(examSessions) as ExamSession[];

  // Filtered Sessions
  const filteredSessions = allSessions.filter(s => {
    if (selectedExamId !== 'all' && s.examId !== selectedExamId) return false;
    if (selectedRoom !== 'all' && s.roomName !== selectedRoom) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.studentName.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        s.namaKelas.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Statistics counters
  const activeCount = allSessions.filter(s => s.status === 'sedang_mengerjakan').length;
  const completedCount = allSessions.filter(s => s.status === 'selesai' || s.status === 'waktu_habis').length;
  const totalCount = allSessions.length;

  const formatSeconds = (sec: number) => {
    if (sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case 'sedang_mengerjakan':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            Mengerjakan
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-950/50 text-blue-400 border border-blue-800/40">
            <CheckCircle2 className="w-3 h-3 mr-1 text-blue-400" />
            Selesai
          </span>
        );
      case 'waktu_habis':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/50 text-amber-400 border border-amber-800/40">
            <Clock className="w-3 h-3 mr-1 text-amber-400" />
            Waktu Habis
          </span>
        );
      case 'terputus':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-950/50 text-rose-400 border border-rose-800/40">
            <XCircle className="w-3 h-3 mr-1 text-rose-400" />
            Terputus
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#1C1C1F] text-[#71717A] border border-[#2D2D31]">
            Belum Mulai
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl shadow-sm border border-[#222224] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#1C1C1F] text-rose-400 border border-[#2D2D31]">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Monitoring Ujian Realtime
              </h1>
              <p className="text-xs text-[#71717A]">
                Pantau progres pengerjaan, status koneksi LAN, dan kendalikan sesi siswa secara langsung.
              </p>
            </div>
          </div>
        </div>

        {/* Live Stats Badges & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Emergency Backup File Upload for Proctor */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportEmergencyFile}
            accept=".cbt,.json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1C1C1F] hover:bg-[#252529] text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all shadow-xs active:scale-95"
            title="Impor berkas cadangan jawaban darurat dari HP/Laptop siswa jika jaringan lab terputus"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Impor Jawaban Darurat (.cbt)</span>
          </button>

          <div className="px-4 py-2 bg-[#121214] border border-[#222224] rounded-xl text-center min-w-[90px]">
            <div className="text-lg font-extrabold text-emerald-400 font-mono">{activeCount}</div>
            <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wide">Aktif</div>
          </div>
          <div className="px-4 py-2 bg-[#121214] border border-[#222224] rounded-xl text-center min-w-[90px]">
            <div className="text-lg font-extrabold text-blue-400 font-mono">{completedCount}</div>
            <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wide">Selesai</div>
          </div>
          <div className="px-4 py-2 bg-[#121214] border border-[#222224] rounded-xl text-center min-w-[90px]">
            <div className="text-lg font-extrabold text-white font-mono">{totalCount}</div>
            <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wide">Total</div>
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-[#161618] p-4 rounded-2xl shadow-sm border border-[#222224] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa / NISN / kelas..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#121214] border border-[#222224] rounded-xl text-[#E5E5E7] placeholder-[#52525B] focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Exam Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#222224] rounded-xl text-[#E5E5E7] focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Ujian Aktif</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>
                {e.namaUjian}
              </option>
            ))}
          </select>
        </div>

        {/* Room Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedRoom}
            onChange={e => setSelectedRoom(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#222224] rounded-xl text-[#E5E5E7] focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Ruang</option>
            {rooms.map(r => (
              <option key={r.id} value={r.namaRuang}>
                {r.nomorRuang}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#222224] rounded-xl text-[#E5E5E7] focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="sedang_mengerjakan">Sedang Mengerjakan</option>
            <option value="selesai">Selesai</option>
            <option value="waktu_habis">Waktu Habis</option>
            <option value="terputus">Terputus</option>
          </select>
        </div>

        {/* Auto Refresh Toggle */}
        <div className="lg:col-span-1 flex justify-end">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
              isAutoRefresh
                ? 'bg-[#1C1C1F] text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                : 'bg-[#121214] text-[#71717A] border-[#222224]'
            }`}
            title={isAutoRefresh ? 'Auto Refresh Aktif (Tiap 3 detik)' : 'Auto Refresh Nonaktif'}
          >
            <RefreshCw className={`w-4 h-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Participants Live Table */}
      <div className="bg-[#161618] rounded-2xl shadow-sm border border-[#222224] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F0F11] text-[#71717A] font-bold border-b border-[#222224]">
              <tr>
                <th className="p-3.5">No</th>
                <th className="p-3.5">Nama Peserta / NISN</th>
                <th className="p-3.5">Kelas & Ruang</th>
                <th className="p-3.5">IP & Perangkat</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Mulai</th>
                <th className="p-3.5 text-center">Sisa Waktu</th>
                <th className="p-3.5 text-center">Jawaban</th>
                <th className="p-3.5 text-center">Aksi Proktor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222224]">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((s, idx) => {
                  const percent = s.totalQuestions > 0 ? Math.round((s.totalAnswered / s.totalQuestions) * 100) : 0;
                  return (
                    <tr key={s.id} className="hover:bg-[#1C1C1F] transition-colors">
                      <td className="p-3.5 font-bold text-[#52525B]">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{s.studentName}</div>
                        <div className="text-[11px] text-[#71717A] font-mono">NISN: {s.nisn}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-[#D1D1D1]">{s.namaKelas}</div>
                        <div className="text-[11px] text-emerald-400 font-medium">{s.roomName}</div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#A1A1AA]">
                        <div>{s.ipAddress}</div>
                        <div className="text-[10px] text-[#52525B] truncate max-w-[120px]">{s.deviceInfo || 'Chrome / LAN'}</div>
                      </td>
                      <td className="p-3.5 text-center">{getStatusBadge(s.status)}</td>
                      <td className="p-3.5 text-center font-mono text-[#71717A]">
                        {s.startedAt?.split(' ')[1] || s.startedAt || '-'}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold">
                        <span className={s.remainingSeconds < 300 && s.status === 'sedang_mengerjakan' ? 'text-rose-400' : 'text-white'}>
                          {s.status === 'sedang_mengerjakan' ? formatSeconds(s.remainingSeconds) : '-'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="font-bold text-white font-mono">
                          {s.totalAnswered} / {s.totalQuestions}
                        </div>
                        <div className="w-16 bg-[#121214] h-1.5 rounded-full mx-auto mt-1 overflow-hidden border border-[#222224]">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* View Answers */}
                          <button
                            onClick={() => setSelectedSessionForView(s)}
                            className="p-1.5 rounded-lg text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-emerald-400 transition-colors border border-transparent hover:border-[#2D2D31]"
                            title="Lihat Log Lembar Jawaban Siswa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Reset Session */}
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin me-reset sesi ujian untuk siswa ${s.studentName}? Siswa akan dapat login kembali.`)) {
                                resetStudentSession(s.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-amber-400 hover:bg-[#1C1C1F] transition-colors border border-transparent hover:border-[#2D2D31]"
                            title="Reset Sesi Login Siswa"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          {/* Add 15 Mins Time */}
                          {s.status === 'sedang_mengerjakan' && (
                            <button
                              onClick={() => addTimeSession(s.id, 15)}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-[#1C1C1F] transition-colors border border-transparent hover:border-[#2D2D31]"
                              title="Tambah Waktu +15 Menit"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Force Finish */}
                          {s.status === 'sedang_mengerjakan' && (
                            <button
                              onClick={() => {
                                if (confirm(`Paksa kumpulkan ujian untuk ${s.studentName}? Nilai akan langsung dihitung.`)) {
                                  finishExamSession(s.id, false);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-[#1C1C1F] transition-colors border border-transparent hover:border-[#2D2D31]"
                              title="Paksa Kumpulkan Ujian"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#52525B]">
                    Tidak ada data peserta ujian yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Student Answers Modal */}
      {selectedSessionForView && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#161618] rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-[#2D2D31] max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 text-[#D1D1D1]">
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <div>
                <h3 className="font-bold text-base text-white">
                  Detail Lembar Jawaban: {selectedSessionForView.studentName}
                </h3>
                <p className="text-xs text-[#71717A] font-mono">
                  NISN: {selectedSessionForView.nisn} | Kelas: {selectedSessionForView.namaKelas}
                </p>
              </div>
              <button
                onClick={() => setSelectedSessionForView(null)}
                className="p-2 text-[#71717A] hover:text-white hover:bg-[#1C1C1F] rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {(Object.values(selectedSessionForView.answers) as StudentAnswer[]).map((ans, idx) => (
                <div key={idx} className="p-3.5 bg-[#121214] border border-[#222224] rounded-xl text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#A1A1AA] mb-1">
                    <span>Soal #{idx + 1} ({ans.tipe.replace(/_/g, ' ')})</span>
                    <span className={ans.isAnswered ? 'text-emerald-400 font-bold' : 'text-[#52525B]'}>
                      {ans.isAnswered ? '✓ Terjawab' : '○ Belum Dijawab'}
                    </span>
                  </div>
                  <div className="text-white font-mono bg-[#0E0E10] p-2.5 rounded-lg border border-[#2D2D31] mt-1">
                    {typeof ans.jawaban === 'object'
                      ? JSON.stringify(ans.jawaban, null, 2)
                      : String(ans.jawaban || '(Kosong)')}
                  </div>
                  <div className="text-[10px] text-[#52525B] mt-1 font-mono">
                    Terakhir disimpan: {ans.savedAt || '-'}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#222224] flex justify-end">
              <button
                onClick={() => setSelectedSessionForView(null)}
                className="px-4 py-2 bg-[#1C1C1F] text-white border border-[#2D2D31] text-xs font-semibold rounded-xl hover:bg-[#252529]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
