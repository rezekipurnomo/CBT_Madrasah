import { Question, ExamSession, ExamResult } from '../types';

export interface ItemAnalysisResult {
  questionId: string;
  nomorUrut: number;
  pertanyaan: string;
  tipe: string;
  totalSubmissions: number;
  correctAnswersCount: number;
  difficultyIndex: number; // P-value: 0.0 - 1.0
  difficultyLabel: 'Sangat Sukar' | 'Sukar' | 'Sedang' | 'Mudah' | 'Sangat Mudah';
  discriminationIndex: number; // D-value: -1.0 to 1.0
  discriminationLabel: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Jelek / Revisi';
  optionDistribution: { [key: string]: number }; // 'A': count, 'B': count...
}

export function calculateItemAnalysis(
  questions: Question[],
  sessions: ExamSession[]
): ItemAnalysisResult[] {
  const completedSessions = Object.values(sessions).filter(
    s => s.status === 'selesai' || s.status === 'waktu_habis'
  );

  const N = completedSessions.length;
  if (N === 0) {
    return questions.map(q => ({
      questionId: q.id,
      nomorUrut: q.nomorUrut,
      pertanyaan: q.pertanyaan,
      tipe: q.tipe,
      totalSubmissions: 0,
      correctAnswersCount: 0,
      difficultyIndex: 0.5,
      difficultyLabel: 'Sedang',
      discriminationIndex: 0.3,
      discriminationLabel: 'Baik',
      optionDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 }
    }));
  }

  // Sort sessions by total score for upper 27% and lower 27% groups
  const sortedSessions = [...completedSessions].sort((a, b) => (b.scoreTotal || 0) - (a.scoreTotal || 0));
  const groupSize = Math.max(1, Math.round(N * 0.27));
  const upperGroup = sortedSessions.slice(0, groupSize);
  const lowerGroup = sortedSessions.slice(Math.max(0, N - groupSize));

  return questions.map(q => {
    let correctTotal = 0;
    const optionCounts: { [key: string]: number } = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    completedSessions.forEach(sess => {
      const ans = sess.answers[q.id];
      if (ans && ans.isAnswered) {
        if (q.tipe === 'pilihan_ganda') {
          const optId = String(ans.jawaban).toUpperCase();
          if (optionCounts[optId] !== undefined) {
            optionCounts[optId]++;
          }
          const correctOpt = q.options?.find(o => o.isCorrect)?.id;
          if (correctOpt && optId === correctOpt) {
            correctTotal++;
          }
        } else {
          if ((ans.scoreEarned || 0) >= q.bobot * 0.7) {
            correctTotal++;
          }
        }
      }
    });

    // P-value (Difficulty)
    const pValue = N > 0 ? Number((correctTotal / N).toFixed(2)) : 0;
    let diffLabel: 'Sangat Sukar' | 'Sukar' | 'Sedang' | 'Mudah' | 'Sangat Mudah' = 'Sedang';
    if (pValue < 0.2) diffLabel = 'Sangat Sukar';
    else if (pValue < 0.3) diffLabel = 'Sukar';
    else if (pValue <= 0.7) diffLabel = 'Sedang';
    else if (pValue <= 0.85) diffLabel = 'Mudah';
    else diffLabel = 'Sangat Mudah';

    // D-value (Discrimination)
    let upperCorrect = 0;
    let lowerCorrect = 0;

    upperGroup.forEach(sess => {
      const ans = sess.answers[q.id];
      if (ans && ((ans.scoreEarned || 0) >= q.bobot * 0.7 || ans.jawaban === q.options?.find(o => o.isCorrect)?.id)) {
        upperCorrect++;
      }
    });

    lowerGroup.forEach(sess => {
      const ans = sess.answers[q.id];
      if (ans && ((ans.scoreEarned || 0) >= q.bobot * 0.7 || ans.jawaban === q.options?.find(o => o.isCorrect)?.id)) {
        lowerCorrect++;
      }
    });

    const dValue = groupSize > 0 ? Number(((upperCorrect - lowerCorrect) / groupSize).toFixed(2)) : 0.3;
    let discLabel: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Jelek / Revisi' = 'Cukup';
    if (dValue >= 0.4) discLabel = 'Sangat Baik';
    else if (dValue >= 0.3) discLabel = 'Baik';
    else if (dValue >= 0.2) discLabel = 'Cukup';
    else discLabel = 'Jelek / Revisi';

    return {
      questionId: q.id,
      nomorUrut: q.nomorUrut,
      pertanyaan: q.pertanyaan,
      tipe: q.tipe,
      totalSubmissions: N,
      correctAnswersCount: correctTotal,
      difficultyIndex: pValue,
      difficultyLabel: diffLabel,
      discriminationIndex: dValue,
      discriminationLabel: discLabel,
      optionDistribution: optionCounts
    };
  });
}
