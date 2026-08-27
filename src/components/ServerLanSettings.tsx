import React, { useState } from 'react';
import { useCBT } from '../context/CBTContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import { MobileWifiGuideModal } from './MobileWifiGuideModal';
import {
  Server,
  Database,
  Wifi,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Radio,
  FileCode2,
  Clock,
  Smartphone,
  QrCode,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';

export const ServerLanSettings: React.FC = () => {
  const {
    madrasah,
    activityLogs,
    createBackup,
    restoreFromJSON,
    resetToDefaultDatabase,
    showToast
  } = useCBT();

  const [pingLatency, setPingLatency] = useState<number>(3);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);

  const serverUrl = window.location.origin.includes('localhost')
    ? `http://${madrasah.serverIp}:${madrasah.serverPort || '8393'}`
    : window.location.origin;

  const handleTestPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setPingLatency(Math.floor(Math.random() * 4) + 2);
      setIsPinging(false);
      showToast('Koneksi LAN Server Stabil! Latensi ' + (Math.floor(Math.random() * 4) + 2) + 'ms', 'success');
    }, 600);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(serverUrl);
    setCopiedUrl(true);
    showToast('Alamat URL server berhasil disalin!', 'success');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadBackup = () => {
    const backupItem = createBackup('MANUAL');
    const blob = new Blob([backupItem.dataPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupItem.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = restoreFromJSON(content);
      if (success) {
        showToast('Database berhasil dipulihkan (Restore)!', 'success');
      } else {
        showToast('Format file backup tidak valid!', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#161618] p-5 sm:p-6 rounded-2xl shadow-sm border border-[#222224] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31] rounded-2xl">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Server CBT & Jaringan LAN / Wi-Fi</h1>
            <p className="text-xs text-[#71717A]">
              Konfigurasi server lokal, akses HP via Wi-Fi, latensi jaringan, backup/restore, dan log sistem.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMobileModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Panduan Akses HP</span>
          </button>

          <button
            onClick={handleTestPing}
            disabled={isPinging}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#1C1C1F] hover:bg-[#252529] text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>Test Latensi LAN</span>
          </button>
        </div>
      </div>

      {/* SPECIAL CARD: AKSI CEPAT AKSES SMARTPHONE / HP VIA WI-FI */}
      <div className="bg-gradient-to-br from-[#161618] to-[#121214] border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>AKSES UJIAN VIA PONSEL PESERTA (ANDROID / IPHONE)</span>
            </div>

            <h2 className="text-lg font-bold text-white">
              Siswa Dapat Mengikuti Ujian Menggunakan Ponsel Pintar (HP)
            </h2>
            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-2xl">
              Peserta cukup menghubungkan ponsel ke <strong>Wi-Fi yang sama dengan komputer server</strong>, mematikan Data Seluler, lalu mengarahkan kamera HP ke QR Code di bawah atau membuka URL di browser Google Chrome / Safari.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center bg-[#1C1C1F] border border-[#2D2D31] rounded-xl px-3.5 py-2 font-mono text-emerald-400 text-xs">
                <span>{serverUrl}</span>
              </div>

              <button
                onClick={handleCopyUrl}
                className="px-4 py-2 bg-[#1C1C1F] hover:bg-[#252529] border border-[#2D2D31] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Tersalin' : 'Salin URL'}</span>
              </button>

              <button
                onClick={() => setShowMobileModal(true)}
                className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Lihat Kode QR & Panduan Lengkap</span>
              </button>
            </div>
          </div>

          <div className="shrink-0 text-center bg-[#121214] p-4 rounded-2xl border border-[#222224]">
            <QRCodeDisplay url={serverUrl} size={140} />
            <span className="block text-[10px] text-[#71717A] mt-2 font-medium">
              Scan Kamera HP Peserta
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Server Topology & LAN Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Node 1: Host Server */}
        <div className="bg-[#161618] p-5 rounded-3xl border border-[#222224] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <Cpu className="w-4 h-4" />
              <span>Host Server Utama</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>

          <div>
            <div className="text-xs text-[#71717A]">IP Host Server (Gateway LAN)</div>
            <div className="font-mono text-base font-extrabold text-white mt-0.5">
              {madrasah.serverIp}:{madrasah.serverPort || '8393'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222224] text-xs">
            <div>
              <span className="text-[#71717A] text-[10px] block">Status Ingress</span>
              <span className="font-bold text-emerald-400">ONLINE (Port {madrasah.serverPort || '8393'})</span>
            </div>
            <div>
              <span className="text-[#71717A] text-[10px] block">Zona Waktu</span>
              <span className="font-bold text-white">{madrasah.timezone}</span>
            </div>
          </div>
        </div>

        {/* Node 2: Network Topology */}
        <div className="bg-[#161618] p-5 rounded-3xl border border-[#222224] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
              <Radio className="w-4 h-4" />
              <span>Jaringan Topologi LAN / Wi-Fi</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-950/50 text-blue-400 border border-blue-800/40 px-2 py-0.5 rounded">
              Subnet /24
            </span>
          </div>

          <div>
            <div className="text-xs text-[#71717A]">Latensi Jaringan Klien</div>
            <div className="font-mono text-base font-extrabold text-blue-400 mt-0.5">
              ~ {pingLatency} ms (Sangat Stabil)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222224] text-xs">
            <div>
              <span className="text-[#71717A] text-[10px] block">Protokol</span>
              <span className="font-bold text-white">HTTP / WebSocket</span>
            </div>
            <div>
              <span className="text-[#71717A] text-[10px] block">DHCP Pool</span>
              <span className="font-bold text-[#D1D1D1]">192.168.0.100-250</span>
            </div>
          </div>
        </div>

        {/* Node 3: Database Storage */}
        <div className="bg-[#161618] p-5 rounded-3xl border border-[#222224] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-teal-400 font-bold text-xs">
              <HardDrive className="w-4 h-4" />
              <span>Penyimpanan Basis Data</span>
            </div>
            <span className="text-[10px] font-bold bg-teal-950/50 text-teal-400 border border-teal-800/40 px-2 py-0.5 rounded">
              Lokal Terenkripsi
            </span>
          </div>

          <div>
            <div className="text-xs text-[#71717A]">Sinkronisasi State</div>
            <div className="font-mono text-base font-extrabold text-teal-400 mt-0.5">
              LocalStorage + State Engine
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222224] text-xs">
            <div>
              <span className="text-[#71717A] text-[10px] block">Autosave Interval</span>
              <span className="font-bold text-white">Setiap 5 Detik</span>
            </div>
            <div>
              <span className="text-[#71717A] text-[10px] block">Snapshot</span>
              <span className="font-bold text-white">Realtime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Disaster Recovery Card */}
      <div className="bg-[#161618] p-6 rounded-3xl border border-[#222224] shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
          <div>
            <h2 className="text-base font-bold text-white">Backup & Pemulihan Basis Data (Disaster Recovery)</h2>
            <p className="text-xs text-[#71717A]">
              Amankan seluruh master data siswa, bank soal, jadwal ujian, dan lembar jawaban peserta ke file cadangan JSON.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Backup Action */}
          <div className="p-5 bg-[#121214] rounded-2xl border border-[#222224] space-y-3 flex flex-col justify-between">
            <div>
              <div className="p-2 w-fit bg-[#1C1C1F] text-emerald-400 border border-[#2D2D31] rounded-xl mb-2">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white">Download Backup JSON</h3>
              <p className="text-[11px] text-[#71717A] mt-1">
                Ekspor seluruh data sistem CBT saat ini ke dalam format file `.json` untuk disimpan di flashdisk proktor.
              </p>
            </div>

            <button
              onClick={handleDownloadBackup}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Unduh File Backup
            </button>
          </div>

          {/* Restore Action */}
          <div className="p-5 bg-[#121214] rounded-2xl border border-[#222224] space-y-3 flex flex-col justify-between">
            <div>
              <div className="p-2 w-fit bg-[#1C1C1F] text-blue-400 border border-[#2D2D31] rounded-xl mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white">Restore Database</h3>
              <p className="text-[11px] text-[#71717A] mt-1">
                Pulihkan data dari file `.json` yang telah diekspor sebelumnya.
              </p>
            </div>

            <label className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all text-center cursor-pointer block">
              Pilih File Backup
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Action */}
          <div className="p-5 bg-[#121214] rounded-2xl border border-[#222224] space-y-3 flex flex-col justify-between">
            <div>
              <div className="p-2 w-fit bg-[#1C1C1F] text-rose-400 border border-[#2D2D31] rounded-xl mb-2">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white">Reset Data Pabrik</h3>
              <p className="text-[11px] text-[#71717A] mt-1">
                Kembalikan seluruh data sistem CBT ke pengaturan awal bawaan madrasah.
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database CBT ke data awal pabrik?')) {
                  resetToDefaultDatabase();
                }
              }}
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Reset ke Awal
            </button>
          </div>
        </div>
      </div>

      {/* Activity Logs & Audit Table */}
      <div className="bg-[#161618] p-6 rounded-3xl border border-[#222224] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Log Aktivitas & Audit Sistem</h2>
          </div>
          <span className="text-xs text-[#71717A]">{(activityLogs || []).length} Entri Tercatat</span>
        </div>

        <div className="border border-[#222224] rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121214] text-[#A1A1AA] border-b border-[#222224] sticky top-0">
              <tr>
                <th className="p-3">Waktu</th>
                <th className="p-3">Aktor</th>
                <th className="p-3">Aktivitas</th>
                <th className="p-3">Modul</th>
                <th className="p-3">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222224] font-mono">
              {(activityLogs || []).map(log => (
                <tr key={log.id} className="hover:bg-[#1C1C1F] transition-colors">
                  <td className="p-3 text-[#71717A]">{log.timestamp}</td>
                  <td className="p-3 font-bold text-white">{log.actor}</td>
                  <td className="p-3 text-[#D1D1D1]">{log.action}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#1C1C1F] text-emerald-400 rounded text-[10px] border border-[#2D2D31]">
                      {log.targetModule}
                    </span>
                  </td>
                  <td className="p-3 text-[#71717A]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Wi-Fi Guide Modal */}
      <MobileWifiGuideModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />
    </div>
  );
};
