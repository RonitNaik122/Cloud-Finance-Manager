
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
}

export interface Expense {
  id: string;
  userId: string;
  name: string;
  date: string;
  category: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  userId: string;
  name: string;
  date: string;
  category: string;
  amount: number;
  paymentMethod: string;
  notes: string;
  receiptUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
