
import React from 'react';
import { DailyReport } from '../types';
import { deleteReport } from '../services/database';

interface HistoryListProps {
  history: DailyReport[];
  onUpdate: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onUpdate }) => {
  const handleDelete = (date: string) => {
    if (window.confirm(`確定要刪除 ${date} 的持股紀錄嗎？`)) {
      deleteReport(date);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900">持股歷史</h2>
        <p className="text-slate-500 mt-1">管理已儲存的每日持股快照</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((report) => (
          <div key={report.date} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <i className="fas fa-calendar-day text-xl"></i>
              </div>
              <button 
                onClick={() => handleDelete(report.date)}
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

            <button className="mt-6 w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors">
              查看詳細持股
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
    </div>
  );
};

export default HistoryList;
