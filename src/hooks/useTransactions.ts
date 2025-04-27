
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, updateExpense, deleteExpense, getIncome, createIncome, updateIncome, deleteIncome } from "@/lib/api";
import { Expense, Income } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useTransactions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const userId = user?.id;

  const expensesQuery = useQuery({
    queryKey: ["expenses", userId],
    queryFn: () => userId ? getExpenses(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const incomeQuery = useQuery({
    queryKey: ["income", userId],
    queryFn: () => userId ? getIncome(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!userId) throw new Error("User not authenticated");
      return createExpense(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", userId] });
      toast({
        title: "Success",
        description: "Expense created successfully",
      });
    },
  });

  const createIncomeMutation = useMutation({
    mutationFn: (data: Omit<Income, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!userId) throw new Error("User not authenticated");
      return createIncome(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income", userId] });
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
