import mongoose from 'mongoose';

const SettingChoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  level: { type: Number },
  detail: { type: String },
  settingsgeneral_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SettingsGeneral' },
  settingsgraphics_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SettingsGraphics' }
});

export default mongoose.models.SettingChoice || mongoose.model('SettingChoice', SettingChoiceSchema);