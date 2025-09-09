import Costumer from "../models/costumer.model";
class CostumerService {
  async create(data: any) {
    const service = new Costumer(data);
    return await service.save();
  }

  async findAll() {
    return await Costumer.find();
  }

  async findByPhone(phone: string) {
    return await Costumer.find({ phone });
  }

  async findById(id: string) {
    return await Costumer.findById(id);
  }

  async update(id: string, data: any) {
    return await Costumer.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await Costumer.findByIdAndDelete(id);
  }
}

export default new CostumerService