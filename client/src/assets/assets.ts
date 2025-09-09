
import logo from './logo.svg'
import upload_area from './upload_area.png'
import profile_img from './profile_img.jpg'
import type { Orders } from '../types/Orders';
export const assets={
logo,
upload_area,
profile_img

}



export const initialCompanies = [
  { id: 1, name: "AutoShine Detailing", email: "contact@autoshinedetailing.com", status: "Active" },
  { id: 2, name: "CleanRide Auto Spa", email: "info@cleanrideautospa.com", status: "Active" },
  { id: 3, name: "MobileWash Pro", email: "support@mobilewashpro.com", status: "Inactive" },
  { id: 4, name: "DetailMasters Inc.", email: "admin@detailmasters.com", status: "Active" },
  { id: 5, name: "Spotless Wheels", email: "hello@spotlesswheels.com", status: "Active" },  { id: 1, name: "AutoShine Detailing", email: "contact@autoshinedetailing.com", status: "Active" },
  { id: 6, name: "CleanRide Auto Spa", email: "info@cleanrideautospa.com", status: "Active" },
  { id: 7, name: "MobileWash Pro", email: "support@mobilewashpro.com", status: "Inactive" },
  { id: 8, name: "DetailMasters Inc.", email: "admin@detailmasters.com", status: "Active" },
  { id: 9, name: "Spotless Wheels", email: "hello@spotlesswheels.com", status: "Active" },
];
 export const workOrders:Orders[] = [
    {
      serviceName: "Car Polishing",
      vehicleInfo: "KL 55 KA 1616",
      customerName: "Swathish Sreeraman",
      phone: "+91 987654321",
      totalCost: '5000',
      status: "Pending",
    },
    {
      serviceName: "Car Wash",
      vehicleInfo: "KL 55 KA 1616",
      customerName: "Someone else",
      phone: "+91 987654321",
      totalCost: '4000',
      status: "Progress",
    },
    {
      serviceName: "Car Polishing",
      vehicleInfo: "KL 55 KA 1616",
      customerName: "Swathish Sreeraman",
      phone: "+91 987654321",
      totalCost: '2000',
      status: "Completed",
    },
  ];

 export const customers = [
  { name: "Swathish Sreeraman", phone: "987654321" },
  { name: "Akhil Mohan", phone: "912345678" },
  { name: "Jithin Ramesh", phone: "9000000001" },
  { name: "Sneha R", phone: "9000000002" },
];
