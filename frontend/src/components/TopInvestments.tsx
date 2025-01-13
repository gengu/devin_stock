import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { fetchTopInvestments, InvestmentOpportunity } from '../lib/api';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export function TopInvestments() {
  const [investments, setInvestments] = useState<InvestmentOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchTopInvestments();
        setInvestments(data);
      } catch (err) {
        setError('Failed to load investment opportunities');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {investments.map((investment) => (
        <Card key={investment.symbol} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{investment.symbol}</span>
              {investment.analysis_factors.past_year_roi > 0 ? (
                <TrendingUp className="text-green-500" />
              ) : (
                <TrendingDown className="text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">{investment.name}</p>
              <div className="flex items-center justify-between">
                <span>Current Price:</span>
                <span className="font-semibold">${investment.current_price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Target Price:</span>
                <span className="font-semibold">${investment.target_price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ROI Potential:</span>
                <span className="font-semibold text-green-600">
                  {investment.roi_potential.toFixed(2)}%
                </span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analysis Factors
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>P/E Ratio:</div>
                  <div className="text-right">{investment.analysis_factors.pe_ratio.toFixed(2)}</div>
                  <div>Profit Margin:</div>
                  <div className="text-right">
                    {(investment.analysis_factors.profit_margins * 100).toFixed(2)}%
                  </div>
                  <div>Past Year ROI:</div>
                  <div className="text-right">
                    {investment.analysis_factors.past_year_roi.toFixed(2)}%
                  </div>
                  <div>Analyst Rating:</div>
                  <div className="text-right capitalize">
                    {investment.analysis_factors.analyst_rating.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
