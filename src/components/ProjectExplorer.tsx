import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  FolderGit2,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, ProjectFile } from '../data/androidProjectFiles';

interface ProjectExplorerProps {
  onDownloadZip: () => void;
  isDownloading: boolean;
  downloadProgress: number;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  onDownloadZip,
  isDownloading,
  downloadProgress
}) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(ANDROID_PROJECT_FILES[1]); // default to native-lib.cpp
  const [copied, setCopied] = useState(false);

  const handleCopyCurrentFile = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageBadge = (lang: ProjectFile['language']) => {
    switch (lang) {
      case 'cpp':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'kotlin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'yaml':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'cmake':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'xml':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const lines = selectedFile.content.split('\n');

  return (
    <div className="space-y-6">
      {/* Top Banner & Exporter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Android C++ Project Tree</h2>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-mono">10 Project Files Ready</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete native Android source repository configured with C++ NDK, CMake, Kotlin Compose, and GitHub Actions CI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadZip}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? `Exporting ZIP (${downloadProgress}%)` : 'Download Full Android Project (.zip)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split View: File Sidebar + Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left File Tree (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Project Files</span>
              <span className="text-[10px] font-mono text-slate-500">NDK r25b</span>
            </div>

            <div className="mt-2 space-y-1">
              {ANDROID_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800 text-white font-medium border border-slate-700/80 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <div className="truncate">
                        <div className="truncate font-mono text-xs">{file.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ml-2 ${getLanguageBadge(file.language)}`}>
                      {file.language}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info Box on Native JNI */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Native C++ JNI Architecture</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Functions in <code className="text-emerald-400 font-mono">native-lib.cpp</code> are exported as JNI symbols:
            </p>
            <ul className="mt-2 text-[11px] font-mono space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-emerald-400" />
                <span>getNativeCpuInfo()</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-emerald-400" />
                <span>getNativeBatterySysHealth()</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-emerald-400" />
                <span>getNativeMemInfo()</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-emerald-400" />
                <span>getNativeSystemProps()</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-emerald-400" />
                <span>runNativeBenchmark()</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Code Viewer (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[700px]">
            {/* Viewer Header */}
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-xs font-medium text-white truncate">{selectedFile.path}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${getLanguageBadge(selectedFile.language)}`}>
                  {selectedFile.language}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyCurrentFile}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors border border-slate-700/60"
                  title="Copy code to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadSingleFile}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors border border-slate-700/60"
                  title="Download this file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* File Description */}
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800/60 text-xs text-slate-400">
              {selectedFile.description}
            </div>

            {/* Code Content with Line Numbers */}
            <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
              <pre className="table w-full">
                {lines.map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-900/60 transition-colors">
                    <span className="table-cell pr-4 text-right text-slate-600 select-none w-10 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
