import {
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
  User,
  ExamSession,
  ExamResult,
  ActivityLog,
  BackupItem
} from '../types';

export const initialMadrasah: MadrasahProfile = {
  id: 'madrasah-01',
  namaMadrasah: 'MTs Negeri 1 Insan Cendekia',
  jenjang: 'MTs',
  nsm: '121132710001',
  npsn: '20278910',
  alamat: 'Jl. Pendidikan Islam No. 45, Kompleks Islamic Center',
  desa: 'Cendekia Jaya',
  kecamatan: 'Sukajadi',
  kabupaten: 'Bandung',
  provinsi: 'Jawa Barat',
  kodePos: '40161',
  email: 'admin@mtsn1insancendekia.sch.id',
  telepon: '(022) 8765-4321',
  website: 'https://mtsn1insancendekia.sch.id',
  kepalaMadrasah: 'Drs. H. Ahmad Fauzan, M.Pd.I',
  nipKepalaMadrasah: '197508172002121003',
  logo: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=200&auto=format&fit=crop&q=80',
  serverIp: '192.168.1.100',
  serverPort: 80,
  timezone: 'Asia/Jakarta'
};

export const initialAcademicYears: AcademicYear[] = [
  { id: 'ay-2025-2026', tahunPelajaran: '2025/2026', statusAktif: true },
  { id: 'ay-2024-2025', tahunPelajaran: '2024/2025', statusAktif: false }
];

export const initialSemesters: Semester[] = [
  { id: 'sem-genap-2526', semester: 'Genap', academicYearId: 'ay-2025-2026', statusAktif: true },
  { id: 'sem-ganjil-2526', semester: 'Ganjil', academicYearId: 'ay-2025-2026', statusAktif: false }
];

export const initialRooms: ExamRoom[] = [
  { id: 'room-lab-01', namaRuang: 'Laboratorium Komputer 1', nomorRuang: 'LAB-01', kapasitas: 40, serverIp: '192.168.1.100', pengawasUtama: 'Ust. Ridwan Kamil, S.Pd' },
  { id: 'room-lab-02', namaRuang: 'Laboratorium Komputer 2', nomorRuang: 'LAB-02', kapasitas: 40, serverIp: '192.168.1.100', pengawasUtama: 'Usth. Siti Sarah, S.Ag' },
  { id: 'room-r01', namaRuang: 'Ruang Ujian 03 (Gedung B)', nomorRuang: 'RUANG-03', kapasitas: 30, serverIp: '192.168.1.100', pengawasUtama: 'Drs. H. Syarifudin' }
];

export const initialSessionConfigs: ExamSessionConfig[] = [
  {
    id: 'sess-cfg-1',
    nomorSesi: 1,
    namaSesi: 'Sesi 1 (Pagi)',
    jamMulai: '07:30',
    jamSelesai: '09:30',
    keterangan: 'Sesi Utama Pagi Hari - Rombel Kelas Utama',
    statusAktif: true
  },
  {
    id: 'sess-cfg-2',
    nomorSesi: 2,
    namaSesi: 'Sesi 2 (Siang)',
    jamMulai: '10:00',
    jamSelesai: '12:00',
    keterangan: 'Sesi Siang Sebelum Istirahat & Dzuhur',
    statusAktif: true
  },
  {
    id: 'sess-cfg-3',
    nomorSesi: 3,
    namaSesi: 'Sesi 3 (Sore)',
    jamMulai: '13:00',
    jamSelesai: '15:00',
    keterangan: 'Sesi Ba\'da Dzuhur / Shalat Berjamaah',
    statusAktif: true
  },
  {
    id: 'sess-cfg-4',
    nomorSesi: 4,
    namaSesi: 'Sesi 4 (Petang / Susulan)',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    keterangan: 'Sesi Tambahan / Ujian Susulan Terjadwal',
    statusAktif: true
  }
];

