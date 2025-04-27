import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BarChartProps {
  data: any[];
  xField: string;
  yFields: string[];
  colors?: string[];
  height?: number;
}

export function BarChart({ 
  data, 
  xField, 
  yFields, 
  colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"],
  height = 300 
}: BarChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis />
          <Tooltip />
          <Legend />
          {yFields.map((field, index) => (
            <Bar 
              key={field} 
              dataKey={field} 
              fill={colors[index % colors.length]} 
              name={field.charAt(0).toUpperCase() + field.slice(1)}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
} 