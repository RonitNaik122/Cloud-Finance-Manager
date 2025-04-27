import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, updateExpense, deleteExpense, getIncome, createIncome, updateIncome, deleteIncome } from "@/lib/api";
import { Expense, Income } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Define the transaction data type for creating new transactions
type TransactionData = {
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
};

export const useTransactions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const userId = user?.id;

  const expensesQuery = useQuery({
    queryKey: ["expenses", userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await getExpenses(userId);
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });

  const incomeQuery = useQuery({
    queryKey: ["income", userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await getIncome(userId);
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: TransactionData) => {
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
    mutationFn: (data: TransactionData) => {
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

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionData }) => {
      if (!userId) throw new Error("User not authenticated");
      return updateExpense(userId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", userId] });
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionData }) => {
      if (!userId) throw new Error("User not authenticated");
      return updateIncome(userId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income", userId] });
      toast({
        title: "Success",
        description: "Income updated successfully",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error("User not authenticated");
      return deleteExpense(userId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", userId] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error("User not authenticated");
      return deleteIncome(userId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income", userId] });
      toast({
        title: "Success",
        description: "Income deleted successfully",
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
    updateExpense: updateExpenseMutation.mutate,
    updateIncome: updateIncomeMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    deleteIncome: deleteIncomeMutation.mutate,
  };
};
