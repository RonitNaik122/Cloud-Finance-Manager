import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGoals, createGoal, updateGoal, deleteGoal } from "@/lib/api";
import { Goal } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Define the goal data type for creating/updating goals
type GoalData = {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description: string;
  category: string;
};

export const useGoals = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const userId = user?.id;

  const goalsQuery = useQuery({
    queryKey: ["goals", userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await getGoals(userId);
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: GoalData) => {
      if (!userId) throw new Error("User not authenticated");
      return createGoal(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      toast({
        title: "Success",
        description: "Goal created successfully",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GoalData }) => {
      if (!userId) throw new Error("User not authenticated");
      return updateGoal(userId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      toast({
        title: "Success",
        description: "Goal updated successfully",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error("User not authenticated");
      return deleteGoal(userId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    },
  });

  return {
    goals: goalsQuery.data || [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
  };
}; 