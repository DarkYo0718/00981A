
import React, { useMemo } from 'react';
import { DailyReport, ChangeAnalysis, HoldingChange } from '../types';
import { analyzeChanges } from '../services/database';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, Legend, ComposedChart, Area
} from 'recharts';

interface DashboardProps {
  history: DailyReport[];
}

const ChangeTable: React.FC<{ 
  title: string; 
  data: HoldingChange[]; 
  type: 'added' | 'increased' | 'decreased' | 'removed';
  icon: string;
  color: string;
}> = ({ title, data, type, icon, color }) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
      <div className={`px-6 py-4 flex items-center gap-3 ${color} bg-opacity-10 border-b border-slate-100`}>
        <i className={`fas ${icon} ${color.replace('bg-', 'text-')}`}></i>
        <h3 className={`font-bold ${color.replace('bg-', 'text-')}`}>{title} ({data.length})</h3>
      </div>
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-3">代號 / 名稱</th>
              <th className="px-6 py-3 text-right">前次股數</th>
              <th className="px-6 py-3 text-right">當前股數</th>
              <th className="px-6 py-3 text-right">變動量</th>
              <th className="px-6 py-3 text-right">權重變動</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={item.symbol} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{item.symbol}</div>
                  <div className="text-xs text-slate-500">{item.name}</div>
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-600">
                  {item.prevShares.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-slate-800">
                  {item.currentShares.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-right text-sm font-bold ${
                  item.shareDiff > 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {item.shareDiff > 0 ? '+' : ''}{item.shareDiff.toLocaleString()}
                  <span className="text-[10px] ml-1 opacity-70">
                    ({item.shareDiffPercent.toFixed(2)}%)
                  </span>
                </td>
                <td className={`px-6 py-4 text-right text-sm font-medium ${
                  item.weightDiff > 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {item.weightDiff > 0 ? '+' : ''}{item.weightDiff.toFixed(3)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const latestReport = history[0];
  const prevReport = history[1];

  // Calculate historical trend for the chart
  const trendData = useMemo(() => {
    // Take the last 10 snapshots (in reverse chronological order in history)
    // We need pairs to analyze changes, so we loop through history
    const data = [];
    for (let i = 0; i < Math.min(history.length - 1, 10); i++) {
      const current = history[i];
      const previous = history[i + 1];
      const analysis = analyzeChanges(current, previous);
      data.unshift({
        date: current.date.slice(5), // MM-DD
        '新增': analysis.added.length,
        '上升': analysis.increased.length,
        '下降': analysis.decreased.length,
        '剔除': analysis.removed.length,
      });
    }
    return data;
  }, [history]);

  const analysis = useMemo(() => {
    if (!latestReport || !prevReport) return null;
    return analyzeChanges(latestReport, prevReport);
  }, [latestReport, prevReport]);

  if (!latestReport) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <i className="fas fa-folder-open text-6xl mb-4 opacity-20"></i>
        <p>目前沒有任何持股數據，請前往「資料匯入」點擊「自動更新」。</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">00981 持股分析儀表板</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500">
              當前數據日期: <span className="font-mono font-bold text-blue-600">{latestReport.date}</span>
            </p>
            {latestReport.sourceUrl && (
              <a 
                href={latestReport.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
              >
                <i className="fas fa-external-link-alt"></i> 查看官網來源
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">持有標的</div>
          <div className="text-2xl font-black text-slate-800">{latestReport.holdings.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">個公司 / 項目</div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
          <div className="text-xs text-emerald-600 font-bold uppercase mb-1">新增 / 上升</div>
          <div className="text-2xl font-black text-emerald-700">
            {analysis ? analysis.added.length + analysis.increased.length : '--'}
          </div>
          <div className="text-[10px] text-emerald-500 mt-1">與前一交易日相比</div>
        </div>
        <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
          <div className="text-xs text-rose-600 font-bold uppercase mb-1">下降 / 剔除</div>
          <div className="text-2xl font-black text-rose-700">
            {analysis ? analysis.decreased.length + analysis.removed.length : '--'}
          </div>
          <div className="text-[10px] text-rose-500 mt-1">與前一交易日相比</div>
        </div>
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
          <div className="text-xs text-blue-600 font-bold uppercase mb-1">總變動數</div>
          <div className="text-2xl font-black text-blue-700">
            {analysis ? analysis.added.length + analysis.increased.length + analysis.decreased.length + analysis.removed.length : '--'}
          </div>
          <div className="text-[10px] text-blue-500 mt-1">組合異動總次數</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">變動歷史趨勢 (最近 10 次更新)</h3>
          <div className="h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" dataKey="新增" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="上升" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="下降" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm">累積至少 2 天數據後顯示趨勢</div>
            )}
          </div>
        </div>

        {/* Weights Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">前十大權重比例 (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latestReport.holdings.slice(0, 10).map(h => ({ name: h.symbol, weight: h.weight }))} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]} barSize={20}>
                  {latestReport.holdings.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1d4ed8' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dynamic Change Tables */}
      {analysis ? (
        <div className="space-y-4">
          <ChangeTable 
            title="新增持股 (New)" 
            data={analysis.added} 
            type="added" 
            icon="fa-plus-circle" 
            color="bg-emerald-500" 
          />
          <ChangeTable 
            title="持股上升 (Increase)" 
            data={analysis.increased} 
            type="increased" 
            icon="fa-arrow-trend-up" 
            color="bg-blue-500" 
          />
          <ChangeTable 
            title="持股下降 (Decrease)" 
            data={analysis.decreased} 
            type="decreased" 
            icon="fa-arrow-trend-down" 
            color="bg-rose-500" 
          />
          <ChangeTable 
            title="剔除持股 (Removed)" 
            data={analysis.removed} 
            type="removed" 
            icon="fa-times-circle" 
            color="bg-slate-500" 
          />
        </div>
      ) : (
        <div className="p-8 bg-blue-50 rounded-2xl text-center border border-blue-100">
          <p className="text-blue-700 font-medium">尚無足夠歷史數據進行差異對比。請繼續每日更新資料。</p>
        </div>
      )}

      {/* Full Holdings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-list-ul text-slate-400"></i>
            全部持股清單 ({latestReport.holdings.length})
          </h3>
          <div className="text-xs text-slate-400">依權重排序</div>
        </div>
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
              {latestReport.holdings.map((h, idx) => (
                <tr key={h.symbol} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{idx + 1}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{h.name}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-mono font-bold">{h.symbol}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">{h.shares.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
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
    </div>
  );
};

export default Dashboard;
