
import React, { useState } from 'react';
import { DailyReport } from '../types';
import { parseRawHoldings, autoFetchHoldings } from '../services/geminiService';
import { saveDailyReport } from '../services/database';

interface ImportDataProps {
  onSuccess: () => void;
}

const ImportData: React.FC<ImportDataProps> = ({ onSuccess }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualImport = async () => {
    if (!rawText.trim()) {
      setError('請輸入持股列表文字數據');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const holdings = await parseRawHoldings(rawText, date);
      saveDailyReport({ date, holdings });
      setRawText('');
      onSuccess();
    } catch (err) {
      setError('數據解析失敗，請確保輸入內容正確。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoImport = async () => {
    setIsAutoLoading(true);
    setError(null);
    try {
      const result = await autoFetchHoldings();
      const report: DailyReport = {
        date: result.date,
        holdings: result.holdings,
        sourceUrl: result.sourceUrl
      };
      saveDailyReport(report);
      alert(`成功自動獲取 ${result.date} 的持股數據！`);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('自動獲取失敗。官網可能暫時無法訪問或數據格式改變，請嘗試手動輸入。');
    } finally {
      setIsAutoLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">資料更新</h2>
        <p className="text-slate-500 mt-1">
          系統提供 AI 自動抓取功能，您也可以手動貼上官網數據。
        </p>
      </header>

      {/* Auto Import Section */}
      <div className="mb-8 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl">
            <i className="fas fa-robot"></i>
        </div>
        <div className="relative z-10">
          <h3 className="text-white text-xl font-bold mb-2">智能自動更新</h3>
          <p className="text-blue-100 text-sm mb-6 max-w-md">
            透過 AI 搜尋技術，直接從統一投信官網獲取最新 00981 持股清單，無需手動複製。
          </p>
          <button
            onClick={handleAutoImport}
            disabled={isAutoLoading}
            className={`px-8 py-4 rounded-xl font-black transition-all flex items-center gap-3 shadow-2xl ${
              isAutoLoading 
              ? 'bg-white/20 text-white cursor-not-allowed' 
              : 'bg-white text-blue-600 hover:scale-105 active:scale-95'
            }`}
          >
            {isAutoLoading ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i>
                <span>正在搜尋並解析官網數據...</span>
              </>
            ) : (
              <>
                <i className="fas fa-bolt text-yellow-400"></i>
                <span>一鍵自動獲取今日持股</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative flex items-center py-4 mb-8">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">或者手動匯入</span>
          <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Manual Import Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6 opacity-60 hover:opacity-100 transition-opacity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">數據日期</label>
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
            </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">貼上持股資料</label>
          <textarea 
            rows={4}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="NVIDIA Corp 11.2%..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono text-sm"
          />
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-3">
            <i className="fas fa-exclamation-circle"></i>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <button
          onClick={handleManualImport}
          disabled={isProcessing || isAutoLoading}
          className="w-full py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-all"
        >
          {isProcessing ? '處理中...' : '手動解析並儲存'}
        </button>
      </div>
    </div>
  );
};

export default ImportData;