export const initialClasses: ClassGroup[] = [
  { id: 'cls-7a', namaKelas: 'VII-A (Tahfidz)', tingkat: '7', jenjang: 'MTs', waliKelas: 'Ust. Nurul Huda, S.Pd.I', academicYearId: 'ay-2025-2026', jumlahSiswa: 32 },
  { id: 'cls-7b', namaKelas: 'VII-B (Reguler)', tingkat: '7', jenjang: 'MTs', waliKelas: 'Usth. Dewi Kartika, M.Pd', academicYearId: 'ay-2025-2026', jumlahSiswa: 30 },
  { id: 'cls-8a', namaKelas: 'VIII-A (Bilingual)', tingkat: '8', jenjang: 'MTs', waliKelas: 'Drs. H. Mahmud', academicYearId: 'ay-2025-2026', jumlahSiswa: 32 },
  { id: 'cls-9a', namaKelas: 'IX-A (Unggulan Sains)', tingkat: '9', jenjang: 'MTs', waliKelas: 'Hj. Fatimah Az-Zahra, S.Si', academicYearId: 'ay-2025-2026', jumlahSiswa: 34 },
  { id: 'cls-9b', namaKelas: 'IX-B (Reguler)', tingkat: '9', jenjang: 'MTs', waliKelas: 'Ust. M. Ridwan, M.Ag', academicYearId: 'ay-2025-2026', jumlahSiswa: 32 }
];

export const initialSubjects: Subject[] = [
  { id: 'sub-mat-09', kode: 'MAT-09', namaMataPelajaran: 'Matematika Terapan & Geometri', kelompok: 'Umum', status: 'aktif' },
  { id: 'sub-fikih-09', kode: 'FIQ-09', namaMataPelajaran: 'Fikih Ibadah & Muamalah', kelompok: 'Agama', status: 'aktif' },
  { id: 'sub-arab-09', kode: 'ARB-09', namaMataPelajaran: 'Bahasa Arab Madrasah', kelompok: 'Agama', status: 'aktif' },
  { id: 'sub-ipa-09', kode: 'IPA-09', namaMataPelajaran: 'Ilmu Pengetahuan Alam (IPA)', kelompok: 'Umum', status: 'aktif' },
  { id: 'sub-aqd-09', kode: 'AQD-09', namaMataPelajaran: 'Akidah Akhlak & Budi Pekerti', kelompok: 'Agama', status: 'aktif' },
  { id: 'sub-ski-09', kode: 'SKI-09', namaMataPelajaran: 'Sejarah Kebudayaan Islam (SKI)', kelompok: 'Agama', status: 'aktif' }
];

export const initialTeachers: Teacher[] = [
  {
    id: 'tch-01',
    userId: 'usr-tch-01',
    nip: '198205142008011012',
    nuptk: '4539760662200023',
    nama: 'Ust. M. Fauzi Arifin, M.Pd',
    jenisKelamin: 'L',
    tempatLahir: 'Bandung',
    tanggalLahir: '1982-05-14',
    email: 'fauzi.arifin@mtsn1.sch.id',
    nomorHp: '081234567890',
    mapelUtama: 'Matematika Terapan & Geometri',
    username: 'guru.fauzi',
    status: 'aktif'
  },
  {
    id: 'tch-02',
    userId: 'usr-tch-02',
    nip: '198709212011012015',
    nuptk: '7845765666210042',
    nama: 'Usth. Hj. Fatimah Az-Zahra, M.Ag',
    jenisKelamin: 'P',
    tempatLahir: 'Ciamis',
    tanggalLahir: '1987-09-21',
    email: 'fatimah.azzahra@mtsn1.sch.id',
    nomorHp: '081398765432',
    mapelUtama: 'Fikih Ibadah & Muamalah',
    username: 'guru.fatimah',
    status: 'aktif'
  }
];

