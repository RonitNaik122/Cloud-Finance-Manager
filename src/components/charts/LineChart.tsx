import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface LineChartProps {
  data: any[];
  xField: string;
  yFields: string[];
  colors?: string[];
  height?: number;
}

export function LineChart({ 
  data, 
  xField, 
  yFields, 
  colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"],
  height = 300 
}: LineChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis />
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
          <Legend />
          {yFields.map((field, index) => (
            <Line 
              key={field} 
              type="monotone" 
              dataKey={field} 
              stroke={colors[index % colors.length]} 
              name={field.charAt(0).toUpperCase() + field.slice(1)}
              activeDot={{ r: 8 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
} 