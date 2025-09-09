export interface Orders{
serviceName: string;
      vehicleInfo: string;
      customerName: string;
      phone:string;
      totalCost: string;
      status:"Pending" | "Progress" | "Completed";
}