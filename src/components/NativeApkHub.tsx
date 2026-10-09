import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  GitBranch,
  Layers,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Terminal,
  ShieldCheck,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { downloadDirectApkPackage } from '../utils/apkGenerator';

interface NativeApkHubProps {
  onDownloadProjectZip: () => void;
  isDownloadingZip: boolean;
  zipProgress: number;
}

export const NativeApkHub: React.FC<NativeApkHubProps> = ({
  onDownloadProjectZip,
  isDownloadingZip,
  zipProgress
}) => {
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [apkProgress, setApkProgress] = useState(0);
  const [githubRepo, setGithubRepo] = useState('');

  const handleDownloadApk = async () => {
    try {
      setIsDownloadingApk(true);
      setApkProgress(0);
      await downloadDirectApkPackage((p) => setApkProgress(p));
    } catch (err) {
      console.error('Failed to download APK package:', err);
    } finally {
      setIsDownloadingApk(false);
    }
  };

  const cleanRepo = githubRepo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Native Android App &amp; APK Artifacts</h2>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-mono">C++17 NDK Native Engine</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pure Android Native application compiled with CMake, NDK shared libraries, Kotlin, and automated GitHub Actions CI/CD.
            </p>
          </div>
        </div>

        {/* Dual Primary CTA Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadApk}
            disabled={isDownloadingApk}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingApk ? `Packaging APK (${apkProgress}%)` : 'Download Native APK (app-debug.apk)'}</span>
          </button>

          <button
            onClick={onDownloadProjectZip}
            disabled={isDownloadingZip}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700 disabled:opacity-50"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>{isDownloadingZip ? `Exporting Project (${zipProgress}%)` : 'Download Android Studio Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* GitHub Actions Artifacts Navigation & Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400">STEP 1</span>
            <GitBranch className="w-4 h-4 text-slate-500" />
          </div>
          <h4 className="text-xs font-semibold text-white">Push to GitHub Repository</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Push the unzipped project to your GitHub account. The workflow file <code className="text-emerald-400 font-mono">.github/workflows/build-apk.yml</code> automatically starts the cloud build on Ubuntu.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400">STEP 2</span>
            <Cpu className="w-4 h-4 text-slate-500" />
          </div>
          <h4 className="text-xs font-semibold text-white">Cloud C++ Compilation</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            GitHub Actions sets up JDK 17, Android NDK 25, and CMake 3.22, compiling <code className="text-slate-300 font-mono">native-lib.cpp</code> into high-speed native shared libraries (<code className="text-emerald-400 font-mono">arm64-v8a</code> &amp; <code className="text-emerald-400 font-mono">armeabi-v7a</code>).
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400">STEP 3</span>
            <Download className="w-4 h-4 text-slate-500" />
          </div>
          <h4 className="text-xs font-semibold text-white">Download APK in Artifacts</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Open the <strong>Actions</strong> tab on your repository, click the latest build run, scroll down to the <strong>Artifacts</strong> box at the bottom, and click <code className="text-emerald-400 font-mono">AegisDroid-Health-v1.0.0-APK</code> to download and install on your phone.
          </p>
        </div>
      </div>

      {/* GitHub Repository Quick Linker */}
      <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium">Link Your GitHub Repo for 1-Click Artifact Access:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 sm:max-w-md">
          <input
            type="text"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            placeholder="e.g. username/aegisdroid-health"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
          />
          {cleanRepo && (
            <a
              href={`https://github.com/${cleanRepo}/actions`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-medium transition-colors border border-slate-700 shrink-0"
            >
              <span>View Artifacts</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
