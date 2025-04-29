import mongoose, { Document, Model, Schema } from 'mongoose';

interface ICpu extends Document {
  libelle: string;
  brand: string;
  range: string;
  generation: string;
}

const CpuSchema: Schema<ICpu> = new mongoose.Schema({
  libelle: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  range: {
    type: String,
    required: true,
  },
  generation: {
    type: String,
    required: true,
  },
});

const Cpu: Model<ICpu> =
  mongoose.models.Cpu || mongoose.model<ICpu>("Cpu", CpuSchema);

export default Cpu;