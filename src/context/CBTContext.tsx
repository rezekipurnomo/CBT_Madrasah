import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  MadrasahProfile,
  AcademicYear,
  Semester,
  ClassGroup,
  Subject,
  Teacher,
  Student,
  ExamRoom,
  ExamSessionConfig,
  QuestionBank,
  Question,
  Exam,
  ExamSession,
  ExamResult,
  StudentAnswer,
  ActivityLog,
  BackupItem,
  SystemHealthStatus
} from '../types';
import {
  initialMadrasah,
  initialAcademicYears,
  initialSemesters,
  initialClasses,
  initialSubjects,
  initialTeachers,
  initialStudents,
  initialUsers,
  initialQuestionBanks,
  initialQuestions,
  initialExams,
  initialExamSessions,
  initialExamResults,
  initialActivityLogs,
  initialBackups,
  initialRooms,
  initialSessionConfigs
} from '../data/initialData';
import { offlineSyncManager } from '../utils/offlineSyncManager';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface CBTContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  login: (identifier: string, pass: string, asRole?: UserRole) => { success: boolean; message: string };
  loginWithUser: (user: User) => { success: boolean; message: string };
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;

  // Madrasah
  madrasah: MadrasahProfile;
  updateMadrasah: (data: Partial<MadrasahProfile>) => void;

  // Master Data
  academicYears: AcademicYear[];
  addAcademicYear: (ay: AcademicYear) => void;
  toggleAcademicYear: (id: string) => void;

  semesters: Semester[];
  toggleSemester: (id: string) => void;

  classes: ClassGroup[];
  addClass: (cls: ClassGroup) => void;
  updateClass: (cls: ClassGroup) => void;
  deleteClass: (id: string) => void;

  subjects: Subject[];
  addSubject: (sub: Subject) => void;
  updateSubject: (sub: Subject) => void;
  deleteSubject: (id: string) => void;

  teachers: Teacher[];
  addTeacher: (t: Teacher) => void;
  updateTeacher: (t: Teacher) => void;
  deleteTeacher: (id: string) => void;
  importTeachersList: (tList: Teacher[]) => void;

  students: Student[];
  addStudent: (s: Student) => void;
  updateStudent: (s: Student) => void;
  deleteStudent: (id: string) => void;
  importStudentsList: (sList: Student[]) => void;

  rooms: ExamRoom[];
  addRoom: (r: ExamRoom) => void;
  updateRoom: (r: ExamRoom) => void;
  deleteRoom: (id: string) => void;

  // Session Configs (Maksimal 4 Sesi)
  sessionConfigs: ExamSessionConfig[];
  addSessionConfig: (cfg: ExamSessionConfig) => { success: boolean; message: string };
  updateSessionConfig: (cfg: ExamSessionConfig) => void;
  deleteSessionConfig: (id: string) => void;
  toggleSessionStatus: (id: string) => void;
  autoAssignStudentSessions: (mode: 'even' | 'by_class' | 'by_room') => void;
  bulkAssignSessionToStudents: (studentIds: string[], sessionNumber: number) => void;

  // Bank Soal & Questions
  questionBanks: QuestionBank[];
  addQuestionBank: (qb: QuestionBank) => void;
  updateQuestionBank: (qb: QuestionBank) => void;
  deleteQuestionBank: (id: string) => void;

  questions: Question[];
  addQuestion: (q: Question) => void;
  updateQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  duplicateQuestion: (id: string) => void;
  importQuestionsList: (qList: Question[]) => void;

  // Exams
  exams: Exam[];
  addExam: (exam: Exam) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  toggleExamStatus: (id: string, status: 'draft' | 'aktif' | 'selesai' | 'arsip') => void;
  regenerateExamToken: (id: string) => string;

  // Exam Sessions & Taking
  examSessions: { [id: string]: ExamSession };
  activeExamSessionId: string | null;
  setActiveExamSessionId: (id: string | null) => void;
  startExam: (examId: string, tokenInput: string, studentId: string) => { success: boolean; message: string; session?: ExamSession };
  saveStudentAnswer: (sessionId: string, questionId: string, value: any, isFlagged?: boolean) => void;
  toggleFlagAnswer: (sessionId: string, questionId: string) => void;
  finishExamSession: (sessionId: string, autoSubmit?: boolean) => void;
  resetStudentSession: (sessionId: string) => void;
  addTimeSession: (sessionId: string, additionalMinutes: number) => void;
  gradeEssayAnswer: (resultId: string, questionId: string, score: number, feedback: string) => void;
  syncOfflineQueue: (sessionId: string) => Promise<{ syncedCount: number }>;
  syncAllOfflineQueues: () => Promise<{ totalSynced: number }>;
  exportEmergencySessionBackup: (sessionId: string) => Promise<{ fileName: string; jsonData: string }>;
  importEmergencySessionBackup: (jsonString: string) => { success: boolean; message: string; studentName?: string };

  // Results
  examResults: ExamResult[];
  deleteResult: (id: string) => void;

  // System & Logs
  activityLogs: ActivityLog[];
  logActivity: (action: string, details: string) => void;
  systemHealth: SystemHealthStatus;
  serverTime: Date;

  // Backup & Restore
  backups: BackupItem[];
  createBackup: (type?: 'full' | 'database_only' | 'questions_only') => BackupItem;
  restoreBackup: (backupId: string) => boolean;
  restoreFromJSON: (jsonString: string) => boolean;
  resetToDefaultDatabase: () => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const CBTContext = createContext<CBTContextType | undefined>(undefined);

const STORAGE_KEY = 'CBT_MADRASAH_DB_V1';

function getStoredArray<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') return fallback;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

function getStoredObject<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') return fallback;
    const parsed = JSON.parse(saved);
    return (parsed && typeof parsed === 'object') ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

