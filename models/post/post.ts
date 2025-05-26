import mongoose, { Document, Schema } from 'mongoose';

// Interface pour les votes
interface Vote {
  user_id: mongoose.Types.ObjectId;
  vote_type: 'up' | 'down';
}

// Interface pour le post
interface IPost extends Document {
  user_id: mongoose.Types.ObjectId;
  game_id: number;
  game_metadata: {
    name: string;
    cover_url: string | null;
  };
  config: {
    gpu_id: mongoose.Types.ObjectId;
    cpu_id: mongoose.Types.ObjectId;
    ram_id: mongoose.Types.ObjectId;
    screenresolution_id: mongoose.Types.ObjectId;
  };
  content: string;
  settings: Record<string, string>;
  votes: {
    upvotes: number;
    downvotes: number;
    voters: Vote[];
  };
  created_at: Date;
  updated_at: Date;
}

// Schéma pour un vote
const VoteSchema = new Schema<Vote>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vote_type: {
    type: String,
    enum: ['up', 'down'],
    required: true
  }
});

// Schéma pour un post
const PostSchema = new Schema<IPost>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game_id: {
    type: Number,
    required: true
  },
  game_metadata: {
    name: {
      type: String,
      required: true
    },
    cover_url: {
      type: String,
      default: null
    }
  },
  config: {
    gpu_id: {
      type: Schema.Types.ObjectId,
      ref: 'Gpu',
      required: true
    },
    cpu_id: {
      type: Schema.Types.ObjectId,
      ref: 'Cpu',
      required: true
    },
    ram_id: {
      type: Schema.Types.ObjectId,
      ref: 'Ram',
      required: true
    },
    screenresolution_id: {
      type: Schema.Types.ObjectId,
      ref: 'ScreenResolution',
      required: true
    }
  },
  content: {
    type: String,
    required: true
  },
  settings: {
    type: Map,
    of: String,
    default: {}
  },
  votes: {
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    voters: {
      type: [VoteSchema],
      default: []
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexer pour améliorer les performances
PostSchema.index({ game_id: 1 });
PostSchema.index({ user_id: 1 });
PostSchema.index({ created_at: -1 });
PostSchema.index({ 'votes.upvotes': -1, 'votes.downvotes': 1 });

// Créer le modèle seulement s'il n'existe pas déjà
const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;