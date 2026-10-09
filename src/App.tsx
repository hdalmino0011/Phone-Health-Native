import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveScanner } from './components/LiveScanner';
import { ProjectExplorer } from './components/ProjectExplorer';
import { GitHubActionsGuide } from './components/GitHubActionsGuide';
import { StressBenchmarkLab } from './components/StressBenchmarkLab';
import { ImeiPermissionModal } from './components/ImeiPermissionModal';
import { NativeApkHub } from './components/NativeApkHub';
import { performFullDeviceScan, FullDeviceScanReport } from './utils/deviceScanner';
import { downloadAndroidProjectZip } from './utils/zipExporter';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'project' | 'actions' | 'benchmark'>('scanner');
  const [report, setReport] = useState<FullDeviceScanReport | null>(null);
  const [isLoadingScan, setIsLoadingScan] = useState(true);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);

  // Initial scan on mount
  useEffect(() => {
    runScan();
  }, []);

  const runScan = async () => {
    setIsLoadingScan(true);
    try {
      const data = await performFullDeviceScan();
      setReport(data);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsLoadingScan(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      setDownloadProgress(0);
      await downloadAndroidProjectZip((p) => setDownloadProgress(p));
    } catch (err) {
      console.error('Failed to download project ZIP:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloadingZip}
        downloadProgress={downloadProgress}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <NativeApkHub
          onDownloadProjectZip={handleDownloadZip}
          isDownloadingZip={isDownloadingZip}
          zipProgress={downloadProgress}
        />

        {activeTab === 'scanner' && (
          <LiveScanner
            report={report}
            isLoading={isLoadingScan}
            onRefresh={runScan}
            onOpenImeiModal={() => setIsImeiModalOpen(true)}
          />
        )}

        {activeTab === 'project' && (
          <ProjectExplorer
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloadingZip}
            downloadProgress={downloadProgress}
          />
        )}

        {activeTab === 'actions' && (
          <GitHubActionsGuide
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloadingZip}
          />
        )}

        {activeTab === 'benchmark' && (
          <StressBenchmarkLab />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AegisDroid Health Scanner</span>
            <span>·</span>
            <span>Android C++ NDK & Kotlin</span>
            <span>·</span>
            <span className="font-mono text-emerald-400">CI/CD Automated Artifacts</span>
          </div>
          <div className="text-slate-500 text-center sm:text-right">
            Designed for mobile hardware diagnostics, battery health, and high-performance NDK benchmarks.
          </div>
        </div>
      </footer>

      {/* IMEI & Permissions Modal */}
      <ImeiPermissionModal
        isOpen={isImeiModalOpen}
        onClose={() => setIsImeiModalOpen(false)}
      />
    </div>
  );
}
