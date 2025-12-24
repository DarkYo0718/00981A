
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const navItems = [
    { id: AppTab.DASHBOARD, icon: 'fa-chart-line', label: '儀表板' },
    { id: AppTab.HISTORY, icon: 'fa-history', label: '持股歷史' },
    { id: AppTab.IMPORT, icon: 'fa-file-import', label: '資料匯入' },
    { id: AppTab.SETTINGS, icon: 'fa-cog', label: '設定' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-microchip text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">00981 追蹤器</h1>
            <p className="text-xs text-slate-400">統一全球半導體 ETF</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 mt-auto">
          <div className="bg-slate-800 rounded-xl p-4 text-xs text-slate-400">
            <p>最後更新數據:</p>
            <p className="text-white mt-1 font-mono">2025-02-14</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
