import mongoose, { Schema } from "mongoose";

const WorkOrderSchema = new Schema ({
    vehicleId: { type: Schema.Types.ObjectId, required: true, ref: "Vehicles" },
    costumerId: { type: Schema.Types.ObjectId, required: true, ref: "Costumer" },
    productsUsed: [{ type: Schema.Types.ObjectId, required: true, ref: "Product" }],
    servicesUsed: [{ type: Schema.Types.ObjectId, required: true, ref: "Services" }],
    totalProductCost: { type: Number, required: true },
    totalServiceCharge: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
})

const WorkOrder = mongoose.model("WorkOrder", WorkOrderSchema);

export default WorkOrder;