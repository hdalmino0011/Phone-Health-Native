import React from 'react';
import { X, ShieldAlert, Lock, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';

interface ImeiPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImeiPermissionModal: React.FC<ImeiPermissionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Android Permissions & IMEI Privacy Guide</h3>
              <p className="text-xs text-slate-400">How AegisDroid manages hardware access and Android 10+ privacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: The Requested Permissions */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Declared Android Permissions</h4>
          
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-emerald-400">android.permission.READ_PHONE_STATE</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Allows the app to read network type, carrier parameters, and device hardware identifiers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-emerald-400">android.permission.BATTERY_STATS</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Allows reading deep battery charging health, voltage, temperature, and cycle status.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-emerald-400">android.permission.ACCESS_NETWORK_STATE</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Allows measuring live network connection latency and bandwidth.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Deep Dive on Android 10+ IMEI Restrictions */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <Lock className="w-4 h-4" />
            <span>Understanding Android 10+ (API 29+) IMEI Policy</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            In older Android versions (Android 9 and below), calling <code className="font-mono text-slate-200">TelephonyManager.getDeviceId()</code> with <code className="font-mono text-slate-200">READ_PHONE_STATE</code> returned the device's physical IMEI directly.
          </p>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Starting in <strong>Android 10</strong>, Google restricted non-resettable device identifiers (IMEI and serial numbers) to protect user privacy against tracking. Non-system apps calling <code className="font-mono text-slate-200">getImei()</code> receive a <code className="font-mono text-slate-200">SecurityException</code> unless they possess privileged system permissions (<code className="font-mono text-slate-200">READ_PRIVILEGED_PHONE_STATE</code>) or carrier app privileges.
          </p>
        </div>

        {/* Section 3: How AegisDroid Solves This */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">AegisDroid Resilient Fallback Architecture</h4>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span><strong>Pre-Android 10 Devices:</strong> Directly retrieves hardware IMEI via TelephonyManager.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span><strong>Carrier / System Devices:</strong> Reads hardware IMEI with privileged token.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span><strong>Standard Android 10+ Devices:</strong> Transparently falls back to <code className="font-mono text-emerald-400">Settings.Secure.ANDROID_ID</code> and board fingerprint without crashing.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors border border-slate-700"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
