export interface Expense {
  _id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
