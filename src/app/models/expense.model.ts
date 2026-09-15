export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Other';

export interface Expense {
  id: number | string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
}