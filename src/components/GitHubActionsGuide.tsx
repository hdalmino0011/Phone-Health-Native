import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  Download,
  Smartphone,
  ShieldCheck,
  Terminal,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface GitHubActionsGuideProps {
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const GitHubActionsGuide: React.FC<GitHubActionsGuideProps> = ({
  onDownloadZip,
  isDownloading
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const simulationLogs = [
    'Initializing Ubuntu 22.04 LTS runner environment...',
    'actions/checkout@v4: Checked out commit HEAD on branch "main"',
    'actions/setup-java@v4: Configured Temurin JDK 17 (build 17.0.10+7)',
    'android-actions/setup-android@v3: Android SDK platform-tools 34.0.0 installed',
    'sdkmanager: Installing Android NDK 25.2.9519653 & CMake 3.22.1...',
    'CMake 3.22.1: Building native-lib for ABI arm64-v8a (clang++ -std=c++17 -O3)...',
    'CMake 3.22.1: Building native-lib for ABI armeabi-v7a...',
    'Gradle daemon: Assembling APK [DEX compilation, JNI shared libraries packaging]...',
    'Output verified: app/build/outputs/apk/debug/app-debug.apk (12.8 MB)',
    'actions/upload-artifact@v4: Uploaded artifact "AegisDroid-Health-Scanner-debug" successfully!'
  ];

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setSimulationStep(current);
      if (current >= simulationLogs.length) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 700);
  };

  const gitCommands = `# 1. Extract downloaded project and initialize git
git init
git add .
git commit -m "feat: AegisDroid native C++ device health scanner"

# 2. Link your GitHub repo and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aegisdroid-health.git
git push -u origin main
`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">GitHub Actions CI/CD & Mobile APK Guide</h2>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-mono">Automated Cloud Builds</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Build your native C++ Android APK in GitHub's cloud without installing Android Studio, then download artifacts directly to your phone.
            </p>
          </div>

          <button
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Project (.zip)</span>
          </button>
        </div>
      </div>

      {/* 4-Step Pipeline Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs mb-3">
              01
            </div>
            <h3 className="text-sm font-semibold text-white">Create GitHub Repo</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Create a new repo on GitHub and push the unzipped project files including <code className="text-emerald-400 font-mono">.github/workflows/build-apk.yml</code>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Push triggers CI automatically
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold text-xs mb-3">
              02
            </div>
            <h3 className="text-sm font-semibold text-white">C++ NDK Compilation</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              GitHub Actions automatically downloads Android NDK 25 & CMake, compiles <code className="text-blue-400 font-mono">native-lib.cpp</code> with Clang optimization (<code className="font-mono text-slate-300">-O3</code>).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Builds ARM64 & ARMv7 binaries
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-mono font-bold text-xs mb-3">
              03
            </div>
            <h3 className="text-sm font-semibold text-white">Artifact Upload</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              The workflow uses <code className="text-purple-400 font-mono">actions/upload-artifact@v4</code> to attach <code className="text-slate-300 font-mono">app-debug.apk</code> to the Actions run page.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Retention: 14 days in GitHub
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs mb-3">
              04
            </div>
            <h3 className="text-sm font-semibold text-white">Install on Mobile</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Open your repo's Actions tab on your phone browser, download the artifact ZIP, extract, and tap to install the APK!
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Allow "Install Unknown Apps"
          </div>
        </div>
      </div>

      {/* GitHub Actions Interactive Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">GitHub Actions Cloud Runner Simulator</h3>
          </div>

          <button
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors border border-slate-700/60 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : ''}`} />
            <span>{isSimulating ? 'Running Build...' : 'Simulate GitHub Actions Run'}</span>
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 font-mono text-xs leading-relaxed text-slate-300 min-h-[220px]">
          <div className="text-slate-500 mb-2 pb-2 border-b border-slate-800/60 flex items-center justify-between">
            <span>workflow: .github/workflows/build-apk.yml</span>
            <span>runner: ubuntu-latest</span>
          </div>

          {simulationStep === 0 && !isSimulating && (
            <div className="text-slate-500 italic py-8 text-center">
              Click &quot;Simulate GitHub Actions Run&quot; to test the cloud compilation steps and artifact generation.
            </div>
          )}

          {simulationLogs.slice(0, simulationStep).map((log, index) => {
            const isLast = index === simulationStep - 1 && isSimulating;
            const isSuccess = index === simulationLogs.length - 1;
            return (
              <div key={index} className="flex items-start gap-2 py-0.5">
                <span className="text-slate-600 select-none w-6 text-right">{index + 1}</span>
                <span className={isSuccess ? 'text-emerald-400 font-semibold' : isLast ? 'text-blue-400' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            );
          })}

          {simulationStep >= simulationLogs.length && (
            <div className="mt-3 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Artifact ready: AegisDroid-Health-Scanner-debug.zip containing app-debug.apk</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Command Quick-Start */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Push to GitHub in 3 Commands</h3>
          </div>
          <button
            onClick={handleCopyCmd}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors border border-slate-700/60"
          >
            {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCmd ? 'Copied' : 'Copy Commands'}</span>
          </button>
        </div>

        <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800/80">
          {gitCommands}
        </pre>
      </div>

      {/* Mobile Installation Details & Unknown Sources */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">How to Install the APK on Your Mobile Phone</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-lg space-y-2">
            <h4 className="font-semibold text-white">1. Download Artifact on Phone</h4>
            <p className="text-slate-400 leading-relaxed">
              Open Chrome or Samsung Internet on your Android device, navigate to your GitHub repository, tap <strong>Actions</strong>, tap the latest run, scroll down to <strong>Artifacts</strong>, and tap <strong>AegisDroid-Health-Scanner-debug</strong>.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-lg space-y-2">
            <h4 className="font-semibold text-white">2. Allow Unknown Apps</h4>
            <p className="text-slate-400 leading-relaxed">
              When prompted by Android, go to <em>Settings → Apps → Special app access → Install unknown apps</em>, and toggle <em>Allow from this source</em> for your browser or Files app. Then tap <strong>Install</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
