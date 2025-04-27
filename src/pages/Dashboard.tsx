import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getGoals, getIncome, getExpenses, updateGoal } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Target, Wallet, PiggyBank, PieChart, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Custom card component with hover effect
const HoverCard = ({ className, children, ...props }: React.ComponentProps<typeof Card>) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1", 
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  );
};

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [savings, setSavings] = useState(0);
  const [amountForGoals, setAmountForGoals] = useState(0);
  const navigate = useNavigate();

  // 50/30/20 distribution calculations
  const [recommendedExpenses, setRecommendedExpenses] = useState(0);
  const [recommendedGoals, setRecommendedGoals] = useState(0);
  const [recommendedSavings, setRecommendedSavings] = useState(0);

  // Colors for the pie chart
  const COLORS = ['#FF8042', '#00C49F', '#FFBB28'];

  // Fetch goals data
  const { data: goalsData, isLoading: isLoadingGoals } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: () => getGoals(user?.id || ""),
    enabled: !!user?.id,
  });

  // Fetch income data
  const { data: incomeData, isLoading: isLoadingIncome } = useQuery({
    queryKey: ["income", user?.id],
    queryFn: () => getIncome(user?.id || ""),
    enabled: !!user?.id,
  });

  // Fetch expense data
  const { data: expenseData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: () => getExpenses(user?.id || ""),
    enabled: !!user?.id,
  });

  // Mutation for updating goals
  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, goalData }: { goalId: string; goalData: any }) =>
      updateGoal(user?.id || "", goalId, goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
      toast({
        title: "Goals Updated",
        description: "Your goals have been updated according to the 50/30/20 rule.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update goals. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating goals:", error);
    },
  });

  useEffect(() => {
    if (incomeData && expenseData) {
      // Calculate totals from actual income and expense data
      const income = incomeData.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
      const expenses = expenseData.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

      // Calculate 50/30/20 distribution
      const recommended50 = income * 0.5;
      const recommended30 = income * 0.3;
      const recommended20 = income * 0.2;
      
      setRecommendedExpenses(recommended50);
      setRecommendedGoals(recommended30);
      setRecommendedSavings(recommended20);

      setTotalIncome(income);
      setTotalExpenses(expenses); 
      setAmountForGoals(recommended30); // Set goals amount to 30% of income
      setSavings(recommended20);  // Set savings to 20% of income
      
      // Update total balance based on income and recommended expenses (50%)
      setTotalBalance(income - recommended50);
      
      // Combine income and expense data into a single transactions array
      const formattedIncomeData = incomeData.map((item: any) => ({
        ...item,
        type: 'income',
      }));
      
      const formattedExpenseData = expenseData.map((item: any) => ({
        ...item,
        type: 'expense',
      }));
      
      // Combine and sort all transactions by date (newest first)
      const allTransactions = [...formattedIncomeData, ...formattedExpenseData]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(allTransactions);
    }
  }, [incomeData, expenseData]);

  // Function to apply 50/30/20 rule to goals
  const apply503020Rule = async () => {
    if (!user?.id || !goalsData || goalsData.length === 0 || !incomeData) {
      toast({
        title: "Error",
        description: "No goals found or insufficient data to apply the rule.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate total income
    const income = incomeData.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    
    // Calculate 50/30/20 rule amounts
    const recommended50 = income * 0.5; // Expenses
    const recommended30 = income * 0.3; // Goals
    const recommended20 = income * 0.2; // Savings
    
    // Calculate recommended amount for goals (30% of income)
    const recommendedGoalsAmount = recommended30;
    
    // Calculate the total target amount needed for all goals
    const totalTargetAmount = goalsData.reduce((sum: number, goal: any) => sum + Number(goal.targetAmount || 0), 0);
    
    // Calculate the actual amount to allocate to goals
    // This will be the lesser of the recommended amount or the total target amount
    const actualGoalsAmount = Math.min(recommendedGoalsAmount, totalTargetAmount);

    // If there's only one goal, update it directly
    if (goalsData.length === 1) {
      const goal = goalsData[0];
      // Don't exceed the target amount for single goal
      const newAmount = Math.min(actualGoalsAmount, Number(goal.targetAmount || 0));
      const remainingAmount = Number(goal.targetAmount || 0) - newAmount;
      
      const updatedGoalData = {
        ...goal,
        currentAmount: newAmount,
        remainingAmount: remainingAmount,
        progress: (newAmount / Number(goal.targetAmount || 1)) * 100,
      };

      try {
        await updateGoalMutation.mutateAsync({ goalId: goal.id, goalData: updatedGoalData });
        queryClient.invalidateQueries({ queryKey: ["goals", user.id] });
        toast({
          title: "Goal Updated",
          description: "Your goal has been updated according to the 50/30/20 rule.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update goal. Please try again.",
          variant: "destructive",
        });
        console.error("Error updating goal:", error);
      }
      return;
    }
    
    // For multiple goals, distribute proportionally while respecting target amounts
    let updatedGoals = 0;
    
    // First pass: calculate proportions and prepare updates
    const goalUpdates = goalsData.map((goal) => {
      // Calculate the proportion of this goal's target to the total target
      const proportion = totalTargetAmount > 0
        ? Number(goal.targetAmount || 0) / totalTargetAmount
        : 1 / goalsData.length;
      
      // Calculate new amount based on proportion
      const proportionalAmount = Math.round(actualGoalsAmount * proportion);
      // Ensure we don't exceed the target amount for each goal
      const newAmount = Math.min(proportionalAmount, Number(goal.targetAmount || 0));
      // Calculate remaining amount to reach the target
      const remainingAmount = Number(goal.targetAmount || 0) - newAmount;
      
      return {
        goalId: goal.id,
        goalData: {
          ...goal,
          currentAmount: newAmount,
          remainingAmount: remainingAmount,
          progress: (newAmount / Number(goal.targetAmount || 1)) * 100,
        },
        targetAmount: Number(goal.targetAmount || 0),
        allocatedAmount: newAmount,
      };
    });
    
    // Check if we need to redistribute leftover amount
    const totalAllocated = goalUpdates.reduce((sum, update) => sum + update.allocatedAmount, 0);
    let leftoverAmount = actualGoalsAmount - totalAllocated;
    
    // Redistribute leftover amount to goals that haven't reached their target
    if (leftoverAmount > 0) {
      // Find goals that can still receive more funds
      const underfilledGoals = goalUpdates.filter(
        update => update.allocatedAmount < update.targetAmount
      );
      
      // If there are underfilled goals, redistribute
      if (underfilledGoals.length > 0) {
        // Sort goals by the remaining space they have (target - current)
        underfilledGoals.sort((a, b) => 
          (b.targetAmount - b.allocatedAmount) - (a.targetAmount - a.allocatedAmount)
        );
        
        // Distribute leftover amount to underfilled goals
        for (const update of underfilledGoals) {
          if (leftoverAmount <= 0) break;
          
          const remainingSpace = update.targetAmount - update.allocatedAmount;
          const additionalAmount = Math.min(leftoverAmount, remainingSpace);
          
          // Update the goal's current amount
          update.goalData.currentAmount += additionalAmount;
          update.goalData.remainingAmount -= additionalAmount;
          update.goalData.progress = (update.goalData.currentAmount / update.targetAmount) * 100;
          update.allocatedAmount += additionalAmount;
          
          leftoverAmount -= additionalAmount;
        }
      }
    }
    
    // Final check to ensure the sum doesn't exceed the actual goals amount
    const finalTotalAllocated = goalUpdates.reduce((sum, update) => sum + update.goalData.currentAmount, 0);
    if (finalTotalAllocated > actualGoalsAmount) {
      const excess = finalTotalAllocated - actualGoalsAmount;
      // Reduce from the goal with the largest allocation
      const sortedUpdates = [...goalUpdates].sort((a, b) => 
        b.goalData.currentAmount - a.goalData.currentAmount
      );
      
      sortedUpdates[0].goalData.currentAmount -= excess;
      sortedUpdates[0].goalData.remainingAmount += excess;
      sortedUpdates[0].goalData.progress = 
        (sortedUpdates[0].goalData.currentAmount / sortedUpdates[0].targetAmount) * 100;
    }
    
    // Update each goal
    for (const update of goalUpdates) {
      try {
        await updateGoalMutation.mutateAsync({ goalId: update.goalId, goalData: update.goalData });
        updatedGoals++;
      } catch (error) {
        console.error(`Error updating goal ${update.goalId}:`, error);
      }
    }
    
    // Refresh goals data
    queryClient.invalidateQueries({ queryKey: ["goals", user.id] });
    
    // Calculate actual amount allocated to goals after updates
    const actualAllocated = goalUpdates.reduce((sum, update) => sum + update.goalData.currentAmount, 0);
    
    // Update the balance and savings based on 50/30/20 rule
    setSavings(recommended20);
    setTotalBalance(income - recommended50);
    
    // Show success message
    if (updatedGoals === goalUpdates.length) {
      toast({
        title: "Goals Updated",
        description: "Your goals have been updated according to the 50/30/20 rule.",
      });
    } else if (updatedGoals > 0) {
      toast({
        title: "Partial Update",
        description: `${updatedGoals} out of ${goalUpdates.length} goals were updated.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update any goals. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Prepare data for the pie chart
  const getDistributionData = () => {
    return [
      { name: 'Expenses (50%)', value: recommendedExpenses },
      { name: 'Goals (30%)', value: recommendedGoals },
      { name: 'Savings (20%)', value: recommendedSavings }
    ];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Unknown date";
    }
  };

  const isLoading = isLoadingGoals || isLoadingIncome || isLoadingExpenses;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          You must be logged in to view the dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/add-income">
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/add-expense">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <HoverCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</div>
          </CardContent>
        </HoverCard>

        <HoverCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: ₹{recommendedExpenses.toLocaleString()} (50%)
            </p>
          </CardContent>
        </HoverCard>

        <HoverCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{totalBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Income - 50% (Expenses)
            </p>
          </CardContent>
        </HoverCard>

        <HoverCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${savings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{savings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              20% of Income
            </p>
          </CardContent>
        </HoverCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <HoverCard 
          className="cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/transactions")}
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Transactions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <style dangerouslySetInnerHTML={{
              __html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #888;
                  border-radius: 10px;
                  transition: background-color 0.3s;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #555;
                }
                .custom-scrollbar {
                  scrollbar-width: thin;
                  scrollbar-color: #888 #f1f1f1;
                  scroll-behavior: smooth;
                }
              `
            }} />
            <div className="space-y-4 h-64 overflow-y-auto custom-scrollbar pr-2">
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No transactions found</p>
              ) : (
                transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex justify-between items-center border-b pb-2 hover:bg-gray-50 rounded-md p-2 transition-colors duration-200"
                  >
                    <div>
                      <p className="font-medium">{transaction.description || transaction.source || transaction.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{transaction.category || 'Uncategorized'}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </HoverCard>

        <HoverCard>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Financial Goals</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={apply503020Rule}
              disabled={updateGoalMutation.isPending}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${updateGoalMutation.isPending ? 'animate-spin' : ''}`} />
              Apply 50/30/20
            </Button>
          </CardHeader>
          <CardContent>
            {!goalsData || goalsData.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No financial goals set yet</p>
                <Button asChild>
                  <Link to="/goals">Set Your First Goal</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {goalsData.slice(0, 3).map((goal: any) => {
                  // Calculate progress percentage
                  const targetAmount = Number(goal.targetAmount || 0);
                  const currentAmount = Number(goal.currentAmount || 0);
                  const progressPercentage = targetAmount > 0 
                    ? Math.min(100, (currentAmount / targetAmount) * 100) 
                    : 0;
                  
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between">
                        <p className="font-medium">{goal.name}</p>
                        <div className="text-right">
                          <p className="text-sm">₹{currentAmount.toLocaleString()} / ₹{targetAmount.toLocaleString()}</p>
                          {goal.remainingAmount !== undefined && (
                            <p className="text-xs text-muted-foreground">
                              Remaining: ₹{Number(goal.remainingAmount || 0).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  );
                })}
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link to="/goals">View All Goals</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </HoverCard>
      </div>

      <HoverCard>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>50/30/20 Budget Rule</CardTitle>
          <PieChart className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Recommended Allocation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Expenses (50%)</span>
                    <span className="font-medium">₹{recommendedExpenses.toLocaleString()}</span>
                  </div>
                  <Progress value={50} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Goals (30%)</span>
                    <span className="font-medium">₹{recommendedGoals.toLocaleString()}</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Savings (20%)</span>
                    <span className="font-medium">₹{recommendedSavings.toLocaleString()}</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={getDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value || 0).toLocaleString()}`} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </HoverCard>
    </div>
  );
}