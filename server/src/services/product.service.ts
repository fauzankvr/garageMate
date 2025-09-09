import Product from "../models/product.model";

class ProductService {
    async create(data: any) {
        const product = new Product(data);
        return await product.save()
    }
    async findAll() {
        return await Product.find();
    }

    async findById(id: string) {
        return await Product.findById(id);
    }
    async update(id: string, data: any) {
        return await Product.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id: string) {
        return await Product.findByIdAndDelete(id);
    }
}

export default new ProductService