import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// 🔹 Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import WorkOrders from "./pages/WorkOrders";
import CompanyTable from "./pages/CompanyTable";
import Services from "./pages/Services";
import Billing from "./pages/Billing";
import Coupen from "./pages/Coupon";
import Employees from "./pages/Employees";
import Products from "./pages/Products";
import CreateCustomer from "./pages/CreateCustomer";
import CreateVehicle from "./pages/CreateVehicle";

// 🔹 Components
import Dashboard from "./components/ui/Dashboard";

const App = () => {
  return (
    <div>
      {/* Notifications */}
      <ToastContainer />

      {/* Routes */}
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* Main */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Management */}
        <Route path="/companies" element={<CompanyTable />} />
        <Route path="/employees" element={<Employees />} />

        {/* Services & Orders */}
        <Route path="/services" element={<Services />} />
        <Route path="/orders" element={<WorkOrders />} />

        {/* Products & Billing */}
        <Route path="/products" element={<Products />} />
        <Route path="/bill" element={<Billing />} />
        <Route path="/coupen" element={<Coupen />} />

        {/* Create Forms */}
        <Route path="/create-customer" element={<CreateCustomer />} />
        <Route path="/create-vehicle" element={<CreateVehicle />} />
      </Routes>
    </div>
  );
};

export default App;






// import { Route, Routes } from "react-router-dom";
// import Login from "./pages/Auth/Login";
// import Register from "./pages/Auth/Register";
// import CompanyTable from "./pages/admin/CompanyTable";
// import ProtectedRoute from "./routes/ProtectRoute";
// import { SidebarProvider } from "./context/SidebarContext";

// const App = () => {
//   return (
//     <Routes>
//       {/* Auth Routes */}
//       <Route path="/signup" element={<Register />} />
//       <Route path="/login" element={<Login />} />

//       {/* Protected Routes */}
//       <Route
//         path="/"
//         element={
//           <ProtectedRoute>
//             <SidebarProvider>
//               <CompanyTable />
//             </SidebarProvider>
//           </ProtectedRoute>
//         }
//       />
//     </Routes>
//   );
// };

// export default App;