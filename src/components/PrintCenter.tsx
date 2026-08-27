import React, { useState } from 'react';
import { useCBT } from '../context/CBTContext';
import {
  generateKartuPesertaPDF,
  generateBeritaAcaraPDF,
  generateDaftarHadirPDF,
  generateRekapNilaiPDF
} from '../utils/pdfGenerator';
import {
  Printer,
  CreditCard,
  FileCheck,
  ClipboardList,
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const PrintCenter: React.FC = () => {
  const {
    students,
    classes,
    rooms,
    exams,
    examResults,
    sessionConfigs,
    madrasah,
    showToast
  } = useCBT();

  // Filters for Kartu Peserta
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-9a');

  // Filters for Berita Acara & Daftar Hadir
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedRoomName, setSelectedRoomName] = useState<string>(rooms[0]?.nomorRuang || 'LAB-01');
  const [sesiUjian, setSesiUjian] = useState<number>(1);
  const [namaPengawas, setNamaPengawas] = useState<string>(rooms[0]?.pengawasUtama || 'Drs. H. Ahmad Fauzi, M.Pd');
  const [catatanKejadian, setCatatanKejadian] = useState<string>('Pelaksanaan ujian berjalan tertib, aman, dan lancar tanpa kendala teknis jaringan LAN.');

  const targetStudentsForCards = students.filter(s => s.classId === selectedClassId);
  const activeExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const targetStudentsForRoom = students.filter(s => s.ruangId === selectedRoomName || !s.ruangId);
  const activeExamResults = examResults.filter(r => r.examId === activeExam?.id);

  const handlePrintKartu = () => {
    if (targetStudentsForCards.length === 0) {
      showToast('Tidak ada siswa pada rombel kelas terpilih!', 'error');
      return;
    }
    const currentClass = classes.find(c => c.id === selectedClassId);
    generateKartuPesertaPDF(targetStudentsForCards, madrasah, currentClass?.namaKelas || 'Kelas IX-A');
    showToast('PDF Kartu Peserta Ujian berhasil digenerate!', 'success');
  };

  const handlePrintBeritaAcara = () => {
    if (!activeExam) return;
    const roomObj = rooms.find(r => r.nomorRuang === selectedRoomName) || rooms[0];
    generateBeritaAcaraPDF(
      activeExam,
      roomObj,
      sesiUjian,
      targetStudentsForRoom.length,
      0,
      madrasah,
      namaPengawas,
      catatanKejadian
    );
    showToast('PDF Berita Acara Pelaksanaan Ujian berhasil digenerate!', 'success');
  };

  const handlePrintDaftarHadir = () => {
    if (!activeExam) return;
    const roomObj = rooms.find(r => r.nomorRuang === selectedRoomName) || rooms[0];
    generateDaftarHadirPDF(
      activeExam,
      roomObj,
      sesiUjian,
      targetStudentsForRoom,
      madrasah,
      namaPengawas
    );
    showToast('PDF Daftar Hadir Peserta Ujian berhasil digenerate!', 'success');
  };

  const handlePrintRekapNilai = () => {
    if (!activeExam) return;
    generateRekapNilaiPDF(activeExam, activeExamResults, madrasah);
    showToast('PDF Rekapitulasi Nilai Ujian berhasil digenerate!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl shadow-sm border border-[#222224] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31] rounded-2xl">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Pusat Cetak Dokumen & Administrasi CBT</h1>
            <p className="text-xs text-[#71717A]">
              Cetak instan kartu peserta ber-barcode, berita acara, daftar hadir pengawas, dan rekapitulasi nilai resmi.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 4 Administrative Document Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Kartu Peserta Ujian */}
        <div className="bg-[#161618] p-6 rounded-3xl border border-[#222224] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                Kartu Peserta
              </span>
            </div>

            <h2 className="text-base font-bold text-white">Kartu Peserta Ujian CBT</h2>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Cetak kartu peserta resmi lengkap dengan nomor peserta, NISN, username login CBT, dan barcode tanda tangan Kepala Madrasah.
            </p>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Pilih Rombel Kelas</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#121214] text-white border border-[#2D2D31] rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.namaKelas} ({students.filter(s => s.classId === c.id).length} Siswa)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handlePrintKartu}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate PDF Kartu ({targetStudentsForCards.length} Siswa)</span>
          </button>
        </div>

        {/* Card 2: Berita Acara Ujian */}
        <div className="bg-[#161618] p-6 rounded-3xl border border-[#222224] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-[#1C1C1F] text-blue-400 border border-[#2D2D31]">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/50 border border-blue-800/40 px-2 py-0.5 rounded">
                Berita Acara
              </span>
            </div>

            <h2 className="text-base font-bold text-white">Berita Acara Pelaksanaan Ujian</h2>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Dokumen berita acara pertanggungjawaban proktor dan pengawas ruang mengenai jumlah hadir dan catatan jalannya asesmen.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Mata Ujian</label>
                <select
                  value={selectedExamId}
                  onChange={e => setSelectedExamId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.namaUjian}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Ruang Ujian</label>
                <select
                  value={selectedRoomName}
                  onChange={e => setSelectedRoomName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.nomorRuang}>
                      {r.namaRuang} ({r.nomorRuang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-blue-400 mb-1">Sesi Pelaksanaan</label>
                <select
                  value={sesiUjian}
                  onChange={e => setSesiUjian(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-medium"
                >
                  {[1, 2, 3, 4].map(sNum => {
                    const cfg = sessionConfigs.find(c => c.nomorSesi === sNum);
                    return (
                      <option key={sNum} value={sNum}>
                        {cfg ? `${cfg.namaSesi} (${cfg.jamMulai}-${cfg.jamSelesai})` : `Sesi ${sNum}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Nama Pengawas</label>
                <input
                  type="text"
                  value={namaPengawas}
                  onChange={e => setNamaPengawas(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handlePrintBeritaAcara}
            className="w-full py-2.5 bg-[#1C1C1F] hover:bg-[#252529] text-white border border-[#2D2D31] text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate PDF Berita Acara</span>
          </button>
        </div>

        {/* Card 3: Daftar Hadir Peserta */}
        <div className="bg-[#161618] p-6 rounded-3xl border border-[#222224] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-[#1C1C1F] text-amber-400 border border-[#2D2D31]">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded">
                Daftar Hadir
              </span>
            </div>

            <h2 className="text-base font-bold text-white">Daftar Hadir & Absensi Peserta</h2>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Format lembar presensi resmi per ruang dengan kolom tanda tangan peserta ujian dan pengawas.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Mata Ujian</label>
                <select
                  value={selectedExamId}
                  onChange={e => setSelectedExamId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.namaUjian}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-amber-400 mb-1">Sesi Pelaksanaan</label>
                <select
                  value={sesiUjian}
                  onChange={e => setSesiUjian(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-medium"
                >
                  {[1, 2, 3, 4].map(sNum => {
                    const cfg = sessionConfigs.find(c => c.nomorSesi === sNum);
                    return (
                      <option key={sNum} value={sNum}>
                        {cfg ? `${cfg.namaSesi} (${cfg.jamMulai}-${cfg.jamSelesai})` : `Sesi ${sNum}`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handlePrintDaftarHadir}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate PDF Daftar Hadir</span>
          </button>
        </div>

        {/* Card 4: Rekapitulasi Nilai Resmi */}
        <div className="bg-[#161618] p-6 rounded-3xl border border-[#222224] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-[#1C1C1F] text-teal-400 border border-[#2D2D31]">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/50 border border-teal-800/40 px-2 py-0.5 rounded">
                Rekap Nilai
              </span>
            </div>

            <h2 className="text-base font-bold text-white">Rekapitulasi Nilai Resmi Madrasah</h2>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Laporan daftar nilai lengkap seluruh rombel peserta ujian, status KKM, dan tanda tangan Kepala Madrasah & Guru Pengampu.
            </p>

            <div className="pt-1 text-xs">
              <label className="block font-semibold text-[#A1A1AA] mb-1">Pilih Ujian</label>
              <select
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.namaUjian} ({e.subjectName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handlePrintRekapNilai}
            className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate PDF Rekap Nilai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
