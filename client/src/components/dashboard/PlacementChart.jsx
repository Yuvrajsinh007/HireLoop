import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
  } from "recharts";
  import { STAGE_COLORS } from "../../utils/constants";
  
  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-sm text-indigo-600 font-bold">{payload[0].value} applications</p>
        </div>
      );
    }
    return null;
  };
  
  const PlacementChart = ({ data = [] }) => {
    if (!data || data.length === 0) {
      return (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Applications by Stage</h3>
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              No application data yet
            </div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Applications by Stage</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="stage"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  export default PlacementChart;