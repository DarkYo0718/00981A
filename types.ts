
export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  weight: number;
  marketValue?: number;
}

export interface DailyReport {
  date: string;
  holdings: Holding[];
  sourceUrl?: string;
}

export interface ChangeAnalysis {
  added: HoldingChange[];
  increased: HoldingChange[];
  decreased: HoldingChange[];
  removed: HoldingChange[];
}

export interface HoldingChange {
  symbol: string;
  name: string;
  prevShares: number;
  currentShares: number;
  shareDiff: number;
  shareDiffPercent: number;
  prevWeight: number;
  currentWeight: number;
  weightDiff: number;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  IMPORT = 'import',
  SETTINGS = 'settings'
}
