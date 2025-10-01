export interface Warranty {
  _id: string;
  packageName: string;
  duration: number;
  cost: number;
  allowedVisits: number;
  customerName: string;
  mobileNumber: string;
  carName: string;
  numberPlate: string;
  issuedDate: Date;
  lastDueDate: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
