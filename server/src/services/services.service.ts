import Services from "../models/service.model";

class ServicesService {
    async create(data: any) {
        const service = new Services(data);
        return await service.save();
    }
    async findAll() {
        return await Services.find();
    }

    async findById(id: string) {
        return await Services.findById(id);
    }
    async update(id: string, data: any) {
        return await Services.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id: string) {
        return await Services.findByIdAndDelete(id);
    }
}

export default new ServicesService