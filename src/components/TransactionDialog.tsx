import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/hooks/useTransactions";
import { useToast } from "@/hooks/use-toast";
import { Expense, Income } from "@/lib/types";
import { Trash2, Pencil } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type TransactionType = "expense" | "income";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType;
  transaction?: Expense | Income | null;
  mode?: "create" | "edit";
}

const EXPENSE_CATEGORIES = [
  "Housing", "Food", "Transportation", "Entertainment", 
  "Utilities", "Healthcare", "Shopping", "Education", 
  "Personal Care", "Travel", "Dining Out", "Other"
];

const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investments", "Rental", 
  "Business", "Gifts", "Other"
];

export function TransactionDialog({ 
  open, 
  onOpenChange, 
  type, 
  transaction = null,
  mode = "create" 
}: TransactionDialogProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  
  const { createExpense, createIncome, updateExpense, updateIncome, deleteExpense, deleteIncome } = useTransactions();
  const { toast } = useToast();
  
  const isExpense = type === "expense";
  const categories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isEditMode = mode === "edit";
  
  // Reset form when dialog opens/closes or transaction changes
  useEffect(() => {
    if (open) {
      if (isEditMode && transaction) {
        setName(transaction.name);
        setAmount(transaction.amount.toString());
        setCategory(transaction.category);
        setDate(transaction.date.split("T")[0]);
        setNotes(transaction.notes || "");
      } else {
        // Reset form for new transaction
        setName("");
        setAmount("");
        setCategory("");
        setDate(new Date().toISOString().split("T")[0]);
        setNotes("");
      }
    }
  }, [open, transaction, isEditMode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount || !category || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const transactionData = {
      name,
      amount: parseFloat(amount),
      category,
      date,
      notes,
    };
    
    try {
      if (isEditMode && transaction) {
        if (isExpense) {
          await updateExpense({ id: transaction.id, data: transactionData });
        } else {
          await updateIncome({ id: transaction.id, data: transactionData });
        }
      } else {
        if (isExpense) {
          await createExpense(transactionData);
        } else {
          await createIncome(transactionData);
        }
      }
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} ${type}. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    if (!transaction) return;
    
    try {
      if (isExpense) {
        await deleteExpense(transaction.id);
      } else {
        await deleteIncome(transaction.id);
      }
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${type}. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit" : "Add"} {isExpense ? "Expense" : "Income"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder={`Enter ${type} name`}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {isEditMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this {type}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 