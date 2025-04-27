
import { useTransactions } from "@/hooks/useTransactions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Transactions() {
  const { expenses, income, isLoading, error } = useTransactions();

  if (isLoading) {
    return <div className="flex items-center justify-center h-60">Loading transactions...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading transactions: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add Expense
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" /> Add Income
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
          {expenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No expenses recorded yet</p>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{expense.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{expense.category}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-red-600 font-medium">-${expense.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Income</h2>
          {income.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No income recorded yet</p>
          ) : (
            <div className="space-y-4">
              {income.map((income) => (
                <div key={income.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{income.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{income.category}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{new Date(income.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-green-600 font-medium">+${income.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
