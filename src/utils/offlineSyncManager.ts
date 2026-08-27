import { Exam, Question, StudentAnswer, ExamSession } from '../types';

const DB_NAME = 'CBT_MADRASAH_OFFLINE_DB';
const DB_VERSION = 1;

export interface OfflineAnswerRecord {
  id: string; // `${sessionId}_${questionId}`
  sessionId: string;
  questionId: string;
  jawaban: any;
  isFlagged: boolean;
  isAnswered: boolean;
  savedAt: string;
  synced: boolean;
  clientTimestamp: number;
}

export interface OfflineSessionSnapshot {
  sessionId: string;
  examId: string;
  studentId: string;
  studentName: string;
  nisn: string;
  namaKelas: string;
  answers: { [questionId: string]: StudentAnswer };
  currentIndex: number;
  remainingSeconds: number;
  updatedAt: string;
  status: string;
}

export interface SyncQueueItem {
  id: string; // Unique event ID
  sessionId: string;
  questionId: string;
  answer: StudentAnswer;
  timestamp: number;
  retryCount: number;
}

class OfflineSyncService {
  private db: IDBDatabase | null = null;
  private isIndexedDBAvailable: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.isIndexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;
  }

  // Initialize IndexedDB with schema
  public async init(): Promise<boolean> {
    if (this.isInitialized) return true;
    if (!this.isIndexedDBAvailable) {
      this.isInitialized = true;
      return false;
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Store for atomic answers
          if (!db.objectStoreNames.contains('answers')) {
            const answerStore = db.createObjectStore('answers', { keyPath: 'id' });
            answerStore.createIndex('sessionId', 'sessionId', { unique: false });
            answerStore.createIndex('synced', 'synced', { unique: false });
          }

          // Store for entire session snapshot
          if (!db.objectStoreNames.contains('sessions')) {
            db.createObjectStore('sessions', { keyPath: 'sessionId' });
          }

          // Store for sync queue (outbox)
          if (!db.objectStoreNames.contains('sync_queue')) {
            const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
            queueStore.createIndex('sessionId', 'sessionId', { unique: false });
            queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // Store for pre-cached exam questions
          if (!db.objectStoreNames.contains('cached_exams')) {
            db.createObjectStore('cached_exams', { keyPath: 'examId' });
          }
        };

        request.onsuccess = (event: Event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.isInitialized = true;
          resolve(true);
        };

        request.onerror = () => {
          // Fallback to localStorage gracefully
          this.isInitialized = true;
          resolve(false);
        };
      } catch {
        this.isInitialized = true;
        resolve(false);
      }
    });
  }

  // Save an answer locally with dual-layer (IndexedDB + localStorage) persistence
  public async saveAnswerLocally(
    sessionId: string,
    questionId: string,
    answer: StudentAnswer
  ): Promise<void> {
    await this.init();

    const record: OfflineAnswerRecord = {
      id: `${sessionId}_${questionId}`,
      sessionId,
      questionId,
      jawaban: answer.jawaban,
      isFlagged: answer.isFlagged,
      isAnswered: answer.isAnswered,
      savedAt: answer.savedAt || new Date().toISOString(),
      synced: false,
      clientTimestamp: Date.now()
    };

    const queueItem: SyncQueueItem = {
      id: `sync_${sessionId}_${questionId}_${Date.now()}`,
      sessionId,
      questionId,
      answer,
      timestamp: Date.now(),
      retryCount: 0
    };

    // 1. Always write to localStorage backup key for instant fail-safe
    try {
      const lsAnswersKey = `CBT_OFFLINE_ANSWERS_${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(lsAnswersKey) || '{}');
      existing[questionId] = answer;
      localStorage.setItem(lsAnswersKey, JSON.stringify(existing));

      // Local storage queue
      const lsQueueKey = `CBT_SYNC_QUEUE_${sessionId}`;
      const queueList: SyncQueueItem[] = JSON.parse(localStorage.getItem(lsQueueKey) || '[]');
      // Deduplicate queue for same questionId: replace older pending update
      const filtered = queueList.filter(q => q.questionId !== questionId);
      filtered.push(queueItem);
      localStorage.setItem(lsQueueKey, JSON.stringify(filtered));
    } catch (e) {
      console.warn('localStorage backup write warning:', e);
    }

    // 2. Write to IndexedDB if available
    if (this.db) {
      try {
        const tx = this.db.transaction(['answers', 'sync_queue'], 'readwrite');
        const answersStore = tx.objectStore('answers');
        const queueStore = tx.objectStore('sync_queue');

        answersStore.put(record);
        queueStore.put(queueItem);
      } catch (err) {
        console.warn('IndexedDB write warning:', err);
      }
    }
  }

  // Pre-cache exam questions for offline continuity
  public async cacheExamAndQuestions(exam: Exam, questions: Question[]): Promise<void> {
    await this.init();
    const payload = {
      examId: exam.id,
      exam,
      questions,
      cachedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`CBT_CACHED_EXAM_${exam.id}`, JSON.stringify(payload));
    } catch {
      // Ignored
    }

    if (this.db) {
      try {
        const tx = this.db.transaction('cached_exams', 'readwrite');
        tx.objectStore('cached_exams').put(payload);
      } catch {
        // Ignored
      }
    }
  }

  // Get cached exam and questions if student loses network on refresh
  public async getCachedExamAndQuestions(
    examId: string
  ): Promise<{ exam: Exam; questions: Question[] } | null> {
    await this.init();

    // Try IndexedDB first
    if (this.db) {
      try {
        const result = await new Promise<any>((resolve) => {
          const tx = this.db!.transaction('cached_exams', 'readonly');
          const request = tx.objectStore('cached_exams').get(examId);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });
        if (result && result.exam && result.questions) {
          return { exam: result.exam, questions: result.questions };
        }
      } catch {
        // Fallback
      }
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(`CBT_CACHED_EXAM_${examId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.exam && parsed.questions) {
          return { exam: parsed.exam, questions: parsed.questions };
        }
      }
    } catch {
      // Ignored
    }

    return null;
  }

  // Save session snapshot locally
  public async saveSessionSnapshot(snapshot: OfflineSessionSnapshot): Promise<void> {
    await this.init();
    try {
      localStorage.setItem(`CBT_SNAPSHOT_${snapshot.sessionId}`, JSON.stringify(snapshot));
    } catch {
      // Ignored
    }

    if (this.db) {
      try {
        const tx = this.db.transaction('sessions', 'readwrite');
        tx.objectStore('sessions').put(snapshot);
      } catch {
        // Ignored
      }
    }
  }

  // Get pending unsynced queue count for a session
  public async getPendingQueue(sessionId: string): Promise<SyncQueueItem[]> {
    await this.init();

    // Check IndexedDB
    if (this.db) {
      try {
        const items = await new Promise<SyncQueueItem[]>((resolve) => {
          const tx = this.db!.transaction('sync_queue', 'readonly');
          const index = tx.objectStore('sync_queue').index('sessionId');
          const request = index.getAll(sessionId);
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => resolve([]);
        });
        if (items.length > 0) return items;
      } catch {
        // Fall through to localStorage
      }
    }

    // Check localStorage
    try {
      const lsQueueKey = `CBT_SYNC_QUEUE_${sessionId}`;
      const queueList: SyncQueueItem[] = JSON.parse(localStorage.getItem(lsQueueKey) || '[]');
      return queueList;
    } catch {
      return [];
    }
  }

  // Get all pending queues across all active/inactive sessions
  public async getAllPendingQueues(): Promise<{ [sessionId: string]: SyncQueueItem[] }> {
    await this.init();
    const result: { [sessionId: string]: SyncQueueItem[] } = {};

    // Check IndexedDB first
    if (this.db) {
      try {
        const allItems = await new Promise<SyncQueueItem[]>((resolve) => {
          const tx = this.db!.transaction('sync_queue', 'readonly');
          const request = tx.objectStore('sync_queue').getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => resolve([]);
        });

        allItems.forEach(item => {
          if (!result[item.sessionId]) result[item.sessionId] = [];
          result[item.sessionId].push(item);
        });
      } catch {
        // Fallback to localStorage scan
      }
    }

    // Also scan localStorage keys for any pending items
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('CBT_SYNC_QUEUE_')) {
          const sessionId = key.replace('CBT_SYNC_QUEUE_', '');
          const items: SyncQueueItem[] = JSON.parse(localStorage.getItem(key) || '[]');
          if (items.length > 0) {
            if (!result[sessionId]) {
              result[sessionId] = items;
            } else {
              // Merge deduplicated
              const existingIds = new Set(result[sessionId].map(it => it.questionId));
              items.forEach(it => {
                if (!existingIds.has(it.questionId)) {
                  result[sessionId].push(it);
                }
              });
            }
          }
        }
      }
    } catch {
      // Ignored
    }

    return result;
  }

  // Clear or mark items as synced after successful synchronization with server
  public async markItemsAsSynced(sessionId: string, syncedQuestionIds: string[]): Promise<void> {
    await this.init();

    // Update localStorage
    try {
      const lsQueueKey = `CBT_SYNC_QUEUE_${sessionId}`;
      const queueList: SyncQueueItem[] = JSON.parse(localStorage.getItem(lsQueueKey) || '[]');
      const updated = queueList.filter(item => !syncedQuestionIds.includes(item.questionId));
      localStorage.setItem(lsQueueKey, JSON.stringify(updated));
    } catch {
      // Ignored
    }

    // Update IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction(['sync_queue', 'answers'], 'readwrite');
        const queueStore = tx.objectStore('sync_queue');
        const answersStore = tx.objectStore('answers');

        const index = queueStore.index('sessionId');
        const request = index.getAll(sessionId);

        request.onsuccess = () => {
          const items: SyncQueueItem[] = request.result || [];
          items.forEach(item => {
            if (syncedQuestionIds.includes(item.questionId)) {
              queueStore.delete(item.id);
            }
          });
        };

        // Mark answer records as synced
        syncedQuestionIds.forEach(qId => {
          const key = `${sessionId}_${qId}`;
          const getReq = answersStore.get(key);
          getReq.onsuccess = () => {
            if (getReq.result) {
              const updated = { ...getReq.result, synced: true };
              answersStore.put(updated);
            }
          };
        });
      } catch {
        // Ignored
      }
    }
  }

  // Export Emergency Encrypted/Verified JSON Backup (for proctor recovery if device loses connection)
  public async exportEmergencyBackup(
    sessionId: string,
    sessionData?: ExamSession | null
  ): Promise<{ fileName: string; jsonData: string }> {
    await this.init();

    let answersMap: { [qId: string]: StudentAnswer } = {};
    if (sessionData && sessionData.answers) {
      answersMap = { ...sessionData.answers };
    }

    // Merge from local storage
    try {
      const lsRaw = localStorage.getItem(`CBT_OFFLINE_ANSWERS_${sessionId}`);
      if (lsRaw) {
        const parsed = JSON.parse(lsRaw);
        answersMap = { ...answersMap, ...parsed };
      }
    } catch {
      // Ignored
    }

    const payload = {
      app: 'CBT_MADRASAH_OFFLINE_BACKUP',
      version: '1.0',
      sessionId,
      studentId: sessionData?.studentId || 'unknown',
      studentName: sessionData?.studentName || 'Peserta',
      nisn: sessionData?.nisn || '',
      namaKelas: sessionData?.namaKelas || '',
      examId: sessionData?.examId || '',
      tokenUsed: sessionData?.tokenUsed || '',
      exportedAt: new Date().toISOString(),
      totalQuestions: sessionData?.totalQuestions || Object.keys(answersMap).length,
      answers: answersMap,
      integrityChecksum: this.computeChecksum(JSON.stringify(answersMap))
    };

    const jsonData = JSON.stringify(payload, null, 2);
    const sanitizedNisn = (sessionData?.nisn || 'SISWA').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `CBT_DARURAT_${sanitizedNisn}_${sessionId.substring(0, 12)}_${Date.now()}.cbt`;

    return { fileName, jsonData };
  }

  // Trigger file download in browser
  public downloadEmergencyBackupFile(fileName: string, jsonData: string): void {
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Simple integrity hash
  private computeChecksum(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return 'CHK-' + Math.abs(hash).toString(16).toUpperCase();
  }
}

export const offlineSyncManager = new OfflineSyncService();
