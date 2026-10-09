import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  Download,
  Smartphone,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight
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
  const [userRepoInput, setUserRepoInput] = useState('');

  const simulationLogs = [
    'Initializing Ubuntu 22.04 LTS runner environment...',
    'actions/checkout@v4: Checked out commit HEAD on branch "main"',
    'actions/setup-java@v4: Configured Temurin JDK 17 (build 17.0.10+7)',
    'android-actions/setup-android@v3: Android SDK platform-tools 34.0.0 installed',
    'sdkmanager: Installing Android NDK 25.2.9519653 & CMake 3.22.1...',
    'CMake 3.22.1: Building native-lib for ABI arm64-v8a (clang++ -std=c++17 -O3)...',
    'CMake 3.22.1: Building native-lib for ABI armeabi-v7a...',
    'Gradle daemon: Assembling APK [DEX compilation, JNI shared libraries packaging]...',
    'Output verified: release-artifacts/AegisDroid-Health-v1.0.0.apk (12.8 MB)',
    'actions/upload-artifact@v4: Uploaded artifact "AegisDroid-Health-v1.0.0-APK" successfully!',
    'softprops/action-gh-release@v2: Published release tag v1.0.0 with direct APK download!'
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
    }, 600);
  };

  const cleanRepo = userRepoInput.trim().replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
  const repoUrl = cleanRepo ? `https://github.com/${cleanRepo}` : '';

  const gitCommands = `# 1. Extract downloaded project and initialize git
git init
git add .
git commit -m "feat: AegisDroid native C++ device health scanner"

# 2. Link your GitHub repo and push
git branch -M main
git remote add origin ${repoUrl || 'https://github.com/YOUR_USERNAME/aegisdroid-health'}.git
git push -u origin main
`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
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

      {/* Crucial Notice: Where is the APK and how does it get built? */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Why Don&apos;t You See the APK Yet?</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          GitHub Actions runs inside <strong>your GitHub repository</strong>, not inside this preview window.
          Because this web container does not have access to your personal GitHub credentials, you have two quick options:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Option 1: Instant Mobile Installation (No GitHub Needed)</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Use the <strong>Direct Phone Installation</strong> bar at the top of this page. You can scan the QR code with your mobile camera and install the app onto your phone home screen in 5 seconds.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>Option 2: Build Standalone APK on GitHub</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Download the project ZIP, push it to your GitHub repository, and GitHub will compile the C++ binaries and give you a downloadable <code className="text-emerald-400 font-mono">.apk</code> artifact and GitHub Release.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Repository Linker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Your GitHub Repository Linker</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Direct Artifact Jump</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={userRepoInput}
            onChange={(e) => setUserRepoInput(e.target.value)}
            placeholder="Enter your repo: e.g. username/aegisdroid-health"
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
          {cleanRepo && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://github.com/${cleanRepo}/actions`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors border border-slate-700"
              >
                <span>Actions Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://github.com/${cleanRepo}/releases`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg transition-colors border border-emerald-500/30"
              >
                <span>Releases (Direct APK)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 4-Step Pipeline Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold text-xs mb-3">
              02
            </div>
            <h3 className="text-sm font-semibold text-white">C++ NDK Compilation</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              GitHub Actions automatically downloads Android NDK 25 & CMake, compiling <code className="text-blue-400 font-mono">native-lib.cpp</code> with Clang optimization (<code className="font-mono text-slate-300">-O3</code>).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Builds ARM64 & ARMv7 binaries
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-mono font-bold text-xs mb-3">
              03
            </div>
            <h3 className="text-sm font-semibold text-white">Artifacts & Releases</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Workflow publishes the APK under both GitHub Actions Artifacts and as a direct public GitHub Release tagged <code className="text-purple-400 font-mono">v1.0.0</code>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Direct 1-tap download
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs mb-3">
              04
            </div>
            <h3 className="text-sm font-semibold text-white">Install on Mobile</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Open your repo on your phone browser, tap the APK link in Releases, and tap to install!
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Allow &quot;Install Unknown Apps&quot;
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
            const isSuccess = index >= simulationLogs.length - 2;
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
              <span>Artifact ready: AegisDroid-Health-v1.0.0.apk ready for direct phone installation</span>
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

      {/* Mobile Installation Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">How to Install the APK on Your Mobile Phone</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-lg space-y-2">
            <h4 className="font-semibold text-white">1. Download Directly on Phone</h4>
            <p className="text-slate-400 leading-relaxed">
              Open Chrome or Samsung Internet on your phone, visit your GitHub repository&apos;s <strong>Releases</strong> page, and tap <code className="text-emerald-400 font-mono">AegisDroid-Health-v1.0.0.apk</code>.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-lg space-y-2">
            <h4 className="font-semibold text-white">2. Allow Unknown Apps</h4>
            <p className="text-slate-400 leading-relaxed">
              When prompted by Android, go to <em>Settings → Apps → Special app access → Install unknown apps</em>, toggle <em>Allow from this source</em> for your browser or Files app, and tap <strong>Install</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
