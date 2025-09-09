import mongoose, { Schema } from 'mongoose';

const CostumerSchema = new Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // vehicle: [{ type: Schema.Types.ObjectId, required: true,  }],
});

const Costumer = mongoose.model('Costumer', CostumerSchema);

export default Costumer;