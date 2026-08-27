import React, { useState } from 'react';
import { useCBT } from '../context/CBTContext';
import {
  QuestionBank,
  Question,
  QuestionType,
  QuestionOption,
  MatchingPair,
  TrueFalseStatement
} from '../types';
import {
  exportQuestionsToExcel,
  downloadQuestionTemplate,
  parseExcelFile
} from '../utils/excelHelper';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Copy,
  FileSpreadsheet,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  Search,
  Filter,
  PlusCircle,
  X
} from 'lucide-react';

export const QuestionBankManager: React.FC = () => {
  const {
    questionBanks,
    questions,
    subjects,
    classes,
    academicYears,
    semesters,
    currentUser,
    addQuestionBank,
    updateQuestionBank,
    deleteQuestionBank,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    importQuestionsList,
    showToast
  } = useCBT();

  const [selectedBankId, setSelectedBankId] = useState<string>(() => {
    const saved = localStorage.getItem('CBT_MADRASAH_SELECTED_QBANK_ID');
    return (saved && questionBanks.some(b => b.id === saved)) ? saved : (questionBanks[0]?.id || '');
  });

  React.useEffect(() => {
    if (selectedBankId) {
      localStorage.setItem('CBT_MADRASAH_SELECTED_QBANK_ID', selectedBankId);
    }
  }, [selectedBankId]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  // Modals state
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [editingBank, setEditingBank] = useState<QuestionBank | null>(null);

  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Bank Form State
  const [bankKode, setBankKode] = useState<string>('');
  const [bankNama, setBankNama] = useState<string>('');
  const [bankSubjectId, setBankSubjectId] = useState<string>(subjects[0]?.id || '');
  const [bankTingkat, setBankTingkat] = useState<string>('9');
  const [bankMateri, setBankMateri] = useState<string>('');

  // Question Form State
  const [qTipe, setQTipe] = useState<QuestionType>('pilihan_ganda');
  const [qPertanyaan, setQPertanyaan] = useState<string>('');
  const [qRumusMath, setQRumusMath] = useState<string>('');
  const [qBobot, setQBobot] = useState<number>(10);
  const [qDifficulty, setQDifficulty] = useState<'Mudah' | 'Sedang' | 'Sukar'>('Sedang');
  const [qMateri, setQMateri] = useState<string>('');
  const [qKompetensi, setQKompetensi] = useState<string>('');
  const [qMediaUrl, setQMediaUrl] = useState<string>('');

  // Options state for PG / PG Kompleks
  const [qOptions, setQOptions] = useState<QuestionOption[]>([
    { id: 'A', text: '', isCorrect: true },
    { id: 'B', text: '', isCorrect: false },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false }
  ]);

  // True/False state
  const [qTFStatements, setQTFStatements] = useState<TrueFalseStatement[]>([
    { id: 'stmt-1', statement: '', correctValue: true },
    { id: 'stmt-2', statement: '', correctValue: false }
  ]);

  // Matching Pairs
  const [qMatchingPairs, setQMatchingPairs] = useState<MatchingPair[]>([
    { id: 'm-1', premise: '', match: '' },
    { id: 'm-2', premise: '', match: '' }
  ]);

  // Short Answer & Essay
  const [qShortAnswers, setQShortAnswers] = useState<string>('');
  const [qRubrikEssay, setQRubrikEssay] = useState<string>('');

  const activeBank = questionBanks.find(b => b.id === selectedBankId) || questionBanks[0];
  const bankQuestions = questions.filter(q => q.bankId === activeBank?.id);

  const filteredQuestions = bankQuestions.filter(q => {
    if (filterType !== 'all' && q.tipe !== filterType) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.pertanyaan.toLowerCase().includes(query) ||
        (q.materi && q.materi.toLowerCase().includes(query)) ||
        (q.kompetensi && q.kompetensi.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Open Bank Modal
  const openBankModal = (bank?: QuestionBank) => {
    if (bank) {
      setEditingBank(bank);
      setBankKode(bank.kodeBank);
      setBankNama(bank.namaBank);
      setBankSubjectId(bank.subjectId);
      setBankTingkat(bank.tingkat);
      setBankMateri(bank.materi);
    } else {
      setEditingBank(null);
      setBankKode(`BNK-${Date.now().toString().slice(-4)}`);
      setBankNama('');
      setBankSubjectId(subjects[0]?.id || '');
      setBankTingkat('9');
      setBankMateri('');
    }
    setShowBankModal(true);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankNama.trim()) {
      showToast('Nama bank soal tidak boleh kosong!', 'error');
      return;
    }
    const subj = subjects.find(s => s.id === bankSubjectId);
    const bankObj: QuestionBank = {
      id: editingBank ? editingBank.id : 'bank-' + Date.now(),
      kodeBank: bankKode,
      namaBank: bankNama,
      subjectId: bankSubjectId,
      subjectName: subj?.namaMataPelajaran || 'Mata Pelajaran',
      tingkat: bankTingkat,
      jenjang: 'MTs',
      academicYearId: academicYears[0]?.id || 'ta-2025',
      semesterId: semesters[0]?.id || 'sem-genap',
      guruId: currentUser?.id || 'usr-teacher-1',
      guruName: currentUser?.nama || 'Guru Mapel',
      totalSoal: editingBank ? editingBank.totalSoal : 0,
      totalBobot: editingBank ? editingBank.totalBobot : 100,
      materi: bankMateri,
      createdAt: editingBank ? editingBank.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingBank) {
      updateQuestionBank(bankObj);
    } else {
      addQuestionBank(bankObj);
      setSelectedBankId(bankObj.id);
    }
    setShowBankModal(false);
  };

  // Open Question Modal
  const openQuestionModal = (q?: Question) => {
    if (q) {
      setEditingQuestion(q);
      setQTipe(q.tipe);
      setQPertanyaan(q.pertanyaan);
      setQRumusMath(q.rumusMath || '');
      setQBobot(q.bobot);
      setQDifficulty(q.tingkatKesulitan);
      setQMateri(q.materi || '');
      setQKompetensi(q.kompetensi || '');
      setQMediaUrl(q.mediaUrl || '');

      if (q.options) setQOptions(q.options);
      if (q.trueFalseStatements) setQTFStatements(q.trueFalseStatements);
      if (q.matchingPairs) setQMatchingPairs(q.matchingPairs);
      if (q.kunciJawabanSingkat) setQShortAnswers(q.kunciJawabanSingkat.join(', '));
      if (q.rubrikEssay) setQRubrikEssay(q.rubrikEssay);
    } else {
      setEditingQuestion(null);
      setQTipe('pilihan_ganda');
      setQPertanyaan('');
      setQRumusMath('');
      setQBobot(10);
      setQDifficulty('Sedang');
      setQMateri(activeBank?.materi || '');
      setQKompetensi('');
      setQMediaUrl('');

      setQOptions([
        { id: 'A', text: '', isCorrect: true },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
      ]);
      setQTFStatements([
        { id: 'stmt-1', statement: '', correctValue: true },
        { id: 'stmt-2', statement: '', correctValue: false }
      ]);
      setQMatchingPairs([
        { id: 'm-1', premise: '', match: '' },
        { id: 'm-2', premise: '', match: '' }
      ]);
      setQShortAnswers('');
      setQRubrikEssay('');
    }
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qPertanyaan.trim()) {
      showToast('Teks pertanyaan tidak boleh kosong!', 'error');
      return;
    }
    if (!activeBank) {
      showToast('Pilih bank soal terlebih dahulu!', 'error');
      return;
    }

    const nextNomor = editingQuestion ? editingQuestion.nomorUrut : bankQuestions.length + 1;

    let finalOptions: QuestionOption[] | undefined = undefined;
    let finalTF: TrueFalseStatement[] | undefined = undefined;
    let finalMatching: MatchingPair[] | undefined = undefined;
    let finalShort: string[] | undefined = undefined;
    let finalEssayRubrik: string | undefined = undefined;

    if (qTipe === 'pilihan_ganda' || qTipe === 'pilihan_ganda_kompleks') {
      finalOptions = qOptions.filter(o => o.text.trim().length > 0);
      if (finalOptions.length < 2) {
        showToast('Minimal masukkan 2 pilihan jawaban untuk soal pilihan ganda!', 'error');
        return;
      }
    } else if (qTipe === 'benar_salah') {
      finalTF = qTFStatements.filter(s => s.statement.trim().length > 0);
    } else if (qTipe === 'menjodohkan') {
      finalMatching = qMatchingPairs.filter(p => p.premise.trim().length > 0 && p.match.trim().length > 0);
    } else if (qTipe === 'isian_singkat') {
      finalShort = qShortAnswers.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else if (qTipe === 'essay') {
      finalEssayRubrik = qRubrikEssay;
    }

    const questionObj: Question = {
      id: editingQuestion ? editingQuestion.id : 'q-' + Date.now(),
      bankId: activeBank.id,
      nomorUrut: nextNomor,
      tipe: qTipe,
      pertanyaan: qPertanyaan,
      rumusMath: qRumusMath.trim() || undefined,
      bobot: Number(qBobot) || 10,
      tingkatKesulitan: qDifficulty,
      materi: qMateri.trim() || undefined,
      kompetensi: qKompetensi.trim() || undefined,
      mediaType: qMediaUrl.trim() ? 'image' : undefined,
      mediaUrl: qMediaUrl.trim() || undefined,
      options: finalOptions,
      trueFalseStatements: finalTF,
      matchingPairs: finalMatching,
      kunciJawabanSingkat: finalShort,
      rubrikEssay: finalEssayRubrik
    };

    if (editingQuestion) {
      updateQuestion(questionObj);
    } else {
      addQuestion(questionObj);
    }

    setShowQuestionModal(false);
  };

  // Import Excel handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeBank) return;
    try {
      const rows = await parseExcelFile(file);
      const imported: Question[] = rows.map((r: any, idx: number) => {
        const rawTipe = (r['Tipe Soal'] || 'pilihan_ganda').toLowerCase();
        let tipe: QuestionType = 'pilihan_ganda';
        if (rawTipe.includes('kompleks')) tipe = 'pilihan_ganda_kompleks';
        else if (rawTipe.includes('benar')) tipe = 'benar_salah';
        else if (rawTipe.includes('jodoh')) tipe = 'menjodohkan';
        else if (rawTipe.includes('singkat') || rawTipe.includes('isian')) tipe = 'isian_singkat';
        else if (rawTipe.includes('essay') || rawTipe.includes('uraian')) tipe = 'essay';

        const options: QuestionOption[] = [];
        const rawKunci = String(r['Kunci Jawaban'] || 'A').toUpperCase().split(',');
        ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
          const optText = r[`Opsi ${letter}`];
          if (optText) {
            options.push({
              id: letter,
              text: String(optText),
              isCorrect: rawKunci.includes(letter)
            });
          }
        });

        return {
          id: 'q-imp-' + Date.now() + '-' + idx,
          bankId: activeBank.id,
          nomorUrut: bankQuestions.length + idx + 1,
          tipe,
          pertanyaan: r['Pertanyaan'] || 'Pertanyaan Baru',
          rumusMath: r['Rumus / LaTeX'] || undefined,
          bobot: Number(r['Bobot']) || 10,
          tingkatKesulitan: r['Tingkat Kesulitan'] || 'Sedang',
          materi: r['Materi'] || activeBank.materi,
          kompetensi: r['Kompetensi'] || '',
          options: options.length > 0 ? options : undefined
        };
      });

      importQuestionsList(imported);
    } catch (err) {
      showToast('Gagal mengurai file Excel soal. Periksa format kolom!', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl shadow-sm border border-[#222224] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31] rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Manajemen Bank Soal</h1>
            <p className="text-xs text-[#71717A]">
              Buat dan kelola bank soal lengkap dengan 6 tipe soal, rumus matematika, dan impor Excel.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => openBankModal()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#1C1C1F] hover:bg-[#252529] text-[#D1D1D1] border border-[#2D2D31] text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Bank Soal</span>
          </button>

          {activeBank && (
            <button
              onClick={() => openQuestionModal()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Butir Soal</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Bank Selector Left, Questions List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bank Soal List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#161618] p-4 rounded-2xl shadow-sm border border-[#222224]">
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Daftar Bank Soal ({questionBanks.length})
              </span>
              <button
                onClick={() => openBankModal()}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                + Tambah
              </button>
            </div>

            <div className="space-y-2 mt-3 overflow-y-auto max-h-[520px]">
              {questionBanks.map(b => {
                const isSelected = b.id === activeBank?.id;
                const totalQ = questions.filter(q => q.bankId === b.id).length;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBankId(b.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1C1C1F] border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.15)] text-white'
                        : 'bg-[#121214] hover:bg-[#1C1C1F] border-[#222224] text-[#D1D1D1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                        {b.kodeBank}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openBankModal(b);
                          }}
                          className="p-1 text-[#71717A] hover:text-white"
                          title="Edit Bank Soal"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Hapus bank soal "${b.namaBank}" beserta seluruh soal di dalamnya?`)) {
                              deleteQuestionBank(b.id);
                            }
                          }}
                          className="p-1 text-[#71717A] hover:text-rose-400"
                          title="Hapus Bank Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xs font-bold text-white mt-1.5 line-clamp-2">
                      {b.namaBank}
                    </h3>

                    <div className="text-[11px] text-[#71717A] mt-1 flex items-center justify-between">
                      <span>{b.subjectName} (Kls {b.tingkat})</span>
                      <span className="font-bold text-[#A1A1AA] font-mono">{totalQ} Butir Soal</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Questions Explorer in Active Bank (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeBank ? (
            <>
              {/* Active Bank Header Card */}
              <div className="bg-[#161618] p-4 sm:p-5 rounded-2xl shadow-sm border border-[#222224]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#222224] gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                      {activeBank.kodeBank}
                    </span>
                    <h2 className="text-base font-bold text-white mt-1">
                      {activeBank.namaBank}
                    </h2>
                    <p className="text-xs text-[#71717A]">
                      Mapel: {activeBank.subjectName} | Guru: {activeBank.guruName} | Materi: {activeBank.materi}
                    </p>
                  </div>

                  {/* Excel Tools for this Bank */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => exportQuestionsToExcel(bankQuestions, activeBank.namaBank)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#252529] text-[#D1D1D1] border border-[#2D2D31] text-xs font-semibold rounded-lg transition-colors"
                      title="Export Butir Soal ke Excel"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>

                    <label className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-400 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-emerald-800/40">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import Excel</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>

                    <button
                      onClick={downloadQuestionTemplate}
                      className="p-1.5 text-[#71717A] hover:text-white"
                      title="Download Template Excel Soal"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-3">
                  <div className="sm:col-span-8 relative">
                    <Search className="w-3.5 h-3.5 text-[#52525B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Cari butir pertanyaan atau materi..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#121214] border border-[#222224] rounded-lg text-white placeholder-[#52525B] focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#121214] border border-[#222224] rounded-lg text-[#E5E5E7] focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="all">Semua Tipe Soal</option>
                      <option value="pilihan_ganda">Pilihan Ganda</option>
                      <option value="pilihan_ganda_kompleks">PG Kompleks</option>
                      <option value="benar_salah">Benar / Salah</option>
                      <option value="menjodohkan">Menjodohkan</option>
                      <option value="isian_singkat">Isian Singkat</option>
                      <option value="essay">Essay / Uraian</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-[#161618] p-4 sm:p-5 rounded-2xl shadow-sm border border-[#222224] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 font-bold text-xs rounded-md">
                            Soal #{idx + 1}
                          </span>
                          <span className="text-[11px] font-semibold text-[#A1A1AA] bg-[#121214] border border-[#222224] px-2 py-0.5 rounded uppercase">
                            {q.tipe.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] font-medium text-[#71717A]">
                            Bobot: {q.bobot} Poin
                          </span>
                          <span className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                            {q.tingkatKesulitan}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setPreviewQuestion(q)}
                            className="p-1.5 text-[#71717A] hover:bg-[#1C1C1F] hover:text-emerald-400 rounded-lg transition-colors"
                            title="Preview Tampilan Siswa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateQuestion(q.id)}
                            className="p-1.5 text-[#71717A] hover:bg-[#1C1C1F] hover:text-blue-400 rounded-lg transition-colors"
                            title="Duplikasi Soal"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openQuestionModal(q)}
                            className="p-1.5 text-[#71717A] hover:bg-[#1C1C1F] hover:text-amber-400 rounded-lg transition-colors"
                            title="Edit Soal"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus butir soal ini?')) {
                                deleteQuestion(q.id);
                              }
                            }}
                            className="p-1.5 text-[#71717A] hover:bg-[#1C1C1F] hover:text-rose-400 rounded-lg transition-colors"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="text-xs sm:text-sm text-[#E5E5E7] font-medium whitespace-pre-line leading-relaxed">
                        {q.pertanyaan}
                      </div>

                      {/* Math LaTeX box if present */}
                      {q.rumusMath && (
                        <div className="p-2.5 bg-[#0E0E10] border border-[#222224] rounded-lg font-mono text-xs text-emerald-400 font-semibold">
                          LaTeX: {q.rumusMath}
                        </div>
                      )}

                      {/* Options Summary for PG */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map(opt => (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-lg text-xs border flex items-center space-x-2 ${
                                opt.isCorrect
                                  ? 'bg-[#1C1C1F] border-emerald-500/80 font-bold text-emerald-400'
                                  : 'bg-[#121214] border-[#222224] text-[#A1A1AA]'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-[#1C1C1F] border border-[#2D2D31] flex items-center justify-center font-bold text-[10px] shrink-0">
                                {opt.id}
                              </span>
                              <span className="truncate">{opt.text}</span>
                              {opt.isCorrect && <span className="ml-auto text-emerald-400 text-[10px]">✓ Kunci</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-[#161618] p-12 rounded-2xl border border-[#222224] text-center text-[#52525B]">
                    Belum ada butir soal pada bank ini. Klik "Tambah Butir Soal" atau gunakan "Import Excel".
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-[#161618] p-12 rounded-2xl border border-[#222224] text-center text-[#52525B]">
              Pilih bank soal di kolom kiri atau buat bank soal baru.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create/Edit Bank Soal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveBank}
            className="bg-[#161618] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[#2D2D31] animate-in fade-in zoom-in-95 duration-150 space-y-4 text-[#D1D1D1]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <h3 className="font-bold text-base text-white">
                {editingBank ? 'Edit Bank Soal' : 'Buat Bank Soal Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="p-1 text-[#71717A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Kode Bank Soal</label>
                <input
                  type="text"
                  required
                  value={bankKode}
                  onChange={e => setBankKode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Tingkat Kelas</label>
                <select
                  value={bankTingkat}
                  onChange={e => setBankTingkat(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                >
                  <option value="7">Kelas VII (7) MTs</option>
                  <option value="8">Kelas VIII (8) MTs</option>
                  <option value="9">Kelas IX (9) MTs</option>
                  <option value="10">Kelas X (10) MA</option>
                  <option value="11">Kelas XI (11) MA</option>
                  <option value="12">Kelas XII (12) MA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Nama Bank Soal</label>
              <input
                type="text"
                required
                value={bankNama}
                onChange={e => setBankNama(e.target.value)}
                placeholder="Contoh: Bank Soal Asesmen Madrasah Matematika 2026"
                className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Mata Pelajaran</label>
              <select
                value={bankSubjectId}
                onChange={e => setBankSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.kode} - {s.namaMataPelajaran} ({s.kelompok})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Cakupan Materi / KD</label>
              <textarea
                rows={3}
                value={bankMateri}
                onChange={e => setBankMateri(e.target.value)}
                placeholder="Tuliskan ringkasan materi atau KD..."
                className="w-full p-3 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Simpan Bank Soal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create/Edit Question with 6 Types */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveQuestion}
            className="bg-[#161618] rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-[#2D2D31] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 text-[#D1D1D1]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <h3 className="font-bold text-base text-white">
                {editingQuestion ? 'Edit Butir Soal' : 'Tambah Butir Soal Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="p-1 text-[#71717A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Type, Bobot, Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Tipe Soal</label>
                  <select
                    value={qTipe}
                    onChange={e => setQTipe(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="pilihan_ganda">1. Pilihan Ganda (Tunggal)</option>
                    <option value="pilihan_ganda_kompleks">2. PG Kompleks (Multi Checkbox)</option>
                    <option value="benar_salah">3. Benar / Salah (Pernyataan)</option>
                    <option value="menjodohkan">4. Menjodohkan (Matching Pairs)</option>
                    <option value="isian_singkat">5. Isian Singkat</option>
                    <option value="essay">6. Essay / Uraian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Bobot Poin</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={qBobot}
                    onChange={e => setQBobot(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Tingkat Kesulitan</label>
                  <select
                    value={qDifficulty}
                    onChange={e => setQDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sukar">Sukar</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Teks Pertanyaan</label>
                <textarea
                  rows={4}
                  required
                  value={qPertanyaan}
                  onChange={e => setQPertanyaan(e.target.value)}
                  placeholder="Ketik butir soal di sini..."
                  className="w-full p-3 text-xs sm:text-sm bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Formula & Media */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Rumus / Formula LaTeX (Opsional)</label>
                  <input
                    type="text"
                    value={qRumusMath}
                    onChange={e => setQRumusMath(e.target.value)}
                    placeholder="Contoh: \sqrt{a^2 + b^2}"
                    className="w-full px-3 py-2 text-xs font-mono bg-[#121214] border border-[#2D2D31] text-emerald-400 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">URL Gambar Media (Opsional)</label>
                  <input
                    type="url"
                    value={qMediaUrl}
                    onChange={e => setQMediaUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Sub-forms based on Type */}

              {/* 1 & 2: Pilihan Ganda & Kompleks */}
              {(qTipe === 'pilihan_ganda' || qTipe === 'pilihan_ganda_kompleks') && (
                <div className="p-4 bg-[#121214] rounded-2xl border border-[#222224] space-y-3">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Pilihan Opsi Jawaban</span>
                    <span className="text-[11px] text-[#71717A]">Centang opsi yang merupakan kunci jawaban</span>
                  </div>

                  {qOptions.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (qTipe === 'pilihan_ganda') {
                            setQOptions(prev => prev.map(o => ({ ...o, isCorrect: o.id === opt.id })));
                          } else {
                            setQOptions(prev => prev.map(o => (o.id === opt.id ? { ...o, isCorrect: !o.isCorrect } : o)));
                          }
                        }}
                        className={`w-8 h-8 rounded-lg font-bold text-xs shrink-0 flex items-center justify-center border transition-all ${
                          opt.isCorrect
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                            : 'bg-[#1C1C1F] text-[#A1A1AA] border-[#2D2D31]'
                        }`}
                        title="Klik untuk jadikan kunci jawaban"
                      >
                        {opt.id}
                      </button>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={e => {
                          const val = e.target.value;
                          setQOptions(prev => prev.map(o => (o.id === opt.id ? { ...o, text: val } : o)));
                        }}
                        placeholder={`Teks Opsi ${opt.id}...`}
                        className="flex-1 px-3 py-2 text-xs bg-[#161618] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 3: Benar / Salah */}
              {qTipe === 'benar_salah' && (
                <div className="p-4 bg-[#121214] rounded-2xl border border-[#222224] space-y-3">
                  <div className="text-xs font-bold text-white">Daftar Pernyataan (Benar / Salah)</div>
                  {qTFStatements.map((stmt, idx) => (
                    <div key={stmt.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={stmt.statement}
                        onChange={e => {
                          const val = e.target.value;
                          setQTFStatements(prev => prev.map(s => (s.id === stmt.id ? { ...s, statement: val } : s)));
                        }}
                        placeholder={`Pernyataan ${idx + 1}...`}
                        className="flex-1 px-3 py-2 text-xs bg-[#161618] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                      <select
                        value={stmt.correctValue ? 'true' : 'false'}
                        onChange={e => {
                          const val = e.target.value === 'true';
                          setQTFStatements(prev => prev.map(s => (s.id === stmt.id ? { ...s, correctValue: val } : s)));
                        }}
                        className="px-3 py-2 text-xs bg-[#161618] border border-[#2D2D31] rounded-xl font-bold text-emerald-400"
                      >
                        <option value="true">Kunci: BENAR</option>
                        <option value="false">Kunci: SALAH</option>
                      </select>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setQTFStatements(prev => [...prev, { id: 'stmt-' + Date.now(), statement: '', correctValue: true }])
                    }
                    className="text-xs text-emerald-400 font-semibold hover:underline"
                  >
                    + Tambah Pernyataan
                  </button>
                </div>
              )}

              {/* 4: Menjodohkan */}
              {qTipe === 'menjodohkan' && (
                <div className="p-4 bg-[#121214] rounded-2xl border border-[#222224] space-y-3">
                  <div className="text-xs font-bold text-white">Pasangan Menjodohkan (Premis & Pasangan)</div>
                  {qMatchingPairs.map((pair, idx) => (
                    <div key={pair.id} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pair.premise}
                        onChange={e => {
                          const val = e.target.value;
                          setQMatchingPairs(prev => prev.map(p => (p.id === pair.id ? { ...p, premise: val } : p)));
                        }}
                        placeholder={`Premis #${idx + 1}`}
                        className="px-3 py-2 text-xs bg-[#161618] border border-[#2D2D31] text-white rounded-xl"
                      />
                      <input
                        type="text"
                        value={pair.match}
                        onChange={e => {
                          const val = e.target.value;
                          setQMatchingPairs(prev => prev.map(p => (p.id === pair.id ? { ...p, match: val } : p)));
                        }}
                        placeholder={`Pasangan Jawaban #${idx + 1}`}
                        className="px-3 py-2 text-xs bg-[#161618] border border-[#2D2D31] text-white rounded-xl"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setQMatchingPairs(prev => [...prev, { id: 'm-' + Date.now(), premise: '', match: '' }])
                    }
                    className="text-xs text-emerald-400 font-semibold hover:underline"
                  >
                    + Tambah Baris Pasangan
                  </button>
                </div>
              )}

              {/* 5: Isian Singkat */}
              {qTipe === 'isian_singkat' && (
                <div className="p-4 bg-[#121214] rounded-2xl border border-[#222224] space-y-2">
                  <label className="block text-xs font-bold text-white">Kunci Jawaban Singkat (Sinonim/Alternatif)</label>
                  <input
                    type="text"
                    value={qShortAnswers}
                    onChange={e => setQShortAnswers(e.target.value)}
                    placeholder="Pisahkan dengan koma, contoh: 1/2, 0.5, 50%"
                    className="w-full px-3 py-2 text-xs bg-[#161618] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* 6: Essay */}
              {qTipe === 'essay' && (
                <div className="p-4 bg-[#121214] rounded-2xl border border-[#222224] space-y-2">
                  <label className="block text-xs font-bold text-white">Rubrik & Panduan Penilaian Guru</label>
                  <textarea
                    rows={3}
                    value={qRubrikEssay}
                    onChange={e => setQRubrikEssay(e.target.value)}
                    placeholder="Tuliskan kriteria pemberian skor (contoh: Langkah aljabar benar skor 10...)"
                    className="w-full p-3 text-xs bg-[#161618] border border-[#2D2D31] text-white rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Simpan Butir Soal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Preview Question */}
      {previewQuestion && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#161618] rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-[#2D2D31] animate-in fade-in zoom-in-95 duration-150 text-[#D1D1D1]">
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Preview Tampilan Siswa</h3>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1 text-[#71717A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded inline-block uppercase">
                {previewQuestion.tipe.replace(/_/g, ' ')} • {previewQuestion.bobot} Poin
              </div>
              <div className="text-sm font-medium text-[#E5E5E7] whitespace-pre-line">
                {previewQuestion.pertanyaan}
              </div>

              {previewQuestion.rumusMath && (
                <div className="p-3 bg-[#0E0E10] border border-[#222224] rounded-xl font-mono text-xs text-emerald-400">
                  {previewQuestion.rumusMath}
                </div>
              )}

              {previewQuestion.options && (
                <div className="space-y-2 pt-2">
                  {previewQuestion.options.map(opt => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border text-xs flex items-center space-x-2.5 ${
                        opt.isCorrect ? 'bg-[#1C1C1F] border-emerald-500/80 font-bold text-white' : 'bg-[#121214] border-[#222224] text-[#A1A1AA]'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-[#1C1C1F] border border-[#2D2D31] flex items-center justify-center font-bold text-xs">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                      {opt.isCorrect && <span className="ml-auto text-[10px] text-emerald-400 font-bold">KUNCI</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#222224] flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-[#1C1C1F] text-white border border-[#2D2D31] text-xs font-semibold rounded-xl hover:bg-[#252529]"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
