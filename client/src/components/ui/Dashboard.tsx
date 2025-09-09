import { AiFillProduct } from "react-icons/ai";
import Card from "../common/buttons/NavigationBtn";
import { FaFileInvoice,   FaTools, FaClipboardList,  } from "react-icons/fa";

const Dashboard = () => {
  const cards = [
    {
      title: "Work Orders",
      description: "Manage and view work orders",
      path: "/orders",
      icon: <FaClipboardList />,
    },
    {
      title: "Billing",
      description: "Create and manage bills",
      path: "/bill",
      icon: <FaFileInvoice />,
    },
    // {
    //   title: "Customers",
    //   description: "View and manage customers",
    //   path: "/customers",
    //   icon: <FaUsers />,
    // },
    // {
    //   title: "Vehicles",
    //   description: "View and manage vehicles",
    //   path: "/vehicles",
    //   icon: <FaCar />,
    // },
    {
      title: "Services",
      description: "Manage service types",
      path: "/services",
      icon: <FaTools />,
    },
    // {
    //   title: "Coupons",
    //   description: "Manage discount coupons",
    //   path: "/coupons",
    //   icon: <FaTags />,
    // },
    // {
    //   title: "Employees",
    //   description: "Employee roles and status",
    //   path: "/employees",
    //   icon: <FaUserTie />,
    // },
    {
      title: "Products",
      description: "Manage Products",
      path: "/products",
      icon: <AiFillProduct />,
    },
  ];

  return (
    <div className="px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Dashboard</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
        {cards.map((card) => (
          <Card
            key={card.path}
            title={card.title}
            description={card.description}
            path={card.path}
            icon={card.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
