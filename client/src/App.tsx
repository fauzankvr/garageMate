import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

// Pages
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
import Salaries from "./pages/Salary";
import Vehicles from "./pages/Vehicle";
import Expenses from "./pages/Expense";
import Customers from "./pages/Customer";
import Warranty from "./pages/Warranty";
import Dashboard from "./components/dashboard/Dashboard";

// Protected Route
import ProtectedRoute from "./pages/Auth/Protected";

const App = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <div>
      {/* Notifications */}
      <ToastContainer />

      {/* Routes */}
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          // element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          element={<Login />}
        />
        <Route
          path="/signup"
          // element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
          element={<Register />}
        />

        {/* Protected Routes */}
        <Route path="/" element={<Home />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/companies" element={<CompanyTable />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/salaries" element={<Salaries />} />
          <Route path="/vehicle" element={<Vehicles />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/warranty" element={<Warranty />} />
          <Route path="/services" element={<Services />} />
          <Route path="/orders" element={<WorkOrders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/bill" element={<Billing />} />
          <Route path="/coupen" element={<Coupen />} />
          <Route path="/create-customer" element={<CreateCustomer />} />
          <Route path="/create-vehicle" element={<CreateVehicle />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