export const initialStudents: Student[] = [
  {
    id: 'std-01',
    userId: 'usr-std-01',
    nis: '232407001',
    nisn: '0098765431',
    nama: 'Muhammad Rizky Pratama',
    jenisKelamin: 'L',
    tempatLahir: 'Bandung',
    tanggalLahir: '2011-04-12',
    classId: 'cls-9a',
    namaKelas: 'IX-A (Unggulan Sains)',
    nomorPeserta: '02-001-023-9',
    username: 'siswa01',
    ruangId: 'room-lab-01',
    sesi: 1,
    status: 'aktif'
  },
  {
    id: 'std-02',
    userId: 'usr-std-02',
    nis: '232407002',
    nisn: '0098765432',
    nama: 'Aisyah Nur Ramadhani',
    jenisKelamin: 'P',
    tempatLahir: 'Tasikmalaya',
    tanggalLahir: '2011-08-25',
    classId: 'cls-9a',
    namaKelas: 'IX-A (Unggulan Sains)',
    nomorPeserta: '02-001-024-8',
    username: 'siswa02',
    ruangId: 'room-lab-01',
    sesi: 1,
    status: 'aktif'
  },
  {
    id: 'std-03',
    userId: 'usr-std-03',
    nis: '232407003',
    nisn: '0098765433',
    nama: 'Ahmad Bilal Al-Farisi',
    jenisKelamin: 'L',
    tempatLahir: 'Garut',
    tanggalLahir: '2011-01-18',
    classId: 'cls-9a',
    namaKelas: 'IX-A (Unggulan Sains)',
    nomorPeserta: '02-001-025-7',
    username: 'siswa03',
    ruangId: 'room-lab-01',
    sesi: 1,
    status: 'aktif'
  },
  {
    id: 'std-04',
    userId: 'usr-std-04',
    nis: '232407004',
    nisn: '0098765434',
    nama: 'Nabila Zahra Syakira',
    jenisKelamin: 'P',
    tempatLahir: 'Sumedang',
    tanggalLahir: '2011-06-30',
    classId: 'cls-9b',
    namaKelas: 'IX-B (Reguler)',
    nomorPeserta: '02-001-026-6',
    username: 'siswa04',
    ruangId: 'room-lab-02',
    sesi: 2,
    status: 'aktif'
  },
  {
    id: 'std-05',
    userId: 'usr-std-05',
    nis: '232407005',
    nisn: '0098765435',
    nama: 'Fauzan Adzim Robbani',
    jenisKelamin: 'L',
    tempatLahir: 'Cimahi',
    tanggalLahir: '2011-11-05',
    classId: 'cls-9b',
    namaKelas: 'IX-B (Reguler)',
    nomorPeserta: '02-001-027-5',
    username: 'siswa05',
    ruangId: 'room-lab-02',
    sesi: 2,
    status: 'aktif'
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    name: 'Super Administrator CBT',
    email: 'superadmin@cbt-madrasah.local',
    role: 'super_admin',
    phone: '081122334455',
    status: 'aktif',
    lastLogin: '2026-08-20 07:15:20'
  },
  {
    id: 'usr-op-01',
    username: 'operator',
    name: 'Operator Madrasah (Pak Hendra)',
    email: 'operator@cbt-madrasah.local',
    role: 'admin',
    phone: '081233445566',
    status: 'aktif',
    lastLogin: '2026-08-20 06:50:11'
  },
  {
    id: 'usr-tch-01',
    username: 'guru.fauzi',
    name: 'Ust. M. Fauzi Arifin, M.Pd',
    email: 'fauzi.arifin@mtsn1.sch.id',
    role: 'guru',
    phone: '081234567890',
    status: 'aktif',
    teacherId: 'tch-01',
    lastLogin: '2026-08-20 07:05:44'
  },
  {
    id: 'usr-tch-02',
    username: 'guru.fatimah',
    name: 'Usth. Hj. Fatimah Az-Zahra, M.Ag',
    email: 'fatimah.azzahra@mtsn1.sch.id',
    role: 'guru',
    phone: '081398765432',
    status: 'aktif',
    teacherId: 'tch-02',
    lastLogin: '2026-08-19 15:30:10'
  },
  {
    id: 'usr-std-01',
    username: 'siswa01',
    name: 'Muhammad Rizky Pratama',
    role: 'siswa',
    studentId: 'std-01',
    status: 'aktif',
    lastLogin: '2026-08-20 07:30:00'
  },
  {
    id: 'usr-std-02',
    username: 'siswa02',
    name: 'Aisyah Nur Ramadhani',
    role: 'siswa',
    studentId: 'std-02',
    status: 'aktif',
    lastLogin: '2026-08-20 07:28:15'
  },
  {
    id: 'usr-std-03',
    username: 'siswa03',
    name: 'Ahmad Bilal Al-Farisi',
    role: 'siswa',
    studentId: 'std-03',
    status: 'aktif'
  },
  {
    id: 'usr-std-04',
    username: 'siswa04',
    name: 'Nabila Zahra Syakira',
    role: 'siswa',
    studentId: 'std-04',
    status: 'aktif'
  },
  {
    id: 'usr-std-05',
    username: 'siswa05',
    name: 'Fauzan Adzim Robbani',
    role: 'siswa',
    studentId: 'std-05',
    status: 'aktif'
  }
];

