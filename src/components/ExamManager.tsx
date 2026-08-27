import React, { useState } from 'react';
import { useCBT } from '../context/CBTContext';
import { Exam, ExamType } from '../types';
import {
  CalendarCheck,
  Plus,
  KeyRound,
  RefreshCw,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Archive,
  Users,
  Settings2,
  Sparkles,
  X
} from 'lucide-react';

export const ExamManager: React.FC = () => {
  const {
    exams,
    questionBanks,
    classes,
    academicYears,
    semesters,
    currentUser,
    addExam,
    updateExam,
    deleteExam,
    toggleExamStatus,
    regenerateExamToken,
    showToast
  } = useCBT();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form states
  const [namaUjian, setNamaUjian] = useState<string>('');
  const [kodeUjian, setKodeUjian] = useState<string>('');
  const [bankId, setBankId] = useState<string>(questionBanks[0]?.id || '');
  const [jenisUjian, setJenisUjian] = useState<ExamType>('Asesmen Madrasah');
  const [targetClassIds, setTargetClassIds] = useState<string[]>([classes[0]?.id || 'cls-9a']);
  const [tanggalMulai, setTanggalMulai] = useState<string>(new Date().toISOString().split('T')[0]);
  const [jamMulai, setJamMulai] = useState<string>('07:30');
  const [tanggalSelesai, setTanggalSelesai] = useState<string>(new Date().toISOString().split('T')[0]);
  const [jamSelesai, setJamSelesai] = useState<string>('12:00');
  const [durasiMenit, setDurasiMenit] = useState<number>(60);
  const [jumlahSoal, setJumlahSoal] = useState<number>(10);
  const [nilaiMinimum, setNilaiMinimum] = useState<number>(75);
  const [acakSoal, setAcakSoal] = useState<boolean>(true);
  const [acakJawaban, setAcakJawaban] = useState<boolean>(true);
  const [izinkanKembali, setIzinkanKembali] = useState<boolean>(true);
  const [tampilkanHasil, setTampilkanHasil] = useState<boolean>(true);
  const [useToken, setUseToken] = useState<boolean>(true);

  const openModal = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setNamaUjian(exam.namaUjian);
      setKodeUjian(exam.kodeUjian);
      setBankId(exam.bankId);
      setJenisUjian(exam.jenisUjian);
      setTargetClassIds(exam.targetClassIds);
      setTanggalMulai(exam.tanggalMulai);
      setJamMulai(exam.jamMulai);
      setTanggalSelesai(exam.tanggalSelesai);
      setJamSelesai(exam.jamSelesai);
      setDurasiMenit(exam.durasiMenit);
      setJumlahSoal(exam.jumlahSoal);
      setNilaiMinimum(exam.nilaiMinimum);
      setAcakSoal(exam.acakSoal);
      setAcakJawaban(exam.acakJawaban);
      setIzinkanKembali(exam.izinkanKembali);
      setTampilkanHasil(exam.tampilkanHasil);
      setUseToken(exam.useToken);
    } else {
      setEditingExam(null);
      setNamaUjian('');
      setKodeUjian(`EXAM-${Date.now().toString().slice(-4)}`);
      setBankId(questionBanks[0]?.id || '');
      setJenisUjian('Asesmen Madrasah');
      setTargetClassIds([classes[0]?.id || 'cls-9a']);
      setTanggalMulai(new Date().toISOString().split('T')[0]);
      setJamMulai('07:30');
      setTanggalSelesai(new Date().toISOString().split('T')[0]);
      setJamSelesai('12:00');
      setDurasiMenit(60);
      setJumlahSoal(10);
      setNilaiMinimum(75);
      setAcakSoal(true);
      setAcakJawaban(true);
      setIzinkanKembali(true);
      setTampilkanHasil(true);
      setUseToken(true);
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaUjian.trim()) {
      showToast('Nama ujian harus diisi!', 'error');
      return;
    }
    const bank = questionBanks.find(b => b.id === bankId);
    const selectedClassObjs = classes.filter(c => targetClassIds.includes(c.id));
    const targetNames = selectedClassObjs.map(c => c.namaKelas);

    const examData: Exam = {
      id: editingExam ? editingExam.id : 'exam-' + Date.now(),
      bankId,
      namaUjian,
      kodeUjian,
      subjectName: bank?.subjectName || 'Mata Pelajaran',
      jenisUjian,
      academicYearId: academicYears.find(a => a.statusAktif)?.id || 'ay-2025-2026',
      semester: semesters.find(s => s.statusAktif)?.semester || 'Genap',
      targetClassIds,
      targetClassNames: targetNames,
      tanggalMulai,
      jamMulai,
      tanggalSelesai,
      jamSelesai,
      durasiMenit: Number(durasiMenit) || 60,
      jumlahSoal: Number(jumlahSoal) || 10,
      nilaiMinimum: Number(nilaiMinimum) || 75,
      acakSoal,
      acakJawaban,
      izinkanKembali,
      tampilkanHasil,
      tampilkanPembahasan: false,
      useToken,
      token: editingExam?.token || 'CBT-2026-01',
      status: editingExam ? editingExam.status : 'aktif',
      createdBy: currentUser?.name || 'Proktor Ujian'
    };

    if (editingExam) {
      updateExam(examData);
    } else {
      addExam(examData);
    }

    setShowModal(false);
  };

  const toggleClassSelect = (clsId: string) => {
    if (targetClassIds.includes(clsId)) {
      setTargetClassIds(prev => prev.filter(id => id !== clsId));
    } else {
      setTargetClassIds(prev => [...prev, clsId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl shadow-sm border border-[#222224] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31] rounded-2xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Jadwal & Token Ujian CBT</h1>
            <p className="text-xs text-[#71717A]">
              Konfigurasi jadwal, token dinamis, rombel peserta, durasi, dan aturan pengerjaan ujian.
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jadwal Ujian</span>
        </button>
      </div>

      {/* Exams Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {exams.map(exam => {
          const isAktif = exam.status === 'aktif';
          return (
            <div
              key={exam.id}
              className={`bg-[#161618] rounded-2xl p-5 border transition-all shadow-sm flex flex-col justify-between ${
                isAktif
                  ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                  : 'border-[#222224]'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#A1A1AA] bg-[#121214] border border-[#222224] px-2.5 py-1 rounded-md">
                    {exam.kodeUjian}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {isAktif ? (
                      <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        Sedang Aktif
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#1C1C1F] text-[#71717A] border border-[#2D2D31] capitalize">
                        {exam.status}
                      </span>
                    )}

                    <button
                      onClick={() => openModal(exam)}
                      className="p-1 text-[#71717A] hover:text-white"
                      title="Edit Ujian"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus jadwal ujian ${exam.namaUjian}?`)) {
                          deleteExam(exam.id);
                        }
                      }}
                      className="p-1 text-[#71717A] hover:text-rose-400"
                      title="Hapus Ujian"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h2 className="text-base font-bold text-white mt-2 leading-snug">
                  {exam.namaUjian}
                </h2>
                <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                  {exam.subjectName} • {exam.jenisUjian}
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-[#121214] border border-[#222224] rounded-xl text-xs text-[#A1A1AA]">
                  <div>
                    <span className="text-[10px] text-[#71717A] block">Jadwal Pelaksanaan</span>
                    <span className="font-semibold text-white">
                      {exam.tanggalMulai} ({exam.jamMulai} - {exam.jamSelesai})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] block">Durasi & KKM</span>
                    <span className="font-semibold text-white">
                      {exam.durasiMenit} Menit | KKM: {exam.nilaiMinimum}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-[#71717A] block">Rombel Kelas Peserta</span>
                    <span className="font-semibold text-emerald-400">
                      {exam.targetClassNames.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Token Box */}
                {exam.useToken && (
                  <div className="mt-3 p-3 bg-[#121214] border border-emerald-500/40 rounded-xl flex items-center justify-between shadow-[0_0_10px_rgba(16,185,129,0.08)]">
                    <div className="flex items-center space-x-2">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#71717A]">Token Ujian Aktif:</div>
                        <div className="font-mono text-base font-extrabold text-emerald-400 tracking-wider">
                          {exam.token}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => regenerateExamToken(exam.id)}
                      className="p-2 text-emerald-400 hover:bg-[#1C1C1F] border border-transparent hover:border-[#2D2D31] rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Generate Ulang Token Baru"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Rilis Token Baru</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-4 mt-4 border-t border-[#222224] flex items-center justify-between">
                <div className="text-[11px] text-[#71717A]">
                  Dibuat oleh: <span className="font-semibold text-[#D1D1D1]">{exam.createdBy}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {isAktif ? (
                    <button
                      onClick={() => toggleExamStatus(exam.id, 'draft')}
                      className="px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-400 border border-amber-800/40 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Jeda Ujian</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleExamStatus(exam.id, 'aktif')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Aktifkan Ujian</span>
                    </button>
                  )}
                  <button
                    onClick={() => toggleExamStatus(exam.id, 'selesai')}
                    className="px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#252529] text-[#A1A1AA] border border-[#2D2D31] text-xs font-semibold rounded-xl"
                  >
                    Arsipkan
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create/Edit Exam */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSave}
            className="bg-[#161618] rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-[#2D2D31] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 text-[#D1D1D1]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <h3 className="font-bold text-base text-white">
                {editingExam ? 'Edit Konfigurasi Ujian' : 'Buat Jadwal Ujian Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-[#71717A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Nama Ujian</label>
                <input
                  type="text"
                  required
                  value={namaUjian}
                  onChange={e => setNamaUjian(e.target.value)}
                  placeholder="Contoh: Asesmen Madrasah 2026 - Matematika IX"
                  className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Bank Soal Sumber</label>
                  <select
                    value={bankId}
                    onChange={e => setBankId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    {questionBanks.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.kodeBank} - {b.namaBank}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Jenis Ujian</label>
                  <select
                    value={jenisUjian}
                    onChange={e => setJenisUjian(e.target.value as ExamType)}
                    className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Asesmen Madrasah">Asesmen Madrasah</option>
                    <option value="Penilaian Akhir Semester">Penilaian Akhir Semester (PAS)</option>
                    <option value="Penilaian Akhir Tahun">Penilaian Akhir Tahun (PAT)</option>
                    <option value="Penilaian Tengah Semester">Penilaian Tengah Semester (PTS)</option>
                    <option value="Ulangan Harian">Ulangan Harian</option>
                    <option value="Try Out">Try Out</option>
                  </select>
                </div>
              </div>

              {/* Rombel Peserta Checklist */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Target Kelas Peserta Ujian:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#121214] border border-[#222224] rounded-xl max-h-32 overflow-y-auto">
                  {classes.map(cls => {
                    const isChecked = targetClassIds.includes(cls.id);
                    return (
                      <label
                        key={cls.id}
                        className={`flex items-center space-x-2 p-2 rounded-lg text-xs cursor-pointer border ${
                          isChecked ? 'bg-[#1C1C1F] border-emerald-500/80 font-bold text-emerald-400' : 'bg-[#161618] border-[#222224] text-[#A1A1AA]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleClassSelect(cls.id)}
                          className="w-3.5 h-3.5 accent-emerald-500 rounded"
                        />
                        <span>{cls.namaKelas}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={e => setTanggalMulai(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={jamMulai}
                    onChange={e => setJamMulai(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={durasiMenit}
                    onChange={e => setDurasiMenit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold bg-[#121214] border border-[#2D2D31] text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Nilai KKM</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={nilaiMinimum}
                    onChange={e => setNilaiMinimum(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold bg-[#121214] border border-[#2D2D31] text-white rounded-xl"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-[#222224] bg-[#121214] cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={acakSoal}
                    onChange={e => setAcakSoal(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span className="text-[#D1D1D1]">Acak Urutan Soal Siswa</span>
                </label>

                <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-[#222224] bg-[#121214] cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={acakJawaban}
                    onChange={e => setAcakJawaban(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span className="text-[#D1D1D1]">Acak Opsi Pilihan Jawaban</span>
                </label>

                <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-[#222224] bg-[#121214] cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={useToken}
                    onChange={e => setUseToken(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span className="text-[#D1D1D1]">Wajibkan Token Ujian</span>
                </label>

                <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-[#222224] bg-[#121214] cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={tampilkanHasil}
                    onChange={e => setTampilkanHasil(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span className="text-[#D1D1D1]">Tampilkan Nilai ke Siswa Usai Ujian</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Simpan Jadwal Ujian
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
