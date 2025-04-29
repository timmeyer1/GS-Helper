import mongoose, { Document, Model, Schema } from 'mongoose';

interface IGpu extends Document {
  libelle: string;
  brand: string;
  generation: string;
}

const GpuSchema: Schema<IGpu> = new mongoose.Schema({
  libelle: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  generation: {
    type: String,
    required: true,
  },
});

const Gpu: Model<IGpu> =
  mongoose.models.Gpu || mongoose.model<IGpu>("Gpu", GpuSchema);

export default Gpu;