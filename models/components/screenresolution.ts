import mongoose, { Document, Model, Schema } from 'mongoose';

interface IScreenResolution extends Document {
  libelle: string;
  width: string;
  height: string;
  aspectRatio: string;
}

const ScreenResolutionSchema: Schema<IScreenResolution> = new mongoose.Schema({
  libelle: {
    type: String,
    required: true,
  },
  width: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  aspectRatio: {
    type: String,
    required: true,
  },
});

const ScreenResolution: Model<IScreenResolution> =
  mongoose.models.ScreenResolution || mongoose.model<IScreenResolution>("ScreenResolution", ScreenResolutionSchema);

export default ScreenResolution;