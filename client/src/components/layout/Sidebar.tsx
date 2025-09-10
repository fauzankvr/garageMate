import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
 
  PlusCircle,

  UserSquare2,
  // Percent,
  ClipboardList,
} from "lucide-react";
import { AiFillProduct } from "react-icons/ai";



const Sidebar = () => {
  const navigate=useNavigate()
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Create Bill", path: "/bill", icon: <PlusCircle className="w-5 h-5" /> },
    { name: "Work Orders", path: "/orders", icon: <ClipboardList className="w-5 h-5" /> },
    { name: "Services", path: "/services", icon: <Users className="w-5 h-5" /> },
    { name: "Products", path: "/products", icon: <AiFillProduct className="w-5 h-5" /> },
    // { name: "Customer Vehicles", path: "/customer", icon: <Car className="w-5 h-5" /> },
    // { name: "Coupons", path: "/coupen", icon: <Percent className="w-5 h-5" /> },
    { name: "Employees", path: "/employees", icon: <UserSquare2 className="w-5 h-5" /> },
    // { name: "Appointments", path: "/appointments", icon: <Calendar className="w-5 h-5" /> },
        
  ];

  return (
    <div className="sticky top-0 h-screen w-56 bg-gray-50 border-r border-gray-200 p-4 flex flex-col sidebar">
      <h1 className="text-lg font-bold mb-8 text-center" onClick={()=>navigate('/')}>Garage Mate</h1>
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-gray-200 text-black shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
