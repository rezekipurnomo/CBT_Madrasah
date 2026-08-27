export type UserRole = 'super_admin' | 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status: 'aktif' | 'nonaktif';
  lastLogin?: string;
  studentId?: string;
  teacherId?: string;
}

export interface MadrasahProfile {
  id: string;
  namaMadrasah: string;
  jenjang: 'MI' | 'MTs' | 'MA';
  nsm: string;
  npsn: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  email: string;
  telepon: string;
  website: string;
  kepalaMadrasah: string;
  nipKepalaMadrasah: string;
  logo: string;
  serverIp: string;
  serverPort: number;
  timezone: string;
}

export interface AcademicYear {
  id: string;
  tahunPelajaran: string; // e.g. "2025/2026"
  statusAktif: boolean;
}

export interface Semester {
  id: string;
  semester: 'Ganjil' | 'Genap';
  academicYearId: string;
  statusAktif: boolean;
}

export interface ClassGroup {
  id: string;
  namaKelas: string; // e.g. "VII-A", "IX-B", "XII-IPA"
  tingkat: string; // e.g. "7", "8", "9", "10", "11", "12"
  jenjang: 'MI' | 'MTs' | 'MA';
  waliKelas: string;
  academicYearId: string;
  jumlahSiswa?: number;
}

export interface Subject {
  id: string;
  kode: string; // e.g. "MAT-07", "SKI-09", "AQD-08"
  namaMataPelajaran: string;
  kelompok: 'Umum' | 'Agama' | 'Peminatan' | 'Muatan Lokal';
  status: 'aktif' | 'nonaktif';
}

export interface Teacher {
  id: string;
  userId: string;
  nip: string;
  nuptk: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  email: string;
  nomorHp: string;
  mapelUtama: string;
  username: string;
  status: 'aktif' | 'nonaktif';
}

export interface Student {
  id: string;
  userId: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  classId: string;
  namaKelas: string;
  nomorPeserta: string;
  username: string;
  ruangId?: string;
  sesi?: number; // 1, 2, 3, or 4 (Maks 4 sesi)
  status: 'aktif' | 'nonaktif';
  foto?: string;
}

export interface ExamSessionConfig {
  id: string;
  nomorSesi: number; // 1, 2, 3, or 4
  namaSesi: string; // e.g. "Sesi 1 (Pagi)", "Sesi 2 (Siang)", "Sesi 3 (Sore)", "Sesi 4 (Petang)"
  jamMulai: string; // e.g. "07:30"
  jamSelesai: string; // e.g. "09:30"
  keterangan?: string;
  statusAktif: boolean;
}

export interface ExamRoom {
  id: string;
  namaRuang: string; // e.g. "Ruang Laboratorium Komputer 1"
  nomorRuang: string; // e.g. "LAB-01"
  kapasitas: number;
  serverIp: string;
  pengawasUtama: string;
}

export type QuestionType =
  | 'pilihan_ganda'
  | 'pilihan_ganda_kompleks'
  | 'benar_salah'
  | 'menjodohkan'
  | 'isian_singkat'
  | 'essay';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
  image?: string;
  isCorrect?: boolean; // For PG & PG Kompleks
}

export interface MatchingPair {
  id: string;
  premise: string;
  match: string;
}

export interface TrueFalseStatement {
  id: string;
  statement: string;
  correctValue: boolean; // true = Benar, false = Salah
}

export interface Question {
  id: string;
  bankId: string;
  nomorUrut: number;
  tipe: QuestionType;
  pertanyaan: string;
  mediaType?: 'image' | 'audio' | 'video';
  mediaUrl?: string;
  rumusMath?: string;
  options?: QuestionOption[]; // for pilihan_ganda & pilihan_ganda_kompleks
  matchingPairs?: MatchingPair[]; // for menjodohkan
  trueFalseStatements?: TrueFalseStatement[]; // for benar_salah
  kunciJawabanSingkat?: string[]; // for isian_singkat (allowed aliases/synonyms)
  rubrikEssay?: string; // for essay
  bobot: number;
  tingkatKesulitan: 'Mudah' | 'Sedang' | 'Sukar';
  kompetensi?: string;
  materi?: string;
}

