
import { DailyReport, Holding, ChangeAnalysis, HoldingChange } from "../types";

const STORAGE_KEY = "etf_00981_history";

export const getHistory = (): DailyReport[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return parsed.sort((a: DailyReport, b: DailyReport) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
};

export const saveDailyReport = (report: DailyReport) => {
  const history = getHistory();
  const existingIndex = history.findIndex(h => h.date === report.date);
  
  if (existingIndex > -1) {
    history[existingIndex] = report;
  } else {
    history.push(report);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const deleteReport = (date: string) => {
  const history = getHistory().filter(h => h.date !== date);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const analyzeChanges = (current: DailyReport, previous: DailyReport): ChangeAnalysis => {
  const added: HoldingChange[] = [];
  const increased: HoldingChange[] = [];
  const decreased: HoldingChange[] = [];
  const removed: HoldingChange[] = [];

  const currMap = new Map(current.holdings.map(h => [h.symbol, h]));
  const prevMap = new Map(previous.holdings.map(h => [h.symbol, h]));

  // Check current for Added and Increased/Decreased
  current.holdings.forEach(curr => {
    const prev = prevMap.get(curr.symbol);
    if (!prev) {
      added.push({
        symbol: curr.symbol,
        name: curr.name,
        prevShares: 0,
        currentShares: curr.shares,
        shareDiff: curr.shares,
        shareDiffPercent: 100,
        prevWeight: 0,
        currentWeight: curr.weight,
        weightDiff: curr.weight
      });
    } else {
      const shareDiff = curr.shares - prev.shares;
      const weightDiff = curr.weight - prev.weight;
      const change: HoldingChange = {
        symbol: curr.symbol,
        name: curr.name,
        prevShares: prev.shares,
        currentShares: curr.shares,
        shareDiff: shareDiff,
        shareDiffPercent: (shareDiff / prev.shares) * 100,
        prevWeight: prev.weight,
        currentWeight: curr.weight,
        weightDiff: weightDiff
      };

      if (shareDiff > 0) {
        increased.push(change);
      } else if (shareDiff < 0) {
        decreased.push(change);
      }
    }
  });

  // Check previous for Removed
  previous.holdings.forEach(prev => {
    if (!currMap.has(prev.symbol)) {
      removed.push({
        symbol: prev.symbol,
        name: prev.name,
        prevShares: prev.shares,
        currentShares: 0,
        shareDiff: -prev.shares,
        shareDiffPercent: -100,
        prevWeight: prev.weight,
        currentWeight: 0,
        weightDiff: -prev.weight
      });
    }
  });

  return { added, increased, decreased, removed };
};
