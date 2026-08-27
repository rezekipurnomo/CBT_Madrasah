import React, { useState, useEffect, useMemo } from 'react';
import { useCBT } from '../context/CBTContext';
import { Question, StudentAnswer } from '../types';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  Sparkles,
  School,
  FileText,
  Maximize2,
  Minimize2,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  Grid,
  X,
  Smartphone
} from 'lucide-react';

interface ExamRunnerProps {
  examId: string;
  token: string;
  onExit: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({ examId, token, onExit }) => {
  const {
    currentUser,
    students,
    exams,
    questions,
    examSessions,
    saveStudentAnswer,
    toggleFlagAnswer,
    finishExamSession,
    showToast
  } = useCBT();

  const currentStudent = students.find(s => s.userId === currentUser?.id) || students[0];
  const exam = exams.find(e => e.id === examId);

  // Find or determine student's active session
  const sessionId = `sess-${currentStudent?.id}-${examId}`;
  const session = examSessions[sessionId] || {
    id: sessionId,
    examId: examId,
    studentId: currentStudent?.id || 'std-1',
    studentName: currentStudent?.nama || 'Siswa Peserta',
    nisn: currentStudent?.nisn || '0089123456',
    namaKelas: currentStudent?.namaKelas || 'Kelas 9A',
    roomName: currentStudent?.ruangId || 'LAB-01',
    status: 'sedang_mengerjakan',
    startedAt: '07:30:00',
    remainingSeconds: (exam?.durasiMenit || 60) * 60,
    totalQuestions: exam?.totalSoal || 10,
    totalAnswered: 0,
    answers: {},
    questionOrder: (exam?.questionIds && exam.questionIds.length > 0) ? exam.questionIds : (questions || []).map(q => q.id),
    ipAddress: '192.168.0.105',
    userAgent: 'CBT Mobile Secure'
  };

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem(`CBT_MADRASAH_CURR_Q_INDEX_${sessionId}`);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  useEffect(() => {
    localStorage.setItem(`CBT_MADRASAH_CURR_Q_INDEX_${sessionId}`, currentIndex.toString());
  }, [currentIndex, sessionId]);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmChecked, setConfirmChecked] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('Tersimpan di Server');
  const [saveTime, setSaveTime] = useState<string>(new Date().toLocaleTimeString('id-ID'));
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Local countdown
  const [timeLeft, setTimeLeft] = useState<number>(session?.remainingSeconds || 3600);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Koneksi Wi-Fi ke Server Terhubung Kembali!', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('PERINGATAN: Wi-Fi Terputus! Jawaban tersimpan di memori HP Anda.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  useEffect(() => {
    if (!session || session.status === 'selesai' || session.status === 'waktu_habis') {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExamSession(sessionId, true);
          showToast('Waktu ujian telah habis! Jawaban Anda otomatis dikumpulkan ke server.', 'warning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, session?.status, finishExamSession, showToast]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const sessionQuestions = useMemo(() => {
    if (!session || !Array.isArray(session.questionOrder)) return [];
    return session.questionOrder
      .map(qId => (questions || []).find(q => q.id === qId))
      .filter((q): q is Question => q !== undefined);
  }, [session, questions]);

  const currentQuestion: Question | undefined = sessionQuestions[currentIndex];
  const currentAnswer: StudentAnswer | undefined = currentQuestion ? session?.answers[currentQuestion.id] : undefined;

  const handleSelectPGOption = (optionId: string) => {
    if (!currentQuestion) return;
    saveStudentAnswer(sessionId, currentQuestion.id, optionId);
    setSaveStatus('Tersimpan');
    setSaveTime(new Date().toLocaleTimeString('id-ID'));
  };

  const handleTogglePGKompleks = (optionId: string) => {
    if (!currentQuestion) return;
    const prevArr: string[] = Array.isArray(currentAnswer?.jawaban) ? currentAnswer.jawaban : [];
    let updatedArr: string[];
    if (prevArr.includes(optionId)) {
      updatedArr = prevArr.filter(id => id !== optionId);
    } else {
      updatedArr = [...prevArr, optionId];
    }
    saveStudentAnswer(sessionId, currentQuestion.id, updatedArr);
    setSaveStatus('Tersimpan');
    setSaveTime(new Date().toLocaleTimeString('id-ID'));
  };

  const handleTrueFalseChange = (statementId: string, value: boolean) => {
    if (!currentQuestion) return;
    const prevObj = (typeof currentAnswer?.jawaban === 'object' && currentAnswer?.jawaban !== null) ? currentAnswer.jawaban : {};
    const updatedObj = {
      ...prevObj,
      [statementId]: value
    };
    saveStudentAnswer(sessionId, currentQuestion.id, updatedObj);
    setSaveStatus('Tersimpan');
    setSaveTime(new Date().toLocaleTimeString('id-ID'));
  };

  const handleMatchingChange = (premiseId: string, matchValue: string) => {
    if (!currentQuestion) return;
    const prevObj = (typeof currentAnswer?.jawaban === 'object' && currentAnswer?.jawaban !== null) ? currentAnswer.jawaban : {};
    const updatedObj = {
      ...prevObj,
      [premiseId]: matchValue
    };
    saveStudentAnswer(sessionId, currentQuestion.id, updatedObj);
    setSaveStatus('Tersimpan');
    setSaveTime(new Date().toLocaleTimeString('id-ID'));
  };

  const handleShortAnswerChange = (text: string) => {
    if (!currentQuestion) return;
    saveStudentAnswer(sessionId, currentQuestion.id, text);
    setSaveStatus('Tersimpan');
    setSaveTime(new Date().toLocaleTimeString('id-ID'));
  };

  const handleEssayChange = (text: string) => {
    if (!currentQuestion) return;
    saveStudentAnswer(sessionId, currentQuestion.id, text);
    setSaveStatus('Tersimpan');
    setSaveTime(new Date().toLocaleTimeString('id-ID'));
  };

  const handleFinishSubmit = () => {
    finishExamSession(sessionId, false);
    setShowConfirmModal(false);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    showToast('Alhamdulillah, ujian berhasil diselesaikan & dikumpulkan!', 'success');
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
        <div className="bg-[#161618] p-6 rounded-2xl border border-[#2D2D31] max-w-md text-center text-[#D1D1D1]">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Sesi Ujian Tidak Ditemukan</h2>
          <p className="text-sm text-[#71717A] mt-2">Sesi ini mungkin telah berakhir atau telah dipindahkan oleh pengawas.</p>
          <button
            onClick={onExit}
            className="mt-5 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = (Object.values(session.answers) as StudentAnswer[]).filter(a => a.isAnswered).length;
  const flaggedCount = (Object.values(session.answers) as StudentAnswer[]).filter(a => a.isFlagged).length;
  const unansweredCount = (session.totalQuestions || sessionQuestions.length) - answeredCount;

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg leading-relaxed';
      case 'xlarge':
        return 'text-xl leading-loose';
      default:
        return 'text-sm sm:text-base leading-normal';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#D1D1D1] flex flex-col select-none antialiased overscroll-contain">
      {/* Offline Alert Banner if Wi-Fi Drops on Phone */}
      {!isOnline && (
        <div className="bg-rose-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-center space-x-2 sticky top-0 z-50 animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>PERINGATAN WI-FI: Sambungan ke server terputus. Jawaban tetap tersimpan di HP. Segera hubungi proktor jika belum terhubung.</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0F0F11] text-[#E5E5E7] shadow-xl shadow-black/50 border-b border-[#222224]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Madrasah Logo & Exam Title */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#161618] border border-[#2D2D31] flex items-center justify-center font-bold text-emerald-400 shrink-0">
              <School className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-white leading-tight truncate max-w-[150px] sm:max-w-md">
                {exam.namaUjian}
              </h1>
              <div className="text-[10px] sm:text-[11px] text-[#71717A] flex items-center space-x-1.5 truncate">
                <span>{session.studentName}</span>
                <span>•</span>
                <span className="font-mono text-emerald-400">{session.nisn}</span>
              </div>
            </div>
          </div>

          {/* Center/Right: Timer countdown & Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Server-Synched Countdown Timer */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl font-mono font-bold border transition-all text-xs sm:text-sm ${
                timeLeft < 300
                  ? 'bg-rose-950/80 text-rose-400 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse'
                  : 'bg-[#161618] text-amber-400 border-[#2D2D31]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="tracking-wider">{formatTime(timeLeft)}</span>
            </div>

            {/* Mobile Question Grid Toggle Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#161618] hover:bg-[#1C1C1F] text-emerald-400 border border-emerald-500/40 transition-colors flex items-center gap-1 text-xs font-bold min-h-[38px]"
              title="Daftar Nomor Soal"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden xs:inline">Soal</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[#161618] hover:bg-[#1C1C1F] text-[#A1A1AA] hover:text-white border border-[#2D2D31] transition-colors hidden sm:block"
              title="Layar Penuh (Fullscreen)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Selesai Ujian Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 min-h-[38px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Selesai Ujian</span>
              <span className="sm:hidden">Selesai</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Column: Active Question Container (8 Cols) */}
        <section className="lg:col-span-8 flex flex-col bg-[#161618] rounded-2xl shadow-sm border border-[#222224] overflow-hidden">
          {/* Question Header Bar */}
          <div className="px-4 sm:px-5 py-3 bg-[#0F0F11] border-b border-[#222224] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-lg uppercase tracking-wider">
                No. {currentIndex + 1}
              </span>
              <span className="text-[11px] font-medium text-[#71717A] bg-[#1C1C1F] border border-[#2D2D31] px-2 py-0.5 rounded-md">
                Bobot: {currentQuestion?.bobot || 10}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#A1A1AA] bg-[#1C1C1F] border border-[#2D2D31] px-2 py-0.5 rounded-md uppercase truncate max-w-[120px] sm:max-w-none">
                {currentQuestion?.tipe.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Autosave Status */}
            <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-[#71717A] font-medium font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse" />
              <span>{saveStatus}</span>
            </div>
          </div>

          {/* Question Body Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
            {currentQuestion ? (
              <>
                {/* Question Text */}
                <div className={`text-[#E5E5E7] font-medium whitespace-pre-line ${getFontSizeClass()}`}>
                  {currentQuestion.pertanyaan}
                </div>

                {/* Math / Formula Rendering Box if available */}
                {currentQuestion.rumusMath && (
                  <div className="p-3 bg-[#0E0E10] border border-[#222224] rounded-xl font-mono text-xs sm:text-sm text-[#A1A1AA] overflow-x-auto shadow-inner">
                    <div className="text-[10px] uppercase font-bold text-[#52525B] mb-1">Rumus / Formula:</div>
                    <code className="text-emerald-400 font-semibold">{currentQuestion.rumusMath}</code>
                  </div>
                )}

                {/* Media Image if available */}
                {currentQuestion.mediaUrl && currentQuestion.mediaType === 'image' && (
                  <div className="my-3 rounded-xl overflow-hidden border border-[#2D2D31] max-w-md bg-[#0E0E10]">
                    <img
                      src={currentQuestion.mediaUrl}
                      alt="Gambar Soal"
                      referrerPolicy="no-referrer"
                      className="w-full object-cover"
                    />
                  </div>
                )}

                <hr className="border-[#222224] my-3 sm:my-4" />

                {/* Question Interactive Options based on Type */}

                {/* 1. Pilihan Ganda (Single Choice) */}
                {currentQuestion.tipe === 'pilihan_ganda' && (
                  <div className="space-y-2.5">
                    {currentQuestion.options?.map(opt => {
                      const isSelected = currentAnswer?.jawaban === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectPGOption(opt.id)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start space-x-3 min-h-[50px] active:scale-[0.99] ${
                            isSelected
                              ? 'bg-[#1C1C1F] border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.15)] text-white'
                              : 'bg-[#121214] hover:bg-[#1C1C1F] border-[#222224] text-[#D1D1D1]'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 border transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                : 'bg-[#1C1C1F] text-[#A1A1AA] border-[#2D2D31]'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className={`pt-0.5 sm:pt-1 ${getFontSizeClass()}`}>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Pilihan Ganda Kompleks (Multi Choice Checkboxes) */}
                {currentQuestion.tipe === 'pilihan_ganda_kompleks' && (
                  <div className="space-y-2.5">
                    <div className="text-xs text-[#71717A] italic mb-1">
                      * Pilih satu atau lebih jawaban yang menurut Anda benar.
                    </div>
                    {currentQuestion.options?.map(opt => {
                      const checkedArr: string[] = Array.isArray(currentAnswer?.jawaban) ? currentAnswer.jawaban : [];
                      const isChecked = checkedArr.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleTogglePGKompleks(opt.id)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start space-x-3 min-h-[50px] active:scale-[0.99] ${
                            isChecked
                              ? 'bg-[#1C1C1F] border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.15)] text-white'
                              : 'bg-[#121214] hover:bg-[#1C1C1F] border-[#222224] text-[#D1D1D1]'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${
                              isChecked
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                : 'bg-[#1C1C1F] text-[#A1A1AA] border-[#2D2D31]'
                            }`}
                          >
                            {isChecked ? <Check className="w-4 h-4" /> : opt.id}
                          </div>
                          <span className={`pt-0.5 ${getFontSizeClass()}`}>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. Benar / Salah Statement Table */}
                {currentQuestion.tipe === 'benar_salah' && (
                  <div className="space-y-3">
                    <div className="text-xs text-[#71717A] italic mb-2">
                      * Tentukan kebenaran (Benar atau Salah) untuk setiap butir pernyataan di bawah ini:
                    </div>
                    <div className="border border-[#222224] rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-[#0F0F11] text-[#71717A] font-semibold border-b border-[#222224]">
                          <tr>
                            <th className="p-2.5 sm:p-3 w-8 text-center">No</th>
                            <th className="p-2.5 sm:p-3">Pernyataan</th>
                            <th className="p-2.5 sm:p-3 w-20 sm:w-24 text-center text-emerald-400">BENAR</th>
                            <th className="p-2.5 sm:p-3 w-20 sm:w-24 text-center text-rose-400">SALAH</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222224]">
                          {currentQuestion.trueFalseStatements?.map((stmt, idx) => {
                            const val = currentAnswer?.jawaban?.[stmt.id];
                            return (
                              <tr key={stmt.id} className="hover:bg-[#1C1C1F] transition-colors">
                                <td className="p-2.5 sm:p-3 text-center font-bold text-[#52525B]">{idx + 1}</td>
                                <td className="p-2.5 sm:p-3 text-[#E5E5E7]">{stmt.statement}</td>
                                <td className="p-2.5 sm:p-3 text-center">
                                  <input
                                    type="radio"
                                    name={`tf-${stmt.id}`}
                                    checked={val === true}
                                    onChange={() => handleTrueFalseChange(stmt.id, true)}
                                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                                  />
                                </td>
                                <td className="p-2.5 sm:p-3 text-center">
                                  <input
                                    type="radio"
                                    name={`tf-${stmt.id}`}
                                    checked={val === false}
                                    onChange={() => handleTrueFalseChange(stmt.id, false)}
                                    className="w-5 h-5 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-500"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Menjodohkan (Matching Premise to Target Match) */}
                {currentQuestion.tipe === 'menjodohkan' && (
                  <div className="space-y-3">
                    <div className="text-xs text-[#71717A] italic mb-2">
                      * Pilih pasangan rumus / definisi yang tepat pada setiap premis:
                    </div>
                    <div className="space-y-2.5">
                      {currentQuestion.matchingPairs?.map((pair, idx) => {
                        const allMatchOptions = currentQuestion.matchingPairs?.map(p => p.match) || [];
                        const selectedVal = currentAnswer?.jawaban?.[pair.id] || '';
                        return (
                          <div
                            key={pair.id}
                            className="p-3 sm:p-3.5 bg-[#121214] border border-[#222224] rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-center"
                          >
                            <div className="sm:col-span-6 font-semibold text-[#E5E5E7] text-xs sm:text-sm">
                              {idx + 1}. {pair.premise}
                            </div>
                            <div className="sm:col-span-6">
                              <select
                                value={selectedVal}
                                onChange={e => handleMatchingChange(pair.id, e.target.value)}
                                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#161618] border border-[#2D2D31] text-[#E5E5E7] rounded-lg focus:border-emerald-500 focus:outline-none"
                              >
                                <option value="">-- Pilih Pasangan Jawaban --</option>
                                {allMatchOptions.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Isian Singkat */}
                {currentQuestion.tipe === 'isian_singkat' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#A1A1AA]">
                      Tuliskan Jawaban Singkat Anda:
                    </label>
                    <input
                      type="text"
                      value={currentAnswer?.jawaban || ''}
                      onChange={e => handleShortAnswerChange(e.target.value)}
                      placeholder="Ketik jawaban di sini..."
                      className="w-full px-4 py-3 border border-[#2D2D31] bg-[#121214] rounded-xl text-base font-semibold text-white focus:border-emerald-500 focus:outline-none focus:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    />
                  </div>
                )}

                {/* 6. Essay */}
                {currentQuestion.tipe === 'essay' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#A1A1AA] flex items-center justify-between">
                      <span>Uraian / Jawaban Essay Lengkap:</span>
                      <span className="text-[11px] text-[#71717A] font-mono">
                        {String(currentAnswer?.jawaban || '').length} Karakter
                      </span>
                    </label>
                    <textarea
                      rows={6}
                      value={currentAnswer?.jawaban || ''}
                      onChange={e => handleEssayChange(e.target.value)}
                      placeholder="Tuliskan uraian langkah perhitungan atau penjelasan lengkap Anda di sini..."
                      className="w-full p-3.5 sm:p-4 border border-[#2D2D31] bg-[#121214] rounded-xl text-sm text-white focus:border-emerald-500 focus:outline-none leading-relaxed"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-[#52525B]">Pilih nomor soal dari daftar di sebelah kanan.</div>
            )}
          </div>

          {/* Bottom Navigation Controls Bar */}
          <div className="p-3 sm:p-4 bg-[#0F0F11] border-t border-[#222224] flex items-center justify-between gap-2">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                currentIndex === 0
                  ? 'bg-[#161618] text-[#52525B] cursor-not-allowed border border-[#222224]'
                  : 'bg-[#1C1C1F] hover:bg-[#252529] text-[#D1D1D1] border border-[#2D2D31] shadow-xs active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Sebelumnya</span>
            </button>

            {/* Ragu-ragu Checkbox Toggle */}
            {currentQuestion && (
              <button
                onClick={() => toggleFlagAnswer(sessionId, currentQuestion.id)}
                className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all min-h-[44px] ${
                  currentAnswer?.isFlagged
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                    : 'bg-[#161618] hover:bg-[#1C1C1F] text-[#A1A1AA] border-[#2D2D31]'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{currentAnswer?.isFlagged ? 'Ragu ✓' : 'Ragu-ragu'}</span>
              </button>
            )}

            {/* Next Button */}
            <button
              onClick={() => setCurrentIndex(prev => Math.min(sessionQuestions.length - 1, prev + 1))}
              disabled={currentIndex === sessionQuestions.length - 1}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                currentIndex === sessionQuestions.length - 1
                  ? 'bg-[#161618] text-[#52525B] cursor-not-allowed border border-[#222224]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95'
              }`}
            >
              <span className="hidden xs:inline">Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Right Column: Question Number Palette Grid & Font Controls (Desktop 4 Cols) */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col space-y-4">
          {/* Font Size & Tool Box */}
          <div className="bg-[#161618] p-4 rounded-2xl shadow-sm border border-[#222224] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#A1A1AA]">Ukuran Teks:</span>
            <div className="flex items-center space-x-1 bg-[#121214] p-1 rounded-xl border border-[#222224]">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1 rounded-lg font-bold ${fontSize === 'normal' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A]'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 rounded-lg font-bold text-sm ${fontSize === 'large' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A]'}`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2.5 py-1 rounded-lg font-bold text-base ${fontSize === 'xlarge' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A]'}`}
              >
                A++
              </button>
            </div>
          </div>

          {/* Question Palette Card */}
          <div className="bg-[#161618] p-4 sm:p-5 rounded-2xl shadow-sm border border-[#222224] flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <h2 className="font-bold text-white text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="uppercase tracking-wider">Nomor Soal</span>
              </h2>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full font-mono">
                {answeredCount} / {session.totalQuestions || sessionQuestions.length} Dijawab
              </span>
            </div>

            {/* Grid of Numbers */}
            <div className="grid grid-cols-5 gap-2.5 my-4 overflow-y-auto max-h-[340px] pr-1">
              {sessionQuestions.map((q, idx) => {
                const ans = session.answers[q.id];
                const isCurrent = idx === currentIndex;
                const isAnswered = ans?.isAnswered;
                const isFlagged = ans?.isFlagged;

                let bgClass = 'bg-[#121214] text-[#A1A1AA] hover:bg-[#1C1C1F] border-[#222224]';
                if (isFlagged) {
                  bgClass = 'bg-amber-500/20 text-amber-400 font-bold border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600/20 text-emerald-400 font-bold border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-11 rounded-xl text-xs font-bold border flex flex-col items-center justify-center transition-all ${bgClass} ${
                      isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#161618] scale-105 z-10' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {ans?.jawaban && typeof ans.jawaban === 'string' && ans.jawaban.length <= 2 && (
                      <span className="text-[9px] opacity-80">{ans.jawaban}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend / Keterangan Warna */}
            <div className="pt-3 border-t border-[#222224] space-y-1.5 text-[11px] text-[#A1A1AA] mt-auto">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-600/30 border border-emerald-500/60" />
                <span>Sudah Dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-500/30 border border-amber-500/60" />
                <span>Ragu-ragu ({flaggedCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#121214] border border-[#222224]" />
                <span>Belum Dijawab ({unansweredCount})</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* MOBILE DRAWER: Question Palette (Bottom Sheet on Smartphones) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-150">
          <div className="bg-[#161618] border-t border-[#2D2D31] rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Daftar Nomor Soal</h3>
              </div>

              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-[#1C1C1F] text-[#A1A1AA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Font Size selector */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#A1A1AA]">Ukuran Teks:</span>
              <div className="flex items-center space-x-1 bg-[#121214] p-1 rounded-xl border border-[#222224]">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-3 py-1 rounded-lg font-bold ${fontSize === 'normal' ? 'bg-emerald-600 text-white' : 'text-[#71717A]'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-3 py-1 rounded-lg font-bold ${fontSize === 'large' ? 'bg-emerald-600 text-white' : 'text-[#71717A]'}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-3 py-1 rounded-lg font-bold ${fontSize === 'xlarge' ? 'bg-emerald-600 text-white' : 'text-[#71717A]'}`}
                >
                  A++
                </button>
              </div>
            </div>

            {/* Mobile Grid */}
            <div className="grid grid-cols-5 gap-2.5 py-2">
              {sessionQuestions.map((q, idx) => {
                const ans = session.answers[q.id];
                const isCurrent = idx === currentIndex;
                const isAnswered = ans?.isAnswered;
                const isFlagged = ans?.isFlagged;

                let bgClass = 'bg-[#121214] text-[#A1A1AA] border-[#222224]';
                if (isFlagged) {
                  bgClass = 'bg-amber-500/20 text-amber-400 font-bold border-amber-500/50';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600/20 text-emerald-400 font-bold border-emerald-500/50';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`h-12 rounded-xl text-xs font-bold border flex flex-col items-center justify-center ${bgClass} ${
                      isCurrent ? 'ring-2 ring-emerald-400 scale-105 z-10' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {ans?.jawaban && typeof ans.jawaban === 'string' && ans.jawaban.length <= 2 && (
                      <span className="text-[9px] opacity-80">{ans.jawaban}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Legends */}
            <div className="pt-2 border-t border-[#222224] flex items-center justify-around text-[10px] text-[#A1A1AA]">
              <span className="text-emerald-400">● {answeredCount} Dijawab</span>
              <span className="text-amber-400">● {flaggedCount} Ragu</span>
              <span className="text-[#71717A]">● {unansweredCount} Kosong</span>
            </div>

            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
            >
              Tutup & Lanjutkan Soal No. {currentIndex + 1}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Selesai Ujian */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#161618] rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-[#2D2D31] animate-in fade-in zoom-in-95 duration-150 text-[#D1D1D1]">
            <div className="flex items-center space-x-3 text-emerald-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#1C1C1F] border border-emerald-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">Konfirmasi Selesai Ujian</h3>
                <p className="text-xs text-[#71717A]">Periksa kembali rekapitulasi pengerjaan Anda</p>
              </div>
            </div>

            {/* Summary Statistics Card */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-[#121214] rounded-xl border border-[#222224] my-4 text-center">
              <div className="p-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">{answeredCount}</div>
                <div className="text-[10px] font-semibold text-emerald-400/80">Sudah Dijawab</div>
              </div>
              <div className="p-2 bg-amber-950/40 border border-amber-800/40 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-amber-400 font-mono">{flaggedCount}</div>
                <div className="text-[10px] font-semibold text-amber-400/80">Ragu-ragu</div>
              </div>
              <div className="p-2 bg-rose-950/40 border border-rose-800/40 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-rose-400 font-mono">{unansweredCount}</div>
                <div className="text-[10px] font-semibold text-rose-400/80">Belum Dijawab</div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-start space-x-2 text-xs text-amber-300 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Peringatan: Masih terdapat <strong>{unansweredCount} butir soal yang belum Anda jawab</strong>. Anda disarankan memeriksa kembali sebelum mengumpulkan.
                </span>
              </div>
            )}

            {/* Integrity Checkbox */}
            <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-[#121214] border border-[#222224] text-xs text-[#A1A1AA] cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={e => setConfirmChecked(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 mt-0.5 accent-emerald-500"
              />
              <span>
                Saya telah memeriksa seluruh jawaban saya dan yakin ingin mengakhiri sesi ujian CBT ini secara final.
              </span>
            </label>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl transition-colors border border-transparent hover:border-[#2D2D31]"
              >
                Batal, Kembali
              </button>
              <button
                disabled={!confirmChecked}
                onClick={handleFinishSubmit}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-md transition-all ${
                  confirmChecked
                    ? 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-[#1C1C1F] cursor-not-allowed text-[#52525B] border border-[#222224]'
                }`}
              >
                Ya, Kumpulkan Jawaban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