export interface QuestionBank {
  id: string;
  kodeBank: string;
  namaBank: string;
  subjectId: string;
  subjectName: string;
  tingkat: string;
  jenjang: 'MI' | 'MTs' | 'MA';
  academicYearId: string;
  semesterId: string;
  guruId: string;
  guruName: string;
  materi: string;
  totalSoal: number;
  totalBobot: number;
  createdAt: string;
  updatedAt: string;
}

export type ExamType =
  | 'Ulangan Harian'
  | 'Penilaian Tengah Semester'
  | 'Penilaian Akhir Semester'
  | 'Penilaian Akhir Tahun'
  | 'Asesmen Madrasah'
  | 'Ujian Praktik'
  | 'Try Out'
  | 'Ujian Lainnya';

export interface Exam {
  id: string;
  bankId: string;
  namaUjian: string;
  kodeUjian: string;
  subjectName: string;
  jenisUjian: ExamType;
  academicYearId: string;
  semester: string;
  targetClassIds: string[]; // List of class IDs
  targetClassNames: string[];
  targetSesi?: number[]; // [1, 2, 3, 4] allowed sessions
  tanggalMulai: string; // YYYY-MM-DD
  jamMulai: string; // HH:mm
  tanggalSelesai: string;
  jamSelesai: string;
  durasiMenit: number;
  jumlahSoal: number;
  nilaiMinimum: number; // KKM
  acakSoal: boolean;
  acakJawaban: boolean;
  izinkanKembali: boolean;
  tampilkanHasil: boolean;
  tampilkanPembahasan: boolean;
  useToken: boolean;
  token: string;
  tokenExpiresAt?: string;
  status: 'draft' | 'aktif' | 'selesai' | 'arsip';
  createdBy: string;
}

export interface StudentAnswer {
  questionId: string;
  tipe: QuestionType;
  // For PG: 'A'
  // For PG Kompleks: ['A', 'C']
  // For Benar/Salah: { [stmtId: string]: boolean }
  // For Menjodohkan: { [premiseId: string]: string }
  // For Isian Singkat: string
  // For Essay: string
  jawaban: any;
  isFlagged: boolean; // Ragu-ragu
  isAnswered: boolean;
  scoreEarned?: number;
  feedback?: string;
  savedAt: string;
}

export type SessionStatus =
  | 'belum_mulai'
  | 'sedang_mengerjakan'
  | 'selesai'
  | 'waktu_habis'
  | 'terputus';

export interface ExamSession {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  nisn: string;
  namaKelas: string;
  roomName: string;
  tokenUsed: string;
  status: SessionStatus;
  startedAt?: string;
  finishedAt?: string;
  lastHeartbeat: string;
  ipAddress: string;
  deviceInfo: string;
  remainingSeconds: number;
  answers: { [questionId: string]: StudentAnswer };
  questionOrder: string[]; // Array of question IDs in randomized sequence
  optionsOrder?: { [questionId: string]: string[] }; // Randomized option keys
  totalAnswered: number;
  totalQuestions: number;
  scoreTotal?: number;
  isPassed?: boolean;
  essayGraded?: boolean;
}

export interface ExamResult {
  id: string;
  examId: string;
  examName: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  nisn: string;
  namaKelas: string;
  roomName: string;
  startedAt: string;
  finishedAt: string;
  durasiPengerjaanMenit: number;
  totalSoal: number;
  benarCount: number;
  salahCount: number;
  kosongCount: number;
  nilaiObjektif: number;
  nilaiEssay: number;
  nilaiAkhir: number;
  kkm: number;
  statusLulus: 'LULUS' | 'TIDAK LULUS';
  essayGraded: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
}

export interface BackupItem {
  id: string;
  fileName: string;
  createdAt: string;
  sizeKb: number;
  type: 'full' | 'database_only' | 'questions_only';
  dataPayload: string; // JSON representation of entire PostgreSQL schema & records
}

export interface SystemHealthStatus {
  applicationStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  databaseStatus: 'ONLINE' | 'ERROR';
  dbEngine: 'PostgreSQL 16.3 (Local LAN)';
  storageStatus: 'OK';
  diskFreeGb: number;
  lanNetworkStatus: 'OK' | 'DISCONNECTED';
  serverIp: string;
  serverPort: number;
  serverTime: string;
  timezone: string;
  activeExamCount: number;
  activeParticipantCount: number;
  lastBackupDate: string;
}
