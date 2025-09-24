export interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
