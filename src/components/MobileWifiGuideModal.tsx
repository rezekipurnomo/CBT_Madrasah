import React, { useState, useEffect } from 'react';
import { useCBT } from '../context/CBTContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import {
  Smartphone,
  Wifi,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  HelpCircle,
  X,
  RefreshCw,
  Signal,
  Check
} from 'lucide-react';

interface MobileWifiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileWifiGuideModal: React.FC<MobileWifiGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const { madrasah, showToast } = useCBT();
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState<'qr' | 'guide' | 'troubleshoot'>('qr');

  const serverUrl = window.location.origin.includes('localhost')
    ? `http://${madrasah.serverIp}:${madrasah.serverPort || '8393'}`
    : window.location.origin;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(serverUrl);
    setCopied(true);
    showToast('Tautan server berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#161618] border border-[#2D2D31] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[#121214] border-b border-[#222224] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Panduan Akses HP (Smartphone) via Wi-Fi</span>
              </h2>
              <p className="text-xs text-[#71717A]">
                Petunjuk menghubungkan ponsel peserta ke server CBT dalam 1 jaringan Wi-Fi lokal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#71717A] hover:text-white hover:bg-[#1C1C1F] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#222224] bg-[#0E0E10] px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code Akses HP</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Syarat & Langkah (4 Langkah)</span>
          </button>

          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'troubleshoot'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#71717A] hover:text-[#D1D1D1]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Solusi Kendala (Troubleshoot)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-6">
              <div className="bg-[#121214] p-5 rounded-2xl border border-[#222224] flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0 text-center">
                  <QRCodeDisplay url={serverUrl} size={180} />
                  <span className="block text-[11px] text-[#71717A] mt-2">
                    Arahkan Kamera HP / Google Lens
                  </span>
                </div>

                <div className="space-y-3 w-full">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <Wifi className="w-4 h-4" />
                    <span>Scan untuk Membuka CBT di HP</span>
                  </div>

                  <p className="text-[#A1A1AA] leading-relaxed">
                    Peserta cukup membuka aplikasi kamera atau browser di ponsel mereka, lalu scan kode QR di samping untuk langsung masuk ke halaman login CBT tanpa mengetik IP manual.
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#71717A] uppercase">
                      Alamat URL Akses Jaringan Lokal:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#1C1C1F] border border-[#2D2D31] rounded-xl px-3 py-2 font-mono text-emerald-400 text-xs truncate">
                        {serverUrl}
                      </div>
                      <button
                        onClick={handleCopyUrl}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Checklist Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#121214] border border-[#222224] rounded-xl">
                  <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>1. Wi-Fi Sama</span>
                  </div>
                  <p className="text-[#71717A] text-[11px]">
                    HP wajib connect ke SSID Wi-Fi / Access Point yang sama dengan laptop/server CBT.
                  </p>
                </div>

                <div className="p-3.5 bg-[#121214] border border-[#222224] rounded-xl">
                  <div className="text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5" />
                    <span>2. Matikan Paket Data</span>
                  </div>
                  <p className="text-[#71717A] text-[11px]">
                    Matikan Data Seluler di HP agar rute internet HP tidak lari ke jaringan luar.
                  </p>
                </div>

                <div className="p-3.5 bg-[#121214] border border-[#222224] rounded-xl">
                  <div className="text-blue-400 font-bold mb-1 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>3. Browser Chrome/Safari</span>
                  </div>
                  <p className="text-[#71717A] text-[11px]">
                    Buka menggunakan Google Chrome (Android) atau Safari (iOS/iPhone).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-4 bg-[#121214] border border-[#222224] rounded-2xl flex gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">Hubungkan HP ke Jaringan Wi-Fi CBT Madrasah</div>
                    <p className="text-[#A1A1AA] leading-relaxed">
                      Buka pengaturan Wi-Fi di ponsel peserta dan pilih nama Wi-Fi (SSID) yang disediakan di ruang ujian (contoh: <code className="text-emerald-400 font-mono">CBT_MADRASAH_RUANG1</code>).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-[#121214] border border-[#222224] rounded-2xl flex gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">Matikan Data Seluler (Paket Data HP)</div>
                    <p className="text-[#A1A1AA] leading-relaxed">
                      Langkah ini sangat penting karena jaringan server lokal tidak memerlukan internet publik. Mematikan data seluler memastikan HP tidak mengabaikan koneksi Wi-Fi lokal.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-[#121214] border border-[#222224] rounded-2xl flex gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">Buka Browser dan Masukkan Alamat URL atau Scan QR</div>
                    <p className="text-[#A1A1AA] leading-relaxed">
                      Buka Google Chrome atau Safari di HP, lalu ketik alamat server <strong className="text-white font-mono">{serverUrl}</strong> atau scan QR Code yang disediakan pengawas.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 bg-[#121214] border border-[#222224] rounded-2xl flex gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    4
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">Login Menggunakan Kredensial Siswa</div>
                    <p className="text-[#A1A1AA] leading-relaxed">
                      Pilih peran <strong>Peserta</strong>, masukkan Username (NISN/No. Peserta) dan Password, lalu klik Masuk. Siswa dapat mengerjakan ujian dengan antarmuka yang otomatis responsif dan pas untuk layar ponsel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TROUBLESHOOT */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Jika HP Tidak Bisa Membuka Halaman Login:</span>
                  <span>Periksa 3 penyebab utama berikut pada komputer server dan router Wi-Fi:</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-[#121214] border border-[#222224] rounded-2xl space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="text-rose-400">●</span>
                    <span>1. Fitur "AP Isolation" di Router Wi-Fi Masih Aktif</span>
                  </div>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    <strong>Penyebab:</strong> Beberapa router Wi-Fi mengaktifkan fitur <em>Access Point Isolation / Client Isolation</em> yang mencegah HP berkomunikasi dengan laptop server.<br />
                    <strong>Solusi:</strong> Buka halaman admin router Wi-Fi, cari menu Wireless Settings, lalu matikan (Disable) opsi <em>AP Isolation / Client Isolation</em>.
                  </p>
                </div>

                <div className="p-4 bg-[#121214] border border-[#222224] rounded-2xl space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="text-rose-400">●</span>
                    <span>2. Windows Firewall Komputer Server Memblokir Port Masuk</span>
                  </div>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    <strong>Penyebab:</strong> Windows Firewall di komputer server secara default memblokir port koneksi dari perangkat luar.<br />
                    <strong>Solusi:</strong> Di komputer server, buka <em>Windows Defender Firewall</em> → <em>Advanced Settings</em> → Buat <em>Inbound Rule</em> baru untuk mengizinkan (Allow) Port <code className="text-emerald-400 font-mono">8393</code> (atau port server yang digunakan) untuk tipe protokol TCP.
                  </p>
                </div>

                <div className="p-4 bg-[#121214] border border-[#222224] rounded-2xl space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="text-rose-400">●</span>
                    <span>3. IP Address Komputer Server Berubah (DHCP)</span>
                  </div>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    <strong>Penyebab:</strong> Jika server tidak di-setting IP Statik, router mungkin memberikan IP baru saat restart.<br />
                    <strong>Solusi:</strong> Buka Command Prompt di server, ketik <code className="text-emerald-400 font-mono">ipconfig</code> untuk memastikan IP server saat ini, lalu cocokkan dengan URL yang diakses siswa di HP.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#121214] border-t border-[#222224] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span>{isOnline ? 'Jaringan Aktif' : 'Terputus'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1C1C1F] hover:bg-[#252529] text-white font-bold rounded-xl border border-[#2D2D31] text-xs transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
