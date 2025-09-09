type StatusType = "Paid" | "Pending";

export interface TableRow {
  customer: string;
  vehicle: string;
  link: string;
  date: string; // ISO format like "2024-07-15"
  cost: number;
  status: StatusType;
}
