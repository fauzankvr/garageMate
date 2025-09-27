import { NavLink, useNavigate } from "react-router-dom";
import { Home, Users, PlusCircle, UserSquare2, Car, Users2 } from "lucide-react";
import { AiFillDollarCircle, AiFillProduct } from "react-icons/ai";
import { FaMoneyBillWave } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Create Bill",
      path: "/orders",
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      name: "Vehicles",
      path: "/vehicle",
      icon: <Car className="w-5 h-5" />,
    },
    {
      name: "Services",
      path: "/services",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Products",
      path: "/products",
      icon: <AiFillProduct className="w-5 h-5" />,
    },
    {
      name: "Expenses",
      path: "/expenses",
      icon: <AiFillDollarCircle className="w-5 h-5" />,
    },
    {
      name: "Salaries",
      path: "/salaries",
      icon: <FaMoneyBillWave className="w-5 h-5" />,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <UserSquare2 className="w-5 h-5" />,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: <Users2 className="w-5 h-5" />,
    },
  ];

  return (
    <div className="sticky top-0 h-screen w-56 bg-gray-50 border-r border-gray-200 p-4 flex flex-col sidebar">
      {/* Logo / Title */}
      <h1
        className="text-lg font-bold mb-8 text-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        OZON
      </h1>

      {/* Navigation Links */}
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === "/dashboard"} // only true for dashboard
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
