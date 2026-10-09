import React from 'react';
import { Smartphone, Download, GitBranch } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scanner' | 'project' | 'actions' | 'benchmark';
  setActiveTab: (tab: 'scanner' | 'project' | 'actions' | 'benchmark') => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
  downloadProgress: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadZip,
  isDownloading,
  downloadProgress
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">AegisDroid Health</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-emerald-400 font-mono">NDK C++ 17</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Native Android Hardware Scanner & GitHub Actions CI/CD Exporter
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadZip}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? `Exporting (${downloadProgress}%)` : 'Download Android Project (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-t border-slate-800/60 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'scanner'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Live Device Scanner
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'project'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Android C++ Codebase & JNI
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'actions'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            GitHub Actions CI & APK Setup
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'benchmark'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            C++ Performance Lab
          </button>
        </div>
      </div>
    </header>
  );
};
