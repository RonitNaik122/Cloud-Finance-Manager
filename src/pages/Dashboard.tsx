
import { Card } from "@/components/ui/card";
import { BarChart, LineChart } from "recharts";

export function Dashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Financial Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
          <p className="mt-2 text-3xl font-bold">$12,750</p>
          <span className="text-sm text-green-600">+2.5%</span>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
          <p className="mt-2 text-3xl font-bold">$4,250</p>
          <span className="text-sm text-green-600">+1.2%</span>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
          <p className="mt-2 text-3xl font-bold">$2,850</p>
          <span className="text-sm text-red-600">-0.8%</span>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Savings</h3>
          <p className="mt-2 text-3xl font-bold">$1,400</p>
          <span className="text-sm text-green-600">+4.3%</span>
        </Card>
      </div>
    </div>
  );
}