export const initialQuestionBanks: QuestionBank[] = [
  {
    id: 'bank-mat-09',
    kodeBank: 'BNK-MAT-IX-2026',
    namaBank: 'Bank Soal Asesmen Madrasah Matematika Kelas IX',
    subjectId: 'sub-mat-09',
    subjectName: 'Matematika Terapan & Geometri',
    tingkat: '9',
    jenjang: 'MTs',
    academicYearId: 'ay-2025-2026',
    semesterId: 'sem-genap-2526',
    guruId: 'tch-01',
    guruName: 'Ust. M. Fauzi Arifin, M.Pd',
    materi: 'Geometri Ruang, Teorema Pythagoras, Peluang, Aljabar & Fungsi Kuadrat',
    totalSoal: 8,
    totalBobot: 100,
    createdAt: '2026-08-10',
    updatedAt: '2026-08-18'
  },
  {
    id: 'bank-fik-09',
    kodeBank: 'BNK-FIK-IX-2026',
    namaBank: 'Bank Soal Penilaian Akhir Semester Fikih Ibadah',
    subjectId: 'sub-fikih-09',
    subjectName: 'Fikih Ibadah & Muamalah',
    tingkat: '9',
    jenjang: 'MTs',
    academicYearId: 'ay-2025-2026',
    semesterId: 'sem-genap-2526',
    guruId: 'tch-02',
    guruName: 'Usth. Hj. Fatimah Az-Zahra, M.Ag',
    materi: 'Penyembelihan Hewan, Qurban & Aqiqah, Muamalah Jual Beli Islami',
    totalSoal: 6,
    totalBobot: 100,
    createdAt: '2026-08-12',
    updatedAt: '2026-08-19'
  }
];

