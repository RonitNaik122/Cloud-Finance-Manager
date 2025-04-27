import { useToast } from "@/hooks/use-toast";
import { User, Expense, Income, Goal, Event } from "./types";

const API_BASE_URL = "http://localhost:3000"; // Replace with your actual backend URL

const request = async (endpoint: string, options: RequestInit) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage += `, ${errorData.error}`;
        }
      } catch (jsonError) {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// User Authentication API calls
export const userSignup = async (userData: any) => {
  return request("/users/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

export const userLogin = async (userData: any) => {
  return request("/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

export const getUser = async (userId: string) => {
  return request(`/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateUser = async (userId: string, userData: any) => {
  return request(`/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId: string) => {
  return request(`/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const changePassword = async (passwordData: any) => {
  return request(`/pass_change`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData),
  });
};

// Expenses API calls
export const createExpense = async (userId: string, expenseData: any) => {
  return request(`/expenses/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });
};

export const getExpenses = async (userId: string) => {
  return request(`/expenses/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateExpense = async (userId: string, expenseId: string, expenseData: any) => {
  return request(`/expenses/${userId}/${expenseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });
};

export const deleteExpense = async (userId: string, expenseId: string) => {
  return request(`/expenses/${userId}/${expenseId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Income API calls
export const createIncome = async (userId: string, incomeData: any) => {
  return request(`/income/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(incomeData),
  });
};

export const getIncome = async (userId: string) => {
  return request(`/income/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getIncomeById = async (userId: string, incomeId: string) => {
  return request(`/income/${userId}/${incomeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateIncome = async (userId: string, incomeId: string, incomeData: any) => {
  return request(`/income/${userId}/${incomeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(incomeData),
  });
};

export const deleteIncome = async (userId: string, incomeId: string) => {
  return request(`/income/${userId}/${incomeId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Goals API calls
export const createGoal = async (userId: string, goalData: any) => {
  return request(`/goals/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalData),
  });
};

export const getGoals = async (userId: string) => {
  return request(`/goals/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getGoalById = async (userId: string, goalId: string) => {
  return request(`/goals/${userId}/${goalId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateGoal = async (userId: string, goalId: string, goalData: any) => {
  return request(`/goals/${userId}/${goalId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalData),
  });
};

export const deleteGoal = async (userId: string, goalId: string) => {
  return request(`/goals/${userId}/${goalId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Events API calls
export const createEvent = async (userId: string, eventData: any) => {
  return request(`/events/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });
};

export const getEvents = async (userId: string) => {
  return request(`/events/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getEventById = async (userId: string, eventId: string) => {
  return request(`/events/${userId}/${eventId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateEvent = async (userId: string, eventId: string, eventData: any) => {
  return request(`/events/${userId}/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });
};

export const deleteEvent = async (userId: string, eventId: string) => {
  return request(`/events/${userId}/${eventId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
