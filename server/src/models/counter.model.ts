
import mongoose, { Schema, Document } from "mongoose";

interface Counter extends Document {
  _id: string; // e.g., 'bill_sequence'
  sequence_value: number; // Current sequence number
}

const counterSchema = new Schema<Counter>({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

export const CounterModel = mongoose.model<Counter>("Counter", counterSchema);
