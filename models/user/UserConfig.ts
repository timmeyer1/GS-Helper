import mongoose from 'mongoose';

const userConfigSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gpu_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gpu',
    required: true,
  },
  cpu_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cpu',
    required: true,
  },
  ram_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ram',
    required: true,
  },
  screen_resolution_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenResolution',
    required: true,
  },
});

export default mongoose.models.UserConfig || mongoose.model('UserConfig', userConfigSchema);
