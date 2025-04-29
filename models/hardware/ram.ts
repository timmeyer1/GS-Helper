import mongoose, { Document, Model, Schema } from 'mongoose';

interface IRam extends Document {
  libelle: string;
  type: string;
}

const RamSchema: Schema<IRam> = new mongoose.Schema({
  libelle: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const Ram: Model<IRam> =
  mongoose.models.Ram || mongoose.model<IRam>("Ram", RamSchema);

export default Ram;