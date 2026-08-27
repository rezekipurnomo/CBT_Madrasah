import React, { useState } from 'react';
import { useCBT } from '../context/CBTContext';
import { ExamResult, Question } from '../types';
import { calculateItemAnalysis } from '../utils/analysisHelper';
import { exportResultsToExcel } from '../utils/excelHelper';
import { generateRekapNilaiPDF } from '../utils/pdfGenerator';
import {
  BarChart3,
  Award,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Search,
  Check,
  Edit,
  Sparkles,
  TrendingUp,
  Download,
  Filter,
  X
} from 'lucide-react';

export const GradingAndAnalysis: React.FC = () => {
  const {
    exams,
    examResults,
    questions,
    students,
    madrasah,
    updateEssayScore,
    showToast
  } = useCBT();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'rekap' | 'essay' | 'analisis'>('rekap');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Result for Essay Correction
  const [selectedResultForGrading, setSelectedResultForGrading] = useState<ExamResult | null>(null);

  const activeExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const examResultList = examResults.filter(r => r.examId === activeExam?.id);
  const examQuestions = questions.filter(q => q.bankId === activeExam?.bankId);

  // Psychometric Analysis calculation
  const itemAnalyses = calculateItemAnalysis(examQuestions, examResultList);

  // Stats calculation
  const totalSubmissions = examResultList.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(examResultList.reduce((acc, r) => acc + r.totalScore, 0) / totalSubmissions)
    : 0;
  const highestScore = totalSubmissions > 0
    ? Math.max(...examResultList.map(r => r.totalScore))
    : 0;
  const lowestScore = totalSubmissions > 0
    ? Math.min(...examResultList.map(r => r.totalScore))
    : 0;
  const passedCount = examResultList.filter(r => r.statusLulus === 'LULUS').length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;

  // Filtered results
  const filteredResults = examResultList.filter(r => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.nisn.includes(q) ||
        r.namaKelas.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Essay questions in active exam
  const essayQuestions = examQuestions.filter(q => q.tipe === 'essay');

  const handleExportPDF = () => {
    if (!activeExam) return;
    generateRekapNilaiPDF(activeExam, examResultList, madrasah);
    showToast('Rekap Nilai PDF berhasil di-generate!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl shadow-sm border border-[#222224] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31] rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Rekap Nilai & Analisis Butir Soal</h1>
            <p className="text-xs text-[#71717A]">
              Koreksi essay manual, analisis daya pembeda (D), tingkat kesukaran (P), dan cetak rekapitulasi nilai.
            </p>
          </div>
        </div>

        {/* Exam Picker */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-[#121214] text-white border border-[#2D2D31] rounded-xl focus:border-emerald-500 focus:outline-none"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>
                {e.namaUjian} ({e.subjectName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#161618] p-4 rounded-2xl border border-[#222224] shadow-xs">
          <div className="text-xs text-[#71717A] font-medium">Peserta Selesai</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{totalSubmissions} Siswa</div>
          <div className="text-[11px] text-[#52525B] mt-0.5">Terkoreksi otomatis</div>
        </div>
        <div className="bg-[#161618] p-4 rounded-2xl border border-[#222224] shadow-xs">
          <div className="text-xs text-[#71717A] font-medium">Rata-Rata Nilai</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{avgScore}</div>
          <div className="text-[11px] text-[#52525B] mt-0.5">KKM: {activeExam?.nilaiMinimum || 75}</div>
        </div>
        <div className="bg-[#161618] p-4 rounded-2xl border border-[#222224] shadow-xs">
          <div className="text-xs text-[#71717A] font-medium">Nilai Tertinggi</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">{highestScore}</div>
          <div className="text-[11px] text-[#52525B] mt-0.5">Skor maksimal</div>
        </div>
        <div className="bg-[#161618] p-4 rounded-2xl border border-[#222224] shadow-xs">
          <div className="text-xs text-[#71717A] font-medium">Nilai Terendah</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{lowestScore}</div>
          <div className="text-[11px] text-[#52525B] mt-0.5">Skor minimal</div>
        </div>
        <div className="bg-[#161618] p-4 rounded-2xl border border-[#222224] shadow-xs">
          <div className="text-xs text-[#71717A] font-medium">Ketuntasan (KKM)</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{passRate}%</div>
          <div className="text-[11px] text-emerald-400/80 font-bold mt-0.5">{passedCount} Siswa Lulus</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#222224] gap-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('rekap')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'rekap'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            Daftar Rekap Nilai Siswa
          </button>
          <button
            onClick={() => setActiveTab('essay')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'essay'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            <span>Koreksi Manual Essay</span>
            {essayQuestions.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-950/50 text-amber-400 border border-amber-800/40 text-[10px] rounded-full">
                {essayQuestions.length} Soal
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analisis')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'analisis'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            Analisis Psikometrik Soal (Daya Pembeda & Kesukaran)
          </button>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center space-x-2 pb-2">
          <button
            onClick={() => exportResultsToExcel(examResultList, activeExam?.namaUjian || 'Ujian')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#252529] text-[#D1D1D1] border border-[#2D2D31] text-xs font-semibold rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cetak PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Rekap Nilai Table */}
      {activeTab === 'rekap' && (
        <div className="bg-[#161618] p-5 rounded-2xl shadow-sm border border-[#222224] space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari siswa, NISN, atau kelas..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#121214] border border-[#222224] rounded-xl text-white placeholder-[#52525B] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="border border-[#222224] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F0F11] text-[#71717A] font-bold border-b border-[#222224]">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Nama Siswa / NISN</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3 text-center">Benar / Salah</th>
                  <th className="p-3 text-center">Skor PG</th>
                  <th className="p-3 text-center">Skor Essay</th>
                  <th className="p-3 text-center">Nilai Akhir</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222224]">
                {filteredResults.length > 0 ? (
                  filteredResults
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((r, idx) => (
                      <tr key={r.id} className="hover:bg-[#1C1C1F] transition-colors">
                        <td className="p-3 font-bold text-[#52525B]">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{r.studentName}</div>
                          <div className="text-[10px] text-[#71717A] font-mono">NISN: {r.nisn}</div>
                        </td>
                        <td className="p-3 font-semibold text-[#D1D1D1]">{r.namaKelas}</td>
                        <td className="p-3 text-center font-mono">
                          <span className="text-emerald-400 font-bold">{r.correctAnswers}B</span> /{' '}
                          <span className="text-rose-400 font-bold">{r.wrongAnswers}S</span>
                        </td>
                        <td className="p-3 text-center font-mono font-semibold text-[#A1A1AA]">{r.pgScore}</td>
                        <td className="p-3 text-center font-mono font-semibold text-[#A1A1AA]">{r.essayScore}</td>
                        <td className="p-3 text-center font-mono font-extrabold text-sm text-emerald-400">
                          {r.totalScore}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.statusLulus === 'LULUS'
                                ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                                : 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                            }`}
                          >
                            {r.statusLulus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedResultForGrading(r)}
                            className="p-1.5 text-[#71717A] hover:text-emerald-400 hover:bg-[#1C1C1F] rounded-lg transition-colors"
                            title="Koreksi Essay / Periksa Jawaban"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#52525B]">
                      Belum ada rekap hasil ujian untuk mata pelajaran ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Essay Grading */}
      {activeTab === 'essay' && (
        <div className="space-y-4">
          <div className="bg-[#161618] p-5 rounded-2xl shadow-sm border border-[#222224]">
            <h2 className="text-base font-bold text-white">Penilaian Uraian / Essay Manual Guru</h2>
            <p className="text-xs text-[#71717A]">
              Pilih lembar jawaban siswa di bawah untuk memberikan skor essay berdasarkan rubrik penilaian.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Students list */}
            <div className="bg-[#161618] p-4 rounded-2xl border border-[#222224] shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-white pb-2 border-b border-[#222224]">Daftar Lembar Jawaban Siswa</h3>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {examResultList.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResultForGrading(r)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                      selectedResultForGrading?.id === r.id
                        ? 'bg-[#1C1C1F] border-emerald-500/80 font-bold text-emerald-400'
                        : 'bg-[#121214] hover:bg-[#1C1C1F] border-[#222224] text-[#A1A1AA]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white">{r.studentName}</span>
                      <span className="font-mono text-emerald-400">Skor: {r.totalScore}</span>
                    </div>
                    <div className="text-[10px] text-[#71717A] mt-0.5">{r.namaKelas} | NISN: {r.nisn}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grading Pane */}
            <div className="md:col-span-2 bg-[#161618] p-5 rounded-2xl border border-[#222224] shadow-xs space-y-4">
              {selectedResultForGrading ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        Koreksi Essay: {selectedResultForGrading.studentName}
                      </h3>
                      <p className="text-xs text-[#71717A]">
                        Kelas: {selectedResultForGrading.namaKelas} | Skor Saat Ini: {selectedResultForGrading.totalScore}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {essayQuestions.length > 0 ? (
                      essayQuestions.map((eq, qIdx) => {
                        const existingScore =
                          selectedResultForGrading.essayScores?.[eq.id] ?? 0;

                        return (
                          <div key={eq.id} className="p-4 bg-[#121214] border border-[#222224] rounded-2xl space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-bold text-xs rounded">
                                Soal Essay #{qIdx + 1}
                              </span>
                              <span className="text-xs font-semibold text-[#71717A]">
                                Bobot Maks: {eq.bobot} Poin
                              </span>
                            </div>

                            <div className="text-xs text-[#E5E5E7] font-medium whitespace-pre-line">
                              {eq.pertanyaan}
                            </div>

                            {eq.rubrikEssay && (
                              <div className="p-2.5 bg-[#0E0E10] border border-amber-800/40 rounded-xl text-xs text-amber-400">
                                <strong>Rubrik Penilaian:</strong> {eq.rubrikEssay}
                              </div>
                            )}

                            <div className="p-3 bg-[#0E0E10] border border-[#2D2D31] rounded-xl">
                              <div className="text-[10px] text-[#71717A] font-bold uppercase mb-1">
                                Jawaban Siswa:
                              </div>
                              <div className="text-xs text-[#E5E5E7] whitespace-pre-line">
                                "Suhu mempengaruhi energi kinetik partikel zat terlarut sehingga kelarutan meningkat seiring naiknya temperatur."
                              </div>
                            </div>

                            {/* Scoring Input */}
                            <div className="flex items-center space-x-3 pt-2">
                              <label className="text-xs font-bold text-white">Beri Nilai Essay:</label>
                              <input
                                type="number"
                                min={0}
                                max={eq.bobot}
                                defaultValue={existingScore}
                                onBlur={e => {
                                  const val = Number(e.target.value);
                                  updateEssayScore(selectedResultForGrading.id, eq.id, val);
                                }}
                                className="w-20 px-3 py-1.5 border border-emerald-500 rounded-xl text-xs font-bold text-center bg-[#161618] text-white"
                              />
                              <span className="text-[11px] text-[#71717A]">/ {eq.bobot} Poin</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-[#52525B]">
                        Tidak ada butir soal bertipe essay pada bank soal ujian ini.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-[#52525B]">
                  Pilih salah satu siswa di kolom kiri untuk melakukan koreksi jawaban essay.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Item Analysis & Psychometrics */}
      {activeTab === 'analisis' && (
        <div className="bg-[#161618] p-5 rounded-2xl shadow-sm border border-[#222224] space-y-4">
          <div className="pb-3 border-b border-[#222224]">
            <h2 className="text-base font-bold text-white">Analisis Kualitas & Psikometrik Butir Soal</h2>
            <p className="text-xs text-[#71717A]">
              Evaluasi validitas soal menggunakan Indeks Kesukaran (P) dan Indeks Daya Pembeda (D) antara kelompok atas dan bawah.
            </p>
          </div>

          <div className="border border-[#222224] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F0F11] text-[#71717A] font-bold border-b border-[#222224]">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Tipe Soal</th>
                  <th className="p-3">Ringkasan Soal</th>
                  <th className="p-3 text-center">Indeks Kesukaran (P)</th>
                  <th className="p-3 text-center">Status Kesukaran</th>
                  <th className="p-3 text-center">Daya Pembeda (D)</th>
                  <th className="p-3 text-center">Status Butir Soal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222224]">
                {itemAnalyses.map((ia, idx) => (
                  <tr key={ia.questionId} className="hover:bg-[#1C1C1F] transition-colors">
                    <td className="p-3 font-bold text-[#52525B]">Soal #{idx + 1}</td>
                    <td className="p-3 uppercase font-semibold text-emerald-400">
                      {ia.tipe.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3 max-w-xs truncate text-[#E5E5E7] font-medium">
                      {ia.pertanyaan}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-white">
                      {ia.difficultyIndex.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ia.difficultyLabel === 'Mudah' || ia.difficultyLabel === 'Sangat Mudah'
                            ? 'bg-blue-950/50 text-blue-400 border border-blue-800/40'
                            : ia.difficultyLabel === 'Sedang'
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {ia.difficultyLabel}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-white">
                      {ia.discriminationIndex.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ia.discriminationLabel === 'Sangat Baik' || ia.discriminationLabel === 'Baik'
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                            : ia.discriminationLabel === 'Cukup'
                            ? 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
                            : 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                        }`}
                      >
                        {ia.discriminationLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
