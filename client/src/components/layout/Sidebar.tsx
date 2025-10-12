import {
  NavLink,
  useNavigate,
  type NavLinkRenderProps,
} from "react-router-dom";
import { toast } from "react-toastify";
import {
  Home,
  Users,
  PlusCircle,
  Car,
  Users2,
  ShieldCheck,
  UserSquare2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
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
      name: "Warranty",
      path: "/warranty",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: <Users2 className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="sticky top-0 h-screen w-56 bg-gray-50 border-r border-gray-200 p-4 flex flex-col sidebar">
      {/* Reload and Back Buttons */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          title="Reload Page"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Logo / Title */}
      <h1
        className="text-lg font-bold mb-8 text-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        OZON
      </h1>

      {/* Navigation Links */}
      <nav className="flex flex-col space-y-2 flex-grow">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }: NavLinkRenderProps) =>
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

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
