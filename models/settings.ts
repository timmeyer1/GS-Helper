import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  name: string;
  display_name: string;
  values: string[];
}

const SettingSchema = new Schema<ISetting>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  display_name: {
    type: String,
    required: true,
  },
  values: {
    type: [String],
    default: ['Low', 'Medium', 'High', 'Ultra'],
  },
});

const Setting = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
export default Setting;
