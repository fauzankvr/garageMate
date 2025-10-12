import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

import customerRoutes from "./routes/costumer.routes";
import serviceRoutes from "./routes/services.routes";
import productRoutes from "./routes/product.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import workOrderRoutes from "./routes/work.routes";
import employeeRoutes from "./routes/employee.routes";
import salaryRoutes from "./routes/salary.routes";
import expenseRoutes from "./routes/expense.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import warrantyRoutes from "./routes/warranty.routes";
import authRoutes from './routes/auth.routes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes );
app.use("/api/customer", customerRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/product", productRoutes);
app.use("/api/workorder", workOrderRoutes );
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/warranties", warrantyRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, world!");
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
