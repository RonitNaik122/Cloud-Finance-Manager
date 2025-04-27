
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, updateExpense, deleteExpense, getIncome, createIncome, updateIncome, deleteIncome } from "@/lib/api";
import { Expense, Income } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export const useTransactions = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const expensesQuery = useQuery({
    queryKey: ["expenses", userId],
    queryFn: () => getExpenses(userId),
  });

  const incomeQuery = useQuery({
    queryKey: ["income", userId],
    queryFn: () => getIncome(userId),
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">) => 
      createExpense(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Success",
        description: "Expense created successfully",
      });
    },
  });

  const createIncomeMutation = useMutation({
    mutationFn: (data: Omit<Income, "id" | "userId" | "createdAt" | "updatedAt">) => 
      createIncome(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast({
        title: "Success",
        description: "Income created successfully",
      });
    },
  });

  return {
    expenses: expensesQuery.data || [],
    income: incomeQuery.data || [],
    isLoading: expensesQuery.isLoading || incomeQuery.isLoading,
    error: expensesQuery.error || incomeQuery.error,
    createExpense: createExpenseMutation.mutate,
    createIncome: createIncomeMutation.mutate,
  };
};
