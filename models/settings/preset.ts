import mongoose, { Document, Schema } from 'mongoose';

export interface IPreset extends Document {
  name: 'Low' | 'Medium' | 'High' | 'Ultra';
  display_name: string;
}

const PresetSchema = new Schema<IPreset>({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Low', 'Medium', 'High', 'Ultra']
  },
  display_name: {
    type: String,
    required: true
  }
});

const Preset = mongoose.models.Preset || mongoose.model<IPreset>('Preset', PresetSchema);
export default Preset;