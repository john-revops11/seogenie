
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RankingHistoryChartProps {
  data: { date: string; position: number | null }[];
  keyword: string;
}

const RankingHistoryChart: React.FC<RankingHistoryChartProps> = ({ data, keyword }) => {
  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No history data available for "{keyword}"</p>
      </div>
    );
  }

  // Format the data for the chart
  // We need to invert positions for visual clarity (lower is better for positions, but higher is better for charts)
  const formattedData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    // Convert null to 0 for the chart, and invert for better visualization
    // (e.g., position 1 is highest on chart, not lowest)
    position: item.position ? 101 - item.position : 0
  }));

  // Custom tooltip formatter that shows original position, not inverted
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const originalPosition = payload[0].value > 0 ? 101 - payload[0].value : "Not Ranking";
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-bold">{label}</p>
          <p>Position: {originalPosition}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            domain={[0, 100]} 
            ticks={[0, 25, 50, 75, 100]} 
            tickFormatter={(value) => {
              if (value === 0) return "Not Ranking";
              if (value === 100) return "1";
              if (value === 75) return "25";
              if (value === 50) return "50";
              if (value === 25) return "75";
              return `${value}`;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="position" 
            stroke="#2563eb" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RankingHistoryChart;
