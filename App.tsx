
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ImportData from './components/ImportData';
import HistoryList from './components/HistoryList';
import { AppTab, DailyReport } from './types';
import { getHistory } from './services/database';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [history, setHistory] = useState<DailyReport[]>([]);

  const loadData = () => {
    const data = getHistory();
    setHistory(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard history={history} />;
      case AppTab.IMPORT:
        return <ImportData onSuccess={() => { loadData(); setActiveTab(AppTab.DASHBOARD); }} />;
      case AppTab.HISTORY:
        return <HistoryList history={history} onUpdate={loadData} />;
      case AppTab.SETTINGS:
        return (
          <div className="p-8 bg-white rounded-3xl text-center shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold mb-4">系統設定</h3>
            <p className="text-slate-500 mb-8">目前資料儲存在本地瀏覽器快取中 (LocalStorage)。</p>
            <button 
              onClick={() => {
                if(window.confirm("確定要清除所有數據嗎？")) {
                  localStorage.clear();
                  loadData();
                }
              }}
              className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200"
            >
              清除所有數據
            </button>
          </div>
        );
      default:
        return <Dashboard history={history} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