export const CBTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or seeds
  const [madrasah, setMadrasah] = useState<MadrasahProfile>(() => {
    return getStoredObject(`${STORAGE_KEY}_madrasah`, initialMadrasah);
  });

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_ay`, initialAcademicYears);
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_sem`, initialSemesters);
  });

  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_classes`, initialClasses);
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_subjects`, initialSubjects);
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_teachers`, initialTeachers);
  });

  const [students, setStudents] = useState<Student[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_students`, initialStudents);
  });

  const [users, setUsers] = useState<User[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_users`, initialUsers);
  });

  const [rooms, setRooms] = useState<ExamRoom[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_rooms`, initialRooms);
  });

  const [sessionConfigs, setSessionConfigs] = useState<ExamSessionConfig[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_session_configs`, initialSessionConfigs);
  });

  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_qbanks`, initialQuestionBanks);
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_questions`, initialQuestions);
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_exams`, initialExams);
  });

  const [examSessions, setExamSessions] = useState<{ [id: string]: ExamSession }>(() => {
    return getStoredObject(`${STORAGE_KEY}_sessions`, initialExamSessions);
  });

  const [examResults, setExamResults] = useState<ExamResult[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_results`, initialExamResults);
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_logs`, initialActivityLogs);
  });

  const [backups, setBackups] = useState<BackupItem[]>(() => {
    return getStoredArray(`${STORAGE_KEY}_backups`, initialBackups);
  });

  // Current logged in user (persisted in localStorage across browser refresh)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return getStoredObject<User | null>(`${STORAGE_KEY}_current_user`, null);
  });

  const [activeExamSessionId, setActiveExamSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_active_sess_id`);
    return (saved && saved !== 'null' && saved !== 'undefined') ? saved : null;
  });

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Server Time simulation ticker
  const [serverTime, setServerTime] = useState<Date>(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_madrasah`, JSON.stringify(madrasah));
  }, [madrasah]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ay`, JSON.stringify(academicYears));
  }, [academicYears]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sem`, JSON.stringify(semesters));
  }, [semesters]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
  }, [classes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
  }, [subjects]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_teachers`, JSON.stringify(teachers));
  }, [teachers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rooms`, JSON.stringify(rooms));
  }, [rooms]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_session_configs`, JSON.stringify(sessionConfigs));
  }, [sessionConfigs]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_qbanks`, JSON.stringify(questionBanks));
  }, [questionBanks]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_questions`, JSON.stringify(questions));
  }, [questions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_exams`, JSON.stringify(exams));
  }, [exams]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(examSessions));
  }, [examSessions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_results`, JSON.stringify(examResults));
  }, [examResults]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(activityLogs));
  }, [activityLogs]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_backups`, JSON.stringify(backups));
  }, [backups]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);
  useEffect(() => {
    if (activeExamSessionId) {
      localStorage.setItem(`${STORAGE_KEY}_active_sess_id`, activeExamSessionId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_active_sess_id`);
    }
  }, [activeExamSessionId]);

  // Log Activity Helper
  const logActivity = useCallback((action: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'System',
      role: currentUser?.role || 'admin',
      action,
      details,
      ipAddress: madrasah.serverIp
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, [currentUser, madrasah.serverIp]);

  // Auth Operations
  const login = (identifier: string, pass: string, asRole?: UserRole) => {
    const trimmed = identifier.trim().toLowerCase();
    
    // 1. Find user in users collection
    let foundUser = users.find(u => 
      u.username.toLowerCase() === trimmed || 
      (u.email && u.email.toLowerCase() === trimmed)
    );
    
    // 2. Check student NISN, NIS, nomorPeserta, or username
    if (!foundUser) {
      const matchedStudent = students.find(s => 
        s.nisn.toLowerCase() === trimmed || 
        (s.nis && s.nis.toLowerCase() === trimmed) ||
        (s.nomorPeserta && s.nomorPeserta.toLowerCase() === trimmed) || 
        s.username.toLowerCase() === trimmed
      );
      if (matchedStudent) {
        foundUser = users.find(u => u.id === matchedStudent.userId || u.studentId === matchedStudent.id) || {
          id: matchedStudent.userId || 'usr-' + matchedStudent.id,
          username: matchedStudent.username,
          name: matchedStudent.nama,
          role: 'siswa',
          studentId: matchedStudent.id,
          status: matchedStudent.status
        };
      }
    }
    
    // 3. Check teacher NIP, NUPTK, email, or username
    if (!foundUser) {
      const matchedTeacher = teachers.find(t => 
        (t.nip && t.nip.toLowerCase() === trimmed) || 
        (t.nuptk && t.nuptk.toLowerCase() === trimmed) ||
        t.username.toLowerCase() === trimmed ||
        (t.email && t.email.toLowerCase() === trimmed)
      );
      if (matchedTeacher) {
        foundUser = users.find(u => u.id === matchedTeacher.userId || u.teacherId === matchedTeacher.id) || {
          id: matchedTeacher.userId || 'usr-' + matchedTeacher.id,
          username: matchedTeacher.username,
          name: matchedTeacher.nama,
          email: matchedTeacher.email,
          role: 'guru',
          phone: matchedTeacher.nomorHp,
          teacherId: matchedTeacher.id,
          status: matchedTeacher.status
        };
      }
    }

    if (!foundUser) {
      return { success: false, message: 'Identitas akun (Username / NISN / NIP / No. Peserta) tidak ditemukan!' };
    }

    if (foundUser.status !== 'aktif') {
      return { success: false, message: 'Akun ini berstatus non-aktif. Silakan hubungi proktor/administrator.' };
    }

    // Role check if specified
    if (asRole && foundUser.role !== asRole && !(asRole === 'admin' && foundUser.role === 'super_admin')) {
      const roleLabels: Record<UserRole, string> = {
        super_admin: 'Super Admin',
        admin: 'Operator Madrasah',
        guru: 'Guru Mapel',
        siswa: 'Peserta'
      };
      return { 
        success: false, 
        message: `Akun ini terdaftar sebagai '${roleLabels[foundUser.role]}'. Silakan pilih opsi peran '${roleLabels[foundUser.role]}' untuk melanjutkan.` 
      };
    }

    const updatedUser: User = {
      ...foundUser,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setCurrentUser(updatedUser);
    logActivity('USER_LOGIN', `Pengguna ${foundUser.name} (${foundUser.role}) berhasil masuk ke sistem CBT`);
    showToast(`Selamat datang, ${foundUser.name}!`, 'success');
    return { success: true, message: 'Login berhasil!' };
  };

  const loginWithUser = (user: User) => {
    const updatedUser: User = {
      ...user,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setCurrentUser(updatedUser);
    logActivity('USER_LOGIN', `Pengguna ${user.name} (${user.role}) masuk melalui pilihan akun terdaftar`);
    showToast(`Berhasil masuk sebagai ${user.name} (${user.role.toUpperCase()})!`, 'success');
    return { success: true, message: 'Login berhasil!' };
  };

  const logout = () => {
    if (currentUser) {
      logActivity('USER_LOGOUT', `Pengguna ${currentUser.name} keluar dari sistem`);
    }
    setCurrentUser(null);
    setActiveExamSessionId(null);
    localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    localStorage.removeItem(`${STORAGE_KEY}_active_sess_id`);
    localStorage.removeItem('CBT_MADRASAH_CURRENT_VIEW');
    localStorage.removeItem('CBT_MADRASAH_RUNNING_EXAM_ID');
    localStorage.removeItem('CBT_MADRASAH_RUNNING_EXAM_TOKEN');
    showToast('Anda telah keluar dari akun CBT.', 'info');
  };

  const switchDemoRole = (role: UserRole) => {
    const target = users.find(u => u.role === role) || users[0];
    setCurrentUser(target);
    logActivity('ROLE_SWITCH', `Beralih peran ke: ${role.toUpperCase()} (${target.name})`);
    showToast(`Beralih tampilan ke peran: ${role.toUpperCase()}`, 'info');
  };

  // Madrasah Profile
  const updateMadrasah = (data: Partial<MadrasahProfile>) => {
    setMadrasah(prev => ({ ...prev, ...data }));
    logActivity('UPDATE_MADRASAH_PROFILE', 'Memperbarui profil madrasah');
    showToast('Profil identitas madrasah berhasil disimpan!', 'success');
  };

  // Academic Years
  const addAcademicYear = (ay: AcademicYear) => {
    setAcademicYears(prev => [...prev, ay]);
    logActivity('ADD_ACADEMIC_YEAR', `Menambah tahun pelajaran: ${ay.tahunPelajaran}`);
    showToast('Tahun pelajaran baru berhasil ditambahkan!', 'success');
  };

  const toggleAcademicYear = (id: string) => {
    setAcademicYears(prev =>
      prev.map(a => ({ ...a, statusAktif: a.id === id ? !a.statusAktif : false }))
    );
    showToast('Status tahun pelajaran berhasil diubah.', 'info');
  };

  // Semesters
  const toggleSemester = (id: string) => {
    setSemesters(prev =>
      prev.map(s => ({ ...s, statusAktif: s.id === id }))
    );
    showToast('Status semester aktif berhasil diperbarui.', 'info');
  };

  // Classes
  const addClass = (cls: ClassGroup) => {
    setClasses(prev => [...prev, cls]);
    logActivity('ADD_CLASS', `Menambah rombel kelas: ${cls.namaKelas}`);
    showToast(`Kelas ${cls.namaKelas} berhasil ditambahkan!`, 'success');
  };
  const updateClass = (cls: ClassGroup) => {
    setClasses(prev => prev.map(c => c.id === cls.id ? cls : c));
    showToast(`Data kelas ${cls.namaKelas} berhasil diperbarui!`, 'success');
  };
  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    showToast('Data kelas berhasil dihapus.', 'info');
  };

  // Subjects
  const addSubject = (sub: Subject) => {
    setSubjects(prev => [...prev, sub]);
    logActivity('ADD_SUBJECT', `Menambah mata pelajaran: ${sub.namaMataPelajaran}`);
    showToast(`Mata pelajaran ${sub.namaMataPelajaran} berhasil ditambahkan!`, 'success');
  };
  const updateSubject = (sub: Subject) => {
    setSubjects(prev => prev.map(s => s.id === sub.id ? sub : s));
    showToast(`Mata pelajaran ${sub.namaMataPelajaran} berhasil diperbarui!`, 'success');
  };
  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    showToast('Mata pelajaran berhasil dihapus.', 'info');
  };

  // Teachers
  const addTeacher = (t: Teacher) => {
    setTeachers(prev => [...prev, t]);
    // Also create matching user
    const newUser: User = {
      id: t.userId || 'usr-' + t.id,
      username: t.username,
      name: t.nama,
      email: t.email,
      role: 'guru',
      phone: t.nomorHp,
      teacherId: t.id,
      status: t.status
    };
    setUsers(prev => [...prev, newUser]);
    logActivity('ADD_TEACHER', `Menambah guru baru: ${t.nama}`);
    showToast(`Data guru ${t.nama} berhasil ditambahkan!`, 'success');
  };
  const updateTeacher = (t: Teacher) => {
    setTeachers(prev => prev.map(item => item.id === t.id ? t : item));
    setUsers(prev => prev.map(u => u.teacherId === t.id ? { ...u, name: t.nama, email: t.email, username: t.username, status: t.status } : u));
    showToast(`Data guru ${t.nama} berhasil diperbarui!`, 'success');
  };
  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(item => item.id !== id));
    setUsers(prev => prev.filter(u => u.teacherId !== id));
    showToast('Data guru berhasil dihapus.', 'info');
  };
  const importTeachersList = (tList: Teacher[]) => {
    setTeachers(prev => [...prev, ...tList]);
    const newUsers: User[] = tList.map(t => ({
      id: t.userId || 'usr-' + t.id,
      username: t.username,
      name: t.nama,
      email: t.email,
      role: 'guru',
      teacherId: t.id,
      status: t.status
    }));
    setUsers(prev => [...prev, ...newUsers]);
    logActivity('IMPORT_TEACHERS', `Mengimpor ${tList.length} data guru dari Excel`);
    showToast(`Berhasil mengimpor ${tList.length} data guru!`, 'success');
  };

  // Students
  const addStudent = (s: Student) => {
    setStudents(prev => [...prev, s]);
    const newUser: User = {
      id: s.userId || 'usr-' + s.id,
      username: s.username,
      name: s.nama,
      role: 'siswa',
      studentId: s.id,
      status: s.status
    };
    setUsers(prev => [...prev, newUser]);
    logActivity('ADD_STUDENT', `Menambah siswa baru: ${s.nama} (${s.namaKelas})`);
    showToast(`Data siswa ${s.nama} berhasil ditambahkan!`, 'success');
  };
  const updateStudent = (s: Student) => {
    setStudents(prev => prev.map(item => item.id === s.id ? s : item));
    setUsers(prev => prev.map(u => u.studentId === s.id ? { ...u, name: s.nama, username: s.username, status: s.status } : u));
    showToast(`Data siswa ${s.nama} berhasil diperbarui!`, 'success');
  };
  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(item => item.id !== id));
    setUsers(prev => prev.filter(u => u.studentId !== id));
    showToast('Data siswa berhasil dihapus.', 'info');
  };
  const importStudentsList = (sList: Student[]) => {
    setStudents(prev => [...prev, ...sList]);
    const newUsers: User[] = sList.map(s => ({
      id: s.userId || 'usr-' + s.id,
      username: s.username,
      name: s.nama,
      role: 'siswa',
      studentId: s.id,
      status: s.status
    }));
    setUsers(prev => [...prev, ...newUsers]);
    logActivity('IMPORT_STUDENTS', `Mengimpor ${sList.length} data siswa dari Excel`);
    showToast(`Berhasil mengimpor ${sList.length} data siswa!`, 'success');
  };

  // Rooms
  const addRoom = (r: ExamRoom) => {
    setRooms(prev => [...prev, r]);
    showToast(`Ruang ujian ${r.namaRuang} berhasil ditambahkan!`, 'success');
  };
  const updateRoom = (r: ExamRoom) => {
    setRooms(prev => prev.map(item => item.id === r.id ? r : item));
    showToast(`Ruang ujian ${r.namaRuang} berhasil diperbarui!`, 'success');
  };
  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(item => item.id !== id));
    showToast('Ruang ujian berhasil dihapus.', 'info');
  };

  // Session Configs (Pengaturan Sesi Ujian - Maksimal 4 Sesi)
  const addSessionConfig = (cfg: ExamSessionConfig): { success: boolean; message: string } => {
    if (sessionConfigs.length >= 4) {
      showToast('Batas maksimal telah tercapai (Maksimal 4 Sesi Ujian)!', 'warning');
      return {
        success: false,
        message: 'Maksimal 4 sesi ujian telah tercapai. Hapus atau edit sesi yang sudah ada.'
      };
    }
    // Check duplicate session number
    if (sessionConfigs.some(s => s.nomorSesi === cfg.nomorSesi)) {
      showToast(`Sesi ${cfg.nomorSesi} sudah ada dalam konfigurasi!`, 'error');
      return {
        success: false,
        message: `Nomor Sesi ${cfg.nomorSesi} sudah terdaftar.`
      };
    }

    setSessionConfigs(prev => {
      const updated = [...prev, cfg].sort((a, b) => a.nomorSesi - b.nomorSesi);
      return updated;
    });
    logActivity('ADD_SESSION_CONFIG', `Menambah pengaturan sesi ujian: ${cfg.namaSesi} (${cfg.jamMulai} - ${cfg.jamSelesai})`);
    showToast(`Pengaturan ${cfg.namaSesi} berhasil ditambahkan!`, 'success');
    return { success: true, message: 'Sesi ujian berhasil ditambahkan.' };
  };

  const updateSessionConfig = (cfg: ExamSessionConfig) => {
    setSessionConfigs(prev => prev.map(s => s.id === cfg.id ? cfg : s).sort((a, b) => a.nomorSesi - b.nomorSesi));
    logActivity('UPDATE_SESSION_CONFIG', `Memperbarui pengaturan sesi: ${cfg.namaSesi}`);
    showToast(`Pengaturan ${cfg.namaSesi} berhasil diperbarui!`, 'success');
  };

  const deleteSessionConfig = (id: string) => {
    if (sessionConfigs.length <= 1) {
      showToast('Minimal harus ada 1 sesi ujian aktif di madrasah!', 'warning');
      return;
    }
    const target = sessionConfigs.find(s => s.id === id);
    setSessionConfigs(prev => prev.filter(s => s.id !== id));
    if (target) {
      logActivity('DELETE_SESSION_CONFIG', `Menghapus konfigurasi sesi: ${target.namaSesi}`);
    }
    showToast('Sesi ujian berhasil dihapus.', 'info');
  };

  const toggleSessionStatus = (id: string) => {
    setSessionConfigs(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = !s.statusAktif;
        logActivity('TOGGLE_SESSION', `Mengubah status ${s.namaSesi} menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}`);
        return { ...s, statusAktif: nextStatus };
      }
      return s;
    }));
  };

  const autoAssignStudentSessions = (mode: 'even' | 'by_class' | 'by_room' = 'even') => {
    const activeSessions = sessionConfigs.filter(s => s.statusAktif).sort((a, b) => a.nomorSesi - b.nomorSesi);
    if (activeSessions.length === 0) {
      showToast('Tidak ada sesi ujian yang berstatus aktif!', 'error');
      return;
    }

    setStudents(prev => {
      if (mode === 'by_class') {
        // Group by class, assign each class to a session round-robin
        const uniqueClasses: string[] = Array.from(new Set(prev.map(s => s.classId)));
        const classToSessionMap = new Map<string, number>();
        uniqueClasses.forEach((clsId: string, idx: number) => {
          const sess = activeSessions[idx % activeSessions.length];
          classToSessionMap.set(clsId, sess.nomorSesi);
        });
        return prev.map(s => ({
          ...s,
          sesi: classToSessionMap.get(s.classId) || activeSessions[0].nomorSesi
        }));
      } else {
        // Even round-robin distribution
        return prev.map((s, idx) => {
          const sess = activeSessions[idx % activeSessions.length];
          return {
            ...s,
            sesi: sess.nomorSesi
          };
        });
      }
    });

    logActivity('AUTO_ASSIGN_SESSIONS', `Mendistribusikan sesi siswa secara otomatis (${activeSessions.length} sesi aktif)`);
    showToast(`Berhasil membagikan ${students.length} siswa ke dalam ${activeSessions.length} sesi aktif!`, 'success');
  };

  const bulkAssignSessionToStudents = (studentIds: string[], sessionNumber: number) => {
    if (!studentIds || studentIds.length === 0) {
      showToast('Pilih setidaknya satu siswa untuk mengatur sesi!', 'warning');
      return;
    }
    setStudents(prev => prev.map(s => {
      if (studentIds.includes(s.id)) {
        return { ...s, sesi: sessionNumber };
      }
      return s;
    }));
    logActivity('BULK_ASSIGN_SESSION', `Mengatur Sesi ${sessionNumber} untuk ${studentIds.length} siswa`);
    showToast(`Berhasil menerapkan Sesi ${sessionNumber} ke ${studentIds.length} siswa!`, 'success');
  };

  // Question Banks & Questions
  const addQuestionBank = (qb: QuestionBank) => {
    setQuestionBanks(prev => [...prev, qb]);
    logActivity('ADD_QUESTION_BANK', `Menambah bank soal: ${qb.namaBank}`);
    showToast(`Bank soal ${qb.namaBank} berhasil dibuat!`, 'success');
  };
  const updateQuestionBank = (qb: QuestionBank) => {
    setQuestionBanks(prev => prev.map(b => b.id === qb.id ? qb : b));
    showToast(`Bank soal ${qb.namaBank} berhasil diperbarui!`, 'success');
  };
  const deleteQuestionBank = (id: string) => {
    setQuestionBanks(prev => prev.filter(b => b.id !== id));
    setQuestions(prev => prev.filter(q => q.bankId !== id));
    showToast('Bank soal beserta seluruh soal di dalamnya berhasil dihapus.', 'info');
  };

  const addQuestion = (q: Question) => {
    setQuestions(prev => [...prev, q]);
    // update totalSoal in bank
    setQuestionBanks(prev => prev.map(b => {
      if (b.id === q.bankId) {
        return { ...b, totalSoal: b.totalSoal + 1, totalBobot: b.totalBobot + q.bobot };
      }
      return b;
    }));
    showToast('Soal berhasil ditambahkan ke bank soal!', 'success');
  };
  const updateQuestion = (q: Question) => {
    setQuestions(prev => prev.map(item => item.id === q.id ? q : item));
    showToast('Soal berhasil diperbarui!', 'success');
  };
  const deleteQuestion = (id: string) => {
    const target = questions.find(q => q.id === id);
    if (target) {
      setQuestionBanks(prev => prev.map(b => {
        if (b.id === target.bankId) {
          return { ...b, totalSoal: Math.max(0, b.totalSoal - 1), totalBobot: Math.max(0, b.totalBobot - target.bobot) };
        }
        return b;
      }));
    }
    setQuestions(prev => prev.filter(item => item.id !== id));
    showToast('Soal berhasil dihapus dari bank soal.', 'info');
  };
  const duplicateQuestion = (id: string) => {
    const target = questions.find(q => q.id === id);
    if (!target) return;
    const duplicated: Question = {
      ...target,
      id: 'q-' + Date.now(),
      nomorUrut: target.nomorUrut + 1,
      pertanyaan: target.pertanyaan + ' (Salinan)'
    };
    addQuestion(duplicated);
    showToast('Soal berhasil diduplikasi!', 'success');
  };
  const importQuestionsList = (qList: Question[]) => {
    if (qList.length === 0) return;
    const bankId = qList[0].bankId;
    setQuestions(prev => [...prev, ...qList]);
    const addedWeight = qList.reduce((acc, c) => acc + c.bobot, 0);
    setQuestionBanks(prev => prev.map(b => {
      if (b.id === bankId) {
        return { ...b, totalSoal: b.totalSoal + qList.length, totalBobot: b.totalBobot + addedWeight };
      }
      return b;
    }));
    logActivity('IMPORT_QUESTIONS', `Mengimpor ${qList.length} butir soal ke bank soal`);
    showToast(`Berhasil mengimpor ${qList.length} soal ke bank soal!`, 'success');
  };

  // Exams
  const addExam = (exam: Exam) => {
    setExams(prev => [...prev, exam]);
    logActivity('ADD_EXAM', `Membuat jadwal ujian baru: ${exam.namaUjian} (${exam.kodeUjian})`);
    showToast(`Jadwal ujian ${exam.namaUjian} berhasil dibuat!`, 'success');
  };
  const updateExam = (exam: Exam) => {
    setExams(prev => prev.map(e => e.id === exam.id ? exam : e));
    showToast(`Jadwal ujian ${exam.namaUjian} berhasil diperbarui!`, 'success');
  };
  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    showToast('Jadwal ujian berhasil dihapus.', 'info');
  };
  const toggleExamStatus = (id: string, status: 'draft' | 'aktif' | 'selesai' | 'arsip') => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    logActivity('EXAM_STATUS_CHANGE', `Mengubah status ujian menjadi ${status.toUpperCase()}`);
    showToast(`Status ujian berhasil diubah menjadi: ${status.toUpperCase()}`, 'info');
  };
  const regenerateExamToken = (id: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newToken = 'CBT-';
    for (let i = 0; i < 4; i++) {
      newToken += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    newToken += '-';
    for (let i = 0; i < 2; i++) {
      newToken += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setExams(prev => prev.map(e => e.id === id ? { ...e, token: newToken } : e));
    logActivity('REGENERATE_TOKEN', `Memperbarui token ujian ${id} menjadi ${newToken}`);
    showToast(`Token ujian baru berhasil dibuat: ${newToken}`, 'success');
    return newToken;
  };

  // Exam Taking Engine
  const startExam = (examId: string, tokenInput: string, studentId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return { success: false, message: 'Jadwal ujian tidak ditemukan.' };
    if (exam.status !== 'aktif') return { success: false, message: 'Ujian ini belum diaktifkan oleh admin/guru.' };

    if (exam.useToken) {
      if (!tokenInput || tokenInput.trim().toUpperCase() !== exam.token.trim().toUpperCase()) {
        return { success: false, message: `Token ujian yang dimasukkan salah! Silakan minta token yang valid kepada proktor.` };
      }
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, message: 'Data siswa tidak valid.' };

    const sessionId = `sess-${student.id}-${exam.id}`;

    // Check if session already exists (Session Recovery!)
    if (examSessions[sessionId]) {
      const existing = examSessions[sessionId];
      if (existing.status === 'selesai' || existing.status === 'waktu_habis') {
        return { success: false, message: 'Anda sudah menyelesaikan ujian ini dan tidak dapat mengulang.' };
      }
      // Re-activate session
      setActiveExamSessionId(sessionId);
      logActivity('EXAM_SESSION_RECOVER', `Siswa ${student.nama} memulihkan sesi ujian ${exam.namaUjian}`);
      return { success: true, message: 'Sesi ujian Anda berhasil dipulihkan.', session: existing };
    }

    // Initialize new session
    const bankQuestions = questions.filter(q => q.bankId === exam.bankId);
    let questionIds = bankQuestions.map(q => q.id);
    if (exam.acakSoal) {
      questionIds = [...questionIds].sort(() => Math.random() - 0.5);
    }
    if (exam.jumlahSoal && exam.jumlahSoal < questionIds.length) {
      questionIds = questionIds.slice(0, exam.jumlahSoal);
    }

    const initialAnswers: { [qId: string]: StudentAnswer } = {};
    questionIds.forEach(qId => {
      const qObj = questions.find(q => q.id === qId);
      initialAnswers[qId] = {
        questionId: qId,
        tipe: qObj?.tipe || 'pilihan_ganda',
        jawaban: qObj?.tipe === 'pilihan_ganda_kompleks' ? [] : qObj?.tipe === 'benar_salah' ? {} : qObj?.tipe === 'menjodohkan' ? {} : '',
        isFlagged: false,
        isAnswered: false,
        savedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    });

    const newSession: ExamSession = {
      id: sessionId,
      examId: exam.id,
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      namaKelas: student.namaKelas,
      roomName: student.ruangId || 'LAB-01',
      tokenUsed: tokenInput.trim().toUpperCase(),
      status: 'sedang_mengerjakan',
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastHeartbeat: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: madrasah.serverIp,
      deviceInfo: navigator.userAgent.substring(0, 50),
      remainingSeconds: exam.durasiMenit * 60,
      answers: initialAnswers,
      questionOrder: questionIds,
      totalAnswered: 0,
      totalQuestions: questionIds.length
    };

    setExamSessions(prev => ({ ...prev, [sessionId]: newSession }));
    setActiveExamSessionId(sessionId);

    // Asynchronously cache exam questions and snapshot into IndexedDB & localStorage
    offlineSyncManager.cacheExamAndQuestions(exam, bankQuestions);
    offlineSyncManager.saveSessionSnapshot({
      sessionId,
      examId: exam.id,
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      namaKelas: student.namaKelas,
      answers: initialAnswers,
      currentIndex: 0,
      remainingSeconds: exam.durasiMenit * 60,
      updatedAt: new Date().toISOString(),
      status: 'sedang_mengerjakan'
    });

    logActivity('START_EXAM_SESSION', `Siswa ${student.nama} memulai ujian ${exam.namaUjian}`);
    return { success: true, message: 'Selamat mengerjakan ujian!', session: newSession };
  };

  const saveStudentAnswer = (sessionId: string, questionId: string, value: any, isFlagged?: boolean) => {
    let capturedUpdatedAnswer: StudentAnswer | null = null;

    setExamSessions(prev => {
      const session = prev[sessionId];
      if (!session) return prev;

      const currentAnswer = session.answers[questionId] || {
        questionId,
        tipe: 'pilihan_ganda',
        jawaban: value,
        isFlagged: false,
        isAnswered: false,
        savedAt: ''
      };

      const hasAnswer =
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === 'object' && Object.keys(value).length === 0);

      const updatedAnswer: StudentAnswer = {
        ...currentAnswer,
        jawaban: value,
        isAnswered: hasAnswer,
        isFlagged: isFlagged !== undefined ? isFlagged : currentAnswer.isFlagged,
        savedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      capturedUpdatedAnswer = updatedAnswer;

      const updatedAnswers = {
        ...session.answers,
        [questionId]: updatedAnswer
      };

      const totalAnswered = (Object.values(updatedAnswers) as StudentAnswer[]).filter(a => a.isAnswered).length;

      return {
        ...prev,
        [sessionId]: {
          ...session,
          answers: updatedAnswers,
          totalAnswered,
          lastHeartbeat: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      };
    });

    // Write to offline dual-layer (IndexedDB + localStorage) immediately
    if (capturedUpdatedAnswer) {
      offlineSyncManager.saveAnswerLocally(sessionId, questionId, capturedUpdatedAnswer);
    }
  };

  const syncOfflineQueue = async (sessionId: string): Promise<{ syncedCount: number }> => {
    try {
      const pendingItems = await offlineSyncManager.getPendingQueue(sessionId);
      if (pendingItems.length === 0) {
        return { syncedCount: 0 };
      }

      const syncedIds: string[] = [];

      setExamSessions(prev => {
        const session = prev[sessionId];
        if (!session) return prev;

        const mergedAnswers = { ...session.answers };
        pendingItems.forEach(item => {
          mergedAnswers[item.questionId] = item.answer;
          syncedIds.push(item.questionId);
        });

        const totalAnswered = (Object.values(mergedAnswers) as StudentAnswer[]).filter(a => a.isAnswered).length;

        return {
          ...prev,
          [sessionId]: {
            ...session,
            answers: mergedAnswers,
            totalAnswered,
            lastHeartbeat: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
        };
      });

      await offlineSyncManager.markItemsAsSynced(sessionId, syncedIds);
      logActivity('SYNC_OFFLINE_ANSWERS', `Sinkronisasi otomatis ${syncedIds.length} jawaban offline untuk sesi ${sessionId}`);
      return { syncedCount: syncedIds.length };
    } catch (e) {
      console.warn('Error during syncOfflineQueue:', e);
      return { syncedCount: 0 };
    }
  };

  const syncAllOfflineQueues = async (): Promise<{ totalSynced: number }> => {
    try {
      const allQueues = await offlineSyncManager.getAllPendingQueues();
      const sessionIds = Object.keys(allQueues);
      if (sessionIds.length === 0) {
        return { totalSynced: 0 };
      }

      let totalSynced = 0;
      for (const sid of sessionIds) {
        const res = await syncOfflineQueue(sid);
        totalSynced += res.syncedCount;
      }

      if (totalSynced > 0) {
        logActivity('AUTO_SYNC_ALL_OFFLINE', `Berhasil melakukan background sync ${totalSynced} jawaban tertunda dari seluruh sesi.`);
      }

      return { totalSynced };
    } catch (e) {
      console.warn('Error during syncAllOfflineQueues:', e);
      return { totalSynced: 0 };
    }
  };

  const exportEmergencySessionBackup = async (sessionId: string) => {
    const session = examSessions[sessionId] || null;
    return await offlineSyncManager.exportEmergencyBackup(sessionId, session);
  };

  const importEmergencySessionBackup = (jsonString: string): { success: boolean; message: string; studentName?: string } => {
    try {
      const payload = JSON.parse(jsonString);
      if (!payload || typeof payload !== 'object' || !payload.sessionId || !payload.answers) {
        return { success: false, message: 'Format berkas cadangan darurat tidak valid.' };
      }

      const sessionId: string = payload.sessionId;
      const importedAnswers: { [qId: string]: StudentAnswer } = payload.answers;
      const studentName: string = payload.studentName || 'Peserta';

      setExamSessions(prev => {
        const existingSession = prev[sessionId];
        if (existingSession) {
          const mergedAnswers = { ...existingSession.answers, ...importedAnswers };
          const totalAnswered = (Object.values(mergedAnswers) as StudentAnswer[]).filter(a => a.isAnswered).length;
          return {
            ...prev,
            [sessionId]: {
              ...existingSession,
              answers: mergedAnswers,
              totalAnswered,
              lastHeartbeat: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          };
        } else {
          // Construct recovered session
          const recoveredSession: ExamSession = {
            id: sessionId,
            examId: payload.examId || '',
            studentId: payload.studentId || '',
            studentName: payload.studentName || 'Siswa',
            nisn: payload.nisn || '',
            namaKelas: payload.namaKelas || '',
            roomName: 'LAB-RECOVERY',
            tokenUsed: payload.tokenUsed || '',
            status: 'sedang_mengerjakan',
            startedAt: payload.exportedAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
            lastHeartbeat: new Date().toISOString().replace('T', ' ').substring(0, 19),
            ipAddress: '127.0.0.1',
            deviceInfo: 'Imported Backup',
            remainingSeconds: 0,
            answers: importedAnswers,
            questionOrder: Object.keys(importedAnswers),
            totalAnswered: Object.values(importedAnswers).filter(a => a.isAnswered).length,
            totalQuestions: payload.totalQuestions || Object.keys(importedAnswers).length
          };
          return {
            ...prev,
            [sessionId]: recoveredSession
          };
        }
      });

      logActivity('IMPORT_EMERGENCY_BACKUP', `Proktor memulihkan jawaban darurat untuk siswa ${studentName} (${Object.keys(importedAnswers).length} jawaban)`);
      showToast(`Berhasil memulihkan ${Object.keys(importedAnswers).length} jawaban darurat siswa: ${studentName}!`, 'success');
      return { success: true, message: 'Cadangan jawaban darurat berhasil diimpor.', studentName };
    } catch (err: any) {
      return { success: false, message: 'Gagal membaca berkas: ' + (err.message || 'Format JSON rusak') };
    }
  };

  const toggleFlagAnswer = (sessionId: string, questionId: string) => {
    setExamSessions(prev => {
      const session = prev[sessionId];
      if (!session || !session.answers[questionId]) return prev;
      const current = session.answers[questionId];
      return {
        ...prev,
        [sessionId]: {
          ...session,
          answers: {
            ...session.answers,
            [questionId]: {
              ...current,
              isFlagged: !current.isFlagged
            }
          }
        }
      };
    });
  };

  // Grade & Finish session
  const finishExamSession = (sessionId: string, autoSubmit = false) => {
    const session = examSessions[sessionId];
    if (!session) return;
    const exam = exams.find(e => e.id === session.examId);
    if (!exam) return;

    let benarCount = 0;
    let salahCount = 0;
    let kosongCount = 0;
    let scoreObjektif = 0;
    let maxObjektifBobot = 0;
    let hasEssay = false;

    session.questionOrder.forEach(qId => {
      const q = questions.find(item => item.id === qId);
      if (!q) return;

      const ans = session.answers[qId];
      if (q.tipe === 'essay') {
        hasEssay = true;
        return;
      }

      maxObjektifBobot += q.bobot;

      if (!ans || !ans.isAnswered) {
        kosongCount++;
        return;
      }

      if (q.tipe === 'pilihan_ganda') {
        const correctOpt = q.options?.find(o => o.isCorrect)?.id;
        if (ans.jawaban === correctOpt) {
          benarCount++;
          scoreObjektif += q.bobot;
          ans.scoreEarned = q.bobot;
        } else {
          salahCount++;
          ans.scoreEarned = 0;
        }
      } else if (q.tipe === 'pilihan_ganda_kompleks') {
        const correctOpts = q.options?.filter(o => o.isCorrect).map(o => o.id) || [];
        const studentOpts = Array.isArray(ans.jawaban) ? ans.jawaban : [];
        const isMatch =
          correctOpts.length === studentOpts.length &&
          correctOpts.every(id => studentOpts.includes(id));
        if (isMatch) {
          benarCount++;
          scoreObjektif += q.bobot;
          ans.scoreEarned = q.bobot;
        } else {
          salahCount++;
          ans.scoreEarned = 0;
        }
      } else if (q.tipe === 'benar_salah') {
        let allCorrect = true;
        q.trueFalseStatements?.forEach(stmt => {
          if (ans.jawaban?.[stmt.id] !== stmt.correctValue) {
            allCorrect = false;
          }
        });
        if (allCorrect && q.trueFalseStatements && q.trueFalseStatements.length > 0) {
          benarCount++;
          scoreObjektif += q.bobot;
          ans.scoreEarned = q.bobot;
        } else {
          salahCount++;
          ans.scoreEarned = 0;
        }
      } else if (q.tipe === 'menjodohkan') {
        let allMatched = true;
        q.matchingPairs?.forEach(pair => {
          if (ans.jawaban?.[pair.id] !== pair.match) {
            allMatched = false;
          }
        });
        if (allMatched && q.matchingPairs && q.matchingPairs.length > 0) {
          benarCount++;
          scoreObjektif += q.bobot;
          ans.scoreEarned = q.bobot;
        } else {
          salahCount++;
          ans.scoreEarned = 0;
        }
      } else if (q.tipe === 'isian_singkat') {
        const studentVal = String(ans.jawaban || '').trim().toLowerCase();
        const allowed = q.kunciJawabanSingkat?.map(k => k.trim().toLowerCase()) || [];
        if (allowed.includes(studentVal)) {
          benarCount++;
          scoreObjektif += q.bobot;
          ans.scoreEarned = q.bobot;
        } else {
          salahCount++;
          ans.scoreEarned = 0;
        }
      }
    });

    const finalScore = scoreObjektif; // Initial score before essay grading
    const isPassed = finalScore >= exam.nilaiMinimum;

    const finishedTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Update session
    const updatedSession: ExamSession = {
      ...session,
      status: autoSubmit ? 'waktu_habis' : 'selesai',
      finishedAt: finishedTime,
      remainingSeconds: 0,
      scoreTotal: finalScore,
      isPassed,
      essayGraded: !hasEssay
    };

    setExamSessions(prev => ({ ...prev, [sessionId]: updatedSession }));

    // Create / Update Result record
    const resultRecord: ExamResult = {
      id: 'res-' + sessionId,
      examId: exam.id,
      examName: exam.namaUjian,
      subjectName: exam.subjectName,
      studentId: session.studentId,
      studentName: session.studentName,
      nisn: session.nisn,
      namaKelas: session.namaKelas,
      roomName: session.roomName,
      startedAt: session.startedAt || finishedTime,
      finishedAt: finishedTime,
      durasiPengerjaanMenit: exam.durasiMenit,
      totalSoal: session.totalQuestions,
      benarCount,
      salahCount,
      kosongCount,
      nilaiObjektif: scoreObjektif,
      nilaiEssay: 0,
      nilaiAkhir: finalScore,
      kkm: exam.nilaiMinimum,
      statusLulus: isPassed ? 'LULUS' : 'TIDAK LULUS',
      essayGraded: !hasEssay
    };

    setExamResults(prev => {
      const filtered = prev.filter(r => r.id !== resultRecord.id);
      return [resultRecord, ...filtered];
    });

    setActiveExamSessionId(null);
    logActivity('FINISH_EXAM_SESSION', `Siswa ${session.studentName} menyelesaikan ujian ${exam.namaUjian} dengan nilai objektif ${scoreObjektif}`);
    showToast(autoSubmit ? 'Waktu habis! Jawaban Anda telah otomatis dikirimkan.' : 'Ujian berhasil diselesaikan! Terima kasih atas partisipasi Anda.', 'success');
  };

  const resetStudentSession = (sessionId: string) => {
    setExamSessions(prev => {
      const copy = { ...prev };
      delete copy[sessionId];
      return copy;
    });
    setExamResults(prev => prev.filter(r => r.id !== 'res-' + sessionId));
    logActivity('RESET_SESSION', `Proktor mereset sesi login/ujian ${sessionId}`);
    showToast('Sesi ujian siswa berhasil di-reset. Siswa dapat login kembali.', 'info');
  };

  const addTimeSession = (sessionId: string, additionalMinutes: number) => {
    setExamSessions(prev => {
      const sess = prev[sessionId];
      if (!sess) return prev;
      return {
        ...prev,
        [sessionId]: {
          ...sess,
          remainingSeconds: sess.remainingSeconds + additionalMinutes * 60
        }
      };
    });
    logActivity('ADD_EXAM_TIME', `Proktor menambah waktu ${additionalMinutes} menit pada sesi ${sessionId}`);
    showToast(`Berhasil menambahkan waktu ${additionalMinutes} menit kepada siswa!`, 'success');
  };

  const gradeEssayAnswer = (resultId: string, questionId: string, score: number, feedback: string) => {
    setExamResults(prev => prev.map(res => {
      if (res.id === resultId) {
        const newEssayScore = score;
        const finalScore = res.nilaiObjektif + newEssayScore;
        const isPassed = finalScore >= res.kkm;
        return {
          ...res,
          nilaiEssay: newEssayScore,
          nilaiAkhir: finalScore,
          statusLulus: isPassed ? 'LULUS' : 'TIDAK LULUS',
          essayGraded: true
        };
      }
      return res;
    }));
    logActivity('GRADE_ESSAY', `Guru memberikan nilai essay ${score} pada hasil ${resultId}`);
    showToast('Penilaian essay berhasil disimpan dan nilai akhir dihitung ulang!', 'success');
  };

  const deleteResult = (id: string) => {
    setExamResults(prev => prev.filter(r => r.id !== id));
    showToast('Data hasil ujian berhasil dihapus.', 'info');
  };

  // Backup & Restore
  const createBackup = (type: 'full' | 'database_only' | 'questions_only' = 'full') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `cbt_backup_${type}_${timestamp}.sql`;

    const fullDump = {
      meta: {
        appName: 'CBT Madrasah',
        version: '2.0-PGSQL',
        createdAt: new Date().toISOString(),
        madrasah: madrasah.namaMadrasah
      },
      madrasah,
      academicYears,
      semesters,
      classes,
      subjects,
      teachers,
      students,
      users,
      rooms,
      sessionConfigs,
      questionBanks,
      questions,
      exams,
      examSessions,
      examResults,
      activityLogs
    };

    const payloadString = JSON.stringify(fullDump, null, 2);
    const sizeKb = Math.round(payloadString.length / 1024);

    const newBackup: BackupItem = {
      id: 'bkp-' + Date.now(),
      fileName,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sizeKb,
      type,
      dataPayload: payloadString
    };

    setBackups(prev => [newBackup, ...prev]);
    logActivity('CREATE_BACKUP', `Membuat file cadangan database: ${fileName} (${sizeKb} KB)`);
    showToast(`Cadangan database berhasil dibuat: ${fileName}`, 'success');
    return newBackup;
  };

  const restoreBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) {
      showToast('File backup tidak ditemukan!', 'error');
      return false;
    }
    return restoreFromJSON(backup.dataPayload);
  };

  const restoreFromJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.madrasah) setMadrasah(data.madrasah);
      if (data.academicYears) setAcademicYears(data.academicYears);
      if (data.semesters) setSemesters(data.semesters);
      if (data.classes) setClasses(data.classes);
      if (data.subjects) setSubjects(data.subjects);
      if (data.teachers) setTeachers(data.teachers);
      if (data.students) setStudents(data.students);
      if (data.users) setUsers(data.users);
      if (data.rooms) setRooms(data.rooms);
      if (data.sessionConfigs) setSessionConfigs(data.sessionConfigs);
      if (data.questionBanks) setQuestionBanks(data.questionBanks);
      if (data.questions) setQuestions(data.questions);
      if (data.exams) setExams(data.exams);
      if (data.examSessions) setExamSessions(data.examSessions);
      if (data.examResults) setExamResults(data.examResults);
      if (data.activityLogs) setActivityLogs(data.activityLogs);

      logActivity('RESTORE_DATABASE', 'Berhasil memulihkan database dari file cadangan');
      showToast('Database CBT Madrasah berhasil dipulihkan secara penuh!', 'success');
      return true;
    } catch (err) {
      showToast('Format file backup tidak valid!', 'error');
      return false;
    }
  };

  const resetToDefaultDatabase = () => {
    setMadrasah(initialMadrasah);
    setAcademicYears(initialAcademicYears);
    setSemesters(initialSemesters);
    setClasses(initialClasses);
    setSubjects(initialSubjects);
    setTeachers(initialTeachers);
    setStudents(initialStudents);
    setUsers(initialUsers);
    setRooms(initialRooms);
    setSessionConfigs(initialSessionConfigs);
    setQuestionBanks(initialQuestionBanks);
    setQuestions(initialQuestions);
    setExams(initialExams);
    setExamSessions(initialExamSessions);
    setExamResults(initialExamResults);
    setActivityLogs(initialActivityLogs);
    showToast('Database berhasil di-reset ke data default madrasah!', 'info');
  };

  // System Health
  const systemHealth: SystemHealthStatus = {
    applicationStatus: 'ONLINE',
    databaseStatus: 'ONLINE',
    dbEngine: 'PostgreSQL 16.3 (Local LAN)',
    storageStatus: 'OK',
    diskFreeGb: 48.5,
    lanNetworkStatus: 'OK',
    serverIp: madrasah.serverIp,
    serverPort: madrasah.serverPort,
    serverTime: serverTime.toLocaleTimeString('id-ID'),
    timezone: madrasah.timezone,
    activeExamCount: exams.filter(e => e.status === 'aktif').length,
    activeParticipantCount: (Object.values(examSessions) as ExamSession[]).filter(s => s.status === 'sedang_mengerjakan').length,
    lastBackupDate: backups.length > 0 ? backups[0].createdAt : 'Belum Ada'
  };

  return (
    <CBTContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        login,
        loginWithUser,
        logout,
        switchDemoRole,
        madrasah,
        updateMadrasah,
        academicYears,
        addAcademicYear,
        toggleAcademicYear,
        semesters,
        toggleSemester,
        classes,
        addClass,
        updateClass,
        deleteClass,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        importTeachersList,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudentsList,
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
        questionBanks,
        addQuestionBank,
        updateQuestionBank,
        deleteQuestionBank,
        questions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        duplicateQuestion,
        importQuestionsList,
        exams,
        addExam,
        updateExam,
        deleteExam,
        toggleExamStatus,
        regenerateExamToken,
        examSessions,
        activeExamSessionId,
        setActiveExamSessionId,
        startExam,
        saveStudentAnswer,
        toggleFlagAnswer,
        finishExamSession,
        resetStudentSession,
        addTimeSession,
        gradeEssayAnswer,
        syncOfflineQueue,
        syncAllOfflineQueues,
        exportEmergencySessionBackup,
        importEmergencySessionBackup,
        examResults,
        deleteResult,
        activityLogs,
        logActivity,
        systemHealth,
        serverTime,
        backups,
        createBackup,
        restoreBackup,
        restoreFromJSON,
        resetToDefaultDatabase,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </CBTContext.Provider>
  );
};

export const useCBT = () => {
  const context = useContext(CBTContext);
  if (!context) {
    throw new Error('useCBT must be used within a CBTProvider');
  }
  return context;
};
