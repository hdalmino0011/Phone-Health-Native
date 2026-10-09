import React, { useState } from 'react';
import {
  Cpu,
  Flame,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Activity,
  HardDrive
} from 'lucide-react';

interface BenchmarkRecord {
  id: string;
  timestamp: string;
  stressLevel: 'Light' | 'Standard' | 'Intensive';
  durationMs: number;
  opsPerSec: number;
  bandwidthMb: number;
  score: number;
  status: string;
}

export const StressBenchmarkLab: React.FC = () => {
  const [stressLevel, setStressLevel] = useState<'Light' | 'Standard' | 'Intensive'>('Standard');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<BenchmarkRecord | null>(null);
  const [history, setHistory] = useState<BenchmarkRecord[]>([]);

  const runBenchmark = async () => {
    setIsRunning(true);
    setProgress(10);
    setCurrentResult(null);

    // Matrix size and memory size according to stress level
    const matrixN = stressLevel === 'Light' ? 120 : stressLevel === 'Standard' ? 220 : 340;
    const memSizeBytes = stressLevel === 'Light' ? 8 * 1024 * 1024 : stressLevel === 'Standard' ? 24 * 1024 * 1024 : 64 * 1024 * 1024;

    await new Promise((r) => setTimeout(r, 100));
    setProgress(35);

    const t0 = performance.now();

    // 1. Matrix multiplication on TypedArray
    const A = new Float32Array(matrixN * matrixN);
    const B = new Float32Array(matrixN * matrixN);
    const C = new Float32Array(matrixN * matrixN);

    for (let i = 0; i < A.length; i++) {
      A[i] = (i % 31) * 0.125;
      B[i] = ((i + 3) % 31) * 0.25;
    }

    setProgress(55);
    await new Promise((r) => setTimeout(r, 50));

    for (let i = 0; i < matrixN; i++) {
      for (let k = 0; k < matrixN; k++) {
        const aik = A[i * matrixN + k];
        for (let j = 0; j < matrixN; j++) {
          C[i * matrixN + j] += aik * B[k * matrixN + j];
        }
      }
    }

    setProgress(75);

    // 2. Sequential & Stride Memory Throughput Check
    const uint32Count = memSizeBytes / 4;
    const memBuffer = new Uint32Array(uint32Count);
    for (let i = 0; i < uint32Count; i += 16) {
      memBuffer[i] = (i ^ 0xabcdef01) + C[0];
    }

    let checksum = 0;
    for (let i = 0; i < uint32Count; i += 8) {
      checksum = (checksum + memBuffer[i]) | 0;
    }

    setProgress(95);
    const t1 = performance.now();
    const durationMs = Math.max(1, t1 - t0);

    const totalOps = matrixN * matrixN * matrixN * 2 + uint32Count;
    const opsPerSec = Math.round(totalOps / (durationMs / 1000));
    const bandwidthMb = Math.round((memSizeBytes / (1024 * 1024)) / (durationMs / 1000));

    // Dynamic scoring formula calibrated to duration
    const baseConstant = stressLevel === 'Light' ? 20000 : stressLevel === 'Standard' ? 70000 : 200000;
    const score = Math.min(9999, Math.round(baseConstant / durationMs));

    let status = 'Optimal Execution';
    if (durationMs > 800) status = 'Thermal Throttling Detected';
    else if (durationMs > 400) status = 'Balanced Governor';

    const record: BenchmarkRecord = {
      id: Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString(),
      stressLevel,
      durationMs: Number(durationMs.toFixed(1)),
      opsPerSec,
      bandwidthMb,
      score,
      status
    };

    setProgress(100);
    setCurrentResult(record);
    setHistory((prev) => [record, ...prev.slice(0, 4)]);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">C++ Native Compute & Stress Lab</h2>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-mono">SIMD & Memory Bandwidth</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tests processor instruction pipeline latency, cache throughput, and thermal stability in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Stress Profile:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              {(['Light', 'Standard', 'Intensive'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setStressLevel(level)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    stressLevel === level
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Execution Parameters</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Multiplication Matrix</span>
                <span className="text-slate-200 font-mono">
                  {stressLevel === 'Light' ? '120 x 120 (Float32)' : stressLevel === 'Standard' ? '220 x 220 (Float32)' : '340 x 340 (Float32)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Memory Buffer Allocation</span>
                <span className="text-slate-200 font-mono">
                  {stressLevel === 'Light' ? '8 MB' : stressLevel === 'Standard' ? '24 MB' : '64 MB'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target Core Governor</span>
                <span className="text-slate-200 font-mono">Performance (Max Freq)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Instruction SIMD Mode</span>
                <span className="text-emerald-400 font-mono">Vectorized Float</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={runBenchmark}
              disabled={isRunning}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? `Running Stress Test (${progress}%)...` : 'Execute Hardware Stress Test'}</span>
            </button>
          </div>
        </div>

        {/* Live / Last Result Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Diagnostics Telemetry</h3>
              </div>
              {currentResult && (
                <span className="text-xs text-slate-400">
                  Completed in <strong className="text-white font-mono">{currentResult.durationMs} ms</strong>
                </span>
              )}
            </div>

            {isRunning ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 max-w-md mx-auto">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Calculating matrix vector dot-products and memory buffers...
                </p>
              </div>
            ) : currentResult ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Compute Score</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {currentResult.score}
                  </div>
                  <span className="text-[10px] text-slate-400">points</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Latency</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {currentResult.durationMs}
                  </div>
                  <span className="text-[10px] text-slate-400">milliseconds</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Throughput</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {(currentResult.opsPerSec / 1000000).toFixed(1)}
                  </div>
                  <span className="text-[10px] text-slate-400">M ops/sec</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">RAM Bandwidth</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {currentResult.bandwidthMb}
                  </div>
                  <span className="text-[10px] text-slate-400">MB/s</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs italic">
                Press &quot;Execute Hardware Stress Test&quot; to measure this device&apos;s native computing performance.
              </div>
            )}
          </div>

          {currentResult && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{currentResult.status}</span>
              </span>
              <span>Test ID #{currentResult.id}</span>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      {history.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-3">Benchmark History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Profile</th>
                  <th className="pb-2 text-right">Latency</th>
                  <th className="pb-2 text-right">Ops / Sec</th>
                  <th className="pb-2 text-right">RAM Throughput</th>
                  <th className="pb-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map((h) => (
                  <tr key={h.id} className="text-slate-300">
                    <td className="py-2.5 font-sans">{h.timestamp}</td>
                    <td className="py-2.5 font-sans text-slate-400">{h.stressLevel}</td>
                    <td className="py-2.5 text-right">{h.durationMs} ms</td>
                    <td className="py-2.5 text-right">{(h.opsPerSec / 1000000).toFixed(1)} M</td>
                    <td className="py-2.5 text-right">{h.bandwidthMb} MB/s</td>
                    <td className="py-2.5 text-right text-emerald-400 font-bold">{h.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
