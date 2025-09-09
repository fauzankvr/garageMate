import WorkOrder from "../models/work.order.model";
class WorkOrderService {
    
    async create(data: any) {
        const workOrder = new WorkOrder(data);
        return await workOrder.save()
    }
    async findAll() {
        const workOrders = await WorkOrder.find()
            .populate('vehicleId')
            .populate('costumerId')
            .populate('productsUsed')
            .populate('servicesUsed');
            
        return workOrders;
    }

}
export default new WorkOrderService