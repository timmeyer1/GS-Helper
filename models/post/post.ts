import mongoose, { Document, Schema } from 'mongoose';

type PostType = 'equilibre' | 'performance' | 'qualite';
type FpsRange = '-60' | '60-80' | '80-100' | '100-120' | '+120';

interface IPost extends Document {
  user_id: mongoose.Types.ObjectId;
  game_id: number;
  game_metadata: { name: string; cover_url: string | null };
  config: {
    gpu_id: mongoose.Types.ObjectId;
    cpu_id: mongoose.Types.ObjectId;
    ram_id: mongoose.Types.ObjectId;
    screenresolution_id: mongoose.Types.ObjectId;
  };
  content: string;
  settings: Record<string, string>;
  postType: PostType;
  expectedFps: FpsRange;
  votes: { upvotes: number; voters: Array<{ user_id: mongoose.Types.ObjectId }> };
  created_at: Date;
  updated_at: Date;
}

const PostSchema = new Schema<IPost>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  game_id: { type: Number, required: true },
  game_metadata: {
    name: { type: String, required: true },
    cover_url: { type: String, default: null }
  },
  config: {
    gpu_id: { type: Schema.Types.ObjectId, ref: 'Gpu', required: true },
    cpu_id: { type: Schema.Types.ObjectId, ref: 'Cpu', required: true },
    ram_id: { type: Schema.Types.ObjectId, ref: 'Ram', required: true },
    screenresolution_id: { type: Schema.Types.ObjectId, ref: 'ScreenResolution', required: true }
  },
  content: { type: String, required: true },
  settings: {
    type: Object,
    of: String,
    default: {},
    required: true
  },
  postType: { type: String, enum: ['equilibre', 'performance', 'qualite'], default: 'equilibre' },
  expectedFps: { type: String, enum: ['-60', '60-80', '80-100', '100-120', '+120'], default: '60-80' },
  votes: {
    upvotes: { type: Number, default: 0 },
    voters: [{ user_id: { type: Schema.Types.ObjectId, ref: 'User' } }]
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Index pour performance
PostSchema.index({ game_id: 1, 'votes.upvotes': -1 });

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
export default Post;
export type { IPost, PostType, FpsRange };