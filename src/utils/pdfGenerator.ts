import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MadrasahProfile, Student, Exam, ExamResult, ExamRoom } from '../types';

export function generateKartuPesertaPDF(
  students: Student[],
  madrasah: MadrasahProfile,
  classNameOrExam: string = 'Seluruh Rombel',
  token?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cardWidth = 88;
  const cardHeight = 58;
  const marginX = 12;
  const marginY = 12;
  const gapX = 10;
  const gapY = 10;

  let currentX = marginX;
  let currentY = marginY;
  let countOnPage = 0;

  students.forEach((student) => {
    if (countOnPage === 8) {
      doc.addPage();
      currentX = marginX;
      currentY = marginY;
      countOnPage = 0;
    }

    // Outer card border
    doc.setDrawColor(16, 185, 129); // Emerald
    doc.setLineWidth(0.6);
    doc.roundedRect(currentX, currentY, cardWidth, cardHeight, 2, 2);

    // Card Header Bar
    doc.setFillColor(6, 95, 70); // Dark emerald
    doc.rect(currentX + 0.3, currentY + 0.3, cardWidth - 0.6, 11, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('KARTU PESERTA UJIAN CBT MADRASAH', currentX + cardWidth / 2, currentY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(madrasah.namaMadrasah.toUpperCase(), currentX + cardWidth / 2, currentY + 8.5, { align: 'center' });

    // Photo Box Placeholder
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(241, 245, 249);
    doc.rect(currentX + 4, currentY + 14, 15, 20, 'FD');
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text('FOTO 2x3', currentX + 11.5, currentY + 24.5, { align: 'center' });

    // Details text
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(6.5);
    const startTextX = currentX + 22;
    let textY = currentY + 16;

    const labelVal = [
      ['No. Peserta', `: ${student.nomorPeserta}`],
      ['NISN / NIS', `: ${student.nisn} / ${student.nis}`],
      ['Nama', `: ${student.nama.length > 20 ? student.nama.substring(0, 18) + '...' : student.nama}`],
      ['Kelas', `: ${student.namaKelas}`],
      ['Username', `: ${student.username}`],
      ['Password', `: ****** (Sesuai Akun)`]
    ];

    labelVal.forEach(([lbl, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(lbl, startTextX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(val, startTextX + 16, textY);
      textY += 3.8;
    });

    // Info bar at bottom
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.rect(currentX + 3, currentY + 41, cardWidth - 6, 8, 'FD');

    doc.setFontSize(6);
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rombel: ${classNameOrExam} | Sesi: ${student.sesi || 1}`, currentX + 5, currentY + 44.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ruang: ${student.ruangId || 'LAB-01'} | Server: ${madrasah.serverIp}`, currentX + 5, currentY + 47.5);

    // Footer signature notice
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Kepala Madrasah: ${madrasah.kepalaMadrasah}`, currentX + cardWidth - 4, currentY + 54, { align: 'right' });

    // Grid calculations (2 cols x 4 rows)
    countOnPage++;
    if (countOnPage % 2 === 1) {
      currentX += cardWidth + gapX;
    } else {
      currentX = marginX;
      currentY += cardHeight + gapY;
    }
  });

  doc.save(`Kartu_Peserta_CBT_${madrasah.namaMadrasah.replace(/\s+/g, '_')}.pdf`);
}

export function generateBeritaAcaraPDF(
  exam: Exam,
  room: ExamRoom | any,
  sesi: number = 1,
  hadirCount: number = 0,
  tidakHadirCount: number = 0,
  madrasah: MadrasahProfile,
  pengawasName?: string,
  catatanRuang: string = 'Pelaksanaan ujian berlangsung tertib, lancar, dan tanpa kendala teknis jaringan LAN.'
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // KOP SURAT MADRASAH
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('KEMENTERIAN AGAMA REPUBLIK INDONESIA', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(13);
  doc.text(madrasah.namaMadrasah.toUpperCase(), pageWidth / 2, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${madrasah.alamat}, Desa ${madrasah.desa}, Kec. ${madrasah.kecamatan}, Kab. ${madrasah.kabupaten}`, pageWidth / 2, 27, { align: 'center' });
  doc.text(`Telp: ${madrasah.telepon} | Email: ${madrasah.email} | NPSN: ${madrasah.npsn} | NSM: ${madrasah.nsm}`, pageWidth / 2, 31, { align: 'center' });

  // Divider line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(15, 34, pageWidth - 15, 34);
  doc.setLineWidth(0.2);
  doc.line(15, 35, pageWidth - 15, 35);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('BERITA ACARA PELAKSANAAN UJIAN CBT', pageWidth / 2, 43, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Tahun Pelajaran 2025/2026 - Semester Genap`, pageWidth / 2, 48, { align: 'center' });

  // Body introductory paragraph
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const introText = `Pada hari ini, ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, di ${madrasah.namaMadrasah}, telah dilaksanakan Ujian Berbasis Komputer (Computer Based Test) dengan rincian sebagai berikut:`;
  const splitIntro = doc.splitTextToSize(introText, pageWidth - 30);
  doc.text(splitIntro, 15, 56);

  // Exam Meta Table
  const totalPeserta = hadirCount + tidakHadirCount;
  const metaBody = [
    ['Nama Ujian / Kode', `: ${exam.namaUjian} (${exam.kodeUjian})`],
    ['Mata Pelajaran', `: ${exam.subjectName}`],
    ['Tingkat / Kelas', `: ${exam.targetClassNames.join(', ')}`],
    ['Hari, Tanggal', `: ${exam.tanggalMulai}`],
    ['Waktu / Durasi', `: ${exam.jamMulai} - ${exam.jamSelesai} (${exam.durasiMenit} Menit)`],
    ['Ruang / Sesi Ujian', `: ${room?.namaRuang || 'LAB-01'} (Sesi ${sesi})`],
    ['Jumlah Peserta Hadir', `: ${hadirCount} Siswa`],
    ['Jumlah Tidak Hadir', `: ${tidakHadirCount} Siswa`],
    ['Token Ujian Digunakan', `: ${exam.token || '-'}`]
  ];

  let currentY = 66;
  metaBody.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, currentY);
    currentY += 5.5;
  });

  // Catatan Pelaksanaan
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Catatan Selama Pelaksanaan Ujian:', 15, currentY);
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.rect(15, currentY, pageWidth - 30, 20);
  doc.text(doc.splitTextToSize(catatanRuang, pageWidth - 36), 18, currentY + 5);

  currentY += 26;
  const closingText = 'Demikian berita acara ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.';
  doc.text(closingText, 15, currentY);

  // Signature section
  currentY += 12;
  const colLeft = 25;
  const colRight = pageWidth - 70;

  doc.text(`Mengetahui,`, colLeft, currentY);
  doc.text(`Kepala ${madrasah.namaMadrasah}`, colLeft, currentY + 5);

  doc.text(`${madrasah.kabupaten}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, colRight, currentY);
  doc.text(`Pengawas / Proktor Ruang`, colRight, currentY + 5);

  currentY += 28;
  doc.setFont('helvetica', 'bold');
  doc.text(madrasah.kepalaMadrasah, colLeft, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. ${madrasah.nipKepalaMadrasah}`, colLeft, currentY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(pengawasName || room?.pengawasUtama || 'Pengawas Ruang', colRight, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. 198205142008011012`, colRight, currentY + 4);

  doc.save(`Berita_Acara_CBT_${exam.kodeUjian}.pdf`);
}

export function generateDaftarHadirPDF(
  exam: Exam,
  room: ExamRoom | any,
  sesi: number = 1,
  students: Student[],
  madrasah: MadrasahProfile,
  pengawasName?: string
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DAFTAR HADIR PESERTA UJIAN CBT', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(12);
  doc.text(madrasah.namaMadrasah.toUpperCase(), pageWidth / 2, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mata Ujian: ${exam.namaUjian} | Ruang: ${room?.namaRuang || 'LAB-01'} (Sesi ${sesi}) | Tanggal: ${exam.tanggalMulai}`, pageWidth / 2, 27, { align: 'center' });

  // Table Data
  const tableData = students.map((st, i) => [
    (i + 1).toString(),
    st.nomorPeserta,
    st.nisn,
    st.nama,
    st.namaKelas,
    i % 2 === 0 ? `${i + 1}. ..................` : '',
    i % 2 === 1 ? `${i + 1}. ..................` : ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [['No', 'No. Peserta', 'NISN', 'Nama Peserta', 'Kelas', 'Tanda Tangan (Ganjil)', 'Tanda Tangan (Genap)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 95, 70],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 26 },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'left' },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'left', cellWidth: 32 },
      6: { halign: 'left', cellWidth: 32 }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const colRight = pageWidth - 70;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`${madrasah.kabupaten}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, colRight, finalY);
  doc.text(`Pengawas Ruang,`, colRight, finalY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(pengawasName || room?.pengawasUtama || 'Pengawas Ruang', colRight, finalY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. 198205142008011012`, colRight, finalY + 28);

  doc.save(`Daftar_Hadir_${exam.kodeUjian}_${room?.nomorRuang || 'LAB'}.pdf`);
}

export function generateRekapNilaiPDF(
  exam: Exam,
  results: ExamResult[],
  madrasah: MadrasahProfile
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`DAFTAR HASIL & REKAPITULASI NILAI UJIAN CBT`, pageWidth / 2, 14, { align: 'center' });
  doc.setFontSize(10);
  doc.text(madrasah.namaMadrasah.toUpperCase(), pageWidth / 2, 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ujian: ${exam.namaUjian} | Mapel: ${exam.subjectName} | KKM: ${exam.nilaiMinimum} | Waktu: ${exam.tanggalMulai}`, pageWidth / 2, 24, { align: 'center' });

  // Table
  const tableData = results.map((res, i) => [
    (i + 1).toString(),
    res.nisn,
    res.studentName,
    res.namaKelas,
    `${res.benarCount}/${res.totalSoal}`,
    `${res.salahCount}`,
    `${res.kosongCount}`,
    res.nilaiObjektif.toString(),
    res.nilaiEssay.toString(),
    res.nilaiAkhir.toString(),
    res.statusLulus
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['No', 'NISN', 'Nama Siswa', 'Kelas', 'Benar', 'Salah', 'Kosong', 'Skor PG', 'Skor Essay', 'Nilai Akhir', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 95, 70],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'left' },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 14 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 18 },
      8: { halign: 'center', cellWidth: 18 },
      9: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      10: { halign: 'center', fontStyle: 'bold', cellWidth: 24 }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const passedCount = results.filter(r => r.statusLulus === 'LULUS').length;
  const avg = results.length > 0 ? (results.reduce((acc, c) => acc + c.nilaiAkhir, 0) / results.length).toFixed(1) : '0';

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Jumlah Peserta: ${results.length} Siswa | Tuntas/Lulus: ${passedCount} Siswa (${results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0}%) | Rata-rata Nilai: ${avg}`, 15, finalY);

  doc.save(`Rekap_Nilai_${exam.kodeUjian}.pdf`);
}