export const initialQuestions: Question[] = [
  // MATEMATIKA SOAL 1: Pilihan Ganda dengan Rumus
  {
    id: 'q-mat-01',
    bankId: 'bank-mat-09',
    nomorUrut: 1,
    tipe: 'pilihan_ganda',
    pertanyaan: 'Sebuah taman berbentuk segitiga siku-siku dengan panjang sisi tegak masing-masing 12 meter dan 16 meter. Jika di sekeliling taman tersebut akan dipasang lampu hias dengan jarak antar lampu 2 meter, berapakah banyak lampu yang diperlukan?',
    rumusMath: 'c^2 = a^2 + b^2 \\implies c = \\sqrt{12^2 + 16^2} = 20\\text{ m}',
    bobot: 10,
    tingkatKesulitan: 'Sedang',
    kompetensi: 'Penerapan Teorema Pythagoras pada bangun datar',
    materi: 'Geometri & Pythagoras',
    options: [
      { id: 'A', text: '24 buah lampu', isCorrect: true },
      { id: 'B', text: '20 buah lampu', isCorrect: false },
      { id: 'C', text: '48 buah lampu', isCorrect: false },
      { id: 'D', text: '32 buah lampu', isCorrect: false }
    ]
  },
  // MATEMATIKA SOAL 2: Pilihan Ganda Kompleks
  {
    id: 'q-mat-02',
    bankId: 'bank-mat-09',
    nomorUrut: 2,
    tipe: 'pilihan_ganda_kompleks',
    pertanyaan: 'Perhatikan persamaan kuadrat: f(x) = x² - 6x + 8 = 0. Manakah di antara pernyataan-pernyataan berikut yang bernilai BENAR? (Pilihlah lebih dari satu jawaban yang tepat)',
    rumusMath: 'D = b^2 - 4ac = (-6)^2 - 4(1)(8) = 4 > 0',
    bobot: 15,
    tingkatKesulitan: 'Sedang',
    kompetensi: 'Karakteristik fungsi dan akar-akar persamaan kuadrat',
    materi: 'Persamaan Kuadrat',
    options: [
      { id: 'A', text: 'Akar-akar dari persamaan tersebut adalah x = 2 dan x = 4', isCorrect: true },
      { id: 'B', text: 'Nilai diskriminan (D) adalah positif (D = 4)', isCorrect: true },
      { id: 'C', text: 'Grafik kurva membuka ke arah bawah (cekung ke bawah)', isCorrect: false },
      { id: 'D', text: 'Titik puncak kurva memiliki sumbu simetri pada x = 3', isCorrect: true }
    ]
  },
  // MATEMATIKA SOAL 3: Benar / Salah
  {
    id: 'q-mat-03',
    bankId: 'bank-mat-09',
    nomorUrut: 3,
    tipe: 'benar_salah',
    pertanyaan: 'Tentukan kebenaran dari setiap pernyataan mengenai sifat-sifat bangun ruang sisi lengkung tabung dan kerucut berikut:',
    bobot: 15,
    tingkatKesulitan: 'Mudah',
    kompetensi: 'Unsur dan sifat bangun ruang sisi lengkung',
    materi: 'Bangun Ruang Sisi Lengkung',
    trueFalseStatements: [
      { id: 'stmt-1', statement: 'Tabung memiliki 3 sisi dan 2 rusuk lengkung tanpa titik sudut.', correctValue: true },
      { id: 'stmt-2', statement: 'Volume kerucut sama dengan setengah dari volume tabung dengan jari-jari dan tinggi yang sama.', correctValue: false },
      { id: 'stmt-3', statement: 'Garis pelukis (s) pada kerucut selalu lebih panjang daripada tinggi kerucut (t).', correctValue: true }
    ]
  },
  // MATEMATIKA SOAL 4: Menjodohkan
  {
    id: 'q-mat-04',
    bankId: 'bank-mat-09',
    nomorUrut: 4,
    tipe: 'menjodohkan',
    pertanyaan: 'Jodohkanlah rumus volume bangun ruang berikut dengan rumus matematis yang tepat sesuai konsep geometri ruang:',
    bobot: 15,
    tingkatKesulitan: 'Sedang',
    kompetensi: 'Rumus baku bangun ruang matematika',
    materi: 'Geometri Ruang',
    matchingPairs: [
      { id: 'match-1', premise: 'Volume Tabung (Cylinder)', match: 'π × r² × t' },
      { id: 'match-2', premise: 'Volume Kerucut (Cone)', match: '1/3 × π × r² × t' },
      { id: 'match-3', premise: 'Volume Bola (Sphere)', match: '4/3 × π × r³' },
      { id: 'match-4', premise: 'Volume Limas Segiempat', match: '1/3 × Luas Alas × Tinggi' }
    ]
  },
  // MATEMATIKA SOAL 5: Isian Singkat
  {
    id: 'q-mat-05',
    bankId: 'bank-mat-09',
    nomorUrut: 5,
    tipe: 'isian_singkat',
    pertanyaan: 'Dalam sebuah kantong terdapat 5 kelereng merah, 3 kelereng kuning, dan 2 kelereng hijau. Jika diambil satu kelereng secara acak, berapakah peluang terambilnya kelereng berwarna MERAH? (Tuliskan dalam bentuk pecahan sederhana, contoh: 1/2)',
    bobot: 15,
    tingkatKesulitan: 'Mudah',
    kompetensi: 'Peluang teoritik kejadian tunggal',
    materi: 'Peluang & Statistika',
    kunciJawabanSingkat: ['1/2', '0.5', '5/10', '50%']
  },
  // MATEMATIKA SOAL 6: Essay
  {
    id: 'q-mat-06',
    bankId: 'bank-mat-09',
    nomorUrut: 6,
    tipe: 'essay',
    pertanyaan: 'Pak Syarif memiliki sebidang tanah pekarangan di belakang madrasah berbentuk persegi panjang dengan keliling 60 meter. Tentukan: \na) Model matematika luas tanah dalam fungsi f(x) jika lebar tanah dimisalkan x meter.\nb) Ukuran panjang dan lebar tanah agar diperoleh luas pekarangan maksimum!\nc) Berapakah luas maksimum tanah tersebut?',
    bobot: 30,
    tingkatKesulitan: 'Sukar',
    kompetensi: 'Menyelesaikan masalah optimasi nilai maksimum menggunakan fungsi kuadrat',
    materi: 'Aplikasi Fungsi Kuadrat',
    rubrikEssay: 'Skor 10: Menuliskan model keliling 2(p+l)=60 => p = 30-x, dan fungsi luas L(x) = 30x - x².\nSkor 10: Menemukan titik puncak sumbu simetri x = -b/(2a) = -30/(-2) = 15 meter, sehingga p = 15 meter dan l = 15 meter.\nSkor 10: Menghitung luas maksimum L = 15 x 15 = 225 m² beserta kesimpulan yang tepat.'
  },
  // FIKIH SOAL 1: Pilihan Ganda
  {
    id: 'q-fik-01',
    bankId: 'bank-fik-09',
    nomorUrut: 1,
    tipe: 'pilihan_ganda',
    pertanyaan: 'Penyembelihan hewan qurban dalam syariat Islam dilaksanakan pada tanggal 10 Dzulhijjah (Hari Raya Idul Adha) dan hari-hari Tasyrik. Kapankah batas akhir waktu penyembelihan hewan qurban tersebut?',
    bobot: 20,
    tingkatKesulitan: 'Mudah',
    kompetensi: 'Ketentuan dan waktu ibadah qurban',
    materi: 'Penyembelihan & Qurban',
    options: [
      { id: 'A', text: 'Sebelum terbenam matahari pada tanggal 13 Dzulhijjah', isCorrect: true },
      { id: 'B', text: 'Tepat saat fajar shadiq tanggal 12 Dzulhijjah', isCorrect: false },
      { id: 'C', text: 'Setelah shalat Maghrib tanggal 10 Dzulhijjah', isCorrect: false },
      { id: 'D', text: 'Sepanjang bulan Dzulhijjah sampai awal Muharram', isCorrect: false }
    ]
  },
  // FIKIH SOAL 2: Pilihan Ganda Kompleks
  {
    id: 'q-fik-02',
    bankId: 'bank-fik-09',
    nomorUrut: 2,
    tipe: 'pilihan_ganda_kompleks',
    pertanyaan: 'Manakah di antara syarat-syarat hewan berikut yang SAH untuk dijadikan hewan sembelihan ibadah Qurban menurut fikih mazhab Syafi\'i? (Pilihlah opsi yang benar)',
    bobot: 25,
    tingkatKesulitan: 'Sedang',
    kompetensi: 'Syarat sah hewan qurban',
    materi: 'Qurban & Aqiqah',
    options: [
      { id: 'A', text: 'Kambing/Domba telah berumur minimal 1 tahun (musinnah) atau tanggal giginya', isCorrect: true },
      { id: 'B', text: 'Sapi/Kerbau telah berumur minimal 2 tahun memasuki tahun ketiga', isCorrect: true },
      { id: 'C', text: 'Hewan tidak dalam keadaan buta sebelah atau pincang parah', isCorrect: true },
      { id: 'D', text: 'Satu ekor kambing dapat digunakan secara sah untuk berqurban 7 orang keluarga', isCorrect: false }
    ]
  }
];

export const initialExams: Exam[] = [
  {
    id: 'exam-mat-01',
    bankId: 'bank-mat-09',
    namaUjian: 'Asesmen Madrasah 2026 - Matematika IX',
    kodeUjian: 'AM-MAT-IX-2026',
    subjectName: 'Matematika Terapan & Geometri',
    jenisUjian: 'Asesmen Madrasah',
    academicYearId: 'ay-2025-2026',
    semester: 'Genap',
    targetClassIds: ['cls-9a', 'cls-9b'],
    targetClassNames: ['IX-A (Unggulan Sains)', 'IX-B (Reguler)'],
    tanggalMulai: '2026-08-20',
    jamMulai: '07:30',
    tanggalSelesai: '2026-08-20',
    jamSelesai: '11:00',
    durasiMenit: 60,
    jumlahSoal: 6,
    nilaiMinimum: 75,
    acakSoal: true,
    acakJawaban: true,
    izinkanKembali: true,
    tampilkanHasil: true,
    tampilkanPembahasan: false,
    useToken: true,
    token: 'CBT-2026-01',
    status: 'aktif',
    createdBy: 'Ust. M. Fauzi Arifin, M.Pd'
  },
  {
    id: 'exam-fik-01',
    bankId: 'bank-fik-09',
    namaUjian: 'Penilaian Akhir Semester - Fikih Ibadah IX',
    kodeUjian: 'PAS-FIK-IX-2026',
    subjectName: 'Fikih Ibadah & Muamalah',
    jenisUjian: 'Penilaian Akhir Semester',
    academicYearId: 'ay-2025-2026',
    semester: 'Genap',
    targetClassIds: ['cls-9a', 'cls-9b'],
    targetClassNames: ['IX-A (Unggulan Sains)', 'IX-B (Reguler)'],
    tanggalMulai: '2026-08-21',
    jamMulai: '08:00',
    tanggalSelesai: '2026-08-21',
    jamSelesai: '10:00',
    durasiMenit: 45,
    jumlahSoal: 2,
    nilaiMinimum: 78,
    acakSoal: true,
    acakJawaban: false,
    izinkanKembali: true,
    tampilkanHasil: false,
    tampilkanPembahasan: false,
    useToken: true,
    token: 'FIK-PAS-99',
    status: 'draft',
    createdBy: 'Usth. Hj. Fatimah Az-Zahra, M.Ag'
  }
];

