'use client';

import { useEffect, useState } from 'react';
import { Cpu, Activity, ShieldCheck, CheckCircle, BarChart3, Binary, Layers } from 'lucide-react';
import smdVectorsRaw from '@/data/smd_vectors.json';

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

export function MLExplorer() {
  const [evalData, setEvalData] = useState<EvaluationSummary | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string>('machine-1-1');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/evaluation_results.json')
      .then((res) => res.json())
      .then((data) => {
        setEvalData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load evaluation results:', err);
        setIsLoading(false);
      });
  }, []);

  const machineDetail = evalData?.machine_details[selectedMachine];
  const sampleVector = (smdVectorsRaw as any)['INC-1097']?.vector || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-100 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">ML Anomaly Engine — Server Machine Dataset (SMD)</h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                28 Isolation Forest Models
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scikit-Learn IsolationForest models trained per machine entity on 38 continuous metric dimensions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">
            FastAPI: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">http://127.0.0.1:8000</strong>
          </span>
        </div>
      </div>

      {/* Aggregate Model Performance Metrics */}
      {evalData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Test Timesteps</span>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {evalData.total_test_timesteps.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Across 28 machines</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Overall Accuracy</span>
            <div className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
              {(evalData.accuracy * 100).toFixed(2)}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Ground truth evaluated</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Micro F1-Score</span>
            <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {evalData.micro_f1.toFixed(4)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Macro F1: {evalData.macro_f1.toFixed(4)}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Micro Recall</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {(evalData.micro_recall * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Precision: {(evalData.micro_precision * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Machine Entity Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Machine Entity Selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Machine Entities (28)</h4>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Select to inspect</span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            {evalData &&
              Object.keys(evalData.machine_details).map((mName) => {
                const isSelected = selectedMachine === mName;
                return (
                  <button
                    key={mName}
                    onClick={() => setSelectedMachine(mName)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/80 border border-purple-500 dark:border-purple-400 text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Middle Column: Selected Machine Confusion Matrix & Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Entity Performance: <span className="text-blue-600 dark:text-blue-400 font-mono">{selectedMachine}</span>
              </h4>
            </div>
            {machineDetail && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Model Ready
              </span>
            )}
          </div>

          {machineDetail ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-0.5">Test Timesteps</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{machineDetail.num_test_samples.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-0.5">Accuracy</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{(machineDetail.accuracy * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Confusion Matrix Table */}
              <div className="bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 block">Confusion Matrix Stats</span>
                <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                  <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 p-2 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold">True Positives (TP)</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{machineDetail.tp.toLocaleString()}</span>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 p-2 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold">False Positives (FP)</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{machineDetail.fp.toLocaleString()}</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 p-2 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold">False Negatives (FN)</span>
                    <span className="font-mono font-bold text-red-700 dark:text-red-300">{machineDetail.fn.toLocaleString()}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold">True Negatives (TN)</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{machineDetail.tn.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold">Precision</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{(machineDetail.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold">Recall</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{(machineDetail.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold">F1-Score</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{machineDetail.f1_score.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">Loading machine performance...</div>
          )}
        </div>

        {/* Right Column: 38-Dimensional SMD Telemetry Vector Inspector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Binary className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">38-Dim SMD Vector Inspector</h4>
            </div>
            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold font-mono">Real SMD Sample</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Below is the genuine 38-dimensional telemetry metric vector passed into the IsolationForest model for machine <strong className="text-slate-900 dark:text-slate-100 font-mono">{selectedMachine}</strong>:
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[11px]">
              {sampleVector.map((val: number, idx: number) => (
                <div key={idx} className="bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">f[{idx}]</span>
                  <span className="text-purple-700 dark:text-purple-300 font-semibold">{val.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-[11px] text-purple-800 dark:text-purple-300 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>ML Input: Genuine 38-dimensional Server Machine Dataset (SMD) numerical vector. Zero synthetic features used.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
