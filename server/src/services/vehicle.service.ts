import Vehicles from "../models/vehicle.model";

class VehicleService {
    async create(data: any) {
        const vehicle = new Vehicles(data);
        await vehicle.save();
        return vehicle;
    }
    async findAll(costumerId: string) {
        return await Vehicles.find({ costumerId });
    }

    async findVehicleBycostumerId(costumerId: string) {
        return await Vehicles.find({ costumerId });
    }

    async search(query: { model?: string; registration_number?: string }) {
        const filter: any = {};

        if (query.model) {
        filter.model = { $regex: query.model, $options: "i" };
        }

        if (query.registration_number) {
        filter.registration_number = { $regex: query.registration_number, $options: "i" };
        }

        return await Vehicles.find(filter);
    }
}

export default new VehicleService