export const initialExamSessions: { [sessionId: string]: ExamSession } = {
  'sess-std01-mat': {
    id: 'sess-std01-mat',
    examId: 'exam-mat-01',
    studentId: 'std-01',
    studentName: 'Muhammad Rizky Pratama',
    nisn: '0098765431',
    namaKelas: 'IX-A (Unggulan Sains)',
    roomName: 'Laboratorium Komputer 1',
    tokenUsed: 'CBT-2026-01',
    status: 'sedang_mengerjakan',
    startedAt: '2026-08-20 07:32:10',
    lastHeartbeat: '2026-08-20 07:35:10',
    ipAddress: '192.168.1.101',
    deviceInfo: 'Chrome 128 / Windows 11 (PC-LAB01-01)',
    remainingSeconds: 3240, // ~54 mins
    questionOrder: ['q-mat-01', 'q-mat-02', 'q-mat-03', 'q-mat-04', 'q-mat-05', 'q-mat-06'],
    totalAnswered: 3,
    totalQuestions: 6,
    answers: {
      'q-mat-01': {
        questionId: 'q-mat-01',
        tipe: 'pilihan_ganda',
        jawaban: 'A',
        isFlagged: false,
        isAnswered: true,
        savedAt: '2026-08-20 07:33:05'
      },
      'q-mat-02': {
        questionId: 'q-mat-02',
        tipe: 'pilihan_ganda_kompleks',
        jawaban: ['A', 'B', 'D'],
        isFlagged: false,
        isAnswered: true,
        savedAt: '2026-08-20 07:34:12'
      },
      'q-mat-03': {
        questionId: 'q-mat-03',
        tipe: 'benar_salah',
        jawaban: { 'stmt-1': true, 'stmt-2': false, 'stmt-3': true },
        isFlagged: true,
        isAnswered: true,
        savedAt: '2026-08-20 07:35:00'
      }
    }
  },
  'sess-std02-mat': {
    id: 'sess-std02-mat',
    examId: 'exam-mat-01',
    studentId: 'std-02',
    studentName: 'Aisyah Nur Ramadhani',
    nisn: '0098765432',
    namaKelas: 'IX-A (Unggulan Sains)',
    roomName: 'Laboratorium Komputer 1',
    tokenUsed: 'CBT-2026-01',
    status: 'sedang_mengerjakan',
    startedAt: '2026-08-20 07:31:00',
    lastHeartbeat: '2026-08-20 07:35:20',
    ipAddress: '192.168.1.102',
    deviceInfo: 'Chrome 128 / Windows 11 (PC-LAB01-02)',
    remainingSeconds: 3180,
    questionOrder: ['q-mat-02', 'q-mat-01', 'q-mat-05', 'q-mat-03', 'q-mat-04', 'q-mat-06'],
    totalAnswered: 4,
    totalQuestions: 6,
    answers: {
      'q-mat-01': {
        questionId: 'q-mat-01',
        tipe: 'pilihan_ganda',
        jawaban: 'A',
        isFlagged: false,
        isAnswered: true,
        savedAt: '2026-08-20 07:32:45'
      },
      'q-mat-02': {
        questionId: 'q-mat-02',
        tipe: 'pilihan_ganda_kompleks',
        jawaban: ['A', 'B'],
        isFlagged: false,
        isAnswered: true,
        savedAt: '2026-08-20 07:33:30'
      }
    }
  },
  'sess-std03-mat': {
    id: 'sess-std03-mat',
    examId: 'exam-mat-01',
    studentId: 'std-03',
    studentName: 'Ahmad Bilal Al-Farisi',
    nisn: '0098765433',
    namaKelas: 'IX-A (Unggulan Sains)',
    roomName: 'Laboratorium Komputer 1',
    tokenUsed: 'CBT-2026-01',
    status: 'selesai',
    startedAt: '2026-08-20 07:00:00',
    finishedAt: '2026-08-20 07:28:40',
    lastHeartbeat: '2026-08-20 07:28:40',
    ipAddress: '192.168.1.103',
    deviceInfo: 'Edge 127 / Windows 10 (PC-LAB01-03)',
    remainingSeconds: 0,
    questionOrder: ['q-mat-01', 'q-mat-02', 'q-mat-03', 'q-mat-04', 'q-mat-05', 'q-mat-06'],
    totalAnswered: 6,
    totalQuestions: 6,
    scoreTotal: 88,
    isPassed: true,
    essayGraded: true,
    answers: {
      'q-mat-01': { questionId: 'q-mat-01', tipe: 'pilihan_ganda', jawaban: 'A', isFlagged: false, isAnswered: true, scoreEarned: 10, savedAt: '2026-08-20 07:05:00' },
      'q-mat-02': { questionId: 'q-mat-02', tipe: 'pilihan_ganda_kompleks', jawaban: ['A', 'B', 'D'], isFlagged: false, isAnswered: true, scoreEarned: 15, savedAt: '2026-08-20 07:10:00' },
      'q-mat-03': { questionId: 'q-mat-03', tipe: 'benar_salah', jawaban: { 'stmt-1': true, 'stmt-2': false, 'stmt-3': true }, isFlagged: false, isAnswered: true, scoreEarned: 15, savedAt: '2026-08-20 07:15:00' },
      'q-mat-04': { questionId: 'q-mat-04', tipe: 'menjodohkan', jawaban: { 'match-1': 'π × r² × t', 'match-2': '1/3 × π × r² × t', 'match-3': '4/3 × π × r³', 'match-4': '1/3 × Luas Alas × Tinggi' }, isFlagged: false, isAnswered: true, scoreEarned: 15, savedAt: '2026-08-20 07:18:00' },
      'q-mat-05': { questionId: 'q-mat-05', tipe: 'isian_singkat', jawaban: '1/2', isFlagged: false, isAnswered: true, scoreEarned: 15, savedAt: '2026-08-20 07:22:00' },
      'q-mat-06': { questionId: 'q-mat-06', tipe: 'essay', jawaban: 'a) Keliling 2(p+l)=60 -> p=30-x, maka Luas L(x) = x(30-x) = 30x - x²\nb) Luas maksimum terjadi saat x = 15m, p = 15m, l = 15m (persegi)\nc) Luas maksimum = 15 x 15 = 225 m²', isFlagged: false, isAnswered: true, scoreEarned: 28, feedback: 'Jawaban dan penurunan aljabar sangat baik dan sistematis.', savedAt: '2026-08-20 07:27:00' }
    }
  }
};

