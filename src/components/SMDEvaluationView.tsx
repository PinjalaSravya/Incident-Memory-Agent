'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Layers, Search } from 'lucide-react';

interface MachineDetail {
  num_test_samples: number;
  actual_anomalies: number;
  predicted_anomalies: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  precision: number;
  recall: number;
  f1_score: number;
  accuracy: number;
  mean_anomaly_score: number;
}

interface EvaluationSummary {
  model_type: string;
  dataset: string;
  num_machines: number;
  total_test_timesteps: number;
  overall_tp: number;
  overall_fp: number;
  overall_tn: number;
  overall_fn: number;
  micro_precision: number;
  micro_recall: number;
  micro_f1: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  accuracy: number;
  machine_details: Record<string, MachineDetail>;
}

// In-memory module cache to avoid re-fetching evaluation results on every tab switch
let cachedEvalData: EvaluationSummary | null = null;

export function SMDEvaluationView() {
  const [evalData, setEvalData] = useState<EvaluationSummary | null>(cachedEvalData);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(!cachedEvalData);

  useEffect(() => {
    if (cachedEvalData) return;

    fetch('/evaluation_results.json')
      .then((res) => res.json())
      .then((data) => {
        cachedEvalData = data;
        setEvalData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch evaluation results:', err);
        setIsLoading(false);
      });
  }, []);

  const machineKeys = evalData
    ? Object.keys(evalData.machine_details).filter((m) => m.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">SMD Model Evaluation Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ground-truth performance statistics across 28 IsolationForest machine models on Server Machine Dataset.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
            Evaluated Timesteps: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{evalData?.total_test_timesteps.toLocaleString() || '708,420'}</strong>
          </span>
        </div>
      </div>

      {/* Overview Stat Cards Strip */}
      {evalData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Overall Accuracy</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {(evalData.accuracy * 100).toFixed(2)}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Ground truth evaluated</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Micro F1-Score</span>
            <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              {evalData.micro_f1.toFixed(4)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Macro F1: {evalData.macro_f1.toFixed(4)}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Micro Recall</span>
            <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {(evalData.micro_recall * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">True Anomaly Coverage</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Micro Precision</span>
            <div className="text-2xl font-extrabold font-mono text-slate-800 dark:text-slate-200">
              {(evalData.micro_precision * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">TP: {evalData.overall_tp.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Machine Entities Evaluation Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Entity Evaluation Breakdown (28 Models)
            </h4>
          </div>

          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter machine entity..."
              className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading evaluation analytics...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Machine Entity</th>
                  <th className="py-3 px-4 text-right">Test Samples</th>
                  <th className="py-3 px-4 text-right">Actual Anomalies</th>
                  <th className="py-3 px-4 text-right">Predicted Anomalies</th>
                  <th className="py-3 px-4 text-right">TP</th>
                  <th className="py-3 px-4 text-right">FP</th>
                  <th className="py-3 px-4 text-right">Precision</th>
                  <th className="py-3 px-4 text-right">Recall</th>
                  <th className="py-3 px-4 text-right">F1-Score</th>
                  <th className="py-3 px-4 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {evalData &&
                  machineKeys.map((mName) => {
                    const detail = evalData.machine_details[mName];
                    return (
                      <tr key={mName} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300">
                        <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono">{mName}</td>
                        <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">{detail.num_test_samples.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-amber-600 dark:text-amber-400">{detail.actual_anomalies.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-purple-600 dark:text-purple-400">{detail.predicted_anomalies.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{detail.tp.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-slate-500 dark:text-slate-400">{detail.fp.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right font-sans">{(detail.precision * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-4 text-right font-sans">{(detail.recall * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400 font-sans">{detail.f1_score.toFixed(4)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-sans">{(detail.accuracy * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
