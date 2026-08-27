import React, { useState } from 'react';
import { useCBT } from '../context/CBTContext';
import {
  Student,
  Teacher,
  ClassGroup,
  Subject,
  ExamRoom,
  ExamSessionConfig,
  AcademicYear,
  Semester
} from '../types';
import {
  exportStudentsToExcel,
  exportTeachersToExcel,
  downloadStudentTemplate,
  downloadTeacherTemplate,
  parseExcelFile
} from '../utils/excelHelper';
import {
  Database,
  Users,
  GraduationCap,
  BookOpen,
  School,
  DoorOpen,
  Calendar,
  Clock,
  Layers,
  Shuffle,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Save,
  CheckSquare,
  Square,
  AlertCircle,
  X
} from 'lucide-react';

type MasterTab = 'madrasah' | 'siswa' | 'guru' | 'kelas' | 'mapel' | 'ruang' | 'sesi' | 'periode';

export const MasterDataManager: React.FC = () => {
  const {
    madrasah,
    updateMadrasah,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudentsList,
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    importTeachersList,
    classes,
    addClass,
    updateClass,
    deleteClass,
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    rooms,
    addRoom,
    updateRoom,
    deleteRoom,
    sessionConfigs,
    addSessionConfig,
    updateSessionConfig,
    deleteSessionConfig,
    toggleSessionStatus,
    autoAssignStudentSessions,
    bulkAssignSessionToStudents,
    academicYears,
    addAcademicYear,
    toggleAcademicYear,
    semesters,
    toggleSemester,
    showToast
  } = useCBT();

  const [activeTab, setActiveTab] = useState<MasterTab>(() => {
    const saved = localStorage.getItem('CBT_MADRASAH_MASTER_TAB');
    const valid: MasterTab[] = ['madrasah', 'siswa', 'guru', 'kelas', 'mapel', 'ruang', 'sesi', 'periode'];
    return (valid.includes(saved as MasterTab) ? (saved as MasterTab) : 'siswa');
  });

  React.useEffect(() => {
    if (activeTab) {
      localStorage.setItem('CBT_MADRASAH_MASTER_TAB', activeTab);
    }
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSesi, setFilterSesi] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [massSessionTarget, setMassSessionTarget] = useState<number>(1);

  // Madrasah Profile Form State
  const [madrasahForm, setMadrasahForm] = useState(madrasah);

  // Student Form Modal State
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [stdNIS, setStdNIS] = useState<string>('');
  const [stdNISN, setStdNISN] = useState<string>('');
  const [stdNama, setStdNama] = useState<string>('');
  const [stdJK, setStdJK] = useState<'L' | 'P'>('L');
  const [stdTempatLahir, setStdTempatLahir] = useState<string>('');
  const [stdTglLahir, setStdTglLahir] = useState<string>('2011-01-01');
  const [stdClassId, setStdClassId] = useState<string>(classes[0]?.id || 'cls-9a');
  const [stdNomorPeserta, setStdNomorPeserta] = useState<string>('');
  const [stdUsername, setStdUsername] = useState<string>('');
  const [stdRuangId, setStdRuangId] = useState<string>(rooms[0]?.nomorRuang || 'LAB-01');
  const [stdSesi, setStdSesi] = useState<number>(1);

  // Session Config Form Modal State (Maksimal 4 Sesi)
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<ExamSessionConfig | null>(null);
  const [sessNomor, setSessNomor] = useState<number>(1);
  const [sessNama, setSessNama] = useState<string>('');
  const [sessMulai, setSessMulai] = useState<string>('07:30');
  const [sessSelesai, setSessSelesai] = useState<string>('09:30');
  const [sessKeterangan, setSessKeterangan] = useState<string>('');

  // Auto Assign Modal
  const [showAutoAssignModal, setShowAutoAssignModal] = useState<boolean>(false);
  const [autoAssignMode, setAutoAssignMode] = useState<'even' | 'by_class'>('even');

  // Teacher Form Modal State
  const [showTeacherModal, setShowTeacherModal] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [tchNIP, setTchNIP] = useState<string>('');
  const [tchNUPTK, setTchNUPTK] = useState<string>('');
  const [tchNama, setTchNama] = useState<string>('');
  const [tchJK, setTchJK] = useState<'L' | 'P'>('L');
  const [tchEmail, setTchEmail] = useState<string>('');
  const [tchHp, setTchHp] = useState<string>('');
  const [tchMapel, setTchMapel] = useState<string>(subjects[0]?.namaMataPelajaran || 'Matematika');
  const [tchUsername, setTchUsername] = useState<string>('');

  // Class Form Modal State
  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [clsNama, setClsNama] = useState<string>('');
  const [clsTingkat, setClsTingkat] = useState<string>('9');
  const [clsWali, setClsWali] = useState<string>('');

  // Subject Form Modal State
  const [showSubModal, setShowSubModal] = useState<boolean>(false);
  const [editingSub, setEditingSub] = useState<Subject | null>(null);
  const [subKode, setSubKode] = useState<string>('');
  const [subNama, setSubNama] = useState<string>('');
  const [subKelompok, setSubKelompok] = useState<'Umum' | 'Agama' | 'Peminatan' | 'Muatan Lokal'>('Umum');

  // Room Form Modal State
  const [showRoomModal, setShowRoomModal] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<ExamRoom | null>(null);
  const [roomNama, setRoomNama] = useState<string>('');
  const [roomNomor, setRoomNomor] = useState<string>('');
  const [roomKapasitas, setRoomKapasitas] = useState<number>(40);
  const [roomPengawas, setRoomPengawas] = useState<string>('');

  // Academic Year modal
  const [showAyModal, setShowAyModal] = useState<boolean>(false);
  const [ayTahun, setAyTahun] = useState<string>('2026/2027');

  // Handlers for Student
  const openStudentModal = (st?: Student) => {
    if (st) {
      setEditingStudent(st);
      setStdNIS(st.nis);
      setStdNISN(st.nisn);
      setStdNama(st.nama);
      setStdJK(st.jenisKelamin);
      setStdTempatLahir(st.tempatLahir);
      setStdTglLahir(st.tanggalLahir);
      setStdClassId(st.classId);
      setStdNomorPeserta(st.nomorPeserta);
      setStdUsername(st.username);
      setStdRuangId(st.ruangId || 'LAB-01');
      setStdSesi(st.sesi || 1);
    } else {
      setEditingStudent(null);
      setStdNIS(`232407${(students.length + 1).toString().padStart(3, '0')}`);
      setStdNISN(`009${Date.now().toString().slice(-7)}`);
      setStdNama('');
      setStdJK('L');
      setStdTempatLahir('Bandung');
      setStdTglLahir('2011-05-15');
      setStdClassId(classes[0]?.id || 'cls-9a');
      setStdNomorPeserta(`U-02-04-${(students.length + 1).toString().padStart(4, '0')}`);
      setStdUsername(`siswa${students.length + 1}`);
      setStdRuangId(rooms[0]?.nomorRuang || 'LAB-01');
      setStdSesi(1);
    }
    setShowStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdNama.trim() || !stdNISN.trim()) {
      showToast('Nama dan NISN siswa wajib diisi!', 'error');
      return;
    }
    const selectedClass = classes.find(c => c.id === stdClassId);
    const newStudent: Student = {
      id: editingStudent ? editingStudent.id : 'std-' + Date.now(),
      userId: editingStudent ? editingStudent.userId : 'usr-std-' + Date.now(),
      nis: stdNIS,
      nisn: stdNISN,
      nama: stdNama,
      jenisKelamin: stdJK,
      tempatLahir: stdTempatLahir,
      tanggalLahir: stdTglLahir,
      classId: stdClassId,
      namaKelas: selectedClass?.namaKelas || 'IX-A',
      nomorPeserta: stdNomorPeserta,
      ruangId: stdRuangId,
      sesi: Number(stdSesi) || 1,
      username: stdUsername,
      status: 'aktif'
    };

    if (editingStudent) {
      updateStudent(newStudent);
    } else {
      addStudent(newStudent);
    }
    setShowStudentModal(false);
  };

  const handleImportStudents = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseExcelFile<any>(file);
      if (data.length > 0) {
        const imported: Student[] = data.map((row, idx) => {
          const matchedClass = classes.find(c => c.namaKelas.toLowerCase() === (row.namaKelas || '').toLowerCase()) || classes[0];
          return {
            id: 'std-imp-' + Date.now() + '-' + idx,
            userId: 'usr-std-imp-' + idx,
            nis: String(row.nis || `2324${idx}`),
            nisn: String(row.nisn || `009${idx}`),
            nama: String(row.nama || 'Siswa Baru ' + (idx + 1)),
            jenisKelamin: row.jenisKelamin === 'P' ? 'P' : 'L',
            tempatLahir: String(row.tempatLahir || 'Bandung'),
            tanggalLahir: String(row.tanggalLahir || '2011-01-01'),
            classId: matchedClass?.id || 'cls-9a',
            namaKelas: matchedClass?.namaKelas || 'IX-A',
            nomorPeserta: String(row.nomorPeserta || `U-02-04-00${idx}`),
            ruangId: String(row.ruangId || 'LAB-01'),
            sesi: Number(row.sesi) || ((idx % 4) + 1),
            username: String(row.username || `siswa${Date.now().toString().slice(-4)}${idx}`),
            status: 'aktif'
          };
        });
        importStudentsList(imported);
      }
    } catch (err) {
      showToast('Gagal memproses file Excel siswa.', 'error');
    }
    e.target.value = '';
  };

  // Handlers for Teacher
  const openTeacherModal = (tc?: Teacher) => {
    if (tc) {
      setEditingTeacher(tc);
      setTchNIP(tc.nip);
      setTchNUPTK(tc.nuptk);
      setTchNama(tc.nama);
      setTchJK(tc.jenisKelamin);
      setTchEmail(tc.email);
      setTchHp(tc.nomorHp);
      setTchMapel(tc.mapelUtama);
      setTchUsername(tc.username);
    } else {
      setEditingTeacher(null);
      setTchNIP(`19850101${Date.now().toString().slice(-10)}`);
      setTchNUPTK(`123456789${(teachers.length + 1).toString().padStart(3, '0')}`);
      setTchNama('');
      setTchJK('L');
      setTchEmail('');
      setTchHp('');
      setTchMapel(subjects[0]?.namaMataPelajaran || 'Matematika');
      setTchUsername(`guru${teachers.length + 1}`);
    }
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tchNama.trim()) {
      showToast('Nama guru wajib diisi!', 'error');
      return;
    }
    const newTeacher: Teacher = {
      id: editingTeacher ? editingTeacher.id : 'tch-' + Date.now(),
      userId: editingTeacher ? editingTeacher.userId : 'usr-tch-' + Date.now(),
      nip: tchNIP,
      nuptk: tchNUPTK,
      nama: tchNama,
      jenisKelamin: tchJK,
      tempatLahir: 'Bandung',
      tanggalLahir: '1985-01-01',
      email: tchEmail,
      nomorHp: tchHp,
      mapelUtama: tchMapel,
      username: tchUsername,
      status: 'aktif'
    };

    if (editingTeacher) {
      updateTeacher(newTeacher);
    } else {
      addTeacher(newTeacher);
    }
    setShowTeacherModal(false);
  };

  // Handlers for Class
  const openClassModal = (cls?: ClassGroup) => {
    if (cls) {
      setEditingClass(cls);
      setClsNama(cls.namaKelas);
      setClsTingkat(cls.tingkat);
      setClsWali(cls.waliKelas);
    } else {
      setEditingClass(null);
      setClsNama('');
      setClsTingkat('9');
      setClsWali(teachers[0]?.nama || 'Wali Kelas');
    }
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clsNama.trim()) {
      showToast('Nama rombel kelas harus diisi!', 'error');
      return;
    }
    const newCls: ClassGroup = {
      id: editingClass ? editingClass.id : 'cls-' + Date.now(),
      namaKelas: clsNama,
      tingkat: clsTingkat,
      jenjang: 'MTs',
      waliKelas: clsWali,
      academicYearId: academicYears.find(a => a.statusAktif)?.id || 'ay-2025-2026',
      jumlahSiswa: 32
    };
    if (editingClass) updateClass(newCls);
    else addClass(newCls);
    setShowClassModal(false);
  };

  // Handlers for Subject
  const openSubModal = (sub?: Subject) => {
    if (sub) {
      setEditingSub(sub);
      setSubKode(sub.kode);
      setSubNama(sub.namaMataPelajaran);
      setSubKelompok(sub.kelompok);
    } else {
      setEditingSub(null);
      setSubKode(`MP-${(subjects.length + 1).toString().padStart(2, '0')}`);
      setSubNama('');
      setSubKelompok('Umum');
    }
    setShowSubModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subNama.trim()) {
      showToast('Nama mata pelajaran wajib diisi!', 'error');
      return;
    }
    const newSub: Subject = {
      id: editingSub ? editingSub.id : 'sub-' + Date.now(),
      kode: subKode,
      namaMataPelajaran: subNama,
      kelompok: subKelompok,
      status: 'aktif'
    };
    if (editingSub) updateSubject(newSub);
    else addSubject(newSub);
    setShowSubModal(false);
  };

  // Handlers for Room
  const openRoomModal = (r?: ExamRoom) => {
    if (r) {
      setEditingRoom(r);
      setRoomNama(r.namaRuang);
      setRoomNomor(r.nomorRuang);
      setRoomKapasitas(r.kapasitas);
      setRoomPengawas(r.pengawasUtama);
    } else {
      setEditingRoom(null);
      setRoomNama('');
      setRoomNomor(`LAB-${(rooms.length + 1).toString().padStart(2, '0')}`);
      setRoomKapasitas(40);
      setRoomPengawas(teachers[0]?.nama || 'Pengawas Ruang');
    }
    setShowRoomModal(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNama.trim()) {
      showToast('Nama ruang harus diisi!', 'error');
      return;
    }
    const newRoom: ExamRoom = {
      id: editingRoom ? editingRoom.id : 'room-' + Date.now(),
      namaRuang: roomNama,
      nomorRuang: roomNomor,
      kapasitas: Number(roomKapasitas) || 40,
      serverIp: madrasah.serverIp,
      pengawasUtama: roomPengawas
    };
    if (editingRoom) updateRoom(newRoom);
    else addRoom(newRoom);
    setShowRoomModal(false);
  };

  // Handlers for Session Config (Maksimal 4 Sesi)
  const openSessionModal = (cfg?: ExamSessionConfig) => {
    if (cfg) {
      setEditingSession(cfg);
      setSessNomor(cfg.nomorSesi);
      setSessNama(cfg.namaSesi);
      setSessMulai(cfg.jamMulai);
      setSessSelesai(cfg.jamSelesai);
      setSessKeterangan(cfg.keterangan || '');
      setShowSessionModal(true);
    } else {
      if (sessionConfigs.length >= 4) {
        showToast('Batas maksimal telah tercapai (Maksimal 4 Sesi Ujian)!', 'warning');
        return;
      }
      setEditingSession(null);
      // Find lowest available session number (1 to 4)
      const existingNomor = sessionConfigs.map(s => s.nomorSesi);
      const nextNomor = [1, 2, 3, 4].find(n => !existingNomor.includes(n)) || 1;
      setSessNomor(nextNomor);
      setSessNama(
        nextNomor === 1 ? 'Sesi 1 (Pagi)' :
        nextNomor === 2 ? 'Sesi 2 (Siang)' :
        nextNomor === 3 ? 'Sesi 3 (Sore)' : 'Sesi 4 (Petang)'
      );
      setSessMulai(
        nextNomor === 1 ? '07:30' :
        nextNomor === 2 ? '10:00' :
        nextNomor === 3 ? '13:00' : '15:30'
      );
      setSessSelesai(
        nextNomor === 1 ? '09:30' :
        nextNomor === 2 ? '12:00' :
        nextNomor === 3 ? '15:00' : '17:30'
      );
      setSessKeterangan(`Jadwal Sesi ${nextNomor} CBT Madrasah`);
      setShowSessionModal(true);
    }
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessNama.trim() || !sessMulai.trim() || !sessSelesai.trim()) {
      showToast('Nama sesi, jam mulai, dan jam selesai wajib diisi!', 'error');
      return;
    }
    if (sessNomor < 1 || sessNomor > 4) {
      showToast('Nomor sesi harus antara 1 sampai 4!', 'error');
      return;
    }

    const newConfig: ExamSessionConfig = {
      id: editingSession ? editingSession.id : 'sess-cfg-' + Date.now(),
      nomorSesi: Number(sessNomor),
      namaSesi: sessNama,
      jamMulai: sessMulai,
      jamSelesai: sessSelesai,
      keterangan: sessKeterangan,
      statusAktif: editingSession ? editingSession.statusAktif : true
    };

    if (editingSession) {
      updateSessionConfig(newConfig);
      setShowSessionModal(false);
    } else {
      const res = addSessionConfig(newConfig);
      if (res.success) {
        setShowSessionModal(false);
      }
    }
  };

  // Bulk student session selection handlers
  const handleToggleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBulkApplySession = (targetSessionNum: number) => {
    if (selectedStudentIds.length === 0) {
      showToast('Pilih siswa terlebih dahulu!', 'warning');
      return;
    }
    bulkAssignSessionToStudents(selectedStudentIds, targetSessionNum);
    setSelectedStudentIds([]);
  };

  const handleAutoAssignSubmit = () => {
    autoAssignStudentSessions(autoAssignMode);
    setShowAutoAssignModal(false);
  };

  // Filtered lists
  const filteredStudents = students.filter(s => {
    if (filterClass !== 'all' && s.classId !== filterClass) return false;
    if (filterSesi !== 'all' && (s.sesi || 1) !== Number(filterSesi)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.nama.toLowerCase().includes(q) ||
        s.nisn.includes(q) ||
        (s.nis && s.nis.includes(q)) ||
        (s.nomorPeserta && s.nomorPeserta.toLowerCase().includes(q)) ||
        s.username.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl shadow-sm border border-[#222224] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31] rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Data Master Madrasah</h1>
            <p className="text-xs text-[#71717A]">
              Pusat pengelolaan data siswa, guru pengampu, kelas, mata pelajaran, ruang ujian, dan identitas madrasah.
            </p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#121214] border border-[#222224] rounded-2xl">
          <button
            onClick={() => setActiveTab('madrasah')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'madrasah' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            Profil Madrasah
          </button>
          <button
            onClick={() => setActiveTab('siswa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'siswa' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            Siswa ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('guru')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guru' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            Guru ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('kelas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'kelas' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            Kelas ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('mapel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mapel' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            Mapel ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('ruang')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ruang' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            Ruang ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('sesi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'sesi' ? 'bg-[#1C1C1F] text-amber-400 border border-amber-500/40' : 'text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Sesi Ujian ({sessionConfigs.length}/4)</span>
          </button>
          <button
            onClick={() => setActiveTab('periode')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'periode' ? 'bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31]' : 'text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            Tahun / Semester
          </button>
        </div>
      </div>

      {/* TAB 1: Profil Madrasah */}
      {activeTab === 'madrasah' && (
        <div className="bg-[#161618] p-6 rounded-2xl shadow-sm border border-[#222224] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#222224]">
            <div>
              <h2 className="text-base font-bold text-white">Identitas & Konfigurasi Madrasah</h2>
              <p className="text-xs text-[#71717A]">Data ini tercetak pada Kartu Peserta, Berita Acara, dan Kop Ujian CBT.</p>
            </div>
            <button
              onClick={() => updateMadrasah(madrasahForm)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">Nama Madrasah</label>
              <input
                type="text"
                value={madrasahForm.namaMadrasah}
                onChange={e => setMadrasahForm({ ...madrasahForm, namaMadrasah: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">Jenjang Pendidikan</label>
              <select
                value={madrasahForm.jenjang}
                onChange={e => setMadrasahForm({ ...madrasahForm, jenjang: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                <option value="MI">Madrasah Ibtidaiyah (MI)</option>
                <option value="MTs">Madrasah Tsanawiyah (MTs)</option>
                <option value="MA">Madrasah Aliyah (MA)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">NSM (Nomor Statistik Madrasah)</label>
              <input
                type="text"
                value={madrasahForm.nsm}
                onChange={e => setMadrasahForm({ ...madrasahForm, nsm: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">NPSN</label>
              <input
                type="text"
                value={madrasahForm.npsn}
                onChange={e => setMadrasahForm({ ...madrasahForm, npsn: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-[#A1A1AA] mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={madrasahForm.alamat}
                onChange={e => setMadrasahForm({ ...madrasahForm, alamat: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                value={madrasahForm.kabupaten}
                onChange={e => setMadrasahForm({ ...madrasahForm, kabupaten: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">Provinsi</label>
              <input
                type="text"
                value={madrasahForm.provinsi}
                onChange={e => setMadrasahForm({ ...madrasahForm, provinsi: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">Kepala Madrasah</label>
              <input
                type="text"
                value={madrasahForm.kepalaMadrasah}
                onChange={e => setMadrasahForm({ ...madrasahForm, kepalaMadrasah: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">NIP Kepala Madrasah</label>
              <input
                type="text"
                value={madrasahForm.nipKepalaMadrasah}
                onChange={e => setMadrasahForm({ ...madrasahForm, nipKepalaMadrasah: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">IP Server CBT (LAN Lokal)</label>
              <input
                type="text"
                value={madrasahForm.serverIp}
                onChange={e => setMadrasahForm({ ...madrasahForm, serverIp: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">Zona Waktu Server</label>
              <select
                value={madrasahForm.timezone}
                onChange={e => setMadrasahForm({ ...madrasahForm, timezone: e.target.value })}
                className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
              >
                <option value="Asia/Jakarta">WIB (Asia/Jakarta - UTC+7)</option>
                <option value="Asia/Makassar">WITA (Asia/Makassar - UTC+8)</option>
                <option value="Asia/Jayapura">WIT (Asia/Jayapura - UTC+9)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Data Siswa */}
      {activeTab === 'siswa' && (
        <div className="bg-[#161618] p-6 rounded-2xl shadow-sm border border-[#222224] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222224]">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Daftar Siswa Peserta CBT</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  {students.length} Siswa Terdaftar
                </span>
              </div>
              <p className="text-xs text-[#71717A]">Kelola akun, nomor peserta, rombongan belajar, dan penempatan sesi ujian (maks. 4 sesi).</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowAutoAssignModal(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl transition-all"
                title="Bagi Sesi Ujian Siswa Secara Otomatis (Maksimal 4 Sesi)"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Distribusi Sesi</span>
              </button>

              <button
                onClick={() => exportStudentsToExcel(students)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#252529] text-[#D1D1D1] border border-[#2D2D31] text-xs font-semibold rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <label className="flex items-center space-x-1 px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#252529] text-emerald-400 text-xs font-semibold rounded-xl cursor-pointer border border-emerald-500/40">
                <Upload className="w-3.5 h-3.5" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleImportStudents}
                />
              </label>

              <button
                onClick={downloadStudentTemplate}
                className="p-2 text-[#71717A] hover:text-emerald-400"
                title="Download Template Format Excel Siswa"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => openStudentModal()}
                className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-3.5 h-3.5 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa, NISN, no peserta, atau username..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#121214] border border-[#222224] rounded-xl text-white placeholder-[#52525B] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#222224] rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Semua Rombel Kelas</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.namaKelas}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <select
                value={filterSesi}
                onChange={e => setFilterSesi(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#121214] border border-[#222224] rounded-xl text-amber-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Semua Sesi Ujian (1-4)</option>
                <option value="1">Sesi 1 (Pagi)</option>
                <option value="2">Sesi 2 (Siang)</option>
                <option value="3">Sesi 3 (Sore)</option>
                <option value="4">Sesi 4 (Petang)</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedStudentIds.length > 0 && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-amber-300 font-semibold">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>{selectedStudentIds.length} Siswa Terpilih</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#A1A1AA] text-xs">Terapkan ke Sesi:</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4].map(sNum => (
                    <button
                      key={sNum}
                      onClick={() => handleBulkApplySession(sNum)}
                      className="px-2.5 py-1 bg-[#1C1C1F] hover:bg-amber-500 hover:text-black text-white border border-[#2D2D31] rounded-lg text-xs font-bold transition-all"
                    >
                      Sesi {sNum}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedStudentIds([])}
                  className="px-2.5 py-1 text-[#71717A] hover:text-white text-xs ml-2"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="border border-[#222224] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F0F11] text-[#71717A] font-bold border-b border-[#222224]">
                  <tr>
                    <th className="p-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                        onChange={handleToggleSelectAllStudents}
                        className="rounded border-[#2D2D31] text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-3">No</th>
                    <th className="p-3">NISN / NIS</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">No. Peserta</th>
                    <th className="p-3">Sesi Ujian</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Ruang</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222224]">
                  {filteredStudents.map((st, idx) => {
                    const isSelected = selectedStudentIds.includes(st.id);
                    const sesiNum = st.sesi || 1;
                    const sessionBadgeColor =
                      sesiNum === 1 ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' :
                      sesiNum === 2 ? 'bg-amber-950/60 text-amber-300 border-amber-800/40' :
                      sesiNum === 3 ? 'bg-sky-950/60 text-sky-300 border-sky-800/40' :
                      'bg-purple-950/60 text-purple-300 border-purple-800/40';

                    return (
                      <tr key={st.id} className={`hover:bg-[#1C1C1F] transition-colors ${isSelected ? 'bg-amber-950/10' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(st.id)}
                            className="rounded border-[#2D2D31] text-emerald-500 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-bold text-[#52525B]">{idx + 1}</td>
                        <td className="p-3 font-mono font-semibold text-white">
                          {st.nisn} <span className="text-[10px] text-[#71717A] block">NIS: {st.nis}</span>
                        </td>
                        <td className="p-3 font-bold text-white">{st.nama}</td>
                        <td className="p-3 font-semibold text-[#D1D1D1]">{st.namaKelas}</td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">{st.nomorPeserta}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${sessionBadgeColor}`}>
                            Sesi {sesiNum}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[#A1A1AA]">@{st.username}</td>
                        <td className="p-3 text-[#71717A]">{st.ruangId || 'LAB-01'}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                            Aktif
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => openStudentModal(st)}
                              className="p-1 text-[#71717A] hover:text-white"
                              title="Edit Siswa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus data siswa ${st.nama}?`)) deleteStudent(st.id);
                              }}
                              className="p-1 text-[#71717A] hover:text-rose-400"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-[#71717A]">
                        Tidak ada data siswa yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Data Guru */}
      {activeTab === 'guru' && (
        <div className="bg-[#161618] p-6 rounded-2xl shadow-sm border border-[#222224] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
            <div>
              <h2 className="text-base font-bold text-white">Daftar Guru Pengampu Mapel</h2>
              <p className="text-xs text-[#71717A]">Kelola akun guru untuk membuat bank soal dan mengoreksi essay.</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportTeachersToExcel(teachers)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#252529] text-[#D1D1D1] border border-[#2D2D31] text-xs font-semibold rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <button
                onClick={downloadTeacherTemplate}
                className="p-2 text-[#71717A] hover:text-emerald-400"
                title="Download Template Guru"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={() => openTeacherModal()}
                className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Guru</span>
              </button>
            </div>
          </div>

          <div className="border border-[#222224] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F0F11] text-[#71717A] font-bold border-b border-[#222224]">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">NIP / NUPTK</th>
                  <th className="p-3">Nama Guru</th>
                  <th className="p-3">Mata Pelajaran Diampu</th>
                  <th className="p-3">Kontak / Email</th>
                  <th className="p-3">Username</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222224]">
                {teachers.map((tc, idx) => (
                  <tr key={tc.id} className="hover:bg-[#1C1C1F] transition-colors">
                    <td className="p-3 font-bold text-[#52525B]">{idx + 1}</td>
                    <td className="p-3 font-mono font-semibold text-white">
                      {tc.nip} <span className="text-[10px] text-[#71717A] block">NUPTK: {tc.nuptk}</span>
                    </td>
                    <td className="p-3 font-bold text-white">{tc.nama}</td>
                    <td className="p-3 font-semibold text-emerald-400">{tc.mapelUtama}</td>
                    <td className="p-3 text-[#A1A1AA]">
                      <div>{tc.email}</div>
                      <div className="text-[10px] text-[#71717A]">{tc.nomorHp}</div>
                    </td>
                    <td className="p-3 font-mono text-[#71717A]">@{tc.username}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => openTeacherModal(tc)}
                          className="p-1 text-[#71717A] hover:text-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus guru ${tc.nama}?`)) deleteTeacher(tc.id);
                          }}
                          className="p-1 text-[#71717A] hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Data Kelas */}
      {activeTab === 'kelas' && (
        <div className="bg-[#161618] p-6 rounded-2xl shadow-sm border border-[#222224] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
            <div>
              <h2 className="text-base font-bold text-white">Rombongan Belajar / Kelas</h2>
              <p className="text-xs text-[#71717A]">Daftar kelas yang terdaftar dalam CBT.</p>
            </div>
            <button
              onClick={() => openClassModal()}
              className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map(cls => {
              const count = students.filter(s => s.classId === cls.id).length;
              return (
                <div key={cls.id} className="p-4 bg-[#121214] rounded-2xl border border-[#222224]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded">
                      Tingkat {cls.tingkat}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openClassModal(cls)}
                        className="p-1 text-[#71717A] hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus kelas ${cls.namaKelas}?`)) deleteClass(cls.id);
                        }}
                        className="p-1 text-[#71717A] hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-white mt-2">{cls.namaKelas}</h3>
                  <div className="text-xs text-[#71717A] mt-1">Wali: {cls.waliKelas}</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-2">
                    {count} Siswa Terdaftar
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Data Mapel */}
      {activeTab === 'mapel' && (
        <div className="bg-[#161618] p-6 rounded-2xl shadow-sm border border-[#222224] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
            <div>
              <h2 className="text-base font-bold text-white">Mata Pelajaran Madrasah</h2>
              <p className="text-xs text-[#71717A]">Mata pelajaran Umum, PAI (Fikih, SKI, Akidah Akhlak, Quran Hadits), dan Bahasa.</p>
            </div>
            <button
              onClick={() => openSubModal()}
              className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mapel</span>
            </button>
          </div>

          <div className="border border-[#222224] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F0F11] text-[#71717A] font-bold border-b border-[#222224]">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Kode Mapel</th>
                  <th className="p-3">Nama Mata Pelajaran</th>
                  <th className="p-3">Kelompok</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222224]">
                {subjects.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-[#1C1C1F] transition-colors">
                    <td className="p-3 font-bold text-[#52525B]">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{sub.kode}</td>
                    <td className="p-3 font-bold text-white">{sub.namaMataPelajaran}</td>
                    <td className="p-3 text-[#A1A1AA]">{sub.kelompok}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                        Aktif
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => openSubModal(sub)}
                          className="p-1 text-[#71717A] hover:text-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus mata pelajaran ${sub.namaMataPelajaran}?`)) deleteSubject(sub.id);
                          }}
                          className="p-1 text-[#71717A] hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Ruang Ujian */}
      {activeTab === 'ruang' && (
        <div className="bg-[#161618] p-6 rounded-2xl shadow-sm border border-[#222224] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
            <div>
              <h2 className="text-base font-bold text-white">Ruang & Laboratorium Ujian</h2>
              <p className="text-xs text-[#71717A]">Penataan ruang ujian, kapasitas komputer, dan proktor penanggung jawab.</p>
            </div>
            <button
              onClick={() => openRoomModal()}
              className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Ruang</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rooms.map(r => (
              <div key={r.id} className="p-4 bg-[#121214] rounded-2xl border border-[#222224]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded">
                    {r.nomorRuang}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openRoomModal(r)}
                      className="p-1 text-[#71717A] hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus ruang ${r.namaRuang}?`)) deleteRoom(r.id);
                      }}
                      className="p-1 text-[#71717A] hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-white mt-2">{r.namaRuang}</h3>
                <div className="text-xs text-[#71717A] mt-1">Kapasitas: {r.kapasitas} Klien PC</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">
                  Pengawas: {r.pengawasUtama}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Pengaturan Sesi Ujian (Maksimal 4 Sesi) */}
      {activeTab === 'sesi' && (
        <div className="bg-[#161618] p-6 rounded-2xl shadow-sm border border-[#222224] space-y-6">
          {/* Header & Policy Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222224]">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-base font-bold text-white">Pengaturan Sesi Ujian</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                  {sessionConfigs.length} / 4 Sesi Terdaftar
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-1">
                Kelola jadwal waktu pelaksanaan ujian CBT madrasah. Sesuai regulasi dan kapasitas lab komputer, dibatasi maksimal 4 sesi.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setShowAutoAssignModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#252529] text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl transition-all"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Distribusi Siswa</span>
              </button>

              <button
                onClick={() => openSessionModal()}
                disabled={sessionConfigs.length >= 4}
                className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-xl shadow-md transition-all ${
                  sessionConfigs.length >= 4
                    ? 'bg-[#252529] text-[#71717A] cursor-not-allowed border border-[#2D2D31]'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title={sessionConfigs.length >= 4 ? 'Maksimal 4 Sesi Ujian telah terpenuhi' : 'Tambah Sesi Baru'}
              >
                <Plus className="w-4 h-4" />
                <span>{sessionConfigs.length >= 4 ? 'Maks. 4 Sesi (Penuh)' : 'Tambah Sesi'}</span>
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-3.5 bg-[#121214] border border-[#222224] rounded-2xl flex items-start space-x-3 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[#A1A1AA] leading-relaxed">
              <span className="text-white font-semibold">Aturan 4 Sesi Ujian:</span> Sistem CBT ini mendukung pembagian hingga 4 sesi harian (contoh: Sesi 1 Pagi, Sesi 2 Siang, Sesi 3 Sore, Sesi 4 Petang). Siswa hanya dapat login dan mengerjakan ujian pada sesi yang telah ditetapkan untuk mencegah kepadatan server dan lalu lintas jaringan lokal.
            </div>
          </div>

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(sNum => {
              const cfg = sessionConfigs.find(c => c.nomorSesi === sNum);
              const studentCount = students.filter(s => (s.sesi || 1) === sNum).length;

              if (!cfg) {
                return (
                  <div
                    key={`slot-${sNum}`}
                    className="p-5 bg-[#121214]/60 border border-dashed border-[#2D2D31] rounded-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1C1C1F] border border-[#2D2D31] flex items-center justify-center text-xs font-bold text-[#71717A]">
                      #{sNum}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#71717A]">Sesi {sNum} Belum Aktif</h4>
                      <p className="text-[11px] text-[#52525B] mt-0.5">Slot sesi tersedia (Maks. 4)</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingSession(null);
                        setSessNomor(sNum);
                        setSessNama(`Sesi ${sNum}`);
                        setSessMulai(
                          sNum === 1 ? '07:30' : sNum === 2 ? '10:00' : sNum === 3 ? '13:00' : '15:30'
                        );
                        setSessSelesai(
                          sNum === 1 ? '09:30' : sNum === 2 ? '12:00' : sNum === 3 ? '15:00' : '17:30'
                        );
                        setSessKeterangan(`Jadwal Sesi ${sNum} CBT Madrasah`);
                        setShowSessionModal(true);
                      }}
                      className="px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#252529] text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold"
                    >
                      + Aktifkan Sesi {sNum}
                    </button>
                  </div>
                );
              }

              const badgeColor =
                sNum === 1 ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300' :
                sNum === 2 ? 'border-amber-500/40 bg-amber-950/40 text-amber-300' :
                sNum === 3 ? 'border-sky-500/40 bg-sky-950/40 text-sky-300' :
                'border-purple-500/40 bg-purple-950/40 text-purple-300';

              return (
                <div
                  key={cfg.id}
                  className={`p-5 bg-[#121214] rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    cfg.statusAktif ? 'border-[#2D2D31] hover:border-emerald-500/50' : 'border-[#222224] opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${badgeColor}`}>
                        Sesi {cfg.nomorSesi}
                      </span>
                      <button
                        onClick={() => toggleSessionStatus(cfg.id)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                          cfg.statusAktif ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50' : 'bg-[#1C1C1F] text-[#71717A] border border-[#2D2D31]'
                        }`}
                        title="Klik untuk mengubah status aktif sesi"
                      >
                        {cfg.statusAktif ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-sm">{cfg.namaSesi}</h3>
                      <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-mono font-semibold mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{cfg.jamMulai} - {cfg.jamSelesai} WIB</span>
                      </div>
                      {cfg.keterangan && (
                        <p className="text-[11px] text-[#71717A] mt-1.5 line-clamp-2">
                          {cfg.keterangan}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#222224] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#71717A] block">Peserta Terdaftar</span>
                      <span className="text-xs font-bold text-white">{studentCount} Siswa</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openSessionModal(cfg)}
                        className="p-1.5 text-[#71717A] hover:text-white hover:bg-[#1C1C1F] rounded-lg transition-colors"
                        title="Edit Sesi"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus konfigurasi ${cfg.namaSesi}?`)) {
                            deleteSessionConfig(cfg.id);
                          }
                        }}
                        className="p-1.5 text-[#71717A] hover:text-rose-400 hover:bg-[#1C1C1F] rounded-lg transition-colors"
                        title="Hapus Sesi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: Tahun Pelajaran & Semester */}
      {activeTab === 'periode' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tahun Pelajaran */}
          <div className="bg-[#161618] p-6 rounded-2xl shadow-sm border border-[#222224] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <h2 className="text-base font-bold text-white">Tahun Pelajaran</h2>
              <button
                onClick={() => setShowAyModal(true)}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                + Tambah
              </button>
            </div>
            <div className="space-y-2">
              {academicYears.map(ay => (
                <div
                  key={ay.id}
                  className="p-3 bg-[#121214] rounded-xl border border-[#222224] flex items-center justify-between"
                >
                  <span className="font-bold text-white text-sm">{ay.tahunPelajaran}</span>
                  <button
                    onClick={() => toggleAcademicYear(ay.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      ay.statusAktif ? 'bg-emerald-600 text-white' : 'bg-[#1C1C1F] text-[#71717A] border border-[#2D2D31]'
                    }`}
                  >
                    {ay.statusAktif ? 'AKTIF ✓' : 'Nonaktif'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Semester */}
          <div className="bg-[#161618] p-6 rounded-2xl shadow-sm border border-[#222224] space-y-4">
            <div className="pb-3 border-b border-[#222224]">
              <h2 className="text-base font-bold text-white">Semester Berjalan</h2>
            </div>
            <div className="space-y-2">
              {semesters.map(sem => (
                <div
                  key={sem.id}
                  className="p-3 bg-[#121214] rounded-xl border border-[#222224] flex items-center justify-between"
                >
                  <span className="font-bold text-white text-sm">Semester {sem.semester}</span>
                  <button
                    onClick={() => toggleSemester(sem.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      sem.statusAktif ? 'bg-emerald-600 text-white' : 'bg-[#1C1C1F] text-[#71717A] border border-[#2D2D31]'
                    }`}
                  >
                    {sem.statusAktif ? 'AKTIF ✓' : 'Nonaktif'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Form Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveStudent}
            className="bg-[#161618] rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-[#2D2D31] max-h-[90vh] overflow-y-auto space-y-4 text-[#D1D1D1]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <h3 className="font-bold text-base text-white">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                className="p-1 text-[#71717A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">NISN (10 Digit)</label>
                <input
                  type="text"
                  required
                  value={stdNISN}
                  onChange={e => setStdNISN(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">NIS Madrasah</label>
                <input
                  type="text"
                  required
                  value={stdNIS}
                  onChange={e => setStdNIS(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-[#A1A1AA] mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={stdNama}
                  onChange={e => setStdNama(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Jenis Kelamin</label>
                <select
                  value={stdJK}
                  onChange={e => setStdJK(e.target.value as 'L' | 'P')}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Rombel Kelas</label>
                <select
                  value={stdClassId}
                  onChange={e => setStdClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.namaKelas}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Nomor Peserta Ujian</label>
                <input
                  type="text"
                  value={stdNomorPeserta}
                  onChange={e => setStdNomorPeserta(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-amber-400 mb-1">Sesi Ujian (1 - 4)</label>
                <select
                  value={stdSesi}
                  onChange={e => setStdSesi(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#121214] text-amber-300 border border-amber-500/40 rounded-xl font-bold"
                >
                  <option value={1}>Sesi 1 (Pagi 07:30 - 09:30)</option>
                  <option value={2}>Sesi 2 (Siang 10:00 - 12:00)</option>
                  <option value={3}>Sesi 3 (Sore 13:00 - 15:00)</option>
                  <option value={4}>Sesi 4 (Petang 15:30 - 17:30)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={stdUsername}
                  onChange={e => setStdUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Ruang Ujian</label>
                <select
                  value={stdRuangId}
                  onChange={e => setStdRuangId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.nomorRuang}>
                      {r.namaRuang} ({r.nomorRuang})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Simpan Data Siswa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teacher Form Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveTeacher}
            className="bg-[#161618] rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-[#2D2D31] max-h-[90vh] overflow-y-auto space-y-4 text-[#D1D1D1]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <h3 className="font-bold text-base text-white">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowTeacherModal(false)}
                className="p-1 text-[#71717A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">NIP</label>
                <input
                  type="text"
                  value={tchNIP}
                  onChange={e => setTchNIP(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">NUPTK</label>
                <input
                  type="text"
                  value={tchNUPTK}
                  onChange={e => setTchNUPTK(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-[#A1A1AA] mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={tchNama}
                  onChange={e => setTchNama(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Mata Pelajaran Utama</label>
                <select
                  value={tchMapel}
                  onChange={e => setTchMapel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.namaMataPelajaran}>
                      {s.namaMataPelajaran}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={tchUsername}
                  onChange={e => setTchUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Email</label>
                <input
                  type="email"
                  value={tchEmail}
                  onChange={e => setTchEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">No. WhatsApp/HP</label>
                <input
                  type="text"
                  value={tchHp}
                  onChange={e => setTchHp(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowTeacherModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Simpan Guru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Class Form Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveClass}
            className="bg-[#161618] rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-[#2D2D31] space-y-4 text-[#D1D1D1]"
          >
            <h3 className="font-bold text-base text-white">
              {editingClass ? 'Edit Rombel Kelas' : 'Tambah Rombel Kelas'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Nama Rombel Kelas</label>
                <input
                  type="text"
                  required
                  value={clsNama}
                  onChange={e => setClsNama(e.target.value)}
                  placeholder="Contoh: VII-A (Tahfidz)"
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Tingkat</label>
                <select
                  value={clsTingkat}
                  onChange={e => setClsTingkat(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                >
                  <option value="7">7 (Kelas VII)</option>
                  <option value="8">8 (Kelas VIII)</option>
                  <option value="9">9 (Kelas IX)</option>
                  <option value="10">10 (Kelas X)</option>
                  <option value="11">11 (Kelas XI)</option>
                  <option value="12">12 (Kelas XII)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Wali Kelas</label>
                <input
                  type="text"
                  value={clsWali}
                  onChange={e => setClsWali(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowClassModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Simpan Kelas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subject Form Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveSubject}
            className="bg-[#161618] rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-[#2D2D31] space-y-4 text-[#D1D1D1]"
          >
            <h3 className="font-bold text-base text-white">
              {editingSub ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Kode Mapel</label>
                <input
                  type="text"
                  required
                  value={subKode}
                  onChange={e => setSubKode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={subNama}
                  onChange={e => setSubNama(e.target.value)}
                  placeholder="Contoh: Fikih Ibadah"
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Kelompok</label>
                <select
                  value={subKelompok}
                  onChange={e => setSubKelompok(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                >
                  <option value="Umum">Umum</option>
                  <option value="Agama">Agama (PAI / B. Arab)</option>
                  <option value="Peminatan">Peminatan</option>
                  <option value="Muatan Lokal">Muatan Lokal</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSubModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Simpan Mapel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveRoom}
            className="bg-[#161618] rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-[#2D2D31] space-y-4 text-[#D1D1D1]"
          >
            <h3 className="font-bold text-base text-white">
              {editingRoom ? 'Edit Ruang Ujian' : 'Tambah Ruang Ujian'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Nama Ruang</label>
                <input
                  type="text"
                  required
                  value={roomNama}
                  onChange={e => setRoomNama(e.target.value)}
                  placeholder="Laboratorium Komputer 1"
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Kode / Nomor Ruang</label>
                <input
                  type="text"
                  required
                  value={roomNomor}
                  onChange={e => setRoomNomor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Kapasitas Klien (Unit PC)</label>
                <input
                  type="number"
                  min={1}
                  value={roomKapasitas}
                  onChange={e => setRoomKapasitas(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Pengawas Utama</label>
                <input
                  type="text"
                  value={roomPengawas}
                  onChange={e => setRoomPengawas(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowRoomModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Simpan Ruang
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Academic Year Modal */}
      {showAyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#161618] rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-[#2D2D31] space-y-4 text-[#D1D1D1]">
            <h3 className="font-bold text-base text-white">Tambah Tahun Pelajaran</h3>
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Format: YYYY/YYYY</label>
              <input
                type="text"
                value={ayTahun}
                onChange={e => setAyTahun(e.target.value)}
                placeholder="2026/2027"
                className="w-full px-3 py-2 text-xs bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono"
              />
            </div>
            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                onClick={() => setShowAyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  addAcademicYear({
                    id: 'ay-' + Date.now(),
                    tahunPelajaran: ayTahun,
                    statusAktif: false
                  });
                  setShowAyModal(false);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Form Modal (Maksimal 4 Sesi) */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveSession}
            className="bg-[#161618] rounded-3xl shadow-2xl max-w-md w-full p-6 border border-[#2D2D31] space-y-4 text-[#D1D1D1]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">
                  {editingSession ? `Edit Sesi ${editingSession.nomorSesi}` : 'Tambah Sesi Ujian (Maks. 4)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                className="p-1 text-[#71717A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-amber-400 mb-1">
                  Nomor Sesi (1 - 4)
                </label>
                <select
                  value={sessNomor}
                  disabled={!!editingSession}
                  onChange={e => {
                    const num = Number(e.target.value);
                    setSessNomor(num);
                    if (!editingSession) {
                      setSessNama(
                        num === 1 ? 'Sesi 1 (Pagi)' :
                        num === 2 ? 'Sesi 2 (Siang)' :
                        num === 3 ? 'Sesi 3 (Sore)' : 'Sesi 4 (Petang)'
                      );
                      setSessMulai(
                        num === 1 ? '07:30' :
                        num === 2 ? '10:00' :
                        num === 3 ? '13:00' : '15:30'
                      );
                      setSessSelesai(
                        num === 1 ? '09:30' :
                        num === 2 ? '12:00' :
                        num === 3 ? '15:00' : '17:30'
                      );
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-bold focus:border-amber-500 focus:outline-none"
                >
                  {[1, 2, 3, 4].map(n => {
                    const isTaken = !editingSession && sessionConfigs.some(c => c.nomorSesi === n);
                    return (
                      <option key={n} value={n} disabled={isTaken}>
                        Sesi {n} {isTaken ? '(Sudah Ada)' : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-[#71717A] mt-1">Sistem dibatasi secara ketat maksimal 4 sesi ujian.</p>
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Nama / Label Sesi</label>
                <input
                  type="text"
                  required
                  value={sessNama}
                  onChange={e => setSessNama(e.target.value)}
                  placeholder="Contoh: Sesi 1 (Pagi)"
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={sessMulai}
                    onChange={e => setSessMulai(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={sessSelesai}
                    onChange={e => setSessSelesai(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Keterangan / Catatan Sesi</label>
                <input
                  type="text"
                  value={sessKeterangan}
                  onChange={e => setSessKeterangan(e.target.value)}
                  placeholder="Contoh: Digunakan untuk Gelombang 1 kelas IX"
                  className="w-full px-3 py-2 bg-[#121214] text-white border border-[#2D2D31] rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Auto Assign Modal */}
      {showAutoAssignModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#161618] rounded-3xl shadow-2xl max-w-md w-full p-6 border border-[#2D2D31] space-y-4 text-[#D1D1D1]">
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <div className="flex items-center space-x-2">
                <Shuffle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Distribusi Sesi Otomatis</h3>
              </div>
              <button
                onClick={() => setShowAutoAssignModal(false)}
                className="p-1 text-[#71717A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#A1A1AA]">
              Fitur ini akan membagikan <strong className="text-white">{students.length} siswa</strong> ke dalam{' '}
              <strong className="text-amber-300">{sessionConfigs.filter(s => s.statusAktif).length} sesi aktif</strong> (maksimal 4 sesi).
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-white">Metode Distribusi:</label>

              <label
                onClick={() => setAutoAssignMode('even')}
                className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  autoAssignMode === 'even' ? 'bg-amber-950/20 border-amber-500/50 text-white' : 'bg-[#121214] border-[#222224] text-[#A1A1AA]'
                }`}
              >
                <input
                  type="radio"
                  name="assignMode"
                  checked={autoAssignMode === 'even'}
                  onChange={() => setAutoAssignMode('even')}
                  className="mt-0.5 text-amber-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold block text-white">Bagi Rata (Round-Robin)</span>
                  <span className="text-[11px] text-[#71717A]">
                    Membagi siswa secara merata ke setiap sesi (Sesi 1, 2, 3, 4) sehingga beban server dan jumlah komputer per sesi seimbang.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setAutoAssignMode('by_class')}
                className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  autoAssignMode === 'by_class' ? 'bg-amber-950/20 border-amber-500/50 text-white' : 'bg-[#121214] border-[#222224] text-[#A1A1AA]'
                }`}
              >
                <input
                  type="radio"
                  name="assignMode"
                  checked={autoAssignMode === 'by_class'}
                  onChange={() => setAutoAssignMode('by_class')}
                  className="mt-0.5 text-amber-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold block text-white">Berdasarkan Rombel Kelas</span>
                  <span className="text-[11px] text-[#71717A]">
                    Siswa dalam satu rombel kelas yang sama akan dikelompokkan ke sesi yang sama.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-3 border-t border-[#222224] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAutoAssignModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-[#1C1C1F] rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAutoAssignSubmit}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Jalankan Distribusi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
