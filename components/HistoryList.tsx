
import React, { useState } from 'react';
import { DailyReport, HoldingChange } from '../types';
import { deleteReport, analyzeChanges } from '../services/database';

interface HistoryListProps {
  history: DailyReport[];
  onUpdate: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onUpdate }) => {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [compareDate, setCompareDate] = useState<string | null>(null);

  const handleDelete = (date: string) => {
    if (window.confirm(`確定要刪除 ${date} 的持股紀錄嗎？`)) {
      deleteReport(date);
      if (selectedReport?.date === date) setSelectedReport(null);
      if (compareDate === date) setCompareDate(null);
      onUpdate();
    }
  };

  const selectedIndex = selectedReport ? history.findIndex(r => r.date === selectedReport.date) : -1;
  const compareReport = compareDate ? history.find(r => r.date === compareDate) : null;
  const comparison = selectedReport && compareReport ? analyzeChanges(selectedReport, compareReport) : null;

  const renderChangeRows = (changes: HoldingChange[], type: 'added' | 'increased' | 'decreased' | 'removed') => {
    const colorMap = {
      added: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', label: '新增' },
      increased: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', label: '增加' },
      decreased: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: '減少' },
      removed: { bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700', label: '剔除' },
    };
    const c = colorMap[type];
    return changes.map(item => (
      <tr key={`${type}-${item.symbol}`} className={`${c.bg} hover:opacity-80 transition-opacity`}>
        <td className="px-4 py-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.badge}`}>{c.label}</span>
        </td>
        <td className="px-4 py-2 font-mono text-sm font-bold">{item.symbol}</td>
        <td className="px-4 py-2 text-sm">{item.name}</td>
        <td className="px-4 py-2 text-right text-sm text-slate-500">{item.prevShares.toLocaleString()}</td>
        <td className="px-4 py-2 text-right text-sm font-medium">{item.currentShares.toLocaleString()}</td>
        <td className={`px-4 py-2 text-right text-sm font-bold ${c.text}`}>
          {item.shareDiff > 0 ? '+' : ''}{item.shareDiff.toLocaleString()}
          <span className="text-[10px] ml-1 opacity-70">({item.shareDiffPercent.toFixed(2)}%)</span>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900">持股歷史</h2>
        <p className="text-slate-500 mt-1">管理已儲存的每日持股快照，點擊卡片可查看詳情並比較不同日期</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((report) => (
          <div key={report.date} className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col hover:shadow-md transition-all cursor-pointer ${
            selectedReport?.date === report.date ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-100'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <i className="fas fa-calendar-day text-xl"></i>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(report.date); }}
                className="text-slate-300 hover:text-rose-500 transition-colors p-2"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800">{report.date}</h3>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <i className="fas fa-list-ul text-xs"></i>
                <span>{report.holdings.length} 個標的</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fas fa-chart-pie text-xs"></i>
                <span>100% 總權重</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedReport(selectedReport?.date === report.date ? null : report);
                setCompareDate(null);
              }}
              className="mt-6 w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              {selectedReport?.date === report.date ? '收起詳細持股' : '查看詳細持股'}
            </button>
          </div>
        ))}

        {history.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400">
             <i className="fas fa-history text-5xl mb-4 opacity-20"></i>
             <p>尚無歷史數據</p>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedReport && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-list-ul text-slate-400"></i>
              {selectedReport.date} 持股清單 ({selectedReport.holdings.length} 個標的)
            </h3>
            {history.length >= 2 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 font-medium">比較:</span>
                <select
                  value={compareDate || ''}
                  onChange={(e) => setCompareDate(e.target.value || null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                >
                  <option value="">-- 選擇日期 --</option>
                  {history
                    .filter(r => r.date !== selectedReport.date)
                    .map(r => (
                      <option key={r.date} value={r.date}>{r.date}</option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Comparison summary */}
          {comparison && (
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-600">新增 <strong className="text-emerald-700">{comparison.added.length}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                  <span className="text-slate-600">增加 <strong className="text-blue-700">{comparison.increased.length}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-slate-600">減少 <strong className="text-amber-700">{comparison.decreased.length}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span className="text-slate-600">剔除 <strong className="text-rose-700">{comparison.removed.length}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Comparison table */}
          {comparison && (comparison.added.length + comparison.increased.length + comparison.decreased.length + comparison.removed.length > 0) && (
            <div className="overflow-x-auto border-b border-slate-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3">變動</th>
                    <th className="px-4 py-3">代號</th>
                    <th className="px-4 py-3">名稱</th>
                    <th className="px-4 py-3 text-right">前次股數</th>
                    <th className="px-4 py-3 text-right">當前股數</th>
                    <th className="px-4 py-3 text-right">變動量</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {renderChangeRows(comparison.added, 'added')}
                  {renderChangeRows(comparison.increased, 'increased')}
                  {renderChangeRows(comparison.decreased, 'decreased')}
                  {renderChangeRows(comparison.removed, 'removed')}
                </tbody>
              </table>
            </div>
          )}

          {/* Full holdings table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3">序</th>
                  <th className="px-6 py-3">標的名稱</th>
                  <th className="px-6 py-3">代號</th>
                  <th className="px-6 py-3 text-right">持股數</th>
                  <th className="px-6 py-3 text-right">權重 (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedReport.holdings.map((h, idx) => (
                  <tr key={h.symbol} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{h.name}</td>
                    <td className="px-6 py-3 text-sm text-blue-600 font-mono font-bold">{h.symbol}</td>
                    <td className="px-6 py-3 text-right text-sm text-slate-600">{h.shares.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-700">
                        {h.weight.toFixed(3)}%
                      </span>
                    </td>
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

export default HistoryList;