export const initialExamResults: ExamResult[] = [
  {
    id: 'res-std03-mat',
    examId: 'exam-mat-01',
    examName: 'Asesmen Madrasah 2026 - Matematika IX',
    subjectName: 'Matematika Terapan & Geometri',
    studentId: 'std-03',
    studentName: 'Ahmad Bilal Al-Farisi',
    nisn: '0098765433',
    namaKelas: 'IX-A (Unggulan Sains)',
    roomName: 'Laboratorium Komputer 1',
    startedAt: '2026-08-20 07:00:00',
    finishedAt: '2026-08-20 07:28:40',
    durasiPengerjaanMenit: 28,
    totalSoal: 6,
    benarCount: 5,
    salahCount: 0,
    kosongCount: 0,
    nilaiObjektif: 60,
    nilaiEssay: 28,
    nilaiAkhir: 88,
    kkm: 75,
    statusLulus: 'LULUS',
    essayGraded: true
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-08-20 07:00:00',
    userId: 'usr-admin-01',
    userName: 'Super Administrator CBT',
    role: 'super_admin',
    action: 'START_EXAM_TOKEN',
    details: 'Mengaktifkan token CBT-2026-01 untuk ujian Asesmen Madrasah 2026 - Matematika IX',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'log-02',
    timestamp: '2026-08-20 07:30:00',
    userId: 'usr-std-01',
    userName: 'Muhammad Rizky Pratama',
    role: 'siswa',
    action: 'LOGIN_EXAM_SESSION',
    details: 'Siswa berhasil validasi token dan memulai pengerjaan ujian Matematika',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'log-03',
    timestamp: '2026-08-20 07:31:00',
    userId: 'usr-std-02',
    userName: 'Aisyah Nur Ramadhani',
    role: 'siswa',
    action: 'LOGIN_EXAM_SESSION',
    details: 'Siswa berhasil validasi token dan memulai pengerjaan ujian Matematika',
    ipAddress: '192.168.1.102'
  }
];

export const initialBackups: BackupItem[] = [
  {
    id: 'bkp-20260819-2100',
    fileName: 'cbt_backup_2026-08-19_210000.sql',
    createdAt: '2026-08-19 21:00:00',
    sizeKb: 1420,
    type: 'full',
    dataPayload: '{"type":"cbt_backup_full","version":"1.0"}'
  }
];
