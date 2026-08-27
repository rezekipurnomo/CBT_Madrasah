import * as XLSX from 'xlsx';
import { Student, Teacher, Question, ExamResult, QuestionOption } from '../types';

export function exportStudentsToExcel(students: Student[], filename = 'Data_Siswa_CBT.xlsx') {
  const data = students.map((s, idx) => ({
    No: idx + 1,
    NIS: s.nis,
    NISN: s.nisn,
    'Nama Lengkap': s.nama,
    'Jenis Kelamin': s.jenisKelamin,
    'Tempat Lahir': s.tempatLahir,
    'Tanggal Lahir': s.tanggalLahir,
    Kelas: s.namaKelas,
    'Nomor Peserta': s.nomorPeserta,
    Username: s.username,
    Status: s.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Siswa');
  XLSX.writeFile(workbook, filename);
}

export function exportTeachersToExcel(teachers: Teacher[], filename = 'Data_Guru_CBT.xlsx') {
  const data = teachers.map((t, idx) => ({
    No: idx + 1,
    NIP: t.nip,
    NUPTK: t.nuptk,
    'Nama Lengkap': t.nama,
    'Jenis Kelamin': t.jenisKelamin,
    'Mata Pelajaran': t.mapelUtama,
    Email: t.email,
    'No HP': t.nomorHp,
    Username: t.username,
    Status: t.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Guru');
  XLSX.writeFile(workbook, filename);
}

export function exportQuestionsToExcel(questions: Question[], subjectName: string, filename = 'Bank_Soal_CBT.xlsx') {
  const data = questions.map((q, idx) => {
    let optA = '', optB = '', optC = '', optD = '', optE = '', kunci = '';
    if (q.options) {
      optA = q.options.find(o => o.id === 'A')?.text || '';
      optB = q.options.find(o => o.id === 'B')?.text || '';
      optC = q.options.find(o => o.id === 'C')?.text || '';
      optD = q.options.find(o => o.id === 'D')?.text || '';
      optE = q.options.find(o => o.id === 'E')?.text || '';
      const correctOpts = q.options.filter(o => o.isCorrect).map(o => o.id);
      kunci = correctOpts.join(',');
    } else if (q.kunciJawabanSingkat) {
      kunci = q.kunciJawabanSingkat.join(' | ');
    }

    return {
      'No Urut': idx + 1,
      'Tipe Soal': q.tipe,
      Pertanyaan: q.pertanyaan,
      'Rumus / LaTeX': q.rumusMath || '',
      'Opsi A': optA,
      'Opsi B': optB,
      'Opsi C': optC,
      'Opsi D': optD,
      'Opsi E': optE,
      'Kunci Jawaban': kunci,
      Bobot: q.bobot,
      'Tingkat Kesulitan': q.tingkatKesulitan,
      Materi: q.materi || '',
      Kompetensi: q.kompetensi || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Soal');
  XLSX.writeFile(workbook, filename);
}

export function exportResultsToExcel(results: ExamResult[], examName: string) {
  const data = results.map((r, idx) => ({
    No: idx + 1,
    NISN: r.nisn,
    'Nama Siswa': r.studentName,
    Kelas: r.namaKelas,
    'Ruang Ujian': r.roomName,
    'Mulai Ujian': r.startedAt,
    'Selesai Ujian': r.finishedAt,
    'Durasi (Menit)': r.durasiPengerjaanMenit,
    'Jumlah Soal': r.totalSoal,
    'Jawaban Benar': r.benarCount,
    'Jawaban Salah': r.salahCount,
    'Nilai PG': r.nilaiObjektif,
    'Nilai Essay': r.nilaiEssay,
    'Nilai Akhir': r.nilaiAkhir,
    KKM: r.kkm,
    'Status Kelulusan': r.statusLulus
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Ujian');
  XLSX.writeFile(workbook, `Hasil_Ujian_${examName.replace(/\s+/g, '_')}.xlsx`);
}

// Generate Templates for download
export function downloadStudentTemplate() {
  const sampleData = [
    {
      NIS: '232407010',
      NISN: '0098765440',
      Nama: 'Zaidan Al-Ayyubi',
      'Jenis Kelamin': 'L',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir': '2011-05-10',
      Kelas: 'IX-A',
      'Nomor Peserta': '02-001-030-8',
      Username: 'siswa06',
      Password: 'password123'
    },
    {
      NIS: '232407011',
      NISN: '0098765441',
      Nama: 'Khadijah Az-Zahra',
      'Jenis Kelamin': 'P',
      'Tempat Lahir': 'Cimahi',
      'Tanggal Lahir': '2011-09-15',
      Kelas: 'IX-A',
      'Nomor Peserta': '02-001-031-7',
      Username: 'siswa07',
      Password: 'password123'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
  XLSX.writeFile(wb, 'Template_Import_Siswa_CBT.xlsx');
}

export function downloadTeacherTemplate() {
  const sampleData = [
    {
      NIP: '198501012010011005',
      NUPTK: '1234567890123456',
      Nama: 'Drs. H. Syarifudin',
      'Jenis Kelamin': 'L',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir': '1985-01-01',
      'Mata Pelajaran': 'Bahasa Arab Madrasah',
      Email: 'syarifudin@mtsn1.sch.id',
      'No HP': '081234567899',
      Username: 'guru.syarif',
      Password: 'password123'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Guru');
  XLSX.writeFile(wb, 'Template_Import_Guru_CBT.xlsx');
}

export function downloadQuestionTemplate() {
  const sampleData = [
    {
      'Tipe Soal': 'pilihan_ganda',
      Pertanyaan: 'Berapakah hasil dari 25 x 4 + 50?',
      'Rumus / LaTeX': '25 \\times 4 + 50 = 150',
      'Opsi A': '150',
      'Opsi B': '100',
      'Opsi C': '200',
      'Opsi D': '125',
      'Opsi E': '175',
      'Kunci Jawaban': 'A',
      Bobot: 10,
      'Tingkat Kesulitan': 'Mudah',
      Materi: 'Operasi Bilangan',
      Kompetensi: 'Hitung aritmatika dasar'
    },
    {
      'Tipe Soal': 'pilihan_ganda_kompleks',
      Pertanyaan: 'Manakah bilangan prima berikut?',
      'Rumus / LaTeX': '',
      'Opsi A': '2',
      'Opsi B': '3',
      'Opsi C': '4',
      'Opsi D': '5',
      'Opsi E': '6',
      'Kunci Jawaban': 'A,B,D',
      Bobot: 15,
      'Tingkat Kesulitan': 'Sedang',
      Materi: 'Teori Bilangan',
      Kompetensi: 'Klasifikasi bilangan'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Soal');
  XLSX.writeFile(wb, 'Template_Import_Soal_CBT.xlsx');
}

// Parse Excel file buffer or arrayBuffer
export async function parseExcelFile<T = any>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
