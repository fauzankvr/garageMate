import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
  productName: { type: String, required: true },
  description: { type: String, required: true },
  // sku: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  // category: { type: Schema.Types.ObjectId, required: true },
});

const Product = mongoose.model('Product', ProductSchema);

export default Product;