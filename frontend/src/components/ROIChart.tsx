import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchStockROI, ROIData } from '../lib/api';

interface ROIChartProps {
  symbol: string;
}

export function ROIChart({ symbol }: ROIChartProps) {
  const [data, setData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const roiData = await fetchStockROI(symbol);
        setData(roiData);
      } catch (err) {
        setError('Failed to load ROI data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [symbol]);

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return null;

  const chartData = data.dates.map((date, index) => ({
    date,
    price: data.prices[index],
  }));

  return (
    <div className="w-full h-96 p-4">
      <h2 className="text-2xl font-bold mb-4">{symbol} - 1 Year ROI: {data.roi_percentage.toFixed(2)}%</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
            interval={30}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#2563eb" 
            dot={false}
            name="Stock Price"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
