import React, { useState, useEffect } from 'react';
import { Smartphone, Download, QrCode, X, CheckCircle2, ExternalLink } from 'lucide-react';

export const InstallAppPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowQrModal(true);
    }
  };

  return (
    <>
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">Direct Phone Installation</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-[11px] font-mono text-emerald-400">Android PWA & Native Ready</span>
            </div>
            <p className="text-xs text-slate-400">
              {isInstalled
                ? 'App is currently running in standalone mobile mode with full hardware access.'
                : 'Install AegisDroid directly to your mobile home screen or build the standalone APK via GitHub Actions.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {isInstalled ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Installed on Device</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleInstallClick}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{deferredPrompt ? 'Install App on Phone' : 'Install on This Device'}</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
                title="Scan QR code to install on mobile"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phone QR</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* QR Code Modal for Phone Scanning */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scan to Install on Mobile</h3>
                  <p className="text-xs text-slate-400">Open on your phone camera or browser</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center max-w-[240px] mx-auto shadow-inner">
              {/* Dynamic QR code generated via Google Chart API vector renderer */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(
                  currentUrl || window.location.href
                )}`}
                alt="Scan to open on phone"
                className="w-48 h-48 block"
              />
              <span className="text-[11px] text-slate-600 font-medium mt-2 text-center">
                Point phone camera to open & install
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="font-semibold text-white">Installation Instructions:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                <li>Scan the QR code with your mobile camera.</li>
                <li>Tap the link to open in Chrome or Samsung Internet.</li>
                <li>Tap <strong>Install App on Phone</strong> or browser menu &quot;Add to Home Screen&quot;.</li>
                <li>The app opens full-screen like a native app with hardware sensors enabled!</li>
              </ol>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
