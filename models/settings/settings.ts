import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  name: string;
  display_name: string;
}

const SettingSchema = new Schema<ISetting>({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['viewDistance', 'antialiasing', 'shadows', 'postProcessing', 'texture', 'effects', 'foliage', 'lights']
  },
  display_name: {
    type: String,
    required: true
  }
});

const Setting = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
export default Setting;