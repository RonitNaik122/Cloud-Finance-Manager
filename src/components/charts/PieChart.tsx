import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PieChartProps {
  data: any[];
  nameField: string;
  valueField: string;
  colors?: string[];
  height?: number;
}

export function PieChart({ 
  data, 
  nameField, 
  valueField, 
  colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"],
  height = 300 
}: PieChartProps) {
  // Format data for the pie chart
  const formattedData = data.map(item => ({
    name: item[nameField],
    value: item[valueField]
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
} 