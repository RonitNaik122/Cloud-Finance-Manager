
import { useTransactions } from "@/hooks/useTransactions";
import { Card } from "@/components/ui/card";

// Temporary userId - In a real app, this would come from auth context
const TEMP_USER_ID = "123";

export function Transactions() {
  const { expenses, income, isLoading, error } = useTransactions(TEMP_USER_ID);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading transactions</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Transactions</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <p className="text-sm text-muted-foreground">{expense.category}</p>
                </div>
                <p className="text-red-600">-${expense.amount}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Income</h2>
          <div className="space-y-4">
            {income.map((income) => (
              <div key={income.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{income.name}</p>
                  <p className="text-sm text-muted-foreground">{income.category}</p>
                </div>
                <p className="text-green-600">+${income.amount}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
