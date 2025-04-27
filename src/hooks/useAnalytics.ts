import { useQuery } from "@tanstack/react-query";
import { getIncome, getExpenses } from "@/lib/api";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getMonth, getYear, subMonths, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export function useAnalytics(
  timeRange: "month" | "quarter" | "year" | "custom", 
  selectedMonth: Date,
  customStartDate?: Date,
  customEndDate?: Date
) {
  const { user } = useAuth();
  
  // Fetch income data for the authenticated user
  const { 
    data: incomeData, 
    isLoading: isLoadingIncome, 
    error: incomeError 
  } = useQuery({
    queryKey: ["income", user?.id],
    queryFn: () => getIncome(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Fetch expense data for the authenticated user
  const { 
    data: expenseData, 
    isLoading: isLoadingExpenses, 
    error: expenseError 
  } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: () => getExpenses(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Combine loading states
  const isLoading = isLoadingIncome || isLoadingExpenses;
  
  // Combine error states
  const error = incomeError || expenseError;

  // Transform income and expense data into a unified format for analytics
  const getFilteredData = () => {
    if (!incomeData || !expenseData) return { income: [], expenses: [] };
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    if (timeRange === "custom" && customStartDate && customEndDate) {
      // Use custom date range
      startDate = startOfDay(customStartDate);
      endDate = endOfDay(customEndDate);
    } else if (timeRange === "month") {
      // Use current month instead of selected month for up-to-date data
      startDate = startOfMonth(now);
      endDate = endOfDay(now);
    } else if (timeRange === "quarter") {
      startDate = startOfMonth(subMonths(now, 3));
      endDate = endOfDay(now);
    } else {
      // Year
      startDate = new Date(getYear(now), 0, 1);
      endDate = endOfDay(now);
    }
    
    // Filter income data
    const filteredIncome = incomeData.filter(income => {
      const incomeDate = new Date(income.date);
      return isWithinInterval(incomeDate, { start: startDate, end: endDate });
    });
    
    // Filter expense data
    const filteredExpenses = expenseData.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start: startDate, end: endDate });
    });
    
    return { 
      income: filteredIncome, 
      expenses: filteredExpenses,
      startDate,
      endDate
    };
  };
  
  const { income, expenses, startDate, endDate } = getFilteredData();
  
  // Calculate total income and expenses
  const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const netIncome = totalIncome - totalExpenses;
  
  // Calculate income and expenses by category
  const getCategoryData = () => {
    const categoryMap = new Map<string, { income: number; expense: number }>();
    
    // Process income data
    income.forEach(item => {
      const category = item.category;
      const amount = Number(item.amount);
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { income: 0, expense: 0 });
      }
      
      const current = categoryMap.get(category)!;
      current.income += amount;
    });
    
    // Process expense data
    expenses.forEach(item => {
      const category = item.category;
      const amount = Number(item.amount);
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { income: 0, expense: 0 });
      }
      
      const current = categoryMap.get(category)!;
      current.expense += amount;
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      income: data.income,
      expense: data.expense,
    }));
  };
  
  // Calculate daily income and expenses for the line chart
  const getDailyData = () => {
    // Use the filtered date range for the chart
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      // Find income for this day
      const dayIncome = income
        .filter(item => isSameDay(new Date(item.date), day))
        .reduce((sum, item) => sum + Number(item.amount), 0);
      
      // Find expenses for this day
      const dayExpense = expenses
        .filter(item => isSameDay(new Date(item.date), day))
        .reduce((sum, item) => sum + Number(item.amount), 0);
      
      return {
        date: format(day, "MMM d"),
        income: dayIncome,
        expense: dayExpense,
      };
    });
  };
  
  // Calculate monthly income and expenses for the bar chart
  const getMonthlyData = () => {
    // For custom date ranges, we'll show all months in the range
    if (timeRange === "custom" && customStartDate && customEndDate) {
      const startYear = getYear(customStartDate);
      const endYear = getYear(customEndDate);
      const startMonth = getMonth(customStartDate);
      const endMonth = getMonth(customEndDate);
      
      // Calculate the number of months in the range
      const monthCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
      
      const months = Array.from({ length: monthCount }, (_, i) => {
        const monthIndex = (startMonth + i) % 12;
        const year = startYear + Math.floor((startMonth + i) / 12);
        const date = new Date(year, monthIndex, 1);
        return {
          month: format(date, "MMM yyyy"),
          income: 0,
          expense: 0,
        };
      });
      
      // Process income data
      income.forEach(item => {
        const itemDate = new Date(item.date);
        const itemYear = getYear(itemDate);
        const itemMonth = getMonth(itemDate);
        
        // Find the index in our months array
        const yearDiff = itemYear - startYear;
        const monthDiff = itemMonth - startMonth;
        const index = yearDiff * 12 + monthDiff;
        
        if (index >= 0 && index < months.length) {
          months[index].income += Number(item.amount);
        }
      });
      
      // Process expense data
      expenses.forEach(item => {
        const itemDate = new Date(item.date);
        const itemYear = getYear(itemDate);
        const itemMonth = getMonth(itemDate);
        
        // Find the index in our months array
        const yearDiff = itemYear - startYear;
        const monthDiff = itemMonth - startMonth;
        const index = yearDiff * 12 + monthDiff;
        
        if (index >= 0 && index < months.length) {
          months[index].expense += Number(item.amount);
        }
      });
      
      return months;
    } else {
      // For other time ranges, show the current year's months
      const now = new Date();
      const currentYear = getYear(now);
      
      const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(currentYear, i, 1);
        return {
          month: format(date, "MMM"),
          income: 0,
          expense: 0,
        };
      });
      
      // Process income data
      income.forEach(item => {
        const itemDate = new Date(item.date);
        const monthIndex = getMonth(itemDate);
        const amount = Number(item.amount);
        
        months[monthIndex].income += amount;
      });
      
      // Process expense data
      expenses.forEach(item => {
        const itemDate = new Date(item.date);
        const monthIndex = getMonth(itemDate);
        const amount = Number(item.amount);
        
        months[monthIndex].expense += amount;
      });
      
      return months;
    }
  };
  
  return {
    isLoading,
    error,
    totalIncome,
    totalExpenses,
    netIncome,
    getCategoryData,
    getDailyData,
    getMonthlyData,
    dateRange: {
      start: startDate,
      end: endDate
    }
  };
} 