import express from 'express';
import { connectDB } from './config/db';
import costumerRoutes from "./routes/costumer.routes"
import serviceRoutes from "./routes/services.routes"
import productRoutes from "./routes/product.routes"
import vehicleRoutes from "./routes/vehicle.routes"
import workOrderRoutes from "./routes/work.routes"

import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.use('/api/customer', costumerRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/product', productRoutes);
app.use('/api/work-order', workOrderRoutes);
app.use('/api/vehicle', vehicleRoutes);



app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(PORT, async () => {
    await connectDB()
    console.log(`Server is running on http://localhost:${PORT}`);
});