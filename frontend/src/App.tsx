import { useState, useEffect } from 'react';
import { ROIChart } from './components/ROIChart';
import { TopInvestments } from './components/TopInvestments';
import { fetchLargeCapStocks, Stock } from './lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStocks() {
      try {
        setLoading(true);
        const data = await fetchLargeCapStocks();
        setStocks(data);
        if (data.length > 0) {
          setSelectedStock(data[0].symbol);
        }
      } catch (err) {
        setError('Failed to load stocks');
      } finally {
        setLoading(false);
      }
    }
    loadStocks();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            US Large-Cap Stocks Analysis
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Investment Return Rates</h2>
            <div className="w-64 mb-4">
              <Select
                value={selectedStock}
                onValueChange={(value) => setSelectedStock(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a stock" />
                </SelectTrigger>
                <SelectContent>
                  {stocks.map((stock) => (
                    <SelectItem key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - {stock.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedStock && <ROIChart symbol={selectedStock} />}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Top Investment Opportunities</h2>
            <TopInvestments />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
