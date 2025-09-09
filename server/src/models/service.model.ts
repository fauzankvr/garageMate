import mongoose, { Schema } from 'mongoose';

const ServicesSchema = new Schema({
  warranty: { type: String, required: true },
  status: { type: Boolean, required: true, default: true },
  price: { type: Number, required: true },
  serviceName: { type: String, required: true },
  description: { type: String, required: true },
});

const Services = mongoose.model('Services', ServicesSchema);

export default Services;