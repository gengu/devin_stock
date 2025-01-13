const API_URL = import.meta.env.VITE_API_URL;

export interface Stock {
  symbol: string;
  name: string;
  market_cap: number;
  current_price: number;
}

export interface ROIData {
  symbol: string;
  initial_price: number;
  final_price: number;
  roi_percentage: number;
  dates: string[];
  prices: number[];
}

export interface InvestmentOpportunity {
  symbol: string;
  name: string;
  current_price: number;
  target_price: number;
  roi_potential: number;
  analysis_factors: {
    pe_ratio: number;
    profit_margins: number;
    analyst_rating: string;
    past_year_roi: number;
  };
}

export async function fetchLargeCapStocks(): Promise<Stock[]> {
  const response = await fetch(`${API_URL}/api/stocks/large-cap`);
  return response.json();
}

export async function fetchStockROI(symbol: string): Promise<ROIData> {
  const response = await fetch(`${API_URL}/api/stocks/${symbol}/roi`);
  return response.json();
}

export async function fetchTopInvestments(): Promise<InvestmentOpportunity[]> {
  const response = await fetch(`${API_URL}/api/analysis/top-investments`);
  return response.json();
}
