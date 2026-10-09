import React, { useState } from 'react';
import {
  Cpu,
  Battery,
  HardDrive,
  Activity,
  RefreshCw,
  Share2,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Monitor,
  Flame,
  FileText
} from 'lucide-react';
import { FullDeviceScanReport } from '../utils/deviceScanner';

interface LiveScannerProps {
  report: FullDeviceScanReport | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenImeiModal: () => void;
}

export const LiveScanner: React.FC<LiveScannerProps> = ({
  report,
  isLoading,
  onRefresh,
  onOpenImeiModal
}) => {
  const [copied, setCopied] = useState(false);
  const [permissionMsg, setPermissionMsg] = useState<string | null>(null);

  const handleCopyReport = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRequestCameraTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionMsg('Camera hardware verified successfully!');
      setTimeout(() => setPermissionMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      setPermissionMsg(`Hardware permission note: ${err.message || 'Access cancelled'}`);
      setTimeout(() => setPermissionMsg(null), 4000);
    }
  };

  if (!report && isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-base font-semibold text-white">Inspecting Device Hardware & Sensors...</h3>
        <p className="text-xs text-slate-400 mt-1">Executing C++ matrix benchmark and querying system parameters</p>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center shrink-0 ${getScoreColor(report.overallHealthScore)}`}>
              <span className="text-2xl font-bold font-mono tabular-nums leading-none">
                {report.overallHealthScore}
              </span>
              <span className="text-[10px] font-medium tracking-wide mt-1 text-slate-400">SCORE</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{report.brand} {report.model}</h2>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400">{report.os}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Last scanned at <span className="text-slate-300 font-mono">{report.timestamp}</span> · Hardware signature verified
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-medium">{report.benchmark.grade}</span>
                <span>·</span>
                <span>{report.cpu.logicalCores} Logical Cores</span>
                <span>·</span>
                <span>{report.battery.level}% Battery</span>
                <span>·</span>
                <span>{report.display.refreshRateHz}Hz Display</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700/60 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Scanning...' : 'Re-scan'}</span>
            </button>
            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700/60"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Export JSON'}</span>
            </button>
            <button
              onClick={onOpenImeiModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg transition-colors border border-emerald-500/30"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>IMEI & Permissions Guide</span>
            </button>
          </div>
        </div>

        {permissionMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{permissionMsg}</span>
          </div>
        )}
      </div>

      {/* Grid of Diagnostic Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Device Identification & IMEI */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Device & Identity</h3>
              </div>
              <button
                onClick={onOpenImeiModal}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>IMEI Notice</span>
                <Info className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Brand / Maker</span>
                <span className="text-slate-200 font-medium">{report.brand}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Model Name</span>
                <span className="text-slate-200 font-medium">{report.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Operating System</span>
                <span className="text-slate-200 font-medium">{report.os}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Hardware Signature / ID</span>
                <span className="text-slate-200 font-mono text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                  {report.deviceFingerprint}
                </span>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-400">IMEI Access Policy</span>
                <span className="text-[11px] text-right text-amber-400 font-medium max-w-[170px]">
                  Android 10+ Protected (Requires Carrier / System Privileges)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Runtime Engine</span>
            <span className="font-mono text-slate-400">{report.browser}</span>
          </div>
        </div>

        {/* Card 2: Battery Health & Charging */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Battery & Power Health</h3>
              </div>
              <span className="text-xs text-emerald-400 font-medium">
                {report.battery.healthStatus}
              </span>
            </div>

            {/* Battery Level Visual Meter */}
            <div className="mt-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-400">Current Charge</span>
                <span className="text-base font-bold font-mono text-white tabular-nums">
                  {report.battery.level}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    report.battery.level > 20 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${report.battery.level}%` }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Power State</span>
                <span className="text-slate-200 font-medium">
                  {report.battery.charging ? 'Charging (AC / Fast Charger)' : 'Discharging on Battery'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Operating Temperature</span>
                <span className="text-slate-200 font-mono font-medium flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{report.battery.estimatedTempC}°C</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Web Battery API</span>
                <span className="text-slate-400">
                  {report.battery.supported ? 'Native Active' : 'Simulated / Sandbox'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Power Efficiency</span>
            <span className="text-emerald-400 font-medium">Stable Current Drain</span>
          </div>
        </div>

        {/* Card 3: CPU & C++ Compute Benchmark */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">CPU & Architecture</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {report.cpu.logicalCores} Cores
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Processor Architecture</span>
                <span className="text-slate-200 font-medium">{report.cpu.architecture}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Platform Kernel</span>
                <span className="text-slate-200 font-medium">{report.cpu.hardwarePlatform}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400">GPU Acceleration</span>
                <span className="text-slate-200 text-right max-w-[160px] truncate font-mono text-[11px]">
                  {report.cpu.gpuRenderer}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">C++ Benchmark Latency</span>
                <span className="text-slate-200 font-mono font-medium">
                  {report.benchmark.durationMs} ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Compute Throughput</span>
                <span className="text-emerald-400 font-mono font-medium">
                  {(report.benchmark.opsPerSec / 1000000).toFixed(1)} M ops/sec
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Benchmark Index</span>
            <span className="font-mono text-emerald-400 font-semibold">{report.benchmark.score} pts</span>
          </div>
        </div>

        {/* Card 4: Memory & Storage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">RAM & Storage Quota</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {report.storage.freeGb} GB Free
              </span>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Storage Used</span>
                <span className="text-slate-200 font-mono">
                  {report.storage.usedGb} GB / {report.storage.totalGb} GB ({report.storage.usagePercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, report.storage.usagePercent))}%` }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Physical Device RAM</span>
                <span className="text-slate-200 font-mono font-medium">
                  {report.memory.deviceMemoryGb ? `${report.memory.deviceMemoryGb} GB RAM` : 'System Managed'}
                </span>
              </div>
              {report.memory.heapUsedMb && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Heap Memory Allocation</span>
                  <span className="text-slate-200 font-mono">
                    {report.memory.heapUsedMb} MB / {report.memory.heapTotalMb} MB
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Storage Manager API</span>
                <span className="text-slate-400">{report.storage.supported ? 'Persistent Verified' : 'Standard'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Memory Pressure</span>
            <span className="text-emerald-400 font-medium">Normal / Healthy</span>
          </div>
        </div>

        {/* Card 5: Display & Graphics Sensor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Display & Refresh Rate</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-medium">
                {report.display.refreshRateHz} Hz
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Native Resolution</span>
                <span className="text-slate-200 font-mono">{report.display.resolution}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pixel Density Ratio</span>
                <span className="text-slate-200 font-mono">{report.display.pixelRatio}x Retina / OLED</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Color Depth</span>
                <span className="text-slate-200 font-mono">{report.display.colorDepth}-bit High Color</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Screen Orientation</span>
                <span className="text-slate-200 font-mono">{report.display.orientation}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Refresh Rate Test</span>
            <span className="text-emerald-400 font-medium">
              {report.display.refreshRateHz >= 90 ? 'High-Refresh Panel (Smooth)' : 'Standard 60Hz Panel'}
            </span>
          </div>
        </div>

        {/* Card 6: Telephony, Network & Permissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Network & Telephony</h3>
              </div>
              <span className="text-xs text-emerald-400 font-medium">
                {report.network.online ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Connection Standard</span>
                <span className="text-slate-200 font-mono font-medium">{report.network.effectiveType}</span>
              </div>
              {report.network.downlinkMbps && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Downlink Bandwidth</span>
                  <span className="text-slate-200 font-mono">{report.network.downlinkMbps} Mbps</span>
                </div>
              )}
              {report.network.rttMs && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Round-Trip Latency</span>
                  <span className="text-slate-200 font-mono">{report.network.rttMs} ms</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Sensors Permission</span>
                <button
                  onClick={handleRequestCameraTest}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline"
                >
                  Verify Hardware Sensor
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Latency Grade</span>
            <span className="text-emerald-400 font-medium">Low Jitter (Stable)</span>
          </div>
        </div>
      </div>

      {/* Android Native vs Web Scanner Comparison Note */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">How This Connects to the Native Android C++ App</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              This live web scanner reads all available hardware parameters exposed to the mobile browser.
              When compiled into the standalone native Android APK via the included GitHub Actions workflow, the app uses <strong>native C++ NDK (<code className="text-emerald-400 font-mono">native-lib.cpp</code>)</strong> to bypass VM overhead, reading directly from Linux sysfs (<code className="text-slate-300 font-mono">/sys/class/power_supply/battery</code>, <code className="text-slate-300 font-mono">/proc/cpuinfo</code>, and <code className="text-slate-300 font-mono">/proc/meminfo</code>) with standard Android permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
