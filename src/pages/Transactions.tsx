import { useTransactions } from "@/hooks/useTransactions";
import { Card } from "@/components/ui/card";
import { FloatingCard } from "@/components/ui/floating-card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { TransactionDialog } from "@/components/TransactionDialog";
import { Expense, Income } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";

export function Transactions() {
  const { expenses, income, isLoading, error, deleteExpense, deleteIncome } = useTransactions();
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Expense | Income | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Debug the data structure
  useEffect(() => {
    console.log("Expenses data:", expenses);
    console.log("Income data:", income);
  }, [expenses, income]);

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "income") {
      handleAddNew("income");
    } else if (type === "expense") {
      handleAddNew("expense");
    }
  }, [searchParams]);

  const handleEdit = (transaction: Expense | Income, type: "expense" | "income") => {
    setSelectedTransaction(transaction);
    setTransactionType(type);
    setDialogMode("edit");
    if (type === "expense") {
      setExpenseDialogOpen(true);
    } else {
      setIncomeDialogOpen(true);
    }
  };

  const handleDelete = async (id: string, type: "expense" | "income") => {
    try {
      if (type === "expense") {
        await deleteExpense(id);
        toast({
          title: "Success",
          description: "Expense deleted successfully",
        });
      } else {
        await deleteIncome(id);
        toast({
          title: "Success",
          description: "Income deleted successfully",
        });
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${type}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleAddNew = (type: "expense" | "income") => {
    setSelectedTransaction(null);
    setTransactionType(type);
    setDialogMode("create");
    if (type === "expense") {
      setExpenseDialogOpen(true);
    } else {
      setIncomeDialogOpen(true);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-60">Loading transactions...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading transactions: {error.message}</div>;
  }

  // Ensure expenses and income are arrays
  const expensesArray = Array.isArray(expenses) ? expenses : [];
  const incomeArray = Array.isArray(income) ? income : [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleAddNew("expense")}>
            <Plus className="mr-1 h-4 w-4" /> Add Expense
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleAddNew("income")}>
            <Plus className="mr-1 h-4 w-4" /> Add Income
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <FloatingCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Expenses</h2>
          {expensesArray.length === 0 ? (
            <p className="text-muted-foreground">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {expensesArray.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(expense.date), "MMM d, yyyy")} • {expense.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-red-500">-₹{Number(expense.amount || 0).toLocaleString()}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(expense, "expense")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the expense.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(expense.id, "expense")}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FloatingCard>
        
        <FloatingCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Income</h2>
          {incomeArray.length === 0 ? (
            <p className="text-muted-foreground">No income recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {incomeArray.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{income.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(income.date), "MMM d, yyyy")} • {income.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-500">+₹{Number(income.amount || 0).toLocaleString()}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(income, "income")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the income.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(income.id, "income")}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FloatingCard>
      </div>
    
      <TransactionDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        transaction={selectedTransaction as Expense}
        type="expense"
        mode={dialogMode}
      />
      
      <TransactionDialog
        open={incomeDialogOpen}
        onOpenChange={setIncomeDialogOpen}
        transaction={selectedTransaction as Income}
        type="income"
        mode={dialogMode}
      />
    </div>
  );
}
