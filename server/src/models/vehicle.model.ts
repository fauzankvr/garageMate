import mongoose, { Schema } from 'mongoose';


const VehiclesSchema = new Schema({
  model: { type: String, required: true },
  year: { type: String, required: true },
  brand: { type: String, required: true },
  registration_number: { type: String, required: true, unique: true },
  costumerId: {type: Schema.Types.ObjectId, required: true}
});

const Vehicles = mongoose.model('Vehicles', VehiclesSchema);

export default Vehicles;